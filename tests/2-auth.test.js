const request = require("supertest");
const app = require("../index");

const { user } = require("../models"); // import transaksi models

let authenticationToken = "0";

describe("Authentication TEST", () => {
  describe("/POST Sign Up", () => {
    test("It should make user and get authentication_key (jwt)", async () => {
      await user.collection.dropIndexes();
      await user.deleteMany();
      await user.collection.createIndex( { email: 1 } , { unique : true } );
      const res = await request(app).post("/auth/signup").send({
        name: "User Biasa",
        email: "biasa@icloud.com",
        password: "Pasword123!!",
        confirmPassword: "Pasword123!!",
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("success");
      expect(res.body).toHaveProperty("token");
    });
  });

  describe("/POST Sign Up (same email)", () => {
    test("It should return error because same email was used", async () => {
      const res = await request(app).post("/auth/signup").send({
        name: "User Biasa",
        email: "biasa@icloud.com",
        password: "Pasword123!!",
        confirmPassword: "Pasword123!!",
      });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("Please use another email");
    });
  });

  describe("/POST Sign Up (data send not complete)", () => {
    test("It should return error because data body send is not complete", async () => {
      const res = await request(app).post("/auth/signup").send({
        name: "mas Reza",
        password: "Pasword123!!",
        confirmPassword: "Pasword123!!",
      });

      expect(res.statusCode).toEqual(500);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("internal server error");
    });
  });

  describe("/POST Login", () => {
    test("It should make user login and get authentication_key (jwt)", async () => {
      const res = await request(app).post("/auth/login").send({
        email: "biasa@icloud.com",
        password: "Pasword123!!",
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("success");
      expect(res.body).toHaveProperty("token");
    });
  });

  describe("/POST Login (wrong password)", () => {
    test("It should return error, because password not correct", async () => {
      const res = await request(app).post("/auth/login").send({
        email: "biasa@icloud.com",
        password: "Pasd12!!",
      });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("Wrong password!");
    });
  });

  describe("/POST Login (user not Found)", () => {
    test("It should return Error because user not found", async () => {
      const res = await request(app).post("/auth/login").send({
        email: "fahmial@icloud.com",
        password: "Pasword123!!",
      });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("User is not found!");
    });
  });

  describe("/POST Login (data send not complete)", () => {
    test("It should return Error because email not send", async () => {
      const res = await request(app).post("/auth/login").send({
        //email: "fahmial@icloud.com",
        password: "Pasword123!!",
      });

      expect(res.statusCode).toEqual(500);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("internal server error");
    });
  });

  describe("/POST Sign Up Name not Valid", () => {
    test("It should return status 400 and error message", async () => {
      const res = await request(app).post("/auth/signup").send({
        name: "mas Reza123",
        email: "fahmialfareza@icloud.com",
        password: "Pasword123!!",
        confirmPassword: "Pasword123!!",
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("Name must be alphabet");
    });
  });

  describe("/POST Sign Up Email not Valid", () => {
    test("It should return status 400 and error message", async () => {
      const res = await request(app).post("/auth/signup").send({
        name: "mas Reza",
        email: "fahmialfarezaicloud.com",
        password: "Pasword123!!",
        confirmPassword: "Pasword123!!",
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("Email is not valid");
    });
  });

  describe("/POST Sign Up Weak Password", () => {
    test("It should return status 400 and error message", async () => {
      const res = await request(app).post("/auth/signup").send({
        name: "mas Reza",
        email: "fahmialfareza@icloud.com",
        password: "Pasword123",
        confirmPassword: "Pasword123",
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual(
        "password must have minimum length 8, minimum 1 lowercase character, minimum 1 uppercase character, minimum 1 numbers, and minimum 1 symbols"
      );
    });
  });

  describe("/POST Sign Up Password not Match", () => {
    test("It should return status 400 and error message", async () => {
      const res = await request(app).post("/auth/signup").send({
        name: "mas Reza",
        email: "fahmialfareza@icloud.com",
        password: "Aneh1234!!",
        confirmPassword: "Ane234",
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.message).toEqual("password does not match");
    });
  });
});
