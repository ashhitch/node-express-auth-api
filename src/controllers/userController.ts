import '../handlers/passport';

import { AuthToken, IUser, default as User } from '../models/User';
import { NextFunction, Request, Response } from 'express';
import { SECRET, extractToken, generateToken } from './../helpers';

import jwt from 'jsonwebtoken';
import { promisify } from 'es6-promisify';

// err: Error, user: UserModel, info: IVerifyOptions

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
    res.status(400).json({ title: 'Register', errors });
    return; // stop the fn from running
  }
  next(); // there were no errors!
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  const user: any = new User({ email: req.body.email, name: req.body.name });
  const register = promisify((User as any).register).bind(User);
  await register(user, req.body.password);

  const token = generateToken(user);

  res.status(200).json({ status: 'success', auth: true, token: token });
};

export const account = (req: Request, res: Response) => {
  const user = (req as any).user;
  const token = generateToken(user);
  res.status(200).json({ status: 'success', user, token });
};

export const updateAccount = async (req: Request, res: Response) => {
  const token = extractToken(req.headers);

  let userID;

  if (!token) {
    return res.status(401).json({ auth: false, message: 'No token provided.' });
  }

  await jwt.verify(token, SECRET, async (err, decoded: any) => {
    if (err || !decoded) {
      return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
    }

    await User.findById(decoded.user._id, { password: 0 }, (err, user: IUser) => {
      if (err) {
        return res.status(500).json({ status: 'error', message: 'There was a problem finding the user.' });
      }
      if (!user) {
        return res.status(404).json({ status: 'error', message: 'No user found.' });
      }

      userID = decoded.user._id;
      return;
    });
  });

  if (!userID) {
    return res.status(500).json({ status: 'error', message: 'There was a problem updating the user.' });
  }

  const updates = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role
  };

  const newUser: IUser = await (User as any).findOneAndUpdate(
    { _id: userID },
    { $set: updates },
    { new: true, runValidators: true, context: 'query' }
  );

  const newToken = generateToken(newUser);

  return res.status(200).json({ status: 'success', message: 'Updated the profile!', user: newUser, token: newToken });
};
