require("dotenv").config({
	path: `.env.${process.env.NODE_ENV}`,
});

// Import For security library for production
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const helmet = require("helmet");
const fs = require("fs");
const path = require("path");
const morgan = require("morgan");
const cors = require("cors");

//import Express framework
const express = require("express");
const app = express();
const fileUpload = require("express-fileupload");

//import for unsplash API
const fetch = require('node-fetch');
const { createApi } = require("unsplash-js");

// CORS, prepared if we want to make it public (hosted in public server)
app.use(cors());

//Set body parser for HTTP post operation
app.use(express.json()); // support json encoded bodies
app.use(
  express.urlencoded({
    extended: true,
  })
); // support encoded bodies

//set fileUpload plugins
app.use(fileUpload());
//set static assets to public directory
app.use(express.static("public"));

app.use("/log", (req, res, next) => {
    console.log("masuk sini");
    return res.status(200).json("yay");
});

// Load Unsplash API
const unsplash = createApi({
	accessKey: process.env.UNSPLASH_ACCESS_KEY,
	headers: { "Accept-Version": "v1" },
    fetch : fetch,
});

app.use("/test",async (req, res, next) => {
    console.log("masuk sini");

    let options = {
        query: 'cat',
        page: 1,
        perPage: 10,
        color: 'green',
        orientation: 'portrait',
      }

    let result = await unsplash.search.getPhotos(options);
    return res.status(200).json(result);
});

// ROUTES DECLARATION & IMPORT
const authRoutes = require("./routes/authRoute.js");
app.use("/auth", authRoutes);

const photoRoutes = require("./routes/photoRoute.js");
app.use("/photo", photoRoutes);

const reviewRoutes = require("./routes/reviewRoute.js");
app.use("/review", reviewRoutes);

const userRoutes = require("./routes/userRoute.js");
app.use("/user", userRoutes);


//========================= Error Handler ==========================
app.use((err, req, res, next) => {
	const status = err.statusCode || 500;
	const message = err.message;
	const data = err.data;
	res.status(status).json({ success: false, message: message, data: data });
});
//========================= End Error Handler ======================

//======================== security code ==============================//
// Sanitize data
app.use(mongoSanitize());

// Prevent XSS attact
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 10 mins
  max: 100,
});

app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Use helmet
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  // create a write stream (in append mode)
  let accessLogStream = fs.createWriteStream(
    path.join(__dirname, "access.log"),
    {
      flags: "a",
    }
  );

  // setup the logger
  app.use(morgan("combined", { stream: accessLogStream }));
}
//======================== end security code ==============================//

//======================== Listen Server ===========================
if (process.env.NODE_ENV !== "test") {
	let PORT = 3000;
	app.listen(PORT, () => console.log(`server running on PORT : ${PORT}`));
} else module.exports = app;
//======================== End Listen Server =======================
