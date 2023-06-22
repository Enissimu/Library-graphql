import { useMutation } from "@apollo/client";
import { useState } from "react";
import { POST_BOOK, GET_ALL_BOOKS, updateCachePls } from "../graphkuel/graphs";

const NewBook = (props) => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [published, setPublished] = useState("");
  const [genre, setGenre] = useState("");
  const [genres, setGenres] = useState(["aga"]);

  const [addBook, { data, loading, error }] = useMutation(POST_BOOK, {
    update: (cache, { data: { addBook } }) => {
      updateCachePls(
        cache,
        {
          query: GET_ALL_BOOKS,
          variables: { genre: null },
        },
        addBook
      );

      // const books = cache.readQuery({
      //   query: GET_ALL_BOOKS,
      //   variables: { genre: null },
      // });
      // cache.writeQuery({
      //   query: GET_ALL_BOOKS,
      //   data: {
      //     allBooks: [...books.allBooks, addBook],
      //   },
      // });
    },
    onError: (error) => {
      const errors = error.graphQLErrors[0].extensions.error.errors;
      const messages = Object.values(errors)
        .map((e) => e.message)
        .join("\n");
      console.log(messages);
    },
  });
  if (loading) return <div>loading..</div>;
  if (error) return <div>{error.message}</div>;

  if (!props.show) {
    return null;
  }
  const submit = async (event) => {
    event.preventDefault();
    addBook({
      variables: { title, author, published: Number(published), genres },
    });
    setTitle("");
    setPublished("");
    setAuthor("");
    setGenres([]);
    setGenre("");
  };

  const addGenre = () => {
    setGenres(genres.concat(genre));
    setGenre("");
  };

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(" ")}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  );
};

export default NewBook;
