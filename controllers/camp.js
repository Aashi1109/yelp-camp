const Camp = require("../models/camp");
const mapbox = require("@mapbox/mapbox-sdk/services/geocoding");
const mapboxToken = process.env.MAPBOX_PUBLIC_TOKEN;
const geocoding = mapbox({ accessToken: mapboxToken });
const { cloudinary } = require("../cloudinary/index");

module.exports.index = async (req, res) => {
  const camps = await Camp.find();
  // console.log(camps);
  res.render("camp/index", { camps });
};

module.exports.newForm = (req, res) => {
  res.render("camp/new");
};

module.exports.saveCamp = async (req, res) => {
  if (!req.body.camp) throw new ExpressError("Invalid Camp Data", 400);
  const data = new Camp(req.body.camp);
  data.images = req.files.map((file) => ({
    url: file.path,
    filename: file.filename,
  }));
  await geocoding
    .forwardGeocode({
      query: req.body.camp.location,
      limit: 1,
    })
    .send()
    .then(
      (response) => {
        const match = response.body.features[0].geometry;
        console.log(match);
        data.geometry = match;
      },
      (err) => {
        console.log(err);
      }
    );
  data.author = req.user._id;
  await data.save();
  // console.log(data);
  req.flash("success", "Camp created succesfully");
  res.redirect(`/camp/details/${data._id}`);
};

module.exports.deleteCamp = async (req, res) => {
  const { id } = req.params;
  await Camp.findByIdAndDelete(id);
  req.flash("delete", "Camp deleted successfully");
  res.redirect("/camp");
};

module.exports.editCamp = async (req, res) => {
  const { id } = req.params;
  const campFound = await Camp.findById(id);
  if (!campFound) {
    req.flash("error", "Campground not found with that ID");
    return res.redirect("/camp");
  }
  res.render("camp/edit", { camp: campFound });
};

module.exports.updateCamp = async (req, res) => {
  const { id } = req.params;
  // console.log(req.body);
  // console.log(req.files);
  const camp = await Camp.findByIdAndUpdate(id, req.body.camp);
  const imgs = req.files.map((file) => ({
    url: file.path,
    filename: file.filename,
  }));

  if (req.body.deleteImages && req.body.deleteImages.length) {
    const cloudFile = [];
    camp.images.map((img) => {
      if (img.url.includes("cloudinary")) {
        cloudFile.push(img.filename);
      }
    });
    // console.log("cloudfiles ->", cloudFile);
    for (let file of cloudFile) {
      await cloudinary.uploader.destroy(file);
    }

    await camp.updateOne({
      $pull: { images: { _id: { $in: req.body.deleteImages } } },
    });
  }

  camp.images.push(...imgs);
  await camp.save();
  req.flash("edit", "Camp updated successfully");
  res.redirect(`/camp/details/${id}`);
};

module.exports.details = async (req, res) => {
  const { id } = req.params;
  const campFound = await Camp.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");
  // console.log(campFound);
  if (!campFound) {
    req.flash("error", "Campground not found with that ID");
    return res.redirect("/camp");
  }
  res.render("camp/show", { camp: campFound });
};
