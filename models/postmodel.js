const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostModel = new Schema(
  {
    title: {
      type: String,
      minLength: 3,
      maxLength: 100,
      required: true,
    },

    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    image: {
      url: String,
      owner: String,
      source: String,
    },

    body: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    public: {
      type: String,
      default: "false",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("BlogPost", PostModel);
