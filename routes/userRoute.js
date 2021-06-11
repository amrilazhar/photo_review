const express = require("express");
const router = express.Router();

// import for auth needs
const passport = require("passport");
const { isUser } = require("../middlewares/auth/");

//Import Controller Here
const userController = require("../controllers/userController");

//Import Midddlewares Here
const userValidator = require("../middlewares/validators/userValidator");
const userUpload = require("../middlewares/uploads/userUpload");

//Create your Router Here
// router.get("/userProfile/:id", isUserOrGlobal , userController.userProfile); //view all user profile (if global want to view our profile)
router.put("/userUpdate/:id", userValidator.validate, isUser, userUpload, userController.userUpdate); //Update profile
router.get("/myUserProfile", isUser, userController.myUserProfile); //view my user profile
router.get("/userGetReview", isUser, userController.userGetReview); //get review
router.get("/getWatchlist",isUser, userController.getWatchList) //get watchlist
router.put("/addWatchList", isUser, userValidator.validateAddWatchList, userController.addWatchList) //add watchlist
router.put("/deleteWatchList", isUser, userValidator.validateDeleteWatchList, userController.deleteWatchList) //deleteWatchlist

module.exports = router;
