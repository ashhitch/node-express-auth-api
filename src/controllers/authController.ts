import './../handlers/passport';

import * as mail from './../handlers/mail';

import { AuthToken, default as User, UserModel } from '../models/User';
import { NextFunction, Request, Response } from 'express';
import { SECRET, UI } from './../helpers';

import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import passport from 'passport';
import { promisify } from 'es6-promisify';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('local', async (err, user, info) => {
    try {
      if (err || !user) {
        return res.json({ status: 'error', msg: 'Opps looks like something went wrong!' });
      }
      req.login(
        user,
        {
          session: false
        },
        async error => {
          if (error) return next(error);
          // We don't want to store the sensitive information such as the
          // user password in the token so we pick only the email and id
          const body = {
            _id: user._id,
            email: user.email
          };
          // Sign the JWT token and populate the payload with the user email and id
          const token = jwt.sign(
            {
              user: body
            },
            SECRET,
            {
              expiresIn: 86400 // expires in 24 hours
            }
          );
          // Send back the token to the user
          return res.json({
            token
          });
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
  res.json({ status: 'success', msg: 'You are now logged out! 👋' });
};

export const isLoggedIn = async (req: Request, res: Response, next: NextFunction) => {
  const token: string = req.headers['x-access-token'] as string;
  console.log({ token });

  if (!token) {
    return res.status(401).json({ auth: false, message: 'No token provided.' });
  }

  await jwt.verify(token, SECRET, (err, decoded: any) => {
    if (err || !decoded) {
      return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
    }

    User.findById(decoded.user._id, { password: 0 }, (err, user) => {
      if (err) {
        return res.status(500).json('There was a problem finding the user.');
      }
      if (!user) {
        return res.status(404).json('No user found.');
      }
      // res.status(200).send(user);

      req.user = {
        user: user.toJSON()
      };
      return next();
    });
  });
};

export const forgot = async (req: Request, res: Response) => {
  // 1. See if a user with that email exists
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.json({ status: 'error', message: 'No account with that email exists.' });
  }
  // 2. Set reset tokens and expiry on their account
  (user as any).resetPasswordToken = crypto.randomBytes(20).toString('hex');
  (user as any).resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
  await user.save();
  // 3. Send them an email with the token
  const resetURL = `${UI}/account/reset/${(user as any).resetPasswordToken}`;
  await mail.send({
    user,
    filename: 'password-reset',
    subject: 'Password Reset',
    resetURL
  });
  // 4. redirect to login page
  res.json({ status: 'success', msg: 'You have been emailed a password reset link.' });
};

export const reset = async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findOne({
    resetPasswordToken: req.body.token,
    resetPasswordExpires: { $gt: Date.now() }
  });
  if (!user) {
    return res.json({ status: 'error', msg: 'Password reset is invalid or has expired' });
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
  res.status(401).json({ status: 'error', msg: 'Passwords do not match!' });
};

export const updatePassword = async (req: Request, res: Response) => {
  const user = await User.findOne({
    resetPasswordToken: req.body.token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    res.status(401);
    return res.json({ status: 'error', msg: 'Password reset is invalid or has expired' });
  }

  const setPassword: any = promisify((user as any).setPassword.bind(user));
  await setPassword(req.body.password);
  (user as any).resetPasswordToken = undefined;
  (user as any).resetPasswordExpires = undefined;
  const updatedUser = await user.save();

  return res.json({ status: 'success', msg: '💃 Nice! Your password has been reset!' });
};
