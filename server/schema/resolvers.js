const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    // users: async () => {
    //   return User.find().populate('thoughts');
    // },
    // user: async (parent, { username }) => {
    //   return User.findOne({ username }).populate('thoughts');
    // },
    // thoughts: async (parent, { username }) => {
    //   const params = username ? { username } : {};
    //   return Thought.find(params).sort({ createdAt: -1 });
    // },
    // thought: async (parent, { thoughtId }) => {
    //   return Thought.findOne({ _id: thoughtId });
    // },
    me: async (parent, args, context) => {
      if (context.user) {
        const user= await User.findOne({ _id: context.user._id })
        return user;
      }
      throw new AuthenticationError('You need to be logged in!');
    },
  },

  Mutation: {
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('No user found with this email address');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user);

      return { token, user };
    },
    saveBook: async (parent, { authors, description, title, bookId, image, link }, context) => {
      if (context.user) {
        const user= await User.findOneAndUpdate(
          { _id: context.user._id },
          {
            $addToSet: {
              savedBooks:{
                authors, description: description?description:"none ", title, bookId, image, link
              }
            }
          },
          // {
          //   new: true,
          //   runValidators: true,
          // }
        );
        return user;
      }
      throw new AuthenticationError('You need to be logged in!');
    },
    removeBook: async (parent, {bookId}, context) => {
      if (context.user) {

        const user= await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: {bookId}} },
          { new: true }
        );

        return user;
      }
      throw new AuthenticationError('You need to be logged in!');
    },
  },
};

module.exports = resolvers;
