const request = require("supertest");
const app = require("../index");
const jwt = require("jsonwebtoken");

const { user, photo, review } = require("../models");

let authenticationToken;
let tempIDPhoto;
let tempIDPhotoTwo;
let tempID;

// ======================|| Create User and No photo reviewed ||======================= */
describe("/GET reviewed_photo SUCCESS ", () => {
	//get our review
	describe("/GET No Photo Reviewed", () => {
		it("it should GET review of user ", async () => {
			// delete all user, do there were no duplicate admin
			await user.collection.dropIndexes();
			await user.deleteMany();
			await user.collection.createIndex({ email: 1 }, { unique: true });
			//create user admin
			const dataUser = {
				name: "aigoo",
				email: "mail@maill.com",
				password: "Password123!!",
				confirmPassword: "Password123!!",
			};

			let userData = await user.create(dataUser);
			const body = {
				id: userData._id,
				email: userData.email,
				role: userData.role,
			};
			tempID = body.id;
			//create token for auth as user
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
				.get(`/user/reviewed_photo`)
				.set({
					Authorization: `Bearer ${authenticationToken}`,
				});

			expect(res.statusCode).toEqual(400);
			expect(res.body.message).toEqual("No Photo Reviewed");
		});
	});
});

//post review
describe("/POST Photo Reviewed SUCCESS", () => {
	test("it should post review of user ", async () => {
		//clean review data
		await photo.deleteMany();
		await review.deleteMany();
		await review.collection.dropIndexes();
		await review.collection.createIndex(
			{ photo_id: 1, user_id: 1 },
			{ unique: true }
		);
		//create dummy photo data for searching
		const dataPhoto = {
			title: "Photo Test",
			photo_id: "51239261467",
			source_type: "flickr",
		};
		let photoData = await photo.create(dataPhoto);
		tempIDPhoto = photoData.photo_id;

		const res = await request(app)
			.post(`/review`)
			.set({
				Authorization: `Bearer ${authenticationToken}`,
			})
			.send({
				photo_id: "51239261467",
				rating: "4",
				review: "good photo",
				sources: "flickr",
			});

		expect(res.statusCode).toEqual(201);
		expect(res.body.message).toEqual("Success");
		expect(res.body.data).toBeInstanceOf(Object);
		expect(res.body.data.rating).toEqual(4);
		expect(res.body.data.review).toEqual("good photo");
	});
});

//===============|| Get Review ||=======================//
describe("/GET Review SUCCESS", () => {
	describe("/GET Review with review's filled ", () => {
		test("it should GET review of user ", async () => {
			const res = await request(app)
				.get(`/user/reviewed_photo`)
				.set({
					Authorization: `Bearer ${authenticationToken}`,
				});

			expect(res.statusCode).toEqual(200);
			expect(res.body.message).toEqual("success");
			expect(res.body.data).toBeInstanceOf(Object);
			expect(res.body.data.docs).toBeInstanceOf(Array);
		});
	});
});
//==================|| Get Review using page and limit ||============//
describe("/GET Review SUCCESS", () => {
	describe("/GET review with Page and Limit has filled", () => {
		test("it should GET review of user ", async () => {
			const res = await request(app)
				.get(`/user/reviewed_photo`)
				.set({
					Authorization: `Bearer ${authenticationToken}`,
				})
				.send({
					user_id: `${tempID}`,
					limit: "1",
					page: "1",
				});
			expect(res.statusCode).toEqual(200);
			expect(res.body.message).toEqual("success");
			expect(res.body.data).toBeInstanceOf(Object);
			expect(res.body.data.limit).toEqual(10);
			expect(res.body.data.page).toEqual(1);
		});
	});
});

//==================|| Favorite Section ||============//
describe("FAVORITE", () => {
	//==================|| Get Favorite failure ||============//
	describe("/GET Favorite empty", () => {
		it("it should GET review of user ", async () => {
			const res = await request(app)
				.get(`/user/favorite_list`)
				.set({
					Authorization: `Bearer ${authenticationToken}`,
				});

			expect(res.statusCode).toEqual(400);
			expect(res.body.message).toEqual(
				"You didn't choose any Photo to be your favorite"
			);
		});
	});

	//==================|| Add Favorite success ||============//
	describe("/PUT Add favorite SUCCESS", () => {
		it("it should PUT add favorite ", async () => {
			const res = await request(app)
				.put(`/user/favorite/?photo_id=${tempIDPhoto}&sources=flickr`)
				.set({
					Authorization: `Bearer ${authenticationToken}`,
				});

			expect(res.statusCode).toEqual(200);
			expect(res.body.message).toEqual("add favorite success");
			expect(res.body.data).toBeInstanceOf(Object);
		});
	});
});

//==================|| Add favorite when Id has been added ||============//
describe("/PUT Add favorite SUCCESS", () => {
	describe("=PUT Id photo has been added", () => {
		it("it should PUT add favorite ", async () => {
			const res = await request(app)
				.put(`/user/favorite/?photo_id=${tempIDPhoto}&sources=flickr`)
				.set({
					Authorization: `Bearer ${authenticationToken}`,
				});

			expect(res.statusCode).toEqual(400);
			expect(res.body.message).toEqual("Photo has been added before");
		});
	});
});

//==================|| Delete Favorite when Id photo has not been registered as local photo ||============//
describe("/DELETE delete favorite ERROR", () => {
	describe("/DELETE Photo has not been added at local photo", () => {
		test("it should return error ", async () => {

			const res = await request(app)
				.delete(`/user/unfavorite/?photo_id=51240131026&sources=flickr`)
				.set({
					Authorization: `Bearer ${authenticationToken}`,
				});

			expect(res.statusCode).toEqual(400);
			expect(res.body.message).toEqual("Photo has not been registered at local");
		});
	});
});

//==================|| Delete Favorite when Id photo has not been added ||============//
describe("/DELETE delete favorite ERROR", () => {
	describe("/DELETE Photo has not been added at favorite", () => {
		test("it should return error ", async () => {
			const dataPhoto = {
				title: "Photo Test",
				photo_id: "51240131028",
				source_type: "flickr",
			};
			let photoData = await photo.create(dataPhoto);
			tempIDPhotoTwo = photoData.photo_id;

			const res = await request(app)
				.delete(`/user/unfavorite/?photo_id=${tempIDPhotoTwo}&sources=flickr`)
				.set({
					Authorization: `Bearer ${authenticationToken}`,
				});

			expect(res.statusCode).toEqual(400);
			expect(res.body.message).toEqual("Photo has not been registered as favorite");
		});
	});
});

//==================|| Delete Favorite Success when return to empty||============//
describe("/DELETE delete favorite SUCCESS ", () => {
	describe("/DELETE delete favorite when data return to empty ", () => {
		test("it should PUT Delete favorite ", async () => {
			const res = await request(app)
				.delete(`/user/unfavorite/?photo_id=${tempIDPhoto}&sources=flickr`)
				.set({
					Authorization: `Bearer ${authenticationToken}`,
				});

			expect(res.statusCode).toEqual(200);
			expect(res.body.message).toEqual("Delete success");
		});
	});
});

//==================|| User Update (User ID is not found) ||============//

describe("/PUT userUpdate ERROR", () => {
	describe("=PUT Id User is not found", () => {
		test("it should not PUT our profile", async () => {
			const res = await request(app)
				.put(`/user/608271a4a98b3001a38a3e47`)
				.set({
					Authorization: `Bearer ${authenticationToken}`,
				})
				.send({
					name: "aigooo",
					email: "aigooo@glints.com",
					password: "Password123!!",
					confirmPassword: "Password123!!",
				});

			expect(res.statusCode).toEqual(400);
			expect(res.body.message).toEqual("id user not found");
		});
	});
});
//==================|| User Update (Password does not match) ||============//
describe("/PUT userUpdate ERROR", () => {
	describe("=PUT Password does not match", () => {
		test("it should not PUT our profile", async () => {
			const res = await request(app)
				.put(`/user/${tempID}`)
				.set({
					Authorization: `Bearer ${authenticationToken}`,
				})
				.send({
					name: "aigooo",
					email: "aigooo@glints.com",
					password: "Password123!!",
					confirmPassword: "Onegai13!!",
				});

			expect(res.statusCode).toEqual(400);
			expect(res.body.message).toEqual("password does not match");
		});
	});
});

//==================|| User Update (password does not have the minimum requirement) ||============//
describe("/PUT userUpdate ERROR", () => {
	describe("=PUT the password does not have the minimum requirements", () => {
		test("it should not PUT our profile", async () => {
			const res = await request(app)
				.put(`/user/${tempID}`)
				.set({
					Authorization: `Bearer ${authenticationToken}`,
				})
				.send({
					name: "aigooo",
					email: "aigooo@glints.com",
					password: "onegai",
					confirmPassword: "onegai",
				});

			expect(res.statusCode).toEqual(400);
			expect(res.body.message).toEqual(
				"password must have minimum length 8, minimum 1 lowercase character, minimum 1 uppercase character, minimum 1 numbers, and minimum 1 symbols"
			);
		});
	});
});

//==================|| User Update (Name must be alphabet) ||============//
describe("/PUT userUpdate ERROR", () => {
	describe("=PUT Name must be alphabet", () => {
		test("it should not PUT our profile", async () => {
			const res = await request(app)
				.put(`/user/${tempID}`)
				.set({
					Authorization: `Bearer ${authenticationToken}`,
				})
				.send({
					name: "aigooo7",
					email: "aigooo@glints.com",
					password: "Password123!!",
					confirmPassword: "Password123!!",
				});

			expect(res.statusCode).toEqual(400);
			expect(res.body.message).toEqual("Name must be alphabet");
		});
	});
});

//==================|| User Update (Email is not valid) ||============//
describe("/PUT userUpdate ERROR", () => {
	describe("=PUT Email is not valid", () => {
		test("it should not PUT our profile", async () => {
			const res = await request(app)
				.put(`/user/${tempID}`)
				.set({
					Authorization: `Bearer ${authenticationToken}`,
				})
				.send({
					name: "aigooo",
					email: "aigooo",
					password: "Password123!!",
					confirmPassword: "Password123!!",
				});
			expect(res.statusCode).toEqual(400);
			expect(res.body.message).toEqual("Email is not valid");
		});
	});
});

//==================|| User Update (User update success) ||============//
describe("/PUT userUpdate SUCCESS", () => {
	test("it should PUT our profile", async () => {
		const res = await request(app)
			.put(`/user/${tempID}`)
			.set({
				Authorization: `Bearer ${authenticationToken}`,
			})
			.send({
				name: "George",
				email: "aigooTwo@glints.com",
				password: "Onegai12yu!!",
				confirmPassword: "Onegai12yu!!",
			});
		expect(res.statusCode).toEqual(200);
		expect(res.body).toBeInstanceOf(Object);
		expect(res.body.message).toEqual("Success");
		expect(res.body.data.name).toEqual("George");
		expect(res.body.data.email).toEqual("aigooTwo@glints.com");
	});
});

describe("/PUT userUpdate SUCCESS with image", () => {
	test("it should PUT our profile", async () => {
		const res = await request(app)
			.put(`/user/${tempID}`)
			.set({
				Authorization: `Bearer ${authenticationToken}`,
			})
			.field("name", "George")
			.field("email", "aigooTwo@glints.com")
			.field("password", "Onegai12yu!!")
			.field("confirmPassword", "Onegai12yu!!")
			.attach("profile_picture", "./tests/smallphoto.png");

		expect(res.statusCode).toEqual(200);
		expect(res.body).toBeInstanceOf(Object);
		expect(res.body.message).toEqual("Success");
		expect(res.body.data.name).toEqual("George");
		expect(res.body.data.email).toEqual("aigooTwo@glints.com");
	});
});

describe("/PUT userUpdate error attribute send not complete", () => {
	test("It should return error", async () => {
		const res = await request(app)
			.put(`/user/${tempID}`)
			.set({
				Authorization: `Bearer ${authenticationToken}`,
			})
			.field("name", "George");

		expect(res.statusCode).toEqual(500);
		expect(res.body).toBeInstanceOf(Object);
		expect(res.body.message).toEqual("Internal Server Error");

    //clean up data after
		await user.deleteMany();
		await photo.deleteMany();
		await review.deleteMany();
	});
});
