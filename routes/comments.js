const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");

/* GET users listing. */
router.get("/list", commentController.get_comments);
router.post("/", commentController.comment_create);
router.patch("/", commentController.comment_edit);
router.delete("/", commentController.delete_comment);

module.exports = router;
