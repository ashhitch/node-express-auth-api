import * as users from './users';


import { makeExecutableSchema, mergeSchemas } from 'graphql-tools';

export default mergeSchemas({
  schemas: [
    makeExecutableSchema(users) // more schemas here
  ],
});
