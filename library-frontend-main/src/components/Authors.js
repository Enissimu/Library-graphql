import { useQuery, useMutation } from "@apollo/client";
import { useState } from "react";
import { GET_ALL_AUTHORS, EDIT_AUTHOR } from "../graphkuel/graphs";

const Authors = (props) => {
  const [setBornTo, SetsetBornTo] = useState("");
  const [name, setName] = useState("");
  const authors = useQuery(GET_ALL_AUTHORS);
  const [update, { data, loading, error }] = useMutation(EDIT_AUTHOR, {
    onError: (error) => {
      const errors = error.graphQLErrors[0].extensions.error.errors;
      const messages = Object.values(errors)
        .map((e) => e.message)
        .join("\n");
      console.log(messages);
    },
  });

  const updateAuthor = (event) => {
    event.preventDefault();
    update({
      variables: { setBornTo: Number(setBornTo), name },
    });
  };
  if (loading) return <div>loading..</div>;
  if (error) return <div>{error.message}</div>;

  if (authors.loading) {
    return <div>loading..</div>;
  }
  if (!props.show) {
    return null;
  } else {
    return (
      <div>
        <h2>authors</h2>
        <table>
          <tbody>
            <tr>
              <th></th>
              <th>born</th>
              <th>books</th>
            </tr>
            {authors.data.allAuthors.map((a) => (
              <tr key={a.name}>
                <td>{a.name}</td>
                <td>{a.born}</td>
                <td>{a.bookCount}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <form onSubmit={updateAuthor}>
          <select
            defaultValue={authors.data ? authors.data.allAuthors[0] : ""}
            onChange={({ target }) => setName(target.value)}
          >
            {authors.data.allAuthors.map((author) => (
              <option value={author.name} key={author.name}>
                {author.name}
              </option>
            ))}
          </select>
          <input
            name="year"
            value={setBornTo}
            onChange={({ target }) => {
              SetsetBornTo(target.value);
            }}
          ></input>

          <button type="submit"> Update</button>
        </form>
      </div>
    );
  }
};

export default Authors;
