const crypto = require("crypto");

function upload(req, res, next) {
  let sampleFile;
  let uploadPath;
  let fileName = crypto.randomBytes(16).toString("hex");

  if (!req.files || Object.keys(req.files).length === 0) {
    req.body.profile_picture = "defaultProfile.png";
    next();
  } else {

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    sampleFile = req.files.profile_picture;

    // Check file size (max 1MB)
    if (sampleFile.size > 5000000) {
      return res
        .status(400)
        .json({ message: "Image must be less than 5MB" });
    }

    if (
      sampleFile.mimetype == "image/jpeg" ||
      sampleFile.mimetype == "image/png" ||
      sampleFile.mimetype == "image/gif" ||
      sampleFile.mimetype == "image/bmp"
    ) {
      fileName += "."+ sampleFile.mimetype.substring(6);
      uploadPath = "./public/images/profile/" + fileName ;
      // Use the mv() method to place the file somewhere on your server
      sampleFile.mv(uploadPath, function (err) {
        if (err) return res.status(500).send(err);
      });

      req.body.profile_picture = fileName;
      next();
    } else {
      return res.status(400).send({message : "file is not an image" });
    }
  }
}

module.exports = upload;
