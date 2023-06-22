const typeDefs = `
  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book]!
    allAuthors: [Author]!
    me: User
  }
  type Subscription{
    bookAdded:Book!
  }
  type Mutation {
    addBook(
      title: String!
      author: String!
      genres: [String!]!
      published: Int
    ): Book
    editAuthor(
      name:String!
      setBornTo:Int!
    ):Author
    createUser(
      username: String!
      favoriteGenre: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
  }
  type Book {
    title: String!
    published: Int!
    id: ID!
    author: Author!
    genres: [String!]!
  }
  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int
  }
  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }
  type Token {
    value: String!
  }
  
`;

module.exports = typeDefs;
