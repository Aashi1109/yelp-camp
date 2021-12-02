if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// console.log(process.env);
// module imports
const express = require("express");
const app = express();
const path = require("path");
const ejsMate = require("ejs-mate");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/users");
const mongoSanitize = require("express-mongo-sanitize");
const MongoDBStore = require("connect-mongo");

// connecting database
//
const dbUrl = process.env.ATLAS_URL || "mongodb://localhost:27017/yelp-camp";
mongoose.connect(dbUrl);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection Error"));
db.once("open", () => {
  console.log("Connection Established");
});

// setting up engine and path
app.engine("ejs", ejsMate);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// starting server at port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening at port ${port}`);
});

// routers
const userRoutes = require("./routes/user");
const campgroundRoutes = require("./routes/campground");
const reviewRoutes = require("./routes/review");

// app middlewares
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  mongoSanitize({
    replaceWith: "_",
  })
);

const secret = process.env.SECRET || "thisismysecret";
const store = new MongoDBStore({
  mongoUrl: dbUrl,
  secret,
  touchAfter: 24 * 60 * 60,
});

store.on("error", (e) => {
  console.log("SESSION STORE ERROR", e);
});
const config = {
  store,
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(config));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// middleware for flash messages
// global variables available to all out templates
app.use((req, res, next) => {
  // console.log(req.session);
  res.locals.success = req.flash("success");
  res.locals.del = req.flash("delete");
  res.locals.update = req.flash("edit");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

// using routers
app.use("/", userRoutes);
app.use("/camp", campgroundRoutes);
app.use("/camp/:id/reviews", reviewRoutes);

// homepage
app.get("/", (req, res) => {
  res.render("home");
});
// Page not found
app.all("*", (req, res, next) => {
  next(new ExpressError("Page not found", 404));
});

// Generic Error handler
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something went wrong";
  res.status(statusCode).render("error", { err });
});
