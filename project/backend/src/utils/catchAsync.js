/**
 * Wraps an async route/middleware handler so any rejected promise or thrown
 * error is forwarded to Express's error-handling middleware instead of
 * crashing the process (fixes unhandled promise rejections in controllers).
 * @param {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => Promise<unknown>} fn
 * @returns {import('express').RequestHandler}
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = catchAsync;
