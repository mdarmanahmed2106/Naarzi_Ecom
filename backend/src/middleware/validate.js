const validate = (schema) => async (req, res, next) => {
  try {
    const parsed = await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    // Assign parsed data (with defaults/coercion) back to req
    if (parsed.body) req.body = parsed.body;
    if (parsed.query) req.query = parsed.query;
    if (parsed.params) req.params = parsed.params;
    next();
  } catch (error) {
    if (error.errors) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map((err) => ({
          location: err.path[0],
          field: err.path.slice(1).join('.'),
          message: err.message
        }))
      });
    }
    next(error);
  }
};

module.exports = validate;
