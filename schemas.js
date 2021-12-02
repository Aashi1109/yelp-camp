const baseJoi = require("joi");
const sanitizeHtml = require("sanitize-html");

const extension = (joi) => ({
  type: "string",
  base: joi.string(),
  messages: {
    "string.escapeHtml": "{{#label}} must not include HTML",
  },
  rules: {
    escapeHtml: {
      validate(value, helpers) {
        const clean = sanitizeHtml(value, {
          allowedTags: [],
          allowedAttributes: {},
        });
        if (clean !== value)
          return helpers.error("string.escapeHtml", { value });
        return clean;
      },
    },
  },
});

const Joi = baseJoi.extend(extension);

module.exports.campgroundSchema = Joi.object({
  camp: Joi.object({
    title: Joi.string().required().escapeHtml(),
    price: Joi.number().min(0).required(),
    image: Joi.array(),
    location: Joi.string().required().escapeHtml(),
    description: Joi.string().required().escapeHtml(),
  }).required(),
  deleteImages: Joi.array(),
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    body: Joi.string().required().escapeHtml(),
    rating: Joi.number().required().min(1).max(5),
  }).required(),
});
