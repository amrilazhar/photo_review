const { user, review, photo } = require("../models");
const myUnsplash = require("../helpers/unsplashAPI");
const myFlickr = require("../helpers/flickrAPI");

class UserController {
	// View data user
	async myUserProfile(req, res, next) {
		try {
			let dataUser = await user.findOne({ _id: req.user.id });
			delete dataUser._doc.password;
			return res.status(200).json({ message: "Success", data: dataUser });
		} catch (error) {
			//console.log(error);
			if (!error.statusCode) {
				error.statusCode = 500;
				error.message = "Internal Server Error";
			}
			next(error);
		}
	}

	// Update data user
	async userUpdate(req, res, next) {
		try {
			// Update data
			if (req.user.id != req.params.id) {
				const error = new Error("id user not found");
				error.statusCode = 400;
				throw error;
			}
			let dataUser = await user.findOneAndUpdate(
				{ _id: req.params.id },
				req.body,
				{ new: true }
			);
			// If success
			if (!dataUser) {
				const error = new Error("id user not found");
				error.statusCode = 400;
				throw error;
			}
			delete dataUser._doc.password;
			return res.status(200).json({ message: "Success", data: dataUser });
		} catch (error) {
			//console.log(error);
			if (!error.statusCode) {
				error.statusCode = 500;
				error.message = "Internal Server Error";
			}
			next(error);
		}
	}

	// view review of user
	async userGetReview(req, res, next) {
		try {
			//cek paginate status
			let paginateStatus = true;
			if (req.query.pagination) {
				if (req.query.pagination == "false") {
					paginateStatus = false;
				}
			}
			const options = {
				page: req.query.page ? req.query.page : 1,
				limit: req.query.limit ? req.query.limit : 10,
				sort: { updated_at: -1 },
				populate: { path: "photo_id" },
				pagination: paginateStatus,
			};

			let dataReview = await review.paginate({ user_id: req.user.id }, options);

			if (dataReview.totalDocs > 0) {
				return res.status(200).json({ message: "success", data: dataReview });
			} else {
				const error = new Error("No Photo Reviewed");
				error.statusCode = 400;
				throw error;
			}
		} catch (error) {
			//console.log(error);
			if (!error.statusCode) {
				error.statusCode = 500;
				error.message = "Internal Server Error";
			}
			next(error);
		}
	}

	// view watchlist of user
	async getFavorite(req, res, next) {
		try {
			let dataFavorite = await user
				.find({ _id: req.user.id })
				.populate({
					path: "favorite",
				})
				.exec();
			let userFavorite = dataFavorite[0].favorite.length;
			if (userFavorite == 0) {
				const error = new Error(
					"You didn't choose any Photo to be your favorite"
				);
				error.statusCode = 400;
				throw error;
			} else {
				return res
					.status(200)
					.json({ message: "Success", data: dataFavorite[0].favorite });
			}
		} catch (error) {
			//console.log(error);
			if (!error.statusCode) {
				error.statusCode = 500;
				error.message = "Internal Server Error";
			}
			next(error);
		}
	}

	//add favorite
	async addFavorite(req, res, next) {
		try {
			let dataUser = await user.findOne({ _id: req.user.id });
			let photoId = await photo.findOne({ photo_id: req.query.photo_id });
			let photoData;
			let insertedPhoto;

			switch (req.query.sources) {
				case "unsplash":
					//if photo id null, then create new photo record
					if (!photoId) {
						photoData = await myUnsplash.getPhoto(req.query.photo_id);
						if (photoData.errors) {
							const error = new Error("Photo not found");
							error.statusCode = 400;
							throw error;
						}
						insertedPhoto = await myUnsplash.savePhotoToLocal(
							photoData.response
						);
					} else {
						insertedPhoto = photoId._id;
					}
					break;
				case "flickr":
					if (!photoId) {
						photoData = await myFlickr.getPhoto(req.query.photo_id);
						if (!photoData) {
							const error = new Error("Photo not found");
							error.statusCode = 400;
							throw error;
						}
						insertedPhoto = await myFlickr.savePhotoToLocal(photoData);
					} else {
						insertedPhoto = photoId._id;
					}

					break;
				default:
					photoId = null;
					break;
			}

			if (insertedPhoto) {
				if (dataUser.favorite.indexOf(insertedPhoto) > -1) {
					const error = new Error("Photo has been added before");
					error.statusCode = 400;
					throw error;
				}
				dataUser.favorite.push(insertedPhoto);
				await dataUser.save();
				return res
					.status(200)
					.json({ message: "add favorite success", data: dataUser });
			} else {
				const error = new Error("add favorite failure");
				error.statusCode = 400;
				throw error;
			}
		} catch (error) {
			//console.log(error);
			if (!error.statusCode) {
				error.statusCode = 500;
				error.message = "Internal Server Error";
			}
			next(error);
		}
	}

	//delete favorite
	async deleteFavorite(req, res, next) {
		try {
			let dataUser = await user.findOne({ _id: req.user.id });
			//no favorite data
			if (dataUser.favorite.length == 0) {
				return res.status(400).json({ message: "Favorite is empty" });
			}

			let indexOfIdPhoto;
			let photoId = await photo.findOne({ photo_id: req.query.photo_id });

			if (!photoId) {
				const error = new Error("Photo has not been registered at local");
				error.statusCode = 400;
				throw error;
			}

			indexOfIdPhoto = dataUser.favorite.indexOf(photoId._id);
			if (indexOfIdPhoto > -1) {
				dataUser.favorite.splice(indexOfIdPhoto, 1);
				await dataUser.save();
			} else {
				const error = new Error("Photo has not been registered as favorite");
				error.statusCode = 400;
				throw error;
			}
			res.status(200).json({ message: "Delete success", data: dataUser });
		} catch (error) {
			// console.log(error);
			if (!error.statusCode) {
				error.statusCode = 500;
				error.message = "Internal Server Error";
			}
			next(error);
		}
	}
}

module.exports = new UserController();
