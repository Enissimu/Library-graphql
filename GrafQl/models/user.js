const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minlength: 3,
  },
  favoriteGenre: {
    type: String,
    minlength: 4,
  },
  hasword: {
    type: String,
    required: true,
    minlength: 5,
  },
});

schema.plugin(uniqueValidator);

module.exports = mongoose.model("User", schema);
