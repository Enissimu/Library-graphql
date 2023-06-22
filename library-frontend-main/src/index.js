import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
  split,
} from "@apollo/client";

import { setContext } from "@apollo/client/link/context";

const wsLink = new GraphQLWsLink(
  createClient({
    url: "ws://localhost:4000",
  })
);
const link = createHttpLink({
  uri: "http://localhost:4000",
});

const authLink = setContext((_, { headers }) => {
  const userForNow = localStorage.getItem("logged-user");

  const token = userForNow ? JSON.parse(userForNow).token : null;

  return {
    headers: {
      ...headers,

      authorization: token ? `Bearer ${token}` : null,
    },
  };
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  authLink.concat(link)
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
  connectToDevTools: true,
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);
