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

    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
        required: false,
      },
    ],

    category: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("BlogPost", PostModel);
