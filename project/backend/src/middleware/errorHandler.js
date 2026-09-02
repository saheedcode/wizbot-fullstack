const { env } = require('../config/env');
const AppError = require('../utils/AppError');

const handleCastError = () => new AppError('Invalid identifier supplied.', 400, 'INVALID_ID');

const handleDuplicateKeyError = (err) => {
  const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'field';
  return new AppError(`This ${field} is already in use.`, 409, 'DUPLICATE_FIELD');
};

const handleValidationError = (err) => {
  const details = Object.values(err.errors).map((e) => e.message);
  return new AppError(`Invalid input: ${details.join(', ')}`, 400, 'MONGOOSE_VALIDATION');
};

const handleJwtError = () => new AppError('Invalid session. Please log in again.', 401, 'INVALID_TOKEN');
const handleJwtExpired = () => new AppError('Your session has expired. Please log in again.', 401, 'TOKEN_EXPIRED');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  let error = err instanceof AppError ? err : new AppError(err.message || 'Something went wrong', 500);

  if (err.name === 'CastError') error = handleCastError();
  if (err.code === 11000) error = handleDuplicateKeyError(err);
  if (err.name === 'ValidationError' && err.errors) error = handleValidationError(err);
  if (err.name === 'JsonWebTokenError') error = handleJwtError();
  if (err.name === 'TokenExpiredError') error = handleJwtExpired();

  const statusCode = error.statusCode || 500;

  if (!env.isProd) {
    console.error('[error]', err);
  }

  res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal server error',
    code: error.code,
    ...(error.details ? { details: error.details } : {}),
    ...(!env.isProd && statusCode === 500 ? { stack: err.stack } : {}),
  });
};

const notFoundHandler = (req, _res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404, 'NOT_FOUND'));
};

module.exports = { errorHandler, notFoundHandler };
