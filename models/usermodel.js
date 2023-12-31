const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },

    first_name: {
      type: String,
      minLength: 3,
    },

    last_name: {
      type: String,
      minLength: 3,
    },

    email: {
      type: String,
      maxLength: 1000,
      unique: true,
      required: true,
    },

    roles: {
      type: [String],
      default: ["User"],
    },

    password: {
      type: String,
      required: true,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);
