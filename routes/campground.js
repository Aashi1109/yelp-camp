const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, validateCamp, isAuthor } = require("../middleware");
const campController = require("../controllers/camp");
const { storage } = require("../cloudinary");
const multer = require("multer");
const upload = multer({ storage });

router.get("/", catchAsync(campController.index));
router.get("/new", isLoggedIn, campController.newForm);

router.post(
  "/save",
  isLoggedIn,
  upload.array("camp[image]"),
  validateCamp,
  catchAsync(campController.saveCamp)
);

router.delete(
  "/delete/:id",
  isLoggedIn,
  isAuthor,
  catchAsync(campController.deleteCamp)
);

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(campController.editCamp)
);

router.put(
  "/update/:id",
  isLoggedIn,
  isAuthor,
  upload.array("camp[image]"),
  validateCamp,
  catchAsync(campController.updateCamp)
);

router.get("/details/:id", catchAsync(campController.details));

module.exports = router;
