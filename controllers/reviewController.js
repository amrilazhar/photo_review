const { review } = require("../models");

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
		} catch (e) {
			console.log(e);
			return res.status(500).json({
				message: "Internal Server Error",
				error: e.message,
			});
		}
	}

	async create(req, res, next) {
		try {
			req.body.user_id = req.user.id;

			// Create data
			let data = await review.create(req.body);

			return res.status(201).json({
				message: "Success",
				data,
			});
		} catch (e) {
			if (
				e.code == 11000 &&
				e.keyPattern.movie_id == 1 &&
				e.keyPattern.user_id == 1
			) {
				//console.log(e);
				return res.status(400).json({
					message: "Error",
					error: "User has been reviewed this movie",
				});
			} else {
				console.log(e);
				return res.status(500).json({
					message: "Internal Server Error",
					error: e.message,
				});
			}
		}
	}

	async update(req, res, next) {
		try {
			req.body.user_id = req.user.id;
			const singleReview = await review.findById(req.params.id);

			if (singleReview.user_id.toString() !== req.user.id && req.user.id) {
				return res.status(404).json({
					message: `you are not the owner of this review`,
				});
			}
			// Update data
			let data = await review.findOneAndUpdate(
				{
					_id: req.params.id,
				},
				req.body, // This is all of req.body
				{
					new: true,
				}
			);
			// new is to return the updated transaksi data
			// If no new, it will return the old data before updated

			// If success
			return res.status(201).json({
				message: "Success",
				data,
			});
		} catch (e) {
			console.log(e);
			return res.status(500).json({
				message: "Internal Server Error",
				error: e.message,
			});
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
		} catch (e) {
			// If failed
			return res.status(500).json({
				message: "Internal Server Error",
				error: e.message,
			});
		}
	}
}

module.exports = new ReviewController();
