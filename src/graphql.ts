import { schema } from './resolvers';
import bodyParser from 'body-parser';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';

import { Request } from 'express';
const app = (app: any) => {
  app.use(
    '/graphql',
    bodyParser.json(),
    graphqlExpress((request: Request) => ({ schema, context: request.user }))
  );
  app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));
};

export default app;