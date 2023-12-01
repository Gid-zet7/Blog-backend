const User = require("../models/usermodel");
const Post = require("../models/postmodel");
const Comment = require("../models/comment");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.get_comments = asyncHandler(async (req, res) => {
  const comments = await Comment.find().lean();

  if (!comments?.length) {
    return res.status(400).json({ message: "There are no comments" });
  }

  res.json(comments);
});

exports.comment_create = [
  body("content").trim().notEmpty().withMessage("Comment cannot be empty"),

  asyncHandler(async (req, res) => {
    const { postId, content, author } = req.body;
    // const targetPostId = req.params.blog_id;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({
        errMsg: errors.array()[0].msg,
      });
    }

    // Find author attempting to comment in database
    const findAuthor = await User.findOne({ username: author }).exec();

    if (!findAuthor) {
      return res
        .status(400)
        .json({ message: "Please login to comment on this post" });
    }

    const comment = await Comment.create({
      post: postId,
      author: findAuthor._id,
      content,
      username: findAuthor.username,
    });

    if (!comment) {
      return res.status(400).json({ message: "Invalid data provided" });
    }

    comment.save();

    res.json({ message: "Comment sent" });
  }),
];

// exports.comment_edit = [
//   body("content")
//     .trim()
//     .notEmpty()
//     .escape()
//     .withMessage("Comment cannot be empty"),

//   asyncHandler(async (req, res) => {
//     const { id, content } = req.body;

//     const errors = validationResult(req);

//     if (!errors.isEmpty()) {
//       res.status(400).json({
//         errMsg: errors.array()[0].msg,
//       });
//     }

//     const comment = await Comment.findById(id).exec();

//     comment.content = content;
//     const updatedComment = await comment.save();

//     res.json(updatedComment);

//   }),
// ];

exports.delete_comment = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Comment ID required" });
  }

  const targetComment = await Comment.findById(id).exec();

  if (!targetComment) {
    return res.status(400).json({ message: "Couldn't find comment" });
  }

  const result = await targetComment.deleteOne();

  const message = "Comment deleted successfully";

  res.json(message);
});
