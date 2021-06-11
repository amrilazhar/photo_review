const validator = require("validator");
const mongoose = require("mongoose");
const { user, review, movie } = require("../../models");

class SearchValidator {
  async search(req,res,next) {
    try {
      let errors = [];

      // cek if params page is defined
      if (Object.keys(req.query).includes('page')) {
        //cek if param page is number
        if (!validator.isNumeric(req.query.page)) {
          errors.push("page must be number");
        }
      } else req.query.page = 1;

      // cek if params limit is defined
      if (Object.keys(req.query).includes('limit')) {
        //cek if param page is number
        if (!validator.isNumeric(req.query.limit)) {
          errors.push("limit must be number");
        }
      } else req.query.limit = 10;

      // add filter status (released/upcoming) if the query params not null
      if (Object.keys(req.query).includes('status')) {
        let status = req.query.status.toLowerCase();
        if (status !== "released" && status !== "upcoming") {
          errors.push("status unidentified");
        }
      }

      // add filter release_date if the query params not null
      if (Object.keys(req.query).includes('release_date')) {
        let release = req.query.release_date.split(",");
        //if input end and start date not a year.
        if (release.length == 2) {
          if (release[0].length !== 4 || release[1].length !== 4) {
            errors.push("date unidentified");
          }
        } else {
          if (release[0].length !== 4) { errors.push("date unidentified"); }
        }
      }
      // print error
      if (errors.length > 0) {
        return res.status(400).json({ message: "error", error: errors });
      }

      return next();
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async getAll(req,res,next) {
    try {
      let errors = [];

      // cek if params page is defined
      if (Object.keys(req.query).includes('page')) {
        //cek if param page is number
        if (!validator.isNumeric(req.query.page)) {
          errors.push("page must be number");
        }
      } else req.query.page = 1;

      // cek if params limit is defined
      if (Object.keys(req.query).includes('limit')) {
        //cek if param page is number
        if (!validator.isNumeric(req.query.limit)) {
          errors.push("limit must be number");
        }
      } else req.query.limit = 10;

      // print error
      if (errors.length > 0) {
        return res.status(400).json({ message: "error", error: errors });
      }

      return next();
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async getReview(req,res,next) {
    try {
      let errors = [];

      // cek if params page is defined
      if (Object.keys(req.query).includes('page')) {
        //cek if param page is number
        if (!validator.isNumeric(req.query.page)) {
          errors.push("page must be number");
        }
      } else req.query.page = 1;

      // cek if params limit is defined
      if (Object.keys(req.query).includes('limit')) {
        //cek if param page is number
        if (!validator.isNumeric(req.query.limit)) {
          errors.push("limit must be number");
        }
      } else req.query.limit = 10;

      // Check id_barang is valid or not
      if (Object.keys(req.params).includes('id_movie')) {
        if (!mongoose.Types.ObjectId.isValid(req.params.id_movie)) {
          errors.push("ID movie is not valid");
        }
      }

      // print error
      if (errors.length > 0) {
        return res.status(400).json({ message: "error", error: errors });
      }

      return next();
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async detailMovie(req,res,next) {
    try {
      let errors = [];

      // Check id_barang is valid or not
      if (Object.keys(req.params).includes('id_movie')) {
        if (!mongoose.Types.ObjectId.isValid(req.params.id_movie)) {
          errors.push("ID movie is not valid");
        }
      }

      //cek if user exists
      if (Object.keys(req).includes('user')) {
        if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
          errors.push("ID user is not valid");
        }
      }

      // print error
      if (errors.length > 0) {
        return res.status(400).json({ message: "error", error: errors });
      }

      return next();
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

module.exports = new SearchValidator();
