const { review, photo } = require("../models");
const myUnsplash = require("../helpers/unsplashAPI");
const myFlickr = require("../helpers/flickrAPI");
class ReviewController {
	async getOne(req, res, next) {
		try {
			req.body.user_id = req.user.id;
			const singleReview = await review
				.findById(req.params.id)
				.populate("movie_id", "title poster");

			// if review not found
			if (!singleReview) {
				const error = new Error("Review not found");
				error.statusCode = 400;
				throw error;
			}

			if (singleReview.user_id.toString() !== req.user.id && req.user.id) {
				return res.status(400).json({
					message: `you are not the owner of this review`,
				});
			}

			// If success
			return res.status(200).json({
				message: "Success",
				data: singleReview,
			});
		} catch (error) {
			if (!error.statusCode) {
				error.statusCode = 500;
				error.message = "Internal Server Error";
			}
			next(error);
		}
	}

	async create(req, res, next) {
		try {
			let insertedPhotoId;
			let photoData;
			let createdData = {
				title: req.body.title,
				rating: eval(req.body.rating),
				review: req.body.review,
				user_id: req.user.id,
			};
			req.body.user_id = req.user.id;

			//check if the photo available
			let photoId = await photo.findOne({ photo_id: req.body.photo_id }).exec();

			switch (req.body.sources) {
				case "unsplash":
					//if photo id null, then create new photo record
					if (!photoId) {
						photoData = await myUnsplash.getPhoto(req.body.photo_id);
						if (photoData.errors) {
							const error = new Error("Photo not found");
							error.statusCode = 400;
							throw error;
						}
						insertedPhotoId = await myUnsplash.savePhotoToLocal(
							photoData.response
						);
					} else {
						insertedPhotoId = photoId._id;
					}
					break;
				case "flickr":
					if (!photoId) {
						photoData = await myFlickr.getPhoto(req.body.photo_id);
						if (!photoData) {
							const error = new Error("Photo not found");
							error.statusCode = 400;
							throw error;
						}
						insertedPhotoId = await myFlickr.savePhotoToLocal(photoData);
					} else {
						insertedPhotoId = photoId._id;
					}
					break;
				default:
					photoId = null;
					break;
			}

			// add new photo id
			createdData.photo_id = insertedPhotoId;

			// Create data
			let data = await review.create(createdData);

			return res.status(201).json({
				message: "Success",
				data,
			});
		} catch (e) {
			if (
				e.code == 11000 &&
				e.keyPattern.photo_id == 1 &&
				e.keyPattern.user_id == 1
			) {
				e.statusCode = 400
				e.message = "User has been reviewed this photo";
				next(e);
			} else {
				//console.log(e);
				if (!e.statusCode) {
					e.statusCode = 500;
					e.message = "Internal Server Error";
				}
				next(e);
			}
		}
	}

	async update(req, res, next) {
		try {
			let updateData = {};

			if (req.body.title) {
				updateData.title = req.body.title;
			}

			if (req.body.rating) {
				updateData.rating = eval(req.body.rating);
			}

			if (req.body.review) {
				updateData.review = req.body.review;
			}

			if (req.body.photo_id) {
				updateData.photo_id = req.body.photo_id;
			}

			if (updateData === {}) {
				const error = new Error("no new data inserted");
				error.statusCode = 400;
				throw error;
			}

			req.body.user_id = req.user.id;
			const singleReview = await review.findById(req.params.id);

			if (singleReview.user_id.toString() !== req.user.id && req.user.id) {
				const error = new Error("you are not the owner of this review");
				error.statusCode = 400;
				throw error;
			}
			
			if (singleReview.photo_id.toString() !== req.body.photo_id.toString()) {
				const error = new Error("photo not found");
				error.statusCode = 400;
				throw error;
			}

			// Update data
			let data = await review.findOneAndUpdate(
				{
					_id: req.params.id,
				},
				updateData,
				{
					new: true,
				}
			);

			// If success
			return res.status(201).json({
				message: "Success",
				data,
			});
		} catch (error) {
			if (!error.statusCode) {
				error.statusCode = 500;
				error.message = "Internal Server Error";
			}
			next(error);
		}
	}

	async delete(req, res, next) {
		try {
			const singleReview = await review.findById(req.params.id);

			if (singleReview.user_id.toString() !== req.user.id && req.user.id) {
				return res.status(403).json({
					message: `you are not the owner of this review`,
				});
			}
			// delete data depends on req.params.id
			let data = await review.deleteOne({ _id: req.params.id }).exec();

			// If success
			return res.status(200).json({
				message: "Success to delete review",
			});
		} catch (error) {
			if (!error.statusCode) {
				error.statusCode = 500;
				error.message = "Internal Server Error";
			}
			next(error);
		}
	}
}

module.exports = new ReviewController();
