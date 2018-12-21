import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

export const ENVIRONMENT = process.env.NODE_ENV;
const prod = ENVIRONMENT === 'production'; // Anything else is treated as 'dev'

export const SECRET = process.env['SECRET'];
export const KEY = process.env['KEY'];
export const DATABASE = process.env['DATABASE'];


