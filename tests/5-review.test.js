const request = require("supertest");
const app = require("../index");
const jwt = require("jsonwebtoken");

const { user, review, movie } = require("../models"); // import transaksi models

let authenticationToken = "0";
let tempMovieId = "";
let tempReviewId = ""
let tokenAnotherUser ="";

describe("Review Feature TEST", () => {

  describe("/POST Create Review", () => {
    test("It should insert new review to a movie", async () => {
      // delete all user, do there were no duplicate admin
      await user.collection.dropIndexes();
      await user.deleteMany();
      await user.collection.createIndex( { email: 1 } , { unique : true } );

      //clean review data
      await review.deleteMany();
      await review.collection.dropIndexes();
      await review.collection.createIndexes(
        { user_id: 1, movie_id: 1 },
        { unique: true }
      );

      //create user
      const dataUser = {
        name: "Reviewer",
        email: "review@test.com",
        password: "Pasword123!!"
      };

      let userData = await user.create(dataUser);
      const body = {
        id: userData._id,
        role: userData.role,
        email: userData.email,
      };

      const dataMovie = {
        title: "Movie Test"
      };
      let movieData = await movie.create(dataMovie)
      tempMovieId = movieData._id

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
        .post("/review/add")
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        })
        .send({
          movie_id: tempMovieId,
          rating: "4",
          review: "Test ini review"
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("Success");
      expect(res.body.data.rating).toEqual(4);

      //save id to be deleted later
      tempReviewId = res.body.data._id;
    });
  });

  describe("/POST Create Review twice", () => {
    test("It should return error", async () => {

      const res = await request(app)
        .post("/review/add")
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        })
        .send({
          movie_id: tempMovieId,
          rating: "4",
          review: "Test ini review dua kali"
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("Error");
      expect(res.body.error).toEqual("User has been reviewed this movie");
    });
  });

  describe("/POST Create Review rating not number", () => {
    test("It should return error", async () => {

      const res = await request(app)
        .post("/review/add")
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        })
        .send({
          movie_id: tempMovieId,
          rating: "a",
          review: "Test ini review dua kali"
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("Rating must be a number");
    });
  });

  describe("/POST Create Review attribut movie id not send", () => {
    test("It should return error", async () => {

      const res = await request(app)
        .post("/review/add")
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        })
        .send({
          review: "Test ini review dua kali"
        });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toBeInstanceOf(Object);
        expect(res.body.message).toEqual("movie_id is not valid and must be 24 character & hexadecimal");
    });
  });

  describe("/POST Create Review rating More than 5", () => {
    test("It should return error", async () => {

      const res = await request(app)
        .post("/review/add")
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        })
        .send({
          movie_id: tempMovieId,
          rating: "7",
          review: "Test ini review dua kali"
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("Rating must be a number 1 to 5");
    });
  });

  describe("/POST Create Review invalid movie ID", () => {
    test("It should return error", async () => {

      const res = await request(app)
        .post("/review/add")
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        })
        .send({
          movie_id: "tempMovieId",
          rating: "5",
          review: "Test ini review dua kali"
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("movie_id is not valid and must be 24 character & hexadecimal");
    });
  });

  describe("/GET/:id review", () => {
    it("it should GET one the review", async () => {
      const res = await request(app)
        .get(`/review/getOne/${tempReviewId}`)
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body).toHaveProperty("data");
      expect(res.body.data).toBeInstanceOf(Object);
    });
  });

  describe("/GET/:id review", () => {
    it("it should return review not found", async () => {
      const res = await request(app)
        .get(`/review/getOne/608579620234671fc97a3508`)
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("review not found");
    });
  });

  describe("/GET/:id review Invalid ID", () => {
    it("it should return error", async () => {
      const res = await request(app)
        .get(`/review/getOne/${124124}`)
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("id_review is not valid and must be 24 character & hexadecimal");
    });
  });

  describe("/PUT Edit Review", () => {
    test("It should update current review", async () => {

      const res = await request(app)
        .put(`/review/update/${tempReviewId}`)
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        })
        .send({
          movie_id: tempMovieId,
          rating: "3",
          review: "Test Update Review"
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("Success");
      expect(res.body.data.review).toEqual("Test Update Review");
    });
  });

  describe("/PUT Edit Review (Review not Found)", () => {
    test("It should return error", async () => {

      const res = await request(app)
        .put(`/review/update/60856e29e9af1c1ffb406b01`)
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        })
        .send({
          movie_id: tempMovieId,
          rating: "3",
          review: "Test Update Review"
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("review not found");
    });
  });

  describe("/PUT Edit Review (Movie Not Found)", () => {
    test("It should return error", async () => {

      const res = await request(app)
        .put(`/review/update/${tempReviewId}`)
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        })
        .send({
          movie_id: "60856e29e9af1c1ffb406b01",
          rating: "3",
          review: "Test Update Review"
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("movie not found");
    });
  });

  describe("/PUT Edit Review, attribut rating not send", () => {
    test("It should return error", async () => {

      const res = await request(app)
        .put(`/review/update/tempReviewId`)
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        })
        .send({
          movie_id: tempMovieId,
          review: "Test Update Review"
        });

      expect(res.statusCode).toEqual(500);
    });
  });

  describe("/PUT Edit Review rating not a number", () => {
    test("It should return error", async () => {

      const res = await request(app)
        .put(`/review/update/${tempReviewId}`)
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        })
        .send({
          movie_id: tempMovieId,
          rating: "a",
          review: "Test Update Review"
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("Rating must be a number");
    });
  });

  describe("/PUT Edit Review rating more than 5", () => {
    test("It should return error", async () => {

      const res = await request(app)
        .put(`/review/update/${tempReviewId}`)
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        })
        .send({
          movie_id: tempMovieId,
          rating: "9",
          review: "Test Update Review"
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("Rating must be a number 1 to 5");
    });
  });

  describe("/PUT Edit Review invalid review id", () => {
    test("It should return error", async () => {

      const res = await request(app)
        .put(`/review/update/${1241}`)
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        })
        .send({
          movie_id: tempMovieId,
          rating: "3",
          review: "Test Update Review"
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("id_review is not valid and must be 24 character & hexadecimal");
    });
  });

  describe("/PUT Edit Review invalid movie id", () => {
    test("It should return error", async () => {

      const res = await request(app)
        .put(`/review/update/${tempReviewId}`)
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        })
        .send({
          movie_id: "tempMovieId",
          rating: "3",
          review: "Test Update Review"
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("movie_id is not valid and must be 24 character & hexadecimal");
    });
  });

  describe("/DELETE Delete Review with different user", () => {
    test("It should delete current review", async () => {

      //create user admin
      const dataUser = {
        name: "Reviewer 1",
        email: "review1@test.com",
        password: "Pasword123!!"
      };

      let userData = await user.create(dataUser);
      const body = {
        id: userData._id,
        role: userData.role,
        email: userData.email,
      };

      //create token for auth as admin
      const token = jwt.sign(
        {
          user: body,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
        { algorithm: "RS256" }
      );

      tokenAnotherUser = token;

      const res = await request(app)
        .delete(`/review/delete/${tempReviewId}`)
        .set({
          Authorization: `Bearer ${token}`,
        });

      expect(res.statusCode).toEqual(403);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("you are not the owner of this review");
    });
  });

  describe("/PUT Edit Review", () => {
    test("It should update current review", async () => {

      const res = await request(app)
        .put(`/review/update/${tempReviewId}`)
        .set({
          Authorization: `Bearer ${tokenAnotherUser}`,
        })
        .send({
          movie_id: tempMovieId,
          rating: "3",
          review: "Test Update Review"
        });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("you are not the owner of this review");
    });
  });

  describe("/GET/:id review", () => {
    it("it should GET one the review", async () => {
      const res = await request(app)
        .get(`/review/getOne/${tempReviewId}`)
        .set({
          Authorization: `Bearer ${tokenAnotherUser}`,
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("you are not the owner of this review");
    });
  });

  describe("/DELETE Delete Review", () => {
    test("It should delete current review", async () => {

      const res = await request(app)
        .delete(`/review/delete/${tempReviewId}`)
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("Success to delete review");
    });
  });

  describe("/DELETE Delete Review Not Found", () => {
    test("It should return error", async () => {

      const res = await request(app)
        .delete(`/review/delete/${tempReviewId}`)
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("Review not found");
    });
  });

  describe("/DELETE Delete Review invalid review id", () => {
    test("It should return error", async () => {

      const res = await request(app)
        .delete(`/review/delete/${124124}`)
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("id_review is not valid and must be 24 character & hexadecimal");
    });
  });

});
