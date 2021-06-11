const request = require("supertest");
const app = require("../index");
const jwt = require("jsonwebtoken");

const { user, movie } = require("../models"); // import transaksi models

let authenticationToken = "0";
let tempID = "";
let temporaryMovieId = "";

describe("Movie Feature TEST", () => {
  describe("/POST Create Movie", () => {
    test("It should insert new movie", async () => {
      // delete all user, do there were no duplicate admin
      await user.collection.dropIndexes();
      await user.deleteMany();
      await user.collection.createIndex({ email: 1 }, { unique: true });
      // user admin
      await movie.deleteMany();
      const dataAdmin = {
        name: "Movie Admin",
        email: "movie@test.com",
        password: "Abcd&1234",
        role: "admin",
      };

      let userData = await user.create(dataAdmin);
      const body = {
        id: userData._id,
        role: userData.role,
        email: userData.email,
      };
      //save id admin
      tempID = body.id;

      // token for auth as admin
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
        .post("/movie/")
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        })
        .send({
          title: "Anne with an E",
          director: "phillip pullman",
          budget: "20000000",
          release_date: "2021/03/11",
          genre: "fantasy, adventure, roamnce",
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("success");
      expect(res.body.data.title).toEqual("Anne with an E");
      //save id movie
      temporaryMovieId = res.body.data._id;
    });
  });

  describe("/POST Create Movie with array genre", () => {
    test("It should insert new movie", async () => {
      const res = await request(app)
        .post("/movie/")
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        })
        .field("title", "my awesome avatar")
        .field("budget", "100")
        .field("release_date", "2021/03/11")
        .field("director", "my awesome director")
        .field("genre", "fantasy")
        .field("genre", "romance");

      expect(res.statusCode).toEqual(201);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("success");
      expect(res.body.data.title).toEqual("my awesome avatar");
    });
  });

  describe("/POST Create Movie with array genre Error (not Alphabet)", () => {
    test("It should insert new movie", async () => {
      const res = await request(app)
        .post("/movie/")
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        })
        .field("title", "my awesome avatar")
        .field("budget", "100")
        .field("release_date", "2021/03/11")
        .field("director", "my awesome director")
        .field("genre", "fantasy")
        .field("genre", "124");

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("Genre should be alphabet");
    });
  });

  describe("/POST Create Movie Failed (director with symbol)", () => {
    test("It should return failed", async () => {
      const res = await request(app)
        .post("/movie/")
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        })
        .send({
          title: "Anne with an E",
          director: "phillip pu!!llman",
          budget: "20000000",
          release_date: "2021/03/11",
          genre: "fantasy, adventure, roamnce",
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("Director should be alphabet");
    });
  });

  describe("/POST Create Movie Failed (budget with alphabet)", () => {
    test("It should return failed", async () => {
      const res = await request(app)
        .post("/movie/")
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        })
        .send({
          title: "Anne with an E",
          director: "phillip pullman",
          budget: "200asf00000",
          release_date: "2021/03/11",
          genre: "fantasy, adventure, roamnce",
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("Budget should be number");
    });
  });

  describe("/POST Create Movie Failed (release date with alphabet)", () => {
    test("It should return failed", async () => {
      const res = await request(app)
        .post("/movie/")
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        })
        .send({
          title: "Anne with an E",
          director: "phillip pullman",
          budget: "20000000",
          release_date: "2021/as/11",
          genre: "fantasy, adventure, roamnce",
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("Date is consist of yyyy/mm/dd");
    });
  });

  describe("/POST Create Movie Failed (genre with number)", () => {
    test("It should return failed", async () => {
      const res = await request(app)
        .post("/movie/")
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        })
        .send({
          title: "Anne with an E",
          director: "phillip pullman",
          budget: "20000000",
          release_date: "2021/03/11",
          genre: "fantasy, 1231, roamnce",
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("Genre should be alphabet");
    });
  });

  describe("/PUT Update Movie Success", () => {
    test("It should update a movie", async () => {
      const res = await request(app)
        .put(`/movie/${temporaryMovieId}`)
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        })
        .send({
          title: "Anne with an A",
          director: "phillip pullman",
          budget: "20000000",
          release_date: "2021/03/11",
          genre: "fantasy, adventure, roamnce",
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("success");
      expect(res.body.data.title).toEqual("Anne with an A");
    });
  });

  describe("/PUT Update Movie Success with array genre", () => {
    test("It should update a movie", async () => {
      const res = await request(app)
        .put(`/movie/${temporaryMovieId}`)
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        })
        .field("title", "my awesome avatar")
        .field("budget", "100")
        .field("release_date", "2021/03/11")
        .field("director", "my awesome director")
        .field("genre", "fantasy")
        .field("genre", "romance");

      expect(res.statusCode).toEqual(201);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("success");
      expect(res.body.data.title).toEqual("my awesome avatar");
    });
  });

  describe("/PUT Movie Failed (invalid id)", () => {
    test("It should return failed because invalid id", async () => {
      const res = await request(app)
        .put(`/movie/` + 12412)
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        })
        .send({
          title: "Anne with an A",
          director: "phillip pullman",
          budget: "20000000",
          release_date: "2021/03/11",
          genre: "fantasy, adventure, roamnce",
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual(
        "id_movie is not valid and must be 24 characters & hexadecimal"
      );
    });
  });

  describe("/PUT Movie Failed (movie not found)", () => {
    test("It should return failed because movie not found", async () => {
      const res = await request(app)
        .put(`/movie/608565ff9953987befeb70d2`)
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("Movie not found");
    });
  });

  describe("/PUT Update Movie Failed (director with symbol)", () => {
    test("It should return failed", async () => {
      const res = await request(app)
        .put(`/movie/${temporaryMovieId}`)
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        })
        .send({
          title: "Anne with an E",
          director: "phillip ??",
          budget: "20000000",
          release_date: "2021/03/11",
          genre: "fantasy, adventure, roamnce",
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("Director should be alphabet");
    });
  });

  describe("/PUT Update Movie Failed (budget with alphabet)", () => {
    test("It should return failed", async () => {
      const res = await request(app)
        .put(`/movie/${temporaryMovieId}`)
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        })
        .send({
          title: "Anne with an E",
          director: "phillip pullman",
          budget: "20000a000",
          release_date: "2021/03/11",
          genre: "fantasy, adventure, roamnce",
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("Budget should be number");
    });
  });

  describe("/PUT Update Movie Failed (release date with alphabet)", () => {
    test("It should return failed", async () => {
      const res = await request(app)
        .put(`/movie/${temporaryMovieId}`)
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        })
        .send({
          title: "Anne with an E",
          director: "phillip pullman",
          budget: "20000000",
          release_date: "2021/asd/11",
          genre: "fantasy, adventure, roamnce",
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("Date is consist of yyyy/mm/dd");
    });
  });

  describe("/PUT Update Movie Failed (genre with number)", () => {
    test("It should return failed", async () => {
      const res = await request(app)
        .put(`/movie/${temporaryMovieId}`)
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        })
        .send({
          title: "Anne with an E",
          director: "phillip pullman",
          budget: "20000000",
          release_date: "2021/03/11",
          genre: "fantasy,adve1242nture,roamnce",
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("Genre should be alphabet");
    });
  });

  describe("/PUT Update Movie Success with images", () => {
    test("It should update a movie", async () => {
      const res = await request(app)
        .put(`/movie/${temporaryMovieId}`)
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        })
        .field("title", "my awesome avatar")
        .field("budget", "100")
        .field("release_date", "2021/03/11")
        .field("director", "my awesome director")
        .field("genre", "fantasy")
        .field("genre", "romance")
        .field("character_name", "John Doe")
        .attach("poster", "./tests/teamATV.png")
        .attach("backdrop", "./tests/teamATV.png")
        .attach("character_images", "./tests/teamATV.png");

      expect(res.statusCode).toEqual(201);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("success");
      expect(res.body.data.title).toEqual("my awesome avatar");
    });
  });

  describe("/PUT UPDATE Movie with image poster, backdrop, character", () => {
    test("It should create a movie with images", async () => {
      const res = await request(app)
        .put(`/movie/${temporaryMovieId}`)
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        })
        .field("title", "my awesome avatar")
        .field("budget", "100")
        .field("release_date", "2021/03/11")
        .field("director", "my awesome director")
        .field("genre", "fantasy,adventure,romance")
        .field("character_name", "John Doe")
        .attach("poster", "./tests/teamATV.png")
        .attach("backdrop", "./tests/teamATV.png")
        .attach("character_images", "./tests/teamATV.png");

      expect(res.statusCode).toEqual(201);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("success");
      expect(res.body).toHaveProperty("data");
    });
  });

  describe("/PUT UPDATE Movie with Non Image poster", () => {
    test("It should return error file must be an image", async () => {
      const res = await request(app)
        .put(`/movie/${temporaryMovieId}`)
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        })
        .field("title", "my awesome avatar")
        .field("budget", "100")
        .field("release_date", "2021/03/11")
        .field("director", "my awesome director")
        .field("genre", "fantasy,adventure,romance")
        .field("character_name", "John Doe")
        .attach("poster", "./tests/4-movie.test.js")
        .attach("backdrop", "./tests/teamATV.png")
        .attach("character_images", "./tests/teamATV.png");

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("file must be an image");
    });
  });

  describe("/PUT UPDATE Movie with Non Image Backdrop", () => {
    test("It should return error file must be an image", async () => {
      const res = await request(app)
        .put(`/movie/${temporaryMovieId}`)
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        })
        .field("title", "my awesome avatar")
        .field("budget", "100")
        .field("release_date", "2021/03/11")
        .field("director", "my awesome director")
        .field("genre", "fantasy,adventure,romance")
        .field("character_name", "John Doe")
        .attach("poster", "./tests/teamATV.png")
        .attach("backdrop", "./tests/4-movie.test.js")
        .attach("character_images", "./tests/teamATV.png");

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("file must be an image");
    });
  });

  describe("/PUT UPDATE Movie with Non Image Character", () => {
    test("It should return error file must be an image", async () => {
      const res = await request(app)
        .put(`/movie/${temporaryMovieId}`)
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        })
        .field("title", "my awesome avatar")
        .field("budget", "100")
        .field("release_date", "2021/03/11")
        .field("director", "my awesome director")
        .field("genre", "fantasy,adventure,romance")
        .field("character_name", "John Doe")
        .attach("poster", "./tests/teamATV.png")
        .attach("backdrop", "./tests/teamATV.png")
        .attach("character_images", "./tests/4-movie.test.js");

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("file must be an image");
    });
  });

  describe("/PUT UPDATE Movie with Large Image Character", () => {
    test("It should return error file must be an image", async () => {
      const res = await request(app)
        .put(`/movie/${temporaryMovieId}`)
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        })
        .field("title", "my awesome avatar")
        .field("budget", "100")
        .field("release_date", "2021/03/11")
        .field("director", "my awesome director")
        .field("genre", "fantasy,adventure,romance")
        .field("character_name", "John Doe")
        .attach("poster", "./tests/teamATV.png")
        .attach("backdrop", "./tests/teamATV.png")
        .attach("character_images", "./tests/pelanggan.gif");

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("file size larger than 3MB");
    });
  });

  describe("/PUT UPDATE Movie with Large Image Backdrop", () => {
    test("It should return error fil must be an image", async () => {
      const res = await request(app)
        .put(`/movie/${temporaryMovieId}`)
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        })
        .field("title", "my awesome avatar")
        .field("budget", "100")
        .field("release_date", "2021/03/11")
        .field("director", "my awesome director")
        .field("genre", "fantasy,adventure,romance")
        .field("character_name", "John Doe")
        .attach("poster", "./tests/teamATV.png")
        .attach("backdrop", "./tests/pelanggan.gif")
        .attach("character_images", "./tests/teamATV.png");

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("file size larger than 5MB");
    });
  });

  describe("/PUT UPDATE Movie with Large Image Poster", () => {
    test("It should return error fil must be an image", async () => {
      const res = await request(app)
        .put(`/movie/${temporaryMovieId}`)
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        })
        .field("title", "my awesome avatar")
        .field("budget", "100")
        .field("release_date", "2021/03/11")
        .field("director", "my awesome director")
        .field("genre", "fantasy,adventure,romance")
        .field("character_name", "John Doe")
        .attach("poster", "./tests/pelanggan.gif")
        .attach("backdrop", "./tests/teamATV.png")
        .attach("character_images", "./tests/teamATV.png");

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("file size larger than 5MB");
    });
  });

  describe("/DELETE Movie Failed (invalid id)", () => {
    test("It should return failed because invalid id", async () => {
      const res = await request(app)
        .delete(`/movie/` + 12412)
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual(
        "id_movie is not valid and must be 24 character & hexadecimal"
      );
    });
  });

  describe("/DELETE Movie success", () => {
    test("It should delete selected movie", async () => {
      const res = await request(app)
        .delete(`/movie/${temporaryMovieId}`)
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("success");
    });
  });

  describe("/DELETE Movie Failed (movie not found)", () => {
    test("It should return failed because movie not found", async () => {
      const res = await request(app)
        .delete(`/movie/${temporaryMovieId}`)
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("Movie not found");
    });
  });

  describe("/POST Create Movie with image poster, backdrop, character", () => {
    test("It should create a movie with images", async () => {
      const res = await request(app)
        .post("/movie/")
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        })
        .field("title", "my awesome avatar")
        .field("budget", "100")
        .field("release_date", "2021/03/11")
        .field("director", "my awesome director")
        .field("genre", "fantasy,adventure,romance")
        .field("character_name", "John Doe")
        .attach("poster", "./tests/teamATV.png")
        .attach("backdrop", "./tests/teamATV.png")
        .attach("character_images", "./tests/teamATV.png");

      expect(res.statusCode).toEqual(201);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("success");
      expect(res.body).toHaveProperty("data");
    });
  });

  describe("/POST Create Movie with Non Image poster", () => {
    test("It should return error fil must be an image", async () => {
      const res = await request(app)
        .post("/movie/")
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        })
        .field("title", "my awesome avatar")
        .field("budget", "100")
        .field("release_date", "2021/03/11")
        .field("director", "my awesome director")
        .field("genre", "fantasy,adventure,romance")
        .field("character_name", "John Doe")
        .attach("poster", "./tests/4-movie.test.js")
        .attach("backdrop", "./tests/teamATV.png")
        .attach("character_images", "./tests/teamATV.png");

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("file must be an image");
    });
  });

  describe("/POST Create Movie with Non Image Backdrop", () => {
    test("It should return error fil must be an image", async () => {
      const res = await request(app)
        .post("/movie/")
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        })
        .field("title", "my awesome avatar")
        .field("budget", "100")
        .field("release_date", "2021/03/11")
        .field("director", "my awesome director")
        .field("genre", "fantasy,adventure,romance")
        .field("character_name", "John Doe")
        .attach("poster", "./tests/teamATV.png")
        .attach("backdrop", "./tests/4-movie.test.js")
        .attach("character_images", "./tests/teamATV.png");

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("file must be an image");
    });
  });

  describe("/POST Create Movie with Non Image Character", () => {
    test("It should return error fil must be an image", async () => {
      const res = await request(app)
        .post("/movie/")
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        })
        .field("title", "my awesome avatar")
        .field("budget", "100")
        .field("release_date", "2021/03/11")
        .field("director", "my awesome director")
        .field("genre", "fantasy,adventure,romance")
        .field("character_name", "John Doe")
        .attach("poster", "./tests/teamATV.png")
        .attach("backdrop", "./tests/teamATV.png")
        .attach("character_images", "./tests/4-movie.test.js");

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("file must be an image");
    });
  });

  describe("/POST Create Movie with Large Image Character", () => {
    test("It should return error fil must be an image", async () => {
      const res = await request(app)
        .post("/movie/")
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        })
        .field("title", "my awesome avatar")
        .field("budget", "100")
        .field("release_date", "2021/03/11")
        .field("director", "my awesome director")
        .field("genre", "fantasy,adventure,romance")
        .field("character_name", "John Doe")
        .attach("poster", "./tests/teamATV.png")
        .attach("backdrop", "./tests/teamATV.png")
        .attach("character_images", "./tests/pelanggan.gif");

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("file size larger than 3MB");
    });
  });

  describe("/POST Create Movie with Large Image Backdrop", () => {
    test("It should return error fil must be an image", async () => {
      const res = await request(app)
        .post("/movie/")
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        })
        .field("title", "my awesome avatar")
        .field("budget", "100")
        .field("release_date", "2021/03/11")
        .field("director", "my awesome director")
        .field("genre", "fantasy,adventure,romance")
        .field("character_name", "John Doe")
        .attach("poster", "./tests/teamATV.png")
        .attach("backdrop", "./tests/pelanggan.gif")
        .attach("character_images", "./tests/teamATV.png");

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("file size larger than 5MB");
    });
  });

  describe("/POST Create Movie with Large Image Poster", () => {
    test("It should return error fil must be an image", async () => {
      const res = await request(app)
        .post("/movie/")
        .set({
          Authorization: `Bearer ${authenticationToken}`,
        })
        .field("title", "my awesome avatar")
        .field("budget", "100")
        .field("release_date", "2021/03/11")
        .field("director", "my awesome director")
        .field("genre", "fantasy,adventure,romance")
        .field("character_name", "John Doe")
        .attach("poster", "./tests/pelanggan.gif")
        .attach("backdrop", "./tests/teamATV.png")
        .attach("character_images", "./tests/teamATV.png");

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("file size larger than 5MB");
    });
  });


});
