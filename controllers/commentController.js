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

exports.get_post_comments = asyncHandler(async (req, res) => {
  //   const targetPostId = req.params.blog_id;

  const { postId } = req.body;

  //   const targetPost = await Post.findById(targetPostId).exec();

  //   Fetch blogPost comments
  //   const [targetPost, comments] = await Promise.all([
  //     Post.findById(postId).exec(),
  //     Comment.find({ blog_post: targetPost }),
  //   ]);

  const targetPost = await Post.findById(postId).populate("comments").exec();
  //   console.log(targetPost);
  //   const comments = Comment.find({ blog_post: targetPost }).exec();

  if (!targetPost) {
    return res.status(400).json({ message: "Couldn't find post" });
  }

  if (!targetPost.comments?.length) {
    return res
      .status(400)
      .json({ message: "There are no comments on this post" });
  }

  res.json(targetPost.comments);
});

exports.comment_create = [
  body("content")
    .trim()
    .notEmpty()
    .escape()
    .withMessage("Comment cannot be empty"),

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

    console.log(findAuthor.username);

    if (!findAuthor) {
      return res
        .status(400)
        .json({ message: "Please login to comment on this post" });
    }

    //   find target post
    const targetPost = await Post.findById(postId).exec();

    if (!targetPost) {
      return res.status(400).json({ message: "Couldn't find post" });
    }

    const comment = await Comment.create({
      author: findAuthor._id,
      content,
      username: findAuthor.username,
    });

    if (comment) {
      targetPost.comments.push(comment);
      await targetPost.save();
      return res
        .status(201)
        .json({ message: "New comment created successfully" });
    } else {
      return res.status(400).json({ message: "Invalid data provided" });
    }
  }),
];

exports.comment_edit = [
  body("content")
    .trim()
    .notEmpty()
    .escape()
    .withMessage("Comment cannot be empty"),

  asyncHandler(async (req, res) => {
    const { id, postId, content } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({
        errMsg: errors.array()[0].msg,
      });
    }

    // const parentPost = await Post.findById(postId).exec();

    // if (!parentPost) {
    //   return res.status(400).json({ message: "Post not found" });
    // }

    const comment = await Comment.findById(id).exec();
    comment.content = content;
    const updatedComment = await comment.save();

    // const targetComment = parentPost.comments.find(
    //   (comment) => comment._id.toString() === id
    // );

    // if (!targetComment) {
    //   return res.status(400).json({ message: "Comment not found" });
    // }

    // targetComment.content = content;
    // const updatedPost = await parentPost.save();

    res.json(updatedComment);

    // res.json(`Comment with id '${updatedPost._id}' updated successfully`);

    // const updatedPost = await post.save();

    // res.json(`'${updatedPost.title}' updated successfully`);
  }),
];

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

  //   const parentPostId = req.params.id;

  //   const parentPost = await Post.findById(parentPostId)
  //     .populate("comments")
  //     .populate("comments.author")
  //     .exec();

  //   if (!parentPost) {
  //     return res.status(400).json({ message: "Couldn't find post" });
  //   }

  //   const targetComment = parentPost.comments.find(
  //     (comment) => comment._id.toString() === req.query.commentid
  //   );

  //   if (!targetComment) {
  //     return res.status(400).json({ message: "Comment not found" });
  //   }

  //   const result = await Post.findOne;
});
