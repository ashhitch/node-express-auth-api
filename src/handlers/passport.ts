import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';

import { SECRET } from './../helpers';
import { default as User } from '../models/User';
import passport from 'passport';

passport.serializeUser((User as any).serializeUser());
passport.deserializeUser((User as any).deserializeUser());


const opts: any = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = SECRET;

 const stratagy = new JwtStrategy(opts, (jwt_payload, done) => {
    return done(undefined, false);
});

passport.use(stratagy);



