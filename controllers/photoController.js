const { review, photo } = require("../models");
const myUnsplash = require("../helpers/unsplashAPI");
const myFlickr = require("../helpers/flickrAPI");

class PhotoController {
	async browsePhoto(req, res, next) {
		try {
			let page = req.query.page ? req.query.page : 1;
			let limit = req.query.limit ? req.query.limit : 10;

			let browseData = null;
			switch (req.query.sources) {
				case "unsplash":
					browseData = (await myUnsplash.browse(page, limit)).response;
					break;
				case "flickr":
					browseData = (await myFlickr.browse(req.query.photo_id)).body.photos;
					break;
				default:
					browseData.errors = true;
					break;
			}
			if (browseData.errors) {
				return res.status(400).json({ message: "No photo Found", data: [] });
			} else return res.status(200).json({ message: "success", data: browseData });
		} catch (error) {
			console.log(error);
			if (!error.statusCode) {
				err.statusCode = 500;
			}
			next(error);
		}
	}

	//get detail movie from local DB
	async detail_local(req, res, next) {
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
	async detail_sources(req, res, next) {
		try {
			let photoData = null;
			switch (req.query.sources) {
				case "unsplash":
					photoData = (await myUnsplash.getPhoto(req.query.photo_id)).response;
					break;
				case "flickr":
					photoData = await myFlickr.getPhoto(req.query.photo_id);
					break;
				default:
					photoData.errors = true;
					break;
			}

			if (!photoData.errors) {
				res.status(200).json({
					message: "success",
					data_photo: photoData,
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
	async allReviewed(req, res, next) {
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
	async search(req, res, next) {
		try {
			let sources = req.query.sources.split(",");

			let optionsUnsplash = {
				query: req.query.keywords,
				page: req.query.page ? req.query.page : 1,
				perPage: req.query.limit ? req.query.limit : 10,
			};

			let optionsFlickr = {
				text: req.query.keywords,
				page: req.query.page ? eval(req.query.page) : 1,
				per_page: req.query.limit ? eval(req.query.limit) : 10,
				format: "json",
				nojsoncallback: 1,
				media: "photo",
			};

			if (req.query.color) {
				optionsUnsplash.color = req.query.color;
			}

			if (req.query.orientation) {
				optionsUnsplash.orientation = req.query.orientation;
			}

			let result = sources.map(async (el) => {
				if (el == "unsplash") {
					let unsplash = await myUnsplash.search(optionsUnsplash);
					unsplash.response.type = "unsplash";
					let retObj = unsplash.response;
					return retObj;
				} else if (el == "flickr") {
					let flickr = await myFlickr.search(optionsFlickr);
					flickr.body.photos.type = "flickr";
					let retObj = flickr.body.photos;
					return retObj;
				}
			});

			// proses promise array
			let container = await Promise.all(result);
			let retObj = { message: "success" };

			//reformat data before return
			container.forEach((el) => {
				retObj[el.type] = el;
			});

			return res.status(200).json(retObj);
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
