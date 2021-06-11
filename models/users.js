const mongoose = require("mongoose");
const mongoose_delete = require("mongoose-delete");
const bcrypt = require("bcrypt"); // Import bcrypt

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      set: encryptPwd,
    },
    role: {
      type: String,
      required: true,
      default: "user",
    },
    favorite : [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "photo",
      },
    ],
    profile_picture: {
      type: String,
      required: false,
      get: getProfileImage,
      default: "defaultProfile.png",
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    toJSON: { getters: true },
  }
);

function getProfileImage(image) {
  if (image[0] !== "/") {
    image = "/" + image;
  }
  return process.env.PUBLIC_URL
    ? process.env.PUBLIC_URL + `/images/profile${image}`
    : `/images/profile${image}`;
}

function encryptPwd(password) {
  return bcrypt.hashSync(password, 10);
}

UserSchema.plugin(mongoose_delete, { overrideMethods: "all" });

module.exports = mongoose.model("user", UserSchema, "user");
