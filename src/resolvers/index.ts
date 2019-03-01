import * as users from './users';


const { makeExecutableSchema, mergeSchemas } = require('graphql-tools');

module.exports = mergeSchemas({
  schemas: [
    makeExecutableSchema(users) // more schemas here
  ],
});
