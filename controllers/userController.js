const { user, review, photo } = require("../models");
const myUnsplash = require("../helpers/unsplashAPI");

class UserController {
	// View data user
	async myUserProfile(req, res) {
		try {
			let dataUser = await user.findOne({ _id: req.user.id });
			delete dataUser._doc.password;
			return res.status(200).json({ message: "Success", data: dataUser });
		} catch (e) {
			console.log(e);
			return res.status(500).json({ message: "Internal Server Error" });
		}
	}

	// Update data user
	async userUpdate(req, res) {
		try {
			// Update data
			if (req.user.id != req.params.id) {
				return res.status(404).json({ message: "Id User is not found" });
			}
			let dataUser = await user.findOneAndUpdate(
				{ _id: req.params.id },
				req.body,
				{ new: true }
			);
			// If success
			if (!dataUser) {
				return res.status(404).json({ message: "Id User is not found" });
			}
			delete dataUser._doc.password;
			return res.status(200).json({ message: "Success", data: dataUser });
		} catch (e) {
			console.log(e);
			return res.status(500).json({ message: "Internal Server Error" });
		}
	}

	// view review of user
	async userGetReview(req, res) {
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
				return res
					.status(400)
					.json({ message: "No Movie Reviewed", data: dataReview });
			}
		} catch (e) {
			console.log(e);
			res.status(500).json({ message: "Internal server error" });
		}
	}

	// view watchlist of user
	async getFavorite(req, res) {
		try {
			let dataFavorite = await user
				.find({ _id: req.user.id })
				.populate({
					path: "favorite",
				})
				.exec();
			let userFavorite = dataFavorite[0].favorite.length;
			if (userFavorite == 0) {
				return res.status(404).json({
					message: "You didn't choose any Photo to be your favorite ",
				});
			} else {
				return res
					.status(200)
					.json({ message: "Success", data: dataFavorite[0].favorite });
			}
		} catch (e) {
			console.log(e);
			return res.status(500).json({ message: "Internal Server Error" });
		}
	}

	//add favorite
	async addFavorite(req, res) {
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
						insertedPhoto = await myUnsplash.savePhotoToLocal(photoData);
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
				dataUser.favorite.push(insertedPhoto);
				await dataUser.save();
				return res
					.status(200)
					.json({ message: "add favorite success", data: dataUser });
			} else return res.status(400).json({ message: "add favorite failure" });
		} catch (e) {
			console.log(e);
			return res.status(500).json({ message: "Internal Server Error" });
		}
	}

	//delete favorite
	async deleteFavorite(req, res) {
		try {
			let dataUser = await user.findOne({ _id: req.user.id });
			let indexOfIdPhoto;
			let photoId = null;

			switch (req.query.sources) {
				case "unsplash":
					photoId = await photo.findOne({ unsplash_id: req.query.photo_id });

					//if photo id null, then return error
					if (!photoId) {
						return res
							.status(403)
							.json({ message: "Photo has not been added at favorite" });
					}
					break;
				case "flickr":
					photoId = await photo.findOne({ flickr_id: req.query.photo_id });
					//if photo id null, then return error
					if (!photoId) {
						return res
							.status(403)
							.json({ message: "Photo has not been added at favorite" });
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
				return res.status(400).json({ message: "Watchlist is empty" });
			} else {
				res
					.status(200)
					.json({ message: "delete watchlist success", data: dataUser });
			}
		} catch (e) {
			console.log(e);
			return res.status(500).json({ message: "Internal Server Error " });
		}
	}
}

module.exports = new UserController();
