const express = require('express');
//add apollo and authmiddleware
const { ApolloServer } = require('apollo-server-express');
const { authMiddleware } = require('./utils/auth');
const path = require('path');
const db = require('./config/connection');
//const routes = require('./routes');

//add schemas
const { typeDefs, resolvers } = require('./schema');
const app = express();
const PORT = process.env.PORT || 3001;

//add server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

//app.use(routes);

const startApolloServer = async (typeDefs, resolvers) => {
  await server.start();
  server.applyMiddleware({ app });
  
  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`🌍 Now listening on localhost:${PORT}`);
      console.log(`Use GraphQL at http://127.0.0.1:${PORT}${server.graphqlPath}`);
    })
  })
};

// //call function
startApolloServer(typeDefs, resolvers);