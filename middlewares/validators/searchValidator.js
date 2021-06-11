const validator = require("validator");
const mongoose = require("mongoose");
const { user, review, movie } = require("../../models");

class SearchValidator {
  async search(req,res,next) {
    try {
      

      return next();
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Internal server error" });
    }
  }

}

module.exports = new SearchValidator();
