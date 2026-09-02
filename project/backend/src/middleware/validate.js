const { ZodError } = require('zod');
const AppError = require('../utils/AppError');

/**
 * @param {import('zod').AnyZodObject} schema
 */
const validate = (schema) => (req, _res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    req.body = parsed.body ?? req.body;
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const details = err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new AppError('Validation failed', 422, 'VALIDATION_ERROR', details));
    }
    next(err);
  }
};

module.exports = validate;
module.exports.validate = validate;
