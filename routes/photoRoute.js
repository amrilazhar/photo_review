const express = require("express");
const router = express.Router();

// import for auth needs
const { isUserOrGlobal } = require("../middlewares/auth");

//Import Controller Here
const photoController = require("../controllers/photoController");
//Import Midddlewares Here
const searchValidator = require("../middlewares/validators/searchValidator");

//Create your Router Here
router.get("/getAll", isUserOrGlobal, searchValidator.getAll, photoController.getAll);

router.get("/search", isUserOrGlobal, photoController.search);

router.get("/detail/:id_movie", isUserOrGlobal, searchValidator.detailMovie, photoController.detail);
router.get("/getReview/:id_movie", isUserOrGlobal, searchValidator.getReview, photoController.getReview);

module.exports = router;
