const validator = require("validator");
const mongoose = require("mongoose");
const { user } = require("../../models");
const bcrypt = require("bcrypt"); // Import bcrypt

class UserValidator {
  async validate(req, res, next) {
    try {
      let act = req.route.path.substring(1).replace("/:id", "");
      let errors = [];

      //validation when user signup or update
      if (act === "signup" || act === "userUpdate") {
        if (!validator.isAlpha(validator.blacklist(req.body.name, " "))) {
          errors.push("Name must be alphabet");
        }

        if (
          !validator.isStrongPassword(req.body.password, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
            returnScore: false,
            pointsPerUnique: 1,
            pointsPerRepeat: 0.5,
            pointsForContainingLower: 10,
            pointsForContainingUpper: 10,
            pointsForContainingNumber: 10,
            pointsForContainingSymbol: 10,
          })
        ) {
          errors.push(
            "password must have minimum length 8, minimum 1 lowercase character, minimum 1 uppercase character, minimum 1 numbers, and minimum 1 symbols"
          );
        }

        if (req.body.confirmPassword !== req.body.password) {
          errors.push("password does not match");
        }        
      }

      //additional check for user update
      if (act === "userUpdate") {
        let findUser = await user.findOne({ _id: req.params.id }).exec();
        if (!findUser) {
          errors.push("User id not found");
        } else {
          const validate = await bcrypt.compare(req.body.oldpassword, findUser.password);
          if (!validate) {
            errors.push("Your Old password is Wrong!");          
          }
        }
      }

      if (!validator.isEmail(req.body.email)) {
        errors.push("Email is not valid");
      }

      if (errors.length > 0) {
        return res.status(400).json({
          message: errors.join(", "),
        });
      } else {
        next();
      }
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        message: "internal server error",
        error: e,
      });
    }
  }

  async validateAddWatchList(req, res, next) {
    try {
      let act = req.route.path.substring(1);
      let errors = [];

      if (act === "addWatchList") {
        let findUser = await user.findOne({ _id: req.user.id }).exec();
        if (!findUser) {
          errors.push(" user id is not found ");
        } else {
          if (findUser.watchlist.includes(req.query.id_movie)) {
            errors.push(" id movie has been added ");
          }
        }

        if (!mongoose.Types.ObjectId.isValid(req.query.id_movie)) {
          errors.push(
            "id movie is invalid and must be 24 characters & hexadecimal"
          );
        }
      }

      if (errors.length > 0) {
        return res.status(400).json({
          message: errors.join(", "),
        });
      }
      next();
    } catch (e) {
      return res.status(500).json({
        message: "Internal Server Error",
        error: e.message,
      });
    }
  }

  async validateDeleteWatchList(req, res, next) {
    try {
      let act = req.route.path.substring(1);
      let errors = [];

      if (act === "deleteWatchList") {
        let findUser = await user.findOne({ _id: req.user.id }).exec();
        if (!findUser) {
          errors.push(" user id is not found ");
        }

        if (!mongoose.Types.ObjectId.isValid(req.query.id_movie)) {
          errors.push(
            "id movie is invalid and must be 24 characters & hexadecimal"
          );
        }
      }

      if (errors.length > 0) {
        return res.status(400).json({
          message: errors.join(", "),
        });
      }
      next();
    } catch (e) {
      return res.status(500).json({
        message: "Internal Server Error",
        error: e.message,
      });
    }
  }
}
module.exports = new UserValidator();
