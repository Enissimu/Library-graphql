bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const Author = require("../models/author");
const Book = require("../models/book");
const { GraphQLError } = require("graphql");
const { PubSub } = require("graphql-subscriptions");
const pubsub = new PubSub();

const DataLoader = require("dataloader");

const authorLoader = new DataLoader(async (authorIds) => {
  const books = await Book.find({ author: authorIds });
  const booksByAuthor = authorIds.map((authorId) => {
    return books.filter((book) => book.author == authorId).length;
  });

  return booksByAuthor;
});
const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, { author, genre }) => {
      if (genre && author) {
        const authorId = await Author.find({ name: author });
        return Book.find({
          genres: { $in: [genre] },
          author: authorId,
        }).populate("author");
      }
      if (genre) {
        return Book.find({
          genres: { $in: [genre] },
        }).populate("author");
      }
      if (author) {
        const authorId = await Author.find({ name: author });
        return Book.find({
          author: authorId,
        }).populate("author");
      }

      const foundOnes = await Book.find({}).populate("author");

      return foundOnes;
    },
    allAuthors: async (root, args) => {
      return Author.find({});
    },
    me: async (root, args, context) => {
      return context.currentUser;
    },
  },
  Mutation: {
    addBook: async (root, args) => {
      const IsThereAuthor = await Author.findOne({ name: args.author });

      if (!IsThereAuthor) {
        const IsThereAuthor = new Author({
          name: args.author,
          born: args.born,
        });

        const newBook = {
          title: args.title,
          genres: args.genres,
          published: args.published,
          author: IsThereAuthor,
        };

        const newBook1 = new Book(newBook);
        try {
          await IsThereAuthor.save();

          await newBook1.save();
        } catch (error) {
          throw new GraphQLError("Failed to create a new book", {
            extensions: {
              code: "BAD_USER_INPUT",
              invalidArgs: args.title,
              error,
            },
          });
        }

        pubsub.publish("BOOK_ADDED", { bookAdded: newBook1 });

        return newBook1.populate("author");
      } else {
        const newBook = {
          title: args.title,
          genres: args.genres,
          published: args.published,
          author: IsThereAuthor,
        };
        const newBook1 = new Book(newBook);
        try {
          await newBook1.save();
        } catch (error) {
          throw new GraphQLError("Failed to create a new book", {
            extensions: {
              code: "BAD_USER_INPUT",
              invalidArgs: args.title,
              error,
            },
          });
        }
        s;
        pubsub.publish("BOOK_ADDED", { bookAdded: newBook1 });
        return newBook1.populate("author");
      }
    },
    editAuthor: async (root, args, context) => {
      if (!context.currentUser) {
        throw new GraphQLError("You are not autharized", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }
      const foundAuthor =
        args.name === ""
          ? await Author.findOne()
          : await Author.findOne({ name: args.name });

      foundAuthor["born"] = args.setBornTo;
      try {
        await foundAuthor.save();
      } catch (error) {
        throw new GraphQLError("Failed to change born year", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: [args.name, args.setBornTo],
            error,
          },
        });
      }
      return foundAuthor;
    },
    createUser: async (root, args, context) => {
      const saltRounds = 10;
      const hasword = await bcrypt.hash("123456", saltRounds);
      const newUser = new User({
        username: args.username,
        hasword: hasword,
        favoriteGenre: args.favoriteGenre,
      });
      try {
        await newUser.save();
      } catch (error) {
        throw new GraphQLError("Cannot create user", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: [args.username, args.password],
            error,
          },
        });
      }
      return newUser;
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });

      if (!user || args.password !== "123456") {
        throw new GraphQLError("Cannot Login", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.username,
            error,
          },
        });
      }
      const tokenUser = {
        username: user.username,
        id: user._id,
      };
      return { value: jwt.sign(tokenUser, process.env.SECRET) };
    },
  },

  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator("BOOK_ADDED"),
    },
  },
  Author: {
    bookCount: (author) => {
      return authorLoader.load(author.id);
    },
  },
};
module.exports = resolvers;
