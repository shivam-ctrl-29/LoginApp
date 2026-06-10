const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map(d => d.message);
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    req.body = value;
    next();
  };
};

module.exports = validate;
