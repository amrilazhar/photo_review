const crypto = require("crypto");
const path = require("path");
const mongoose = require("mongoose");
const validator = require("validator");
const { movie } = require("../../models");

exports.create = async (req, res, next) => {
  try {
    let errors = [];

    if (!validator.isAlpha(validator.blacklist(req.body.director, " "))) {
      errors.push("Director should be alphabet");
    }

    if (!validator.isNumeric(req.body.budget)) {
      errors.push("Budget should be number");
    }

    if (!validator.isDate(req.body.release_date)) {
      errors.push("Date is consist of yyyy/mm/dd");
    }

    if (typeof req.body.genre == "string") {
      if (!validator.isAlpha(validator.blacklist(req.body.genre, ", "))) {
        errors.push("Genre should be alphabet");
      }
    } else {
      req.body.genre.forEach((item) => {
        if (!validator.isAlpha(validator.blacklist(item, ", "))) {
          errors.push("Genre should be alphabet");
        }
      });
    }

    if (errors.length > 0) {
      return res.status(400).json({
        message: errors.join(", "),
      });
    }

    if (req.files) {
      if (req.files.character_images) {
        // cek apakah array
        if (!req.files.character_images.length) {
          req.files.character_images = [req.files.character_images];
        }
        const file = req.files.character_images;
        req.character = { images: [] };
        for (let i = 0; i < file.length; i++) {
          if (!file[i].mimetype.startsWith("image")) {
            return res.status(400).json({
              message: "file must be an image",
            });
          }

          if (file[i].size > 3000000) {
            return res.status(400).json({
              message: "file size larger than 3MB",
            });
          }

          let fileName = crypto.randomBytes(16).toString("hex");
          file[i].name = `${fileName}${path.parse(file[i].name).ext}`;
          req.character.images.push(file[i].name);

          file[i].mv(`./public/images/cast/` + `${file[i].name}`, function (
            err
          ) {
            if (err) {
              console.log(err);

              return res.status(500).json({
                message: "Internal Server Error",
                error: err.message,
              });
            }
          });
        }
      }

      if (req.files.backdrop) {
        const file = req.files.backdrop;
        if (!file.mimetype.startsWith("image")) {
          return res.status(400).json({
            message: "file must be an image",
          });
        }

        if (file.size > 5000000) {
          return res.status(400).json({
            message: "file size larger than 5MB",
          });
        }

        let fileName = crypto.randomBytes(16).toString("hex");

        file.name = `${fileName}${path.parse(file.name).ext}`;

        req.body.backdrop = file.name;

        file.mv(`./public/images/backdrop/${file.name}`, async (err) => {
          if (err) {
            console.log(err);
            return res.status(500).json({
              message: "Internal Server Error",
              error: err.message,
            });
          }
        });
      }

      if (req.files.poster) {
        const file = req.files.poster;

        if (!file.mimetype.startsWith("image")) {
          return res.status(400).json({
            message: "file must be an image",
          });
        }

        if (file.size > 5000000) {
          return res.status(400).json({
            message: "file size larger than 5MB",
          });
        }

        let fileName = crypto.randomBytes(16).toString("hex");

        file.name = `${fileName}${path.parse(file.name).ext}`;

        req.body.poster = file.name;

        file.mv(`./public/images/poster/${file.name}`, async (err) => {
          if (err) {
            console.log(err);
            return res.status(500).json({
              message: "Internal Server Error",
              error: err.message,
            });
          }
        });
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
};

exports.update = async (req, res, next) => {
  try {
    let errors = [];

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message:
          "id_movie is not valid and must be 24 characters & hexadecimal",
      });
    }

    let data = await movie.findOne({ _id: req.params.id }).exec();

    if (!data) {
      return res.status(400).json({
        message: "Movie not found",
      });
    }

    if (!validator.isAlpha(validator.blacklist(req.body.director, " "))) {
      errors.push("Director should be alphabet");
    }

    if (!validator.isNumeric(req.body.budget)) {
      errors.push("Budget should be number");
    }

    if (!validator.isDate(req.body.release_date)) {
      errors.push("Date is consist of yyyy/mm/dd");
    }

    if (typeof req.body.genre == "string") {
      if (!validator.isAlpha(validator.blacklist(req.body.genre, ", "))) {
        errors.push("Genre should be alphabet");
      }
    } else {
      req.body.genre.forEach((item) => {
        if (!validator.isAlpha(validator.blacklist(item, ", "))) {
          errors.push("Genre should be alphabet");
        }
      });
    }

    if (errors.length > 0) {
      return res.status(400).json({
        message: errors.join(", "),
      });
    }

    if (req.files) {
      if (req.files.character_images) {
        // cek apakah array
        if (!req.files.character_images.length) {
          req.files.character_images = [req.files.character_images];
        }
        const file = req.files.character_images;
        req.character = { images: [] };
        for (let i = 0; i < file.length; i++) {
          if (!file[i].mimetype.startsWith("image")) {
            return res.status(400).json({
              message: "file must be an image",
            });
          }

          if (file[i].size > 3000000) {
            return res.status(400).json({
              message: "file size larger than 3MB",
            });
          }

          let fileName = crypto.randomBytes(16).toString("hex");

          file[i].name = `${fileName}${path.parse(file[i].name).ext}`;

          req.character.images.push(file[i].name);

          file[i].mv(`./public/images/cast/` + `${file[i].name}`, (err) => {
            if (err) {
              console.log(err);
              return res.status(500).json({
                message: "Internal Server Error",
                error: err.message,
              });
            }
          });
        }
      }

      if (req.files.backdrop) {
        const file = req.files.backdrop;

        if (!file.mimetype.startsWith("image")) {
          return res.status(400).json({
            message: "file must be an image",
          });
        }

        if (file.size > 5000000) {
          return res.status(400).json({
            message: "file size larger than 5MB",
          });
        }

        let fileName = crypto.randomBytes(16).toString("hex");

        file.name = `${fileName}${path.parse(file.name).ext}`;

        req.body.backdrop = file.name;

        file.mv(`./public/images/backdrop/${file.name}`, async (err) => {
          if (err) {
            console.log(err);
            return res.status(500).json({
              message: "Internal Server Error",
              error: err.message,
            });
          }
        });
      }

      if (req.files.poster) {
        const file = req.files.poster;

        if (!file.mimetype.startsWith("image")) {
          return res.status(400).json({
            message: "file must be an image",
          });
        }

        if (file.size > 5000000) {
          return res.status(400).json({
            message: "file size larger than 5MB",
          });
        }

        let fileName = crypto.randomBytes(16).toString("hex");

        file.name = `${fileName}${path.parse(file.name).ext}`;

        req.body.poster = file.name;

        file.mv(`./public/images/poster/${file.name}`, async (err) => {
          if (err) {
            console.log(err);
            return res.status(500).json({
              message: "Internal Server Error",
              error: err.message,
            });
          }
        });
      }
    }
    next();
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      message: "Internal Server Error",
      error: e.message,
    });
  }
};

exports.delete = async (req, res, next) => {
  let errors = [];

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    errors.push("id_movie is not valid and must be 24 character & hexadecimal");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: errors.join(", "),
    });
  }

  let data = await movie.findOne({ _id: req.params.id });

  if (!data) {
    errors.push("Movie not found");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: errors.join(", "),
    });
  }

  next();
};
