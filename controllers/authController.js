require("dotenv").config();
const User = require("../models/usermodel");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  const findUser = await User.findOne({ username }).exec();

  if (!findUser || !findUser.active) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const match = await bcrypt.compare(password, findUser.password);

  if (!match) return res.status(401).json({ message: "Unauthorized" });

  const accessToken = jwt.sign(
    {
      UserInfo: {
        Username: findUser.username,
        roles: findUser.roles,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "20m" }
  );

  console.log(findUser.username);

  const refreshToken = jwt.sign(
    { username: findUser.username },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("jwt", refreshToken, {
    httpOnly: true, // accessible only by web server
    // secure: true, // https
    // sameSite: "None", // cross-site cookie
    maxAge: 7 * 24 * 60 * 60 * 1000, // cookie expiry set to match refresh token
  });

  res.json({ accessToken });
});

exports.signup = asyncHandler(async (req, res) => {
  const { username, first_name, last_name, email, password } = req.body;

  console.log(username, first_name, last_name, email, password);

  if ((!username || !password || !first_name || !last_name, !email)) {
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
    password: hashedPassword,
  };

  // Save user to database
  const user = await User.create(userObj);

  if (user) {
    res.status(201).json({ message: `Signed up successfully` });
  } else {
    res.status(400).json({ mesaage: "Invalid" });
  }
});

exports.refresh = asyncHandler(async (req, res) => {
  const cookies = req.cookies;

  console.log(cookies);

  if (!cookies?.jwt) return res.status(401).json({ message: "Unauthorized" });

  const refreshToken = cookies.jwt;

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    asyncHandler(async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Forbidden" });

      const findUser = await User.findOne({
        username: decoded.username,
      }).exec();

      if (!findUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const accessToken = jwt.sign(
        {
          UserInfo: {
            Username: findUser.username,
            roles: findUser.roles,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "20m" }
      );

      console.log(accessToken);

      res.json({ accessToken });
    })
  );
});

exports.logout = asyncHandler(async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendFile(204);
  res.clearCookie("jwt", {
    httpOnly: true,
    // secure: true, // https
    // sameSite: "None",
  });
  res.json({ message: "Cookie cleared" });
});
