import mongodbErrorHandler = require('mongoose-mongodb-errors');

import { NextFunction } from 'express';
import bcrypt from 'bcrypt-nodejs';
import crypto from 'crypto';
import md5 from 'md5';
import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';
import validator from 'validator';

export interface IUser extends mongoose.Document {
  email: any;
  name: string;
  password: string;
  resetPasswordToken: string;
  resetPasswordExpires: Date;
  tokens?: AuthToken[];
  comparePassword: comparePasswordFunction;
  gravatar: (size: number) => string;
  role: string;
}

type comparePasswordFunction = (candidatePassword: string, cb: (err: any, isMatch: any) => {}) => void;

export type AuthToken = {
  accessToken: string;
  kind: string;
};

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, 'Invalid Email Address'],
      required: 'Please Supply an email address'
    },
    password: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    tokens: Array,
    name: String,
    role: {
      type: String,
      enum: ['editor', 'admin'],
      default: 'editor'
    }
  },
  { timestamps: true }
);

/**
 * Password hash middleware.
 */
userSchema.pre('save', function save(next: NextFunction) {
  const user = this;
  if (!user.isModified('password')) {
    return next();
  }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err);
    }
    bcrypt.hash(user.password, salt, undefined, (err: mongoose.Error, hash) => {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  });
});

const comparePassword: comparePasswordFunction = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err: mongoose.Error, isMatch: boolean) => {
    cb(err, isMatch);
  });
};

userSchema.methods.comparePassword = comparePassword;

/**
 * Virtual for getting user's gravatar.
 */
userSchema.virtual('gravatar').get(function() {
  const hash = md5(this.email);
  return `https://gravatar.com/avatar/${hash}?s=200`;
});

userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });
userSchema.plugin(mongodbErrorHandler);

const User = mongoose.model('User', userSchema);
export default User;
