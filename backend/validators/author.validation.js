const Joi = require("joi");

const createAuthor = Joi.object({
  name: Joi.string().min(2).max(80).required(),
  bio: Joi.string().max(2000).allow("", null),
});

const updateAuthor = Joi.object({
  name: Joi.string().min(2).max(80),
  bio: Joi.string().max(2000).allow("", null),
}).min(1);

module.exports = { createAuthor, updateAuthor };
