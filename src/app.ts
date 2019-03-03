
import ConnectRoles from 'connect-roles';
import bodyParser from 'body-parser';
import compression from 'compression';
import dotenv from 'dotenv';
import express from 'express';
import expressValidator from 'express-validator';
import lusca from 'lusca';
import mongo from 'connect-mongo';
import mongoose from 'mongoose';
import passport from 'passport';
import path from 'path';
import { default as routes } from './routes';
import session from 'express-session';

import cors from 'cors';

// compresses requests

const MongoStore = mongo(session);
const BASE_API: string = '/api/v1';
// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config({ path: '.env' });

// Create Express server
const app = express();

// User roles
const roles = new ConnectRoles();

// Cors
app.use(cors());

// Connect to MongoDB
const mongoUrl = process.env.DATABASE;
(<any>mongoose).Promise = global.Promise;
mongoose.connect(
  mongoUrl,
  { useNewUrlParser: true }
);

mongoose.connection.on('error', err => {
  console.error(`🙅 🚫 🙅 🚫 🙅 🚫 🙅 🚫 → ${err.message}`);
});

// Express configuration
app.set('port', process.env.PORT || 4000);

// Views
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');

// Performance
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(expressValidator());
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SECRET,
    store: new MongoStore({
      url: mongoUrl,
      autoReconnect: true
    })
  })
);

// Passport Auth
app.use(passport.initialize());
app.use(passport.session());
app.use(roles.middleware());

// Security
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});



app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  if (
    !req.user &&
    req.path !== '/login' &&
    req.path !== '/signup' &&
    !req.path.match(/^\/auth/) &&
    !req.path.match(/\./)
  ) {
    req.session.returnTo = req.path;
  } else if (req.user && req.path == '/account') {
    req.session.returnTo = req.path;
  }
  next();
});

app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

/**
 *  app routes.
 */


app.use(BASE_API, routes);




export default app;
