import app from './app';
import errorHandler from 'errorhandler';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs, resolvers } from './resolvers/users';
/**
 * Error Handler. Provides full stack - remove for production
 */
app.use(errorHandler());

const server = new ApolloServer({
  // These will be defined for both new or existing servers
  typeDefs,
  resolvers,
  introspection: true,
  playground: true,
});


server.applyMiddleware({ app, path: '/graphql' });

/**
 * Start Express server.
 */
const appServer = app.listen(app.get('port'), () => {
  console.log(
    '  App is running at http://localhost:%d in %s mode',
    app.get('port'),
    app.get('env')
  );
  console.log('  Press CTRL-C to stop\n');
});




export default appServer;
