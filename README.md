# TypeScript Node Auth API Starter

A Basic Express API setup written in TypeScript, designed to be a starting place for any App requiring auth. 

## Setup

Install: dependencies:

`yarn` or `npm install`

Run in watch mode:

`yarn watch` or `npm run watch`

Run in watch mode with node debug:

`yarn watch-debug` or `npm run watch-debug`

Copy `.env.example` to `.env`

Add DB and SMTP details ( I use [mlab](https://mlab.com/) and [mailtrap](https://mailtrap.io) )

## Current features
- Login
- Logout
- Forgotten password request
- Password reset
- Update user details
- User roles

## Routes
- `/` - GET - returns welcome message
- `/admin-only` - GET - Only accessible if user has admin role
- `/register` - POST - Register a new user
- `/login` - POST - Login returns user and token
- `/account` - GET - Returns logged in user account
- `/account/forgotten` - POST - Sends password reset email
-  `/account/reset` - POST - Resets users password

## Roadmap
- Demo data
- Password change (for logged in user)
- Tests
- Better docs and examples

## Contributions 
I welcome any feedback or pull requests on this project 👍 