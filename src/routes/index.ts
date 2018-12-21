import * as authController from './../controllers/authController';
import * as homeController from './../controllers/homeController';
import * as userController from './../controllers/userController';

import { catchErrors } from './../handlers/errorHandlers';
import express from 'express';

const router = express.Router();

// Base home route
router.get('/', homeController.index);


// Auth routes
router.post('/register', userController.validateRegister, userController.register);
router.post('/login', authController.login);


export default router;
