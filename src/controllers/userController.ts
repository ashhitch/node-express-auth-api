import '../handlers/passport';

import { AuthToken, IUser, default as User } from '../models/User';
import { NextFunction, Request, Response } from 'express';
import { SECRET, extractToken, generateToken } from './../helpers';

import { IApiResponse } from 'src/interfaces/api-response.interface';
import jwt from 'jsonwebtoken';
import { promisify } from 'es6-promisify';

export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
  req.sanitizeBody('name');
  req.checkBody('name', 'You must supply a name!').notEmpty();
  req.checkBody('email', 'That Email is not valid!').isEmail();
  req.sanitizeBody('email').normalizeEmail({
    gmail_remove_dots: false,
    gmail_remove_subaddress: false
  });
  req.checkBody('password', 'Password Cannot be Blank!').notEmpty();
  req.checkBody('password-confirm', 'Confirmed Password cannot be blank!').notEmpty();
  req.checkBody('password-confirm', 'Oops! Your passwords do not match').equals(req.body.password);

  const errors = req.validationErrors();
  if (errors) {
    const data: IApiResponse = { status: 'error', message: errors };
    res.status(400).json(data);
    return; // stop the fn from running
  }
  next(); // there were no errors!
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  const user: any = new User({ email: req.body.email, name: req.body.name });
  const registerReq = promisify((User as any).register).bind(User);
  await registerReq(user, req.body.password);

  const token = generateToken(user);
  const data: IApiResponse = { status: 'success', auth: true, message: 'User registered', token: token };
  res.status(200).json(data);
};

export const account = (req: Request, res: Response) => {
  const user = (req as any).user;
  const token = generateToken(user);
  const data: IApiResponse = { status: 'success', user, token };
  res.status(200).json(data);
};

export const updateAccount = async (req: Request, res: Response) => {
  const token = extractToken(req.headers);

  let userID;

  if (!token) {
    return res.status(401).json({ status: 'error', auth: false, message: 'No token provided.' });
  }

  await jwt.verify(token, SECRET, async (err, decoded: any) => {
    if (err || !decoded) {
      const data: IApiResponse = { status: 'error', auth: false, message: 'Failed to authenticate token.' };
      return res.status(500).json(data);
    }

    await User.findById(decoded.user._id, { password: 0 }, (findErr: any, user: IUser) => {
      if (findErr) {
        const data = { status: 'error', message: 'There was a problem finding the user.' };
        return res.status(500).json(data);
      }
      if (!user) {
        const data: IApiResponse = { status: 'error', message: 'No user found.' };
        return res.status(404).json(data);
      }

      userID = decoded.user._id;
      return;
    });
  });

  if (!userID) {
    const data: IApiResponse = { status: 'error', message: 'There was a problem updating the user.' };
    return res.status(500).json(data);
  }

  const updates = {
    name: req.body.name,
    email: req.body.email
  };

  const newUser: IUser = await (User as any).findOneAndUpdate(
    { _id: userID },
    { $set: updates },
    { new: true, runValidators: true, context: 'query' }
  );

  const newToken = generateToken(newUser);
  const data: IApiResponse = { status: 'success', message: 'Updated the profile!', user: newUser, token: newToken };
  return res.status(200).json(data);
};
