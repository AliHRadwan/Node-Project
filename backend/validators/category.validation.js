const Joi = require("joi");

const id = Joi.string().hex().length(24);

const createCategory = Joi.object({
  name: Joi.string().min(2).max(60).required(),
  slug: Joi.string().pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(), // optional; will be auto-generated if missing
  parentId: id.allow(null),
});

const updateCategory = Joi.object({
  name: Joi.string().min(2).max(60),
  slug: Joi.string().pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  parentId: id.allow(null),
}).min(1); // at least one field

module.exports = { createCategory, updateCategory };
