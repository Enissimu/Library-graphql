import { useQuery } from "@apollo/client";
import { useState } from "react";
import { GET_ALL_BOOKS, ME } from "../graphkuel/graphs";

const Books = (props) => {
  const [filter, setFilter] = useState(null);
  const { data, loading, error } = useQuery(GET_ALL_BOOKS, {
    variables: { genre: filter },
  });
  const favoriteOf = useQuery(ME);
  const whatAreThose = () => {
    if (props.recommend && favoriteOf.data) {
      return <h1>books in the favorite genre of yours </h1>;
    } else {
      if (filter === null) {
        return <h1>books from all the genres</h1>;
      } else {
        return <h1>`books in the genre of {filter} </h1>;
      }
    }
  };
  const filterBooks = (target) => {
    setFilter(target.target.name);
  };
  if (!props.show) {
    return null;
  }
  if (loading) {
    return <div>loading..</div>;
  } else {
    const genres = new Set();
    data.allBooks.forEach((a) => {
      a.genres.forEach((b) => {
        genres.add(b);
      });
    });
    const genres1 = Array.from(genres);
    return (
      <div>
        <h2>books</h2>
        {whatAreThose()}

        <table>
          <tbody>
            <tr>
              <th></th>
              <th>author</th>
              <th>published</th>
            </tr>
            {data.allBooks.map((a) => {
              if (props.recommend && favoriteOf.data) {
                if (a.genres.includes(favoriteOf.data.me.favoriteGenre)) {
                  return (
                    <tr key={a.title}>
                      <td>{favoriteOf.data.me.favoriteGenre}</td>
                      <td>{a.title}</td>
                      <td>{a.author.name}</td>
                      <td>{a.published}</td>
                    </tr>
                  );
                }
              } else {
                return (
                  <tr key={a.title}>
                    <td>{a.title}</td>
                    <td>{a.author.name}</td>
                    <td>{a.published}</td>
                  </tr>
                );
              }
            })}
          </tbody>
        </table>

        {genres1.map((a) => {
          return (
            <button
              key={a}
              name={a}
              type="radio"
              style={filter === a ? { borderBlockColor: "blue" } : null}
              onClick={filterBooks}
            >
              {a}
            </button>
          );
        })}
        <button onClick={() => setFilter(null)}>All genres</button>
      </div>
    );
  }
};

export default Books;
