const express = require("express");
const router = express.Router();
const loginLimiter = require("../middleware/loginLimiter");
const authController = require("../controllers/authController");

/* GET users listing. */
router.post("/login", loginLimiter, authController.login);
router.post("/signup", authController.signup);
router.get("/refresh", authController.refresh);
router.post("/logout", authController.logout);

module.exports = router;
