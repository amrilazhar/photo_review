const validator = require("validator");
const mongoose = require("mongoose");
const { review, photo } = require("../../models");

exports.create = async (req, res, next) => {
    try {
        let errors = [];

        // Check is rating numeric and not greater than 5?
        if (!validator.isNumeric(req.body.rating)) {
            errors.push("Rating must be a number");
        } else {
          if (req.body.rating > 5 || req.body.rating < 1 ) {
            errors.push("Rating must be a number 1 to 5");
          }
        }

        // If errors
        if (errors.length > 0) {
            return res.status(400).json({
                message: errors.join(", "),
            });
        }

        // Go to next
        next();
    } catch (e) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: e.message,
        });
    }
};

exports.update = async (req, res, next) => {
    try {
        let errors = [];

        // Check parameter id is valid or not
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            errors.push(
                "id_review is not valid and must be 24 character & hexadecimal"
            );
        }

        // If the parameters is not valid it will go here
        if (errors.length > 0) {
            return res.status(400).json({
                message: errors.join(", "),
            });
        }

        // Find data review based on ID
        let findData = await review.findOne({ _id: req.params.id });

        // If review not found
        if (!findData) {
            errors.push("review not found");
        }


        // Check jumlah is numeric
        if (!validator.isNumeric(req.body.rating)) {
            errors.push("Rating must be a number");
        } else {
          if (req.body.rating > 5 || req.body.rating < 1 ) {
            errors.push("Rating must be a number 1 to 5");
          }
        }

        if (errors.length > 0) {
            return res.status(400).json({
                message: errors.join(", "),
            });
        }

        // Go to next
        next();
    } catch (e) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: e.message,
        });
    }
}

exports.delete = async (req, res, next) => {
    try {
        let errors = [];

        // Check params is valid or not
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            errors.push(
                "id_review is not valid and must be 24 character & hexadecimal"
            );
        }

        // If params error
        if (errors.length > 0) {
            return res.status(400).json({
                message: errors.join(", "),
            });
        }

        // Find one Review
        let data = await review.findOne({ _id: req.params.id });

        // If Review not found
        if (!data) {
            errors.push("Review not found");
        }

        // If error
        if (errors.length > 0) {
            return res.status(400).json({
                message: errors.join(", "),
            });
        }

        // Go to next
        next();
    } catch (e) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: e.message,
        });
    }
};

exports.get = async (req, res, next) => {
    try {
        let errors = [];

        // Check parameter id is valid or not
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            errors.push(
                "id_review is not valid and must be 24 character & hexadecimal"
            );
        }

        // If the parameters is not valid it will go here
        if (errors.length > 0) {
            return res.status(400).json({
                message: errors.join(", "),
            });
        }

        // Go to next
        next();
    } catch (e) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: e.message,
        });
    }
}
