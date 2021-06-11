const express = require("express");
const router = express.Router();

// import for auth needs
const { isUser } = require("../middlewares/auth/");
//Import Midddlewares Here

const reviewValidator = require("../middlewares/validators/reviewValidator");
//Import Controller Here
const reviewController = require("../controllers/reviewController");

//Create your Router Here
router.get("/getOne/:id", isUser, reviewValidator.get, reviewController.getOne);
router.post("/add", isUser, reviewValidator.create, reviewController.create);
router.put("/update/:id", isUser, reviewValidator.update, reviewController.update);
router.delete("/delete/:id", isUser, reviewValidator.delete, reviewController.delete);

module.exports = router;
