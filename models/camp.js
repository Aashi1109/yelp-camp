const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./reviews");

const opts = { toJSON: { virtuals: true } };
const imageSchema = new Schema({
  url: String,
  filename: String,
});

const campSchema = new Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    images: [imageSchema],
    price: {
      type: Number,
    },
    description: {
      type: String,
    },
    location: {
      type: String,
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
  },
  opts
);

imageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_150,h_100");
});

campSchema.virtual("properties.popupMarkup").get(function () {
  return `<h4><a href="/camp/details/${this._id}">${this.title}</a></h4>
  <p>${this.description.substring(0, 20)}...</p>`;
});
campSchema.post("findOneAndDelete", async (doc) => {
  if (doc) {
    const re = await Review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    });
    console.log("camp deleted", re);
  }
  // console.log(doc);
});
module.exports = mongoose.model("Camp", campSchema);
