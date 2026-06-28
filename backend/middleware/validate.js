const sanitizeNoSQL = (obj) => {
  if (obj instanceof Object) {
    for (let key in obj) {
      if (key.startsWith('$')) {
        delete obj[key];
      } else if (typeof obj[key] === 'object') {
        sanitizeNoSQL(obj[key]);
      }
    }
  }
};

const validate = (schema) => (req, res, next) => {
  try {
    sanitizeNoSQL(req.body);
    sanitizeNoSQL(req.query);
    sanitizeNoSQL(req.params);

    if (schema.body) {
      req.body = schema.body.parse(req.body);
    }
    if (schema.query) {
      req.query = schema.query.parse(req.query);
    }
    if (schema.params) {
      req.params = schema.params.parse(req.params);
    }
    next();
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: err.errors }
    });
  }
};

module.exports = validate;
