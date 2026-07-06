const AppError = require('../utils/AppError');

const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      const messages = result.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`
      );
      return next(new AppError(`Validation failed: ${messages.join('; ')}`, 400));
    }

    const parsed = result.data;
    if (parsed.body) req.body = parsed.body;
    if (parsed.query) req.query = parsed.query;
    if (parsed.params) req.params = parsed.params;

    next();
  };
};

module.exports = { validate };
