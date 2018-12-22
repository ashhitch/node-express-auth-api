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

// Request password reset
router.post('/forgotten', authController.forgot);

export default router;
