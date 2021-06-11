const { user, review, photo } = require("../models");
const myUnsplash = require("../helpers/unsplashAPI");

class UserController {
	// View data user
	async myUserProfile(req, res, next) {
		try {
			let dataUser = await user.findOne({ _id: req.user.id });
			delete dataUser._doc.password;
			return res.status(200).json({ message: "Success", data: dataUser });
		} catch (error) {
			console.log(error);
			if (!error.statusCode) {
				err.statusCode = 500;
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
			console.log(error);
			if (!error.statusCode) {
				err.statusCode = 500;
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
				const error = new Error("No Photo reviewed");
				error.statusCode = 400;
				throw error;
			}
		} catch (error) {
			console.log(error);
			if (!error.statusCode) {
				err.statusCode = 500;
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
			console.log(error);
			if (!error.statusCode) {
				err.statusCode = 500;
			}
			next(error);
		}
	}

	//add favorite
	async addFavorite(req, res, next) {
		try {
			let dataUser = await user.findOne({ _id: req.user.id });
			let photoId = null;
			let photoData;
			let insertedPhoto;

			switch (req.query.sources) {
				case "unsplash":
					photoId = await photo.findOne({ unsplash_id: req.query.photo_id });

					//if photo id null, then create new photo record
					if (!photoId) {
						photoData = await myUnsplash.getPhoto(req.query.photo_id);
						if (photoData.errors.length > 0) {
							const error = new Error("Photo not found");
							error.statusCode = 400;
							throw error;
						}
						insertedPhoto = await myUnsplash.savePhotoToLocal(photoData);
					} else {
						insertedPhoto = photoId._id;
					}
					break;
				case "flickr":
					photoId = await photo.findOne({ flickr_id: req.query.photo_id });
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
			console.log(error);
			if (!error.statusCode) {
				err.statusCode = 500;
			}
			next(error);
		}
	}

	//delete favorite
	async deleteFavorite(req, res, next) {
		try {
			let dataUser = await user.findOne({ _id: req.user.id });
			let indexOfIdPhoto;
			let photoId = null;

			switch (req.query.sources) {
				case "unsplash":
					photoId = await photo.findOne({ unsplash_id: req.query.photo_id });

					//if photo id null, then return error
					if (!photoId) {
						const error = new Error("Photo has not been added at favorite");
						error.statusCode = 400;
						throw error;
					}
					break;
				case "flickr":
					photoId = await photo.findOne({ flickr_id: req.query.photo_id });
					//if photo id null, then return error
					if (!photoId) {
						const error = new Error("Photo has not been added at favorite");
						error.statusCode = 400;
						throw error;
					}
					break;
				default:
					photoId = null;
					break;
			}

			indexOfIdPhoto = dataUser.favorite.indexOf(photoId._id);
			dataUser.favorite.splice(indexOfIdPhoto, 1);
			await dataUser.save();

			if (dataUser.favorite.length == 0) {
				return res.status(200).json({ message: "Favorite is empty" });
			} else {
				res
					.status(200)
					.json({ message: "delete favorite success", data: dataUser });
			}
		} catch (error) {
			console.log(error);
			if (!error.statusCode) {
				err.statusCode = 500;
			}
			next(error);
		}
	}
}

module.exports = new UserController();
