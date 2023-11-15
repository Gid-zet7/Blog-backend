require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
// const logger = require("morgan");
const { logger } = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");

const app = express();

app.use(logger);
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 Not Found" });
  } else {
    res.type("txt").send("404 not Found");
  }
});

app.use(errorHandler);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
module.exports = app;
