const validator = require("validator");
const { user } = require("../../models");
const bcrypt = require("bcrypt"); // Import bcrypt

class UserValidator {
  async validate(req, res, next) {
    try {
      let act = req.route.path;
      let errors = [];
      
      if (!validator.isEmail(req.body.email)) {
        errors.push("Email is not valid");
      }

      //validation when user signup or update
      if (act === "/signup" || act === "/:id") {
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

      if (errors.length > 0) {
        const error = new Error(
					errors.join(", ")
				);
				error.statusCode = 400;
				throw error;
      } else {
        next();
      }
    } catch (error) {
			//console.log(error);
			if (!error.statusCode) {
				error.statusCode = 500;
        error.message = "Internal Server Error";				
			}
			next(error);
		}
  }
}
module.exports = new UserValidator();
