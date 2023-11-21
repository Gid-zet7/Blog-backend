var express = require("express");
var router = express.Router();
const postController = require("../controllers/postController");
const verifyJWT = require("../middleware/verifyJWT");

router.use(verifyJWT);

/* GET users listing. */
router.get("/", postController.get_all_posts);
router.post("/", postController.post_create);
router.patch("/", postController.post_update);
router.delete("/", postController.post_delete);

module.exports = router;
