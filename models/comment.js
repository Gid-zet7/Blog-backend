const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  date_created: {
    type: Date,
    default: Date.now(),
  },

  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  content: {
    type: String,
    required: true,
  },

  parent_comment_id: {
    type: Schema.Types.ObjectId,
    ref: "Comment",
    required: false,
  },
});

module.exports = mongoose.model("Comment", CommentSchema);
