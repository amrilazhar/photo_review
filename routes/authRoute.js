const express = require("express");
const router = express.Router();

// import for auth needs
const { doAuth } = require("../middlewares/auth/");
const authController = require("../controllers/authController");
const userValidator = require("../middlewares/validators/userValidator");
const userUpload = require("../middlewares/uploads/userUpload");

router.post("/signup", userValidator.validate, userUpload, doAuth, authController.getToken);
router.post("/login", userValidator.validate, doAuth, authController.getToken);


module.exports = router;
