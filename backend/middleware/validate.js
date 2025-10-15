const validateBody = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({
      message: "Validation error",
      details: error.details.map(d => ({ path: d.path.join("."), message: d.message })),
    });
  }
  req.body = value; 
  next();
};
const validateQuery = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.query, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(400).json({
      message: "Invalid query params",
      details: error.details.map(d => ({ path: d.path.join("."), message: d.message })),
    });
  }
  req.query = value; 
  next();
};

module.exports = { validateBody, validateQuery };

