const { user, review, photo } = require("../models");
const myUnsplash = require("../helpers/unsplashAPI");

class PhotoController {
	async detail(req, res) {
		try {
			//get movie detail info
			let detailMovie = await movie.find({
				deleted: false,
				_id: req.params.id_movie,
			});

			if (Object.keys(req).includes("user")) {
				//cek if user has reviewed the movie
				let cekReview = await review.find({
					user_id: req.user.id,
					movie_id: req.params.id_movie,
				});
				//set review Status
				if (cekReview.length == 0) {
					detailMovie[0]._doc.reviewStatus = false;
					detailMovie[0]._doc.reviewID = null;
				} else {
					detailMovie[0]._doc.reviewStatus = true;
					detailMovie[0]._doc.reviewID = cekReview[0]._id;
				}

				//cek if user has add watchlist of the movie
				let cekWatch = await user
					.find({ user_id: req.user.id })
					.select("watchlist")
					.exec();
				if (cekWatch.includes(req.params.id_movie)) {
					detailMovie[0]._doc.watchlistStatus = true;
				} else {
					detailMovie[0]._doc.watchlistStatus = false;
				}
			}

			if (!detailMovie.length == 0) {
				res.status(200).json({ message: "success", data: detailMovie });
			} else {
				res.status(400).json({ message: "No movie Found", data: detailMovie });
			}
		} catch (e) {
			console.log(e);
			res.status(500).json({ message: "Internal server error" });
		}
	}

	async getReview(req, res) {
		try {
			//cek paginate status
			let paginateStatus = true;
			if (req.query.pagination) {
				if (req.query.pagination == "false") {
					paginateStatus = false;
				}
			}
			const options = {
				select: "title rating review updated_at",
				sort: { updated_at: -1 },
				populate: { path: "user_id", select: "name profile_picture" },
				page: req.query.page ? req.query.page : 1,
				limit: req.query.limit ? req.query.limit : 10,
				pagination: paginateStatus,
			};

			let dataReview = await review.paginate(
				{ movie_id: req.params.id_movie },
				options
			);

			if (dataReview.totalDocs > 0) {
				return res.status(200).json({ message: "success", data: dataReview });
			} else {
				return res
					.status(400)
					.json({ message: "Not Yet Reviewed", data: dataReview });
			}
		} catch (e) {
			console.log(e);
			res.status(500).json({ message: "Internal server error" });
		}
	}

	async getAll(req, res) {
		try {
			const options = {
				select: "title poster avg_rating genre release_date",
				sort: { release_date: -1 },
				page: req.query.page ? req.query.page : 1,
				limit: req.query.limit ? req.query.limit : 10,
			};

			let dataMovie = await movie.paginate({ deleted: false }, options);

			if (dataMovie.totalDocs > 0) {
				res.status(200).json({ message: "success", data: dataMovie });
			} else {
				res.status(400).json({ message: "Not Found" });
			}
		} catch (e) {
			console.log(e);
			res.status(500).json({ message: "Internal server error" });
		}
	}

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
		} catch (e) {
			console.log(e);
			res.status(500).json({ message: "Internal server error" });
		}
	}
}

module.exports = new PhotoController();
