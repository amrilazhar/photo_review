const request = require("supertest");
const app = require("../index");
const jwt = require("jsonwebtoken");

const { user, movie, review } = require("../models"); // import transaksi models

let authenticationToken = "0";
let tempIDMovie;
let tempIDReview;
let tempIDUser;

describe("Movie List TEST", () => {
  describe("/GET Featured Movie (Not Found)", () => {
    test("It should return 10 movies of featured movies", async () => {
      //clean up the data first
      //clean user data
      await user.collection.dropIndexes();
      await user.deleteMany();
      await user.collection.createIndex({ email: 1 }, { unique: true });
      //clean movie data
      await movie.deleteMany();

      //clean review data
      await review.deleteMany();
      await review.collection.dropIndexes();
      await review.collection.createIndexes(
        { user_id: 1, movie_id: 1 },
        { unique: true }
      );

      const res = await request(app).get("/movie/getFeatured");

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("Not Found");
    });
  });

  describe("/GET All Movie (Not Found)", () => {
    test("It should return list of all movies, with pagination", async () => {
      const res = await request(app).get("/movie/getAll");

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("Not Found");
    });
  });

  describe("/GET All Movie", () => {
    test("It should return list of all movies, with pagination", async () => {

      //create dummy movie data for searching
      let dummyMovie = await movie.create({
        genre: ["Action", "Adventure"],
        title: "Avenger",
        isFeatured: true,
        isReleased : true,
        release_date: new Date("2010-10-10"),
        rated : "R"
      });
      tempIDMovie = dummyMovie._id;

      const res = await request(app).get("/movie/getAll?page=5&limit=10");

      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("success");
      expect(res.body).toHaveProperty("data");
    });
  });

  describe("/GET All Movie with default attribute", () => {
    test("It should return list of all movies, with pagination", async () => {
      const res = await request(app).get("/movie/getAll");

      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("success");
      expect(res.body).toHaveProperty("data");
    });
  });

  describe("/GET All Movie with invalid page attribute passed", () => {
    test("It should return error", async () => {
      const res = await request(app).get("/movie/getAll?page=asd&limit=10");

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("error");
      expect(res.body.error[0]).toEqual("page must be number");
    });
  });

  describe("/GET All Movie with invalid limit attribute passed", () => {
    test("It should return error", async () => {
      const res = await request(app).get("/movie/getAll?page=1&limit=asf");

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("error");
      expect(res.body.error[0]).toEqual("limit must be number");
    });
  });

  describe("/GET Search Movie with invalid page attribute passed", () => {
    test("It should return error", async () => {
      const res = await request(app).get("/movie/search?page=asd&limit=10");

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("error");
      expect(res.body.error[0]).toEqual("page must be number");
    });
  });

  describe("/GET Search Movie with invalid limit attribute passed", () => {
    test("It should return error", async () => {
      const res = await request(app).get("/movie/search?page=1&limit=asf");

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("error");
      expect(res.body.error[0]).toEqual("limit must be number");
    });
  });

  describe("/GET Search Movie with invalid attribut status", () => {
    test("It should return error", async () => {
      const res = await request(app).get(
        "/movie/search?page=5&limit=10&status=rilis"
      );

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("error");
      expect(res.body.error[0]).toEqual("status unidentified");
    });
  });

  describe("/GET Search Movie with invalid attribut release date", () => {
    test("It should return error", async () => {
      const res = await request(app).get(
        "/movie/search?page=5&limit=10&release_date=200,900"
      );

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("error");
      expect(res.body.error[0]).toEqual("date unidentified");
    });
  });

  describe("/GET All Movie with invalid attribut release date (single input)", () => {
    test("It should return error", async () => {
      const res = await request(app).get(
        "/movie/search?page=5&limit=10&release_date=20000"
      );

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("error");
      expect(res.body.error[0]).toEqual("date unidentified");
    });
  });

  describe("/GET Featured Movie", () => {
    test("It should return 10 movies of featured movies", async () => {
      const res = await request(app).get("/movie/getFeatured");

      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("success");
      expect(res.body).toHaveProperty("data");
    });
  });

  describe("/GET Search Movie", () => {
    test("It should return list of movies that match the search options, with pagination", async () => {
      const res = await request(app).get(
        "/movie/search?page=1&limit=10&genre=Action,adventure&title=Ave&release_date=2010&status=released&rated=R"
      );

      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("success");
      expect(res.body).toHaveProperty("data");
    });
  });

  describe("/GET Search Movie with Release date range", () => {
    test("It should return list of movies that match the search options, with pagination", async () => {
      const res = await request(app).get(
        "/movie/search?page=1&limit=10&genre=Action,adventure&title=Ave&release_date=2009,2021&status=released&rated=R"
      );

      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("success");
      expect(res.body).toHaveProperty("data");
    });
  });

  describe("/GET Search Movie (Not FOUND)", () => {
    test("It should return message not found", async () => {
      const res = await request(app).get(
        "/movie/search?page=1&limit=10&genre=Action,comedy&title=ave&release_date=2059"
      );

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("Not Found");
    });
  });
});

describe("Movie Details TEST", () => {
  describe("/GET Review Movie (NY Reviewed)", () => {
    test("It should return list of review that connected to the movie", async () => {
      //create dummy user for review
      let dummyUser = await user.create({
        name: "search Users",
        email: "search@test.com",
        password: "Pasword123!!",
        role: "user",
      });
      tempIDUser = dummyUser._id;

      const body = {
        id: dummyUser._id,
        email: dummyUser.email,
        role: dummyUser.role,
      };
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

      const res = await request(app).get(
        `/movie/getReview/${tempIDMovie}?page=1&limit=10`
      );

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("Not Yet Reviewed");
    });
  });

  describe("/GET Review Movie", () => {
    test("It should return list of review that connected to the movie", async () => {
      //create dummy review for search
      let dummyReview = await review.create({
        user_id: tempIDUser,
        movie_id: tempIDMovie,
        rating: 5,
        review: "just so so",
      });
      tempIDReview = dummyReview._id;

      const res = await request(app).get(
        `/movie/getReview/${tempIDMovie}?page=1&limit=10`
      );

      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("success");
      expect(res.body).toHaveProperty("data");
    });
  });

  describe("/GET Review Movie with as user (with token)", () => {
    test("It should return success", async () => {
      const res = await request(app)
        .get(`/movie/getReview/${tempIDMovie}?page=1&limit=10`)
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("success");
      expect(res.body).toHaveProperty("data");
    });
  });

  describe("/GET Review Movie with invalid page attribute passed", () => {
    test("It should return error", async () => {
      const res = await request(app).get(
        `/movie/getReview/${tempIDMovie}?page=asd&limit=10`
      );

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("error");
      expect(res.body.error[0]).toEqual("page must be number");
    });
  });

  describe("/GET Review Movie with invalid limit attribute passed", () => {
    test("It should return error", async () => {
      const res = await request(app).get(
        `/movie/getReview/${tempIDMovie}?page=1&limit=asf`
      );

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("error");
      expect(res.body.error[0]).toEqual("limit must be number");
    });
  });

  describe("/GET Review Movie with invalid ID movie attribute passed", () => {
    test("It should return error", async () => {
      const res = await request(app).get(
        "/movie/getReview/6079062a82f?page=1&limit=10"
      );

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("error");
      expect(res.body.error[0]).toEqual("ID movie is not valid");
    });
  });

  describe("/GET Review Movie without ID movie attribute passed", () => {
    test("It should return error", async () => {
      const res = await request(app).get("/movie/getReview/?page=1&limit=asf");

      expect(res.statusCode).toEqual(404);
    });
  });

  describe("/GET Movie Detail Info (NOT FOUND)", () => {
    test("It should return detail info of the movie", async () => {
      const res = await request(app).get(
        "/movie/detail/60776b98c0ffba6cd2c3ebb8"
      );

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("No movie Found");
    });
  });

  describe("/GET Movie Detail Info (Invalid ID movie)", () => {
    test("It should return detail info of the movie", async () => {
      const res = await request(app).get("/movie/detail/60776b98c0ffb");

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("error");
      expect(res.body.error[0]).toEqual("ID movie is not valid");
    });
  });

  describe("/GET Movie Detail Info (ID movie not passed)", () => {
    test("It should return detail info of the movie", async () => {
      const res = await request(app).get("/movie/detail/");

      expect(res.statusCode).toEqual(404);
    });
  });

  describe("/GET Movie Detail Info", () => {
    test("It should return detail info of the movie", async () => {
      const res = await request(app).get(`/movie/detail/${tempIDMovie}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("success");
      expect(res.body).toHaveProperty("data");
    });
  });

  describe("/GET Movie Detail Info as a User", () => {
    test("It should return detail info of the movie", async () => {
      const res = await request(app)
        .get(`/movie/detail/${tempIDMovie}`)
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("success");
      expect(res.body).toHaveProperty("data");
    });
  });
});
