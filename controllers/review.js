const Camp = require("../models/camp");
const Review = require("../models/reviews");

module.exports.createReview = async (req, res) => {
  const camp = await Camp.findById(req.params.id);
  const review = new Review(req.body.review);
  camp.reviews.push(review);
  review.author = req.user._id;
  await camp.save();
  await review.save();
  req.flash("success", "Review added successfully");
  res.redirect(`/camp/details/${camp._id}`);
};

module.exports.deleteReview = async (req, res) => {
  console.log("del", req.params);
  const { id, reviewId } = req.params;
  // console.log(req.params);
  const re = await Camp.findByIdAndUpdate(id, {
    $pull: { reviews: reviewId },
  });
  await Review.findByIdAndDelete(reviewId);
  // console.log(re);
  req.flash("delete", "Review deleted successfully");
  res.redirect(`/camp/details/${id}`);
};
