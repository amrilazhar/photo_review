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
router.get("/me", isUser, userController.myUserProfile); //view my user profile
router.get("/reviewed_photo", isUser, userController.userGetReview); //get list photo reviewed
router.get("/favorite_list", isUser, userController.getFavorite); //get watchlist
router.put("/favorite", isUser, userController.addFavorite); //add watchlist
router.delete("/unfavorite", isUser, userController.deleteFavorite); //deleteWatchlist
router.put(
	"/:id",
	userValidator.validate,
	isUser,
	userUpload,
	userController.userUpdate
);

module.exports = router;
