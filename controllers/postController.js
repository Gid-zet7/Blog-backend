const User = require("../models/usermodel");
const Post = require("../models/postmodel");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.get_all_posts = asyncHandler(async (req, res) => {
  const posts = await Post.find().lean();

  if (!posts?.length) {
    return res.status(400).json({ message: "Couldn't find post" });
  }

  //   Adds a username to each post before sending the response
  const postsWithUser = await Promise.all(
    posts.map(async (post) => {
      const author = await User.findById(post.author).lean().exec();
      return { ...post, username: author.username };
    })
  );

  res.json(postsWithUser);
});

exports.post_create = [
  body("title")
    .trim()
    .isLength({ min: 3, max: 1000 })
    .escape()
    .withMessage("Title cannot be empty"),
  body("dispaly-image.url").escape(),
  body("dispaly-image.owner").escape(),
  body("dispaly-image.source").escape(),
  body("body")
    .trim()
    .notEmpty()
    .escape()
    .withMessage("Content cannot be empty"),
  body("category")
    .trim()
    .notEmpty()
    .escape()
    .withMessage("Category cannot be empty"),

  asyncHandler(async (req, res) => {
    const { id, author, title, body, image, comments, category } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({
        errMsg: errors.array()[0].msg,
      });
    }

    const duplicate = await Post.findOne({ title }).lean().exec();

    if (duplicate) {
      return res
        .status(400)
        .json({ message: "Title already used by another author" });
    }
    console.log(author);

    const findAuthor = await User.findOne({ username: author }).exec();

    console.log(findAuthor);

    if (!findAuthor) {
      return res.status(400).json({ message: "Could not find author" });
    }

    const post = await Post.create({
      title,
      author: findAuthor,
      image,
      body,
      category,
    });

    if (post) {
      return res
        .status(201)
        .json({ message: `New post with title '${post.title}' created` });
    } else {
      return res.status(400).json({ message: "Invalid" });
    }
  }),
];

exports.post_update = [
  body("title")
    .trim()
    .isLength({ min: 3, max: 1000 })
    .escape()
    .withMessage("Title cannot be empty"),
  body("author")
    .trim()
    .notEmpty()
    .escape()
    .withMessage("Author cannot be empty"),
  body("display-image.url").escape(),
  body("display-image.owner").escape(),
  body("display-image.source").escape(),
  body("body")
    .trim()
    .notEmpty()
    .escape()
    .withMessage("Content cannot be empty"),
  body("category")
    .trim()
    .notEmpty()
    .escape()
    .withMessage("Category cannot be empty"),

  asyncHandler(async (req, res) => {
    const { id, author, title, body, image, comments, category } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({
        errMsg: errors.array()[0].msg,
      });
    }

    const post = await Post.findById(id).exec();

    if (!post) {
      return res.status(400).json({ message: "Post not found" });
    }

    const duplicate = await Post.findOne({ title }).lean().exec();

    if (duplicate && duplicate?._id.toString() !== id) {
      return res
        .status(409)
        .json({ message: "Title already used by another author" });
    }

    const findAuthor = await User.findOne({ username: author }).exec();

    if (!findAuthor) {
      return res.status(400).json({ message: "Could not find author" });
    }

    post.title = title;
    post.author = findAuthor;
    post.image = image;
    post.body = body;
    post.comments = comments;
    post.category = category;

    const updatedPost = await post.save();

    res.json(`'${updatedPost.title}' updated successfully`);
  }),
];

exports.post_delete = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Post ID required" });
  }

  const post = await Post.findById(id).exec();

  if (!post) {
    return res.status(400).json({ message: "Couldn't find post" });
  }

  const result = await post.deleteOne();

  const message = "Post deleted successfully";

  res.json(message);
});
