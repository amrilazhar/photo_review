const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const ReviewSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    photo_id : {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "photos",
    },
    rating: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: false,
    },
    review: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

// Prevent user for submitting more than one review per movie
ReviewSchema.index({ photo_id: 1, user_id: 1 }, { unique: true });

// Static method to get averaga rating
ReviewSchema.statics.getAverageRating = async function (photoId) {
  try {
    let obj = await this.aggregate([
      {
        $match: { photo_id : photoId },
      },
      {
        $group: {
          _id: "$photo_id",
          averageRating: { $avg: "$rating" },
        },
      },
    ]);
    let count_review = await this.find({ photo_id: photoId }).exec();

    await this.model("photos").findByIdAndUpdate(photoId, {
      avg_rating: obj[0].averageRating,
      count_review: eval(count_review.length),
    });
  } catch (e) {
    console.log(e);
  }
};

// call getAverageCost after save
ReviewSchema.post("save", function () {
  //call function get average rating from model document
  this.constructor.getAverageRating(this.photo_id);
});

// call getAverageCost after update
ReviewSchema.post("findOneAndUpdate", function () {
  //get photoId from this (query document)
  let photoId = this._update["$set"].photo_id;
  //call the getAverageRating function within query document.
  this.model.getAverageRating(photoId);
});

// call getAverageCost after remove
ReviewSchema.post("remove", function () {
  this.constructor.getAverageRating(this.photo_id);
});

ReviewSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("reviews", ReviewSchema, "reviews");
