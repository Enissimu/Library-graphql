import { gql } from "@apollo/client";

export const GET_ALL_AUTHORS = gql`
  query Query {
    allAuthors {
      bookCount
      born
      name
      id
    }
  }
`;

export const POST_BOOK = gql`
  mutation Mutation(
    $title: String!
    $author: String!
    $genres: [String!]!
    $published: Int
  ) {
    addBook(
      title: $title
      author: $author
      genres: $genres
      published: $published
    ) {
      author {
        id
        name
        born
        bookCount
      }
      id
      genres
      published
      title
    }
  }
`;

export const BOOK_ADDED = gql`
  subscription BookAdded {
    bookAdded {
      author {
        bookCount
        born
        id
        name
      }
      genres
      id
      title
      published
    }
  }
`;

export const EDIT_AUTHOR = gql`
  mutation Mutation($name: String!, $setBornTo: Int!) {
    editAuthor(name: $name, setBornTo: $setBornTo) {
      bookCount
      born
      id
      name
    }
  }
`;

export const GET_ALL_BOOKS = gql`
  query Query($author: String, $genre: String) {
    allBooks(author: $author, genre: $genre) {
      author {
        name
        id
        born
        bookCount
      }
      genres
      id
      published
      title
    }
  }
`;

export const LOGIN = gql`
  mutation Mutation($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`;

export const ME = gql`
  query Query {
    me {
      username
      favoriteGenre
      id
    }
  }
`;
export const updateCachePls = (cache, query, addedThing) => {
  const uniqByName = (a) => {
    let seen = new Set();
    return a.filter((item) => {
      let k = item.title;
      return seen.has(k) ? false : seen.add(k);
    });
  };

  cache.updateQuery(query, ({ allBooks }) => {
    return { allBooks: uniqByName(allBooks.concat(addedThing)) };
  });
};
