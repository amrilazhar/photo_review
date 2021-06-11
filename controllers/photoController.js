const { review, photo } = require("../models");
const myUnsplash = require("../helpers/unsplashAPI");

class PhotoController {
	async browsePhoto(req, res) {
		try {
			let page = req.query.page ? req.query.page : 1;
			let limit = req.query.limit ? req.query.limit : 10;
			let browseData = await myUnsplash.browse(page, limit);

			res.status(200).json({ message: "success", data: browseData.response });
		} catch (error) {
			console.log(error);
			if (!error.statusCode) {
				err.statusCode = 500;
			}
			next(error);
		}
	}

	//get detail movie from local DB
	async detail_local(req, res) {
		try {
			let photoId = null;

			switch (req.query.sources) {
				case "unsplash":
					photoId = await photo.findOne({ unsplash_id: req.query.photo_id });
					//if photo id null, then create new photo record
					if (!photoId) {
						const error = new Error("Photo Not Found in Local");
						error.statusCode = 400;
						throw error;
					}
					break;
				case "flickr":
					photoId = await photo.findOne({ flickr_id: req.query.photo_id });
					if (!photoId) {
						const error = new Error("Photo Not Found in Local");
						error.statusCode = 400;
						throw error;
					}
					break;
				default:
					photoId = null;
					break;
			}

			if (photoId) {
				let returnedData = {
					message: "success",
					data_photo: photoId,
					data_review: null,
				};

				let reviewData = await review
					.find({ photo: photoId._id })
					.lean()
					.exec();
				if (reviewData) {
					returnedData.data_review = reviewData;
				}

				return res.status(200).json(returnedData);
			} else {
				return res
					.status(400)
					.json({ message: "No photo Found", data_photo: [], data_review: [] });
			}
		} catch (error) {
			console.log(error);
			if (!error.statusCode) {
				err.statusCode = 500;
			}
			next(error);
		}
	}

	//get Detail movie from sources
	async detail_sources(req, res) {
		try {
			let photoData = null;
			switch (req.query.sources) {
				case "unsplash":
					photoData = await myUnsplash.getPhoto(req.query.photo_id);
					break;
				case "flickr":
					photoData = await photo.findOne({ flickr_id: req.query.photo_id });
					break;
				default:
					photoId = null;
					break;
			}

			if (!photoData.errors) {
				res.status(200).json({
					message: "success",
					data_photo: photoData.response,
				});
			} else {
				res
					.status(400)
					.json({ message: "No photo Found", data_photo: [], data_review: [] });
			}
		} catch (error) {
			console.log(error);
			if (!error.statusCode) {
				err.statusCode = 500;
			}
			next(error);
		}
	}

	//get all reviewed photo from local database
	async allReviewed(req, res) {
		try {
			const options = {
				sort: { updated_at: -1 },
				page: req.query.page ? req.query.page : 1,
				limit: req.query.limit ? req.query.limit : 10,
			};

			let reviewedPhoto = await photo.paginate(
				{ count_review: { $gt: 0 } },
				options
			);

			if (reviewedPhoto.totalDocs > 0) {
				return res
					.status(200)
					.json({ message: "success", data: reviewedPhoto });
			} else {
				return res
					.status(400)
					.json({ message: "Not Reviewed Photo", data: reviewedPhoto });
			}
		} catch (e) {
			console.log(e);
			res.status(500).json({ message: "Internal server error" });
		}
	}

	//search photo from external API
	async search(req, res) {
		try {
			let options = {
				query: req.query.keywords,
				page: req.query.page ? req.query.page : 1,
				perPage: req.query.limit ? req.query.limit : 10,
			};

			if (req.query.color) {
				options.color = req.query.color;
			}

			if (req.query.orientation) {
				options.orientation = req.query.orientation;
			}

			let result = await myUnsplash.search(options);
			return res.status(200).json(result);
		} catch (error) {
			console.log(error);
			if (!error.statusCode) {
				err.statusCode = 500;
			}
			next(error);
		}
	}
}

module.exports = new PhotoController();
