const { user, review } = require("../models");

class UserController {
	// View data user
	async myUserProfile(req, res) {
		try {
			let dataUser = await user.findOne({ _id: req.user.id });
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
				populate: { path: "movie_id", select: "title poster backdrop" },
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
	async getWatchList(req, res) {
		try {
			let dataWatchlist = await user
				.find({ _id: req.user.id })
				.populate({
					path: "watchlist",
					select: "poster title release_date genre",
				})
				.exec();
			let userWatchlist = dataWatchlist[0].watchlist.length;
			if (userWatchlist == 0) {
				return res.status(404).json({ message: "Watchlist is empty" });
			} else {
				return res
					.status(200)
					.json({ message: "Success", data: dataWatchlist[0].watchlist });
			}
		} catch (e) {
			console.log(e);
			return res.status(500).json({ message: "Internal Server Error" });
		}
	}

	//add watchlist
	async addWatchList(req, res) {
		try {
			let findUser = await user.findOne({ _id: req.user.id });
			findUser.watchlist.push(req.query.id_movie);
			let insertUser = await user.findOneAndUpdate(
				{ _id: findUser._id },
				findUser,
				{ new: true }
			);
			if (!insertUser) {
				return res.status(402).json({ message: "Data user can't be appeared" });
			} else
				res
					.status(200)
					.json({ message: "add watchlist success", data: insertUser });
		} catch (e) {
			console.log(e);
			return res.status(500).json({ message: "Internal Server Error" });
		}
	}

	//delete watchlist
	async deleteWatchList(req, res) {
		try {
			let findUser = await user.findOne({ _id: req.user.id });
			let indexOfIdMovie = findUser.watchlist.indexOf(req.query.id_movie);
			if (indexOfIdMovie < 0) {
				return res
					.status(403)
					.json({ message: "Movie has not been added at watchlist" });
			} else {
				findUser.watchlist.splice(indexOfIdMovie, 1);
			}
			let deleteMovie = await user.findOneAndUpdate(
				{ _id: findUser._id },
				findUser,
				{ new: true }
			);
			if (!deleteMovie) {
				return res.status(402).json({ message: "Data user can't be appeared" });
			}
			let userWatchlist = deleteMovie.watchlist;
			if (userWatchlist == 0) {
				return res.status(404).json({ message: "Watchlist is empty" });
			}
			res
				.status(200)
				.json({ message: "delete watchlist success", data: deleteMovie });
		} catch (e) {
			console.log(e);
			return res.status(500).json({ message: "Internal Server Error " });
		}
	}
}

module.exports = new UserController();
