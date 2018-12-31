import './../handlers/passport';

import * as mail from './../handlers/mail';

import { AuthToken, IUser, default as User } from '../models/User';
import { NextFunction, Request, Response } from 'express';
import { SECRET, UI, extractToken, generateToken } from './../helpers';

import { IApiResponse } from '/../interfaces/api-response.interface';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import passport from 'passport';
import { promisify } from 'es6-promisify';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('local', async (err, user, info) => {
    try {
      if (err || !user) {
        return res.json({ status: 'error', message: 'Opps looks like something went wrong!' });
      }
      req.login(
        user,
        {
          session: false
        },
        async error => {
          if (error) {
            return next(error);
          }
          const token = generateToken(user);
          // Send back the token to the user
          const data: IApiResponse = { status: 'success', auth: true, message: 'You are now logged in', token: token };
          return res.json(data);
        }
      );
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
};

// export const login = passport.authenticate('jwt', { session: false });

export const logout = (req: Request, res: Response) => {
  req.logout();
  res.status(200);
  // @TODO destroy the token here
  const data: IApiResponse = { status: 'success', message: 'You are now logged out! 👋' };
  res.json(data);
};

export const isLoggedIn = async (req: Request, res: Response, next: NextFunction) => {
  const token = extractToken(req.headers);

  if (!token) {
    const data: IApiResponse = { auth: false, status: 'error', message: 'No token provided.' };
    return res.status(401).json(data);
  }

  await jwt.verify(token, SECRET, (err, decoded: any) => {
    if (err || !decoded) {
      const data: IApiResponse = { auth: false, status: 'error', message: 'Failed to authenticate token.' };
      return res.status(500).json(data);
    }

    User.findById(decoded.user._id, { password: 0 }, (err, user: IUser) => {
      if (err) {
        const data: IApiResponse = { auth: false, status: 'error', message: 'There was a problem finding the user.' };
        return res.status(500).json(data);
      }
      if (!user) {
        const data: IApiResponse = { auth: false, status: 'error', message: 'No user found.' };
        return res.status(422).json(data);
      }
      // res.status(200).send(user);
      const returnUser = {
        _id: user._id,
        email: user.email,
        name: user.name
      };

      req.user = returnUser;

      return next();
    });
  });
};

export const forgot = async (req: Request, res: Response) => {
  // 1. See if a user with that email exists
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    const data: IApiResponse = { status: 'error', message: 'No account with that email exists.' };
    return res.json(data);
  }
  // 2. Set reset tokens and expiry on their account
  (user as IUser).resetPasswordToken = crypto.randomBytes(20).toString('hex');
  const expireDate = Date.now() + 3600000; // 1 hour from now
  (user as IUser).resetPasswordExpires = (expireDate as unknown as Date);
  await user.save();
  // 3. Send them an email with the token
  const resetURL = `${UI}/account/reset/${(user as any).resetPasswordToken}`;
  try {
    await mail.send({
      user,
      filename: 'password-reset',
      subject: 'Password Reset',
      resetURL
    });
    // 4. send success response
    const data: IApiResponse = { status: 'success', message: 'You have been emailed a password reset link.' };
    res.status(200).json(data);
  } catch (error) {
    const data: IApiResponse = { status: 'error', message: `Could not send password request. ${error}` };
    res.status(400).json(data);
  }
};

export const reset = async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findOne({
    resetPasswordToken: req.body.token,
    resetPasswordExpires: { $gt: Date.now() }
  });
  if (!user) {
    const data: IApiResponse = { status: 'error', message: 'Password reset is invalid or has expired' };
    return res.status(422).json(data);
  }
  // if there is a user,
  next(); // keepit going!
  return;
};

export const confirmedPasswords = (req: Request, res: Response, next: NextFunction) => {
  if (req.body.password === req.body['password-confirm']) {
    next(); // keepit going!
    return;
  }

  const data: IApiResponse = { status: 'error', message: 'Passwords do not match!' };

  res.status(401).json(data);
};

export const updatePassword = async (req: Request, res: Response) => {
  const user = await User.findOne({
    resetPasswordToken: req.body.token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    res.status(401);
    const data: IApiResponse = { status: 'error', message: 'Password reset is invalid or has expired' };
    return res.json(data);
  }

  const setPassword: any = promisify((user as any).setPassword.bind(user));
  await setPassword(req.body.password);
  (user as IUser).resetPasswordToken = undefined;
  (user as IUser).resetPasswordExpires = undefined;
  const updatedUser = await user.save();

  const data: IApiResponse = { status: 'success', message: ' Your password has been reset!' };
  return res.json(data);
};

export const roleAuth = (roles: Array<String>) => {
  return function(req: Request, res: Response, next: NextFunction) {
    const { user } = req;

    User.findById(user._id, function(err, foundUser: IUser) {
      if (err) {
        const data: IApiResponse = { status: 'error', message: 'No user found.' };
        res.status(422).json(data);
        return next(err);
      }

      if (roles.indexOf(foundUser.role) > -1) {
        return next();
      }
      const data: IApiResponse = { status: 'error', message: 'You are not authorized to view this content' };
      return res.status(401).json(data);
    });
  };
};
