const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const passport = require("passport");
const userController = require("../controllers/user");

// router.use(passport.initialize());

router
  .route("/login")
  .get(userController.login)
  .post(
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    userController.loginUser
  );

router
  .route("/register")
  .get(userController.register)
  .post(catchAsync(userController.registerUser));

router.get("/logout", userController.logout);

module.exports = router;
