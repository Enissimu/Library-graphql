const mongoose = require("mongoose");
const User = require("./models/user");
const jwt = require("jsonwebtoken");
const typeDefs = require("./resAndType/typeDefs");
const resolvers = require("./resAndType/resolver");

const cors = require("cors");
const express = require("express");
const http = require("http");

const { expressMiddleware } = require("@apollo/server/express4");

const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const {
  ApolloServerPluginDrainHttpServer,
} = require("@apollo/server/plugin/drainHttpServer");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { WebSocketServer } = require("ws");
const { useServer } = require("graphql-ws/lib/use/ws");

mongoose.set("strictQuery", false);
mongoose.set("debug", true);
require("dotenv").config();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("CONNECTED"))
  .catch((err) => console.log(err));

const start = async () => {
  const app = express();
  const httpServer = http.createServer(app);

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/",
  });

  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const serverCleanup = useServer({ schema }, wsServer);

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }), // Proper shutdown for the HTTP server.
      {
        async serverWillStart() {
          // Proper shutdown for the WebSocket server.
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });
  await server.start();

  app.use(
    "/",
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        const auth = req ? req.headers.authorization : null;
        if (auth && auth.startsWith("Bearer")) {
          const decodedToken = jwt.verify(
            auth.substring(7),
            process.env.SECRET
          );
          const currentUser = await User.findById(decodedToken.id);
          return { currentUser };
        }
      },
    })
  );

  const PORT = 4000;
  httpServer.listen(PORT, () =>
    // This way, the server starts listening on the HTTP and WebSocket transports simultaneously.
    console.log("server is now running on port ", PORT)
  );
};

start();
