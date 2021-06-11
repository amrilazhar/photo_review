const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const ReviewSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    photo : {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "photo",
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
ReviewSchema.index({ movie_id: 1, user_id: 1 }, { unique: true });

// Static method to get averaga rating
ReviewSchema.statics.getAverageRating = async function (movieId) {
  try {
    let obj = await this.aggregate([
      {
        $match: { movie_id: movieId },
      },
      {
        $group: {
          _id: "$movie_id",
          averageRating: { $avg: "$rating" },
        },
      },
    ]);
    let count_review = await this.find({ movie_id: movieId }).exec();

    await this.model("movies").findByIdAndUpdate(movieId, {
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
  this.constructor.getAverageRating(this.movie_id);
});

// call getAverageCost after update
ReviewSchema.post("findOneAndUpdate", function () {
  //get movie id from this (query document)
  let movieId = this._update["$set"].movie_id;
  //call the getAverageRating function within query document.
  this.model.getAverageRating(movieId);
});

// call getAverageCost after remove
ReviewSchema.post("remove", function () {
  this.constructor.getAverageRating(this.movie_id);
});

ReviewSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("reviews", ReviewSchema, "reviews");
