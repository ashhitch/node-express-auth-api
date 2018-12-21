import '../handlers/passport';

import { AuthToken, default as User, UserModel } from '../models/User';
import { NextFunction, Request, Response } from 'express';

import { SECRET } from './../helpers';
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

    res.status(400).json({ title: 'Register', errors});
    return; // stop the fn from running
  }
  next(); // there were no errors!
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  const user = new User({ email: req.body.email, name: req.body.name });
  const register = promisify((User as any).register).bind(User);
  await register(user, req.body.password);

    // // create a token
    const token = jwt.sign({ id: user._id }, SECRET, {
      expiresIn: 86400 // expires in 24 hours
    });

    res.status(200).json({ auth: true, token: token });
};

export const account = (req: Request, res: Response) => {
  res.json({ title: 'Edit Your Account' });
};

export const updateAccount = async (req: Request, res: Response) => {
  const updates = {
    name: req.body.name,
    email: req.body.email
  };

  const user = await User.findOneAndUpdate(
    { _id: req.user._id },
    { $set: updates },
    { new: true, runValidators: true, context: 'query' }
  );
  res.json({msg: 'Updated the profile!', data: user});
};
