import { IUser } from './models/User';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config({ path: '.env' });

export const ENVIRONMENT = process.env.NODE_ENV;
const prod = ENVIRONMENT === 'production'; // Anything else is treated as 'dev'

export const SECRET = process.env['SECRET'];
export const KEY = process.env['KEY'];
export const DATABASE = process.env['DATABASE'];
export const UI = process.env['UI_URL'];

export const generateToken = (user: IUser) => {
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
  return token;
};
