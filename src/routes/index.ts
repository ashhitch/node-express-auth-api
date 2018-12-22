import * as authController from './../controllers/authController';
import * as homeController from './../controllers/homeController';
import * as userController from './../controllers/userController';

import { catchErrors } from './../handlers/errorHandlers';
import express from 'express';

const router = express.Router();

// Base home route
router.get('/', homeController.index);

// Auth routes

// Register for new account
router.post('/register', userController.validateRegister, userController.register);

// Login
router.post('/login', authController.login);

// Update user account
router.post('/account', catchErrors(userController.updateAccount));

// Request password reset
router.post('/account/forgotten', catchErrors(authController.forgot));

// Reset users password
router.post('/account/reset',
  authController.confirmedPasswords,
  catchErrors(authController.updatePassword)
);

export default router;
