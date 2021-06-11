const express = require("express");
const router = express.Router();

// import for auth needs
const { isUserOrGlobal } = require("../middlewares/auth");

//Import Controller Here
const photoController = require("../controllers/photoController");

//Create your Router Here
router.get("/all", isUserOrGlobal, photoController.allReviewed);
router.get("/browse", isUserOrGlobal, photoController.browsePhoto);
router.get("/search", isUserOrGlobal, photoController.search);
router.get("/detail_local", isUserOrGlobal, photoController.detail_local);
router.get("/detail_out", isUserOrGlobal, photoController.detail_sources);

module.exports = router;
