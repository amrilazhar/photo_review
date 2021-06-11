const request = require("supertest");
const app = require("../index");
const jwt = require("jsonwebtoken");

const { user, movie, review } = require("../models");

let authenticationToken;
let tempIDMovie;
let tempIDMovieTwo;
let tempID;
let invalidToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjA3OGZjNGZjMWJjMjA3Nzc3ZTc4Nzk4IiwiZW1haWwiOiJ1c2VyMUBnbGludHNtYWlsLmNvbSJ9LCJpYXQiOjE2MTkyNTI5NDcsImV4cCI6MTYxOTg1Nzc0N30.c3KzbMZIPJXUGhHrQ_xeVSxT4AlSN3JVMOio0Pbz4K8";

// ======================|| Create User and No movie reviewed ||======================= */
describe("/GET userGetReview SUCCESS ", () => {
  //get our review
  describe("/GET No Movie Reviewed", () => {
    it("it should GET review of user ", async () => {
      // delete all user, do there were no duplicate admin
      await user.collection.dropIndexes();
      await user.deleteMany();
      await user.collection.createIndex({ email: 1 }, { unique: true });
      //create user admin
      const dataUser = {
        name: "Hisamawa",
        email: "jhorgisukageprek@glints.com",
        password: "Onegai12!!",
        confirmPassword: "Onegai12!!",
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
        .get(`/user/userGetReview`)
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual("No Movie Reviewed");
      expect(res.body.data).toBeInstanceOf(Object);
      expect(res.body.data.totalDocs).toEqual(0);
    });
  });
});

//post review
describe("/POST Movie Reviewed SUCCESS", () => {
  test("it should post review of user ", async () => {
    //clean review data
    await movie.deleteMany();
    await review.deleteMany();
    await review.collection.dropIndexes();
    await review.collection.createIndex(
      { movie_id: 1, user_id: 1 },
      { unique: true }
    );
    //create dummy movie data for searching
    let dummyMovie = await movie.create({
      title: "The Godfather",
      director: "Francis Ford Coppola",
      budget: "6000000",
      release_date: new Date("2010-10-10"),
      synopsis:
        "Spanning the years 1945 to 1955, a chronicle of the fictional Italian-...",
      genre: ["Anime", "comedy"],
      trailer: "httpurl",
      characters: "jhorgi",
    });
    tempIDMovie = dummyMovie._id;

    const res = await request(app)
      .post(`/review/add`)
      .set({
        Authorization: `Bearer ${authenticationToken}`,
      })
      .send({
        movie_id: `${tempIDMovie}`,
        rating: "4",
        review: "good movie",
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.message).toEqual("Success");
    expect(res.body.data).toBeInstanceOf(Object);
    expect(res.body.data.rating).toEqual(4);
    expect(res.body.data.review).toEqual("good movie");
  });
});

//===============|| Get Review ||=======================//
describe("/GET Review SUCCESS", () => {
  describe("=GET Review with review's filled ", () => {
    test("it should GET review of user ", async () => {
      const res = await request(app)
        .get(`/user/userGetReview`)
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
  describe("=GET review with Page and Limit has filled", () => {
    test("it should GET review of user ", async () => {
      const res = await request(app)
        .get(`/user/userGetReview`)
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

//==================|| Get Watchlist when empty ||============//
describe("/GET getWatchlist SUCCESS", () => {
  describe("=GET Watchlist empty", () => {
    it("it should GET review of user ", async () => {
      const res = await request(app)
        .get(`/user/getWatchlist`)
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        });

      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toEqual("Watchlist is empty");
    });
  });

  //==================|| Get Watchlist success ||============//
  describe("/PUT Add watchlist SUCCESS", () => {
    it("it should PUT add watchlist ", async () => {
      const res = await request(app)
        .put(`/user/addWatchList/?id_movie=${tempIDMovie}`)
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual("add watchlist success");
      expect(res.body.data).toBeInstanceOf(Object);
    });
  });
});

//==================|| Get Watchlist when Id movie is invalid ||============//
describe("/PUT add watchlist ERROR", () => {
  describe("=PUT Id movie is invalid", () => {
    it("it should PUT add watchlist ", async () => {
      const res = await request(app)
        .put(`/user/addWatchList/?id_movie=6079061a82fce60f2fede4co`)
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual(
        "id movie is invalid and must be 24 characters & hexadecimal"
      );
    });
  });
});
//==================|| Add watchlist when Id has been added ||============//
describe("/PUT Add watchlist SUCCESS", () => {
  describe("=PUT Id movie has been added", () => {
    it("it should PUT add watchlist ", async () => {
      const res = await request(app)
        .put(`/user/addWatchList/?id_movie=${tempIDMovie}`)
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual(" id movie has been added ");
    });
  });
});

//==================|| Delete watchlist is invalid ||============//
describe("/PUT delete watchlist ERROR ", () => {
  //view user profile
  describe("=PUT Id movie is invalid", () => {
    it("it should PUT Delete watchlist ", async () => {
      const res = await request(app)
        .put(`/user/deleteWatchList/?id_movie=607his`)
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual(
        "id movie is invalid and must be 24 characters & hexadecimal"
      );
    });
  });
});

//==================|| Delete Watchlist when Id movie has not been added ||============//
describe("/PUT delete watchlist ERROR", () => {
  describe("=PUT Movie has not been added at watchlist", () => {
    test("it should PUT Delete watchlist ", async () => {
      let dummyMovieTwo = await movie.create({
        title: "The Avenger",
        director: "Francis Ford Coppola",
        budget: "6500000",
        release_date: new Date("2013-10-10"),
        synopsis:
          "Spanning the years 1945 to 1955, a chronicle of the fictional Italian-...",
        genre: ["Action", "comedy"],
        trailer: "httpurl",
        characters: "jhorgi",
      });
      tempIDMovieTwo = dummyMovieTwo._id;
      const res = await request(app)
        .put(`/user/deleteWatchList/?id_movie=${tempIDMovieTwo}`)
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        });
      expect(res.statusCode).toEqual(403);
      expect(res.body.message).toEqual("Movie has not been added at watchlist");
    });
  });
});

//==================|| Delete Watchlist Success when return to empty||============//
describe("/PUT delete watchlist SUCCESS ", () => {
  describe("/PUT delete watchlist when data return to empty ", () => {
    test("it should PUT Delete watchlist ", async () => {
      const res = await request(app)
        .put(`/user/deleteWatchList/?id_movie=${tempIDMovie}`)
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        });

      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toEqual("Watchlist is empty");
    });
  });
});

//=====================|| add dummy watchlist 1 || =====================\\
describe("/PUT Add watchlist SUCCESS", () => {
  it("it should PUT add watchlist ", async () => {
    const res = await request(app)
      .put(`/user/addWatchList/?id_movie=${tempIDMovieTwo}`)
      .set({
        Authorization: `Bearer ${authenticationToken}`,
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual("add watchlist success");
    expect(res.body.data).toBeInstanceOf(Object);
  });
});

//=====================|| add dummy watchlist 2 || =====================\\
describe("/PUT Add watchlist SUCCESS", () => {
  it("it should PUT add watchlist ", async () => {
    const res = await request(app)
      .put(`/user/addWatchList/?id_movie=${tempIDMovie}`)
      .set({
        Authorization: `Bearer ${authenticationToken}`,
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual("add watchlist success");
    expect(res.body.data).toBeInstanceOf(Object);
  });
});

//==================|| Delete Watchlist Success ||============//
describe("/PUT delete watchlist SUCCESS ", () => {
  describe("/PUT delete watchlist when data is not empty ", () => {
    test("it should PUT Delete watchlist ", async () => {
      const res = await request(app)
        .put(`/user/deleteWatchList/?id_movie=${tempIDMovie}`)
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual("delete watchlist success");
      expect(res.body.data).toBeInstanceOf(Object);
      expect(res.body.data.watchlist).toBeInstanceOf(Array);
    });
  });
});

//==================|| User Update (User ID is not found) ||============//

describe("/PUT userUpdate ERROR", () => {
  describe("=PUT Id User is not found", () => {
    test("it should not PUT our profile", async () => {
      const res = await request(app)
        .put(`/user/userUpdate/608271a4a98b3001a38a3e47`)
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        })
        .send({
          name: "Hisamawa",
          email: "jhorgisukageprek@glints.com",
          password: "Onegai12!!",
          confirmPassword: "Onegai12!!",
        });

      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toEqual("Id User is not found");
    });
  });
});
//==================|| User Update (Password does not match) ||============//
describe("/PUT userUpdate ERROR", () => {
  describe("=PUT Password does not match", () => {
    test("it should not PUT our profile", async () => {
      const res = await request(app)
        .put(`/user/userUpdate/${tempID}`)
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        })
        .send({
          name: "Hisamawa",
          email: "jhorgisukageprek@glints.com",
          password: "Onegai12!!",
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
        .put(`/user/userUpdate/${tempID}`)
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        })
        .send({
          name: "Hisamawa",
          email: "jhorgisukageprek@glints.com",
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
        .put(`/user/userUpdate/${tempID}`)
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        })
        .send({
          name: "Hisamawa7",
          email: "jhorgisukageprek@glints.com",
          password: "Onegai12!!",
          confirmPassword: "Onegai12!!",
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
        .put(`/user/userUpdate/${tempID}`)
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        })
        .send({
          name: "Hisamawa",
          email: "jhorgisukageprek",
          password: "Onegai12!!",
          confirmPassword: "Onegai12!!",
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
      .put(`/user/userUpdate/${tempID}`)
      .set({
        Authorization: `Bearer ${authenticationToken}`,
      })
      .send({
        name: "George",
        email: "jhorgisukanasigoreng@glints.com",
        password: "Onegai12yu!!",
        confirmPassword: "Onegai12yu!!",
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Object);
    expect(res.body.message).toEqual("Success");
    expect(res.body.data.name).toEqual("George");
    expect(res.body.data.email).toEqual("jhorgisukanasigoreng@glints.com");
  });
});

describe("/PUT userUpdate SUCCESS with image", () => {
  test("it should PUT our profile", async () => {
    const res = await request(app)
      .put(`/user/userUpdate/${tempID}`)
      .set({
        Authorization: `Bearer ${authenticationToken}`,
      })
      .field("name", "George")
      .field("email", "jhorgisukanasigoreng@glints.com")
      .field("password", "Onegai12yu!!")
      .field("confirmPassword", "Onegai12yu!!")
      .attach("profile_picture", "./tests/teamATV.png");

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Object);
    expect(res.body.message).toEqual("Success");
    expect(res.body.data.name).toEqual("George");
    expect(res.body.data.email).toEqual("jhorgisukanasigoreng@glints.com");
  });
});

describe("/PUT userUpdate error profile picture too large", () => {
  test("It should return error file too large", async () => {
    const res = await request(app)
      .put(`/user/userUpdate/${tempID}`)
      .set({
        Authorization: `Bearer ${authenticationToken}`,
      })
      .field("name", "George")
      .field("email", "jhorgisukanasigoreng@glints.com")
      .field("password", "Onegai12yu!!")
      .field("confirmPassword", "Onegai12yu!!")
      .attach("profile_picture", "./tests/pelanggan.gif");

    expect(res.statusCode).toEqual(400);
    expect(res.body).toBeInstanceOf(Object);
    expect(res.body.message).toEqual("Image must be less than 5MB");
  });
});

describe("/PUT userUpdate error profile picture not Image", () => {
  test("It should return error file must be an image", async () => {
    const res = await request(app)
      .put(`/user/userUpdate/${tempID}`)
      .set({
        Authorization: `Bearer ${authenticationToken}`,
      })
      .field("name", "George")
      .field("email", "jhorgisukanasigoreng@glints.com")
      .field("password", "Onegai12yu!!")
      .field("confirmPassword", "Onegai12yu!!")
      .attach("profile_picture", "./tests/1-user.test.js");

    expect(res.statusCode).toEqual(400);
    expect(res.body).toBeInstanceOf(Object);
    expect(res.body.message).toEqual("file is not an image");
  });
});

describe("/PUT userUpdate error attribute images has different key", () => {
  test("It should return error", async () => {
    const res = await request(app)
      .put(`/user/userUpdate/${tempID}`)
      .set({
        Authorization: `Bearer ${authenticationToken}`,
      })
      .field("name", "George")
      .field("email", "jhorgisukanasigoreng@glints.com")
      .field("password", "Onegai12yu!!")
      .field("confirmPassword", "Onegai12yu!!")
      .attach("character_images", "./tests/1-user.test.js");

    expect(res.statusCode).toEqual(500);
    expect(res.body).toBeInstanceOf(Object);
  });
});

describe("/PUT userUpdate error attribute send not complete", () => {
  test("It should return error", async () => {
    const res = await request(app)
      .put(`/user/userUpdate/${tempID}`)
      .set({
        Authorization: `Bearer ${authenticationToken}`,
      })
      .field("name", "George");

    expect(res.statusCode).toEqual(500);
    expect(res.body).toBeInstanceOf(Object);
    expect(res.body.message).toEqual("internal server error");
  });
});
