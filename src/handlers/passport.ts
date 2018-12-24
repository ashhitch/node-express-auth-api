import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';

import { Strategy as LocalStrategy } from 'passport-local';
import { SECRET } from './../helpers';
import { default as User } from '../models/User';
import passport from 'passport';

passport.serializeUser((User as any).serializeUser());
passport.deserializeUser((User as any).deserializeUser());

const localOptions = {
  usernameField: 'email'
};

const localLogin = new LocalStrategy(localOptions, function(email, password, done) {

  User.findOne({
      email: email
  }, function(err, user) {

      if (err) {
          return done(err);
      }

      if (!user) {
          return done(undefined, false, { error: 'Login failed. Please try again.' });
      }

      (user as any).comparePassword(password, function(err: any, isMatch: boolean) {

          if (err) {
              return done(err);
          }

          if (!isMatch) {
              return done(undefined, false, { error: 'Login failed. Please try again.' });
          }

          return done(undefined, user);

      });

  });

});

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeader(),
  secretOrKey: SECRET
};

const jwtLogin = new JwtStrategy(jwtOptions, function(payload, done) {

  User.findById(payload.user._id, function(err, user) {

      if (err) {
          return done(err, false);
      }

      if (user) {
          done(undefined, user);
      } else {
          done(undefined, false);
      }

  });

});

passport.use(jwtLogin);
passport.use(localLogin);


