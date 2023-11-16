const User = require("../models/usermodel");
const Post = require("../models/postmodel");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

exports.user_list = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").lean();
  if (!users?.length) {
    return res.status(400).json({ message: "No users found" });
  }
  res.json(users);
});

exports.user_create = asyncHandler(async (req, res) => {
  const { username, first_name, last_name, email, password, roles } = req.body;

  if (
    (!username || !password || !first_name || !last_name,
    !email || !Array.isArray(roles) || !roles.length)
  ) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  // Finding duplicates
  const duplicate = await User.findOne({ username }).lean().exec();

  if (duplicate) {
    return res.status(409).json({ message: "Username already exists" });
  }

  // Hashing password
  const hashedPassword = await bcrypt.hash(password, 10);

  const userObj = {
    username,
    first_name,
    last_name,
    email,
    roles,
    password: hashedPassword,
  };

  // Save user to database
  const user = await User.create(userObj);

  if (user) {
    res.status(201).json({ message: `New user ${username} created` });
  } else {
    res.status(400).json({ mesaage: "Invalid" });
  }
});

exports.user_update = asyncHandler(async (req, res) => {
  const {
    id,
    username,
    first_name,
    last_name,
    email,
    password,
    roles,
    active,
  } = req.body;

  if (
    (!id || !username || !password || !first_name || !last_name,
    !email ||
      !Array.isArray(roles) ||
      !roles.length ||
      typeof active !== "boolean")
  ) {
    return res.status(400).json({ message: "Sorry, all fields are required!" });
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "user not found" });
  }

  const duplicate = await User.findOne({ username }).lean().exec();

  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "user already exists" });
  }

  user.username = username;
  user.first_name = first_name;
  user.last_name = last_name;
  user.email = email;
  user.roles = roles;
  user.active = active;

  if (password) {
    user.password = await bcrypt.hash(password, 10);
  }

  const updatedUser = await user.save();

  res.json({ mesaage: `${updatedUser.username} updated successfully` });
});

exports.user_delete = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "User ID required" });
  }

  const post = await Post.findOne({ author: id }).lean().exec();

  console.log(post);
  if (post) {
    return res.status(400).json({ message: "This user has assigned posts" });
  }

  const user = await User.findById(id).exec();
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const result = await user.deleteOne();

  const message = "User deleted successfully";

  res.json(message);
});
