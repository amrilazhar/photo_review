const request = require("supertest");
const app = require("../index");
const jwt = require("jsonwebtoken");

const { user, photo, review } = require("../models"); // import transaksi models

let authenticationToken = "0";
let tempPhotoId;
let tempReviewId;
let tempIDUser;

describe("Photo Search TEST", () => {
	describe("/GET Reviewed Photo (Not Found)", () => {
		test("It should return error ", async () => {
			//clean up the data first
			//clean user data
			await user.collection.dropIndexes();
			await user.deleteMany();
			await user.collection.createIndex({ email: 1 }, { unique: true });
			//clean movie data
			await photo.deleteMany();

			//clean review data
			await review.deleteMany();
			await review.collection.dropIndexes();
			await review.collection.createIndexes(
				{ user_id: 1, movie_id: 1 },
				{ unique: true }
			);

			const res = await request(app).get("/photo/all?page=1&limit=10");

			expect(res.statusCode).toEqual(400);
			expect(res.body).toBeInstanceOf(Object);
			expect(res.body.message).toEqual("Not Reviewed Photo");
		});
	});

	describe("/POST Create Dummy Review", () => {
		test("It should insert new review to a photo", async () => {
			//create user
			const dataUser = {
				name: "Reviewer",
				email: "review@test.com",
				password: "Pasword123!!",
			};

			let userData = await user.create(dataUser);

			const body = {
				id: userData._id,
				role: userData.role,
				email: userData.email,
			};

			const dataPhoto = {
				title: "Photo Test",
				photo_id: "51239261467",
				source_type: "flickr",
				count_review: 1,
				avg_rating: 0,
			};
			let photoData = await photo.create(dataPhoto);

			tempPhotoId = photoData._id;

			//create token for auth as admin
			const token = jwt.sign(
				{
					user: body,
				},
				process.env.JWT_SECRET,
				{ expiresIn: "7d" },
				{ algorithm: "RS256" }
			);
			// save token for later use
			authenticationToken = token;

			const res = await request(app)
				.post("/review")
				.set({
					Authorization: `Bearer ${authenticationToken}`,
				})
				.send({
					title: "test juga",
					photo_id: "51239261467",
					rating: "4",
					review: "Test ini review",
					sources: "flickr",
				});

			expect(res.statusCode).toEqual(201);
			expect(res.body.message).toEqual("Success");
			expect(res.body.data).toBeInstanceOf(Object);
			expect(res.body.data.rating).toEqual(4);
			expect(res.body.data.review).toEqual("Test ini review");
			//save id to be deleted later
			tempReviewId = res.body.data._id;
		});
	});

	describe("/GET Reviewed Photo", () => {
		test("It should return list review", async () => {
			const res = await request(app).get("/photo/all?page=1&limit=10");
			expect(res.statusCode).toEqual(200);
			expect(res.body).toBeInstanceOf(Object);
		});
	});

  describe("/GET Search Photo (from flickr)", () => {
		test("It should return list photo ", async () => {
			const res = await request(app).get("/photo/search?page=1&limit=10&keywords=cat&sources=flickr");
			expect(res.statusCode).toEqual(200);
			expect(res.body).toBeInstanceOf(Object);
		});
	});

  describe("/GET Search Photo (from unsplash)", () => {
		test("It should return list photo ", async () => {
			const res = await request(app).get("/photo/search?page=1&limit=10&keywords=cat&sources=unsplash");
			expect(res.statusCode).toEqual(200);
			expect(res.body).toBeInstanceOf(Object);
		});
	});

  describe("/GET Get Detail Info Photo (from local)", () => {
		test("It should return Detail Info photo ", async () => {
			const res = await request(app).get("/photo/detail_local?photo_id=51239261467&sources=flickr");
			expect(res.statusCode).toEqual(200);
			expect(res.body).toBeInstanceOf(Object);
		});
	});

  describe("/GET Get Detail Info Photo (from local)", () => {
		test("It should return Not Found ", async () => {
			const res = await request(app).get("/photo/detail_local?photo_id=51239261468&sources=flickr");
			expect(res.statusCode).toEqual(400);
			expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("Photo Not Found in Local")
		});
	});

  // FROM UNSPLASH SOURCES
  describe("/GET Get Detail Info Photo (from sources unsplash)", () => {
		test("It should return Detail Info photo ", async () => {
			const res = await request(app).get("/photo/detail_out?photo_id=OzAeZPNsLXk&sources=unsplash");
			expect(res.statusCode).toEqual(200);
			expect(res.body).toBeInstanceOf(Object);
		});
	});

  describe("/GET Get Detail Info Photo (from sources unsplash)", () => {
		test("It should return Not Found ", async () => {
			const res = await request(app).get("/photo/detail_out?photo_id=OzAeZ&sources=unsplash");
			expect(res.statusCode).toEqual(400);
			expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("No photo Found")
		});
	});

  // FROM FLICKR SOURCES
  describe("/GET Get Detail Info Photo (from sources flickr)", () => {
		test("It should return Detail Info photo ", async () => {
			const res = await request(app).get("/photo/detail_out?photo_id=51240131028&sources=flickr");
			expect(res.statusCode).toEqual(200);
			expect(res.body).toBeInstanceOf(Object);
		});
	});

  describe("/GET Get Detail Info Photo (from sources flickr)", () => {
		test("It should return Not Found ", async () => {
			const res = await request(app).get("/photo/detail_out?photo_id=5124asdasd28&sources=flickr");
			expect(res.statusCode).toEqual(400);
			expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("No photo Found")
		});
	});

  //BROWSE Photo from Sources
  describe("/GET List of Photo (from sources flickr)", () => {
		test("It should return List of Photo ", async () => {
			const res = await request(app).get("/photo/browse?page=1&limit=10&sources=flickr");
			expect(res.statusCode).toEqual(200);
			expect(res.body).toBeInstanceOf(Object);
		});
	});

  describe("/GET List of Photo (from sources unsplash)", () => {
		test("It should return List of Photo ", async () => {
			const res = await request(app).get("/photo/browse?page=1&limit=10&sources=unsplash");
			expect(res.statusCode).toEqual(200);
			expect(res.body).toBeInstanceOf(Object);
		});
	});


});
