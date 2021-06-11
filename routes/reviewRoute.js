const express = require("express");
const router = express.Router();

// import for auth needs
const { isUser } = require("../middlewares/auth/");
//Import Midddlewares Here

const reviewValidator = require("../middlewares/validators/reviewValidator");
//Import Controller Here
const reviewController = require("../controllers/reviewController");

//Create your Router Here
router.get("/:id", isUser, reviewValidator.get, reviewController.getOne);
router.put("/:id", isUser, reviewValidator.update, reviewController.update);
router.delete("/:id", isUser, reviewValidator.delete, reviewController.delete);
router.post("/", isUser, reviewValidator.create, reviewController.create);


module.exports = router;
