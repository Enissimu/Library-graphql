import { useState, useEffect } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import Login from "./components/Login";
import NewBook from "./components/NewBook";
import {
  BOOK_ADDED,
  GET_ALL_BOOKS,
  LOGIN,
  updateCachePls,
} from "./graphkuel/graphs";
import { useMutation, useApolloClient, useSubscription } from "@apollo/client";

const App = () => {
  const [page, setPage] = useState("books");
  const [user, setUser] = useState(null);
  const [recommend, setRecommend] = useState(false);
  const client = useApolloClient();
  useSubscription(BOOK_ADDED, {
    onData: ({ data, client }) => {
      updateCachePls(
        client.cache,
        {
          query: GET_ALL_BOOKS,
          variables: { genre: null },
        },
        data.data.bookAdded
      );
      window.alert("YOU JUST ADDED");
    },
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("logged-user"));
    setUser(user);
  }, []);

  const [login, { data, error, loading }] = useMutation(LOGIN, {
    onError: (error) => {
      const errors = error.graphQLErrors[0].extensions.error.errors;
      const messages = Object.values(errors)
        .map((e) => e.message)
        .join("\n");
      console.log(messages);
    },
  });

  const loginUser = async (username, password) => {
    const dataOfLOgin = await login({ variables: { username, password } });
    const token = dataOfLOgin.data.login.value;
    setUser({ username, token });
    localStorage.setItem("logged-user", JSON.stringify({ username, token }));
    setPage("books");
  };

  const logoutUser = () => {
    localStorage.clear();
    client.resetStore();
    setUser(null);
  };

  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        {!user ? (
          <button onClick={() => setPage("login")}>login</button>
        ) : (
          <>
            <button onClick={() => setPage("add")}>add book</button>
            <button
              onClick={() => {
                setRecommend(!recommend);
                setPage("books");
              }}
            >
              recommends
            </button>
            <button onClick={logoutUser}>log out</button>
          </>
        )}
      </div>

      <Login
        show={page === "login"}
        loginUser={loginUser}
        logoutUser={logoutUser}
        loading={loading}
        error={error}
      />
      <Authors show={page === "authors"} />

      <Books recommend={recommend} show={page === "books"} />

      <NewBook show={page === "add"} client={client} />
    </div>
  );
};

export default App;
