var express = require("express");
var router = express.Router();
const postController = require("../controllers/postController");

/* GET users listing. */
router.get("/", postController.get_all_posts);

module.exports = router;
