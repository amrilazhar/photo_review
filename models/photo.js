const mongoose = require("mongoose");
const mongoose_delete = require("mongoose-delete");
const mongoosePaginate = require('mongoose-paginate-v2');

const PhotosSchema = new mongoose.Schema(
  {
    unsplash_id: {
      type: String,
      required: false,
    },
    flickr_id : {
      type: String,
      required: false,
    },
    width : {
      type: Number,
      required: false,
    } ,
    height: {
      type: Number,
      required: false,
    },
    description: {
      type: Date,
      required: false,
    },
    image_links: {
      type: Object,
      required: false,
    },
    categories: {
      type: Array,
      required: false,
    },
    likes : {
      type: Array,
      required: false,
    },
    unsplash_user : {
      type: Object,
      required: false,
    },
    avg_rating : {
      type : Number,
      required : false,
    },
    count_review : {
      type : Number,
      required : false,
    },
    source_created_at : {
      type : Date,
      required : false,
    },
    source_updated_at : {
      type : Date,
      required : false,
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

PhotosSchema.plugin(mongoosePaginate);
PhotosSchema.plugin(mongoose_delete, { overrideMethods: "all" });

module.exports = mongoose.model("photos", PhotosSchema, "photos");
