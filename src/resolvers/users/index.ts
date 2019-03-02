import users from './queries/users';
import { gql } from 'apollo-server-express';

const typeDefs = gql`
  type Query {
    #Get the users in the company, must be an admin
    users: [User] 
  }

  type User {
    id: Int!
    name: String!
    email: String!
  }
`;

const resolvers = {
  Query: {
    users,
  },
};

export  { typeDefs, resolvers };