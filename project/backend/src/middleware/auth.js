const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { verifyToken } = require('../utils/token');
const User = require('../models/User');

/**
 * Protects a route: requires a valid JWT (via Authorization header or the
 * `token` cookie), attaches the authenticated user to `req.user`.
 */
const protect = catchAsync(async (req, _res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please log in to access this resource.', 401, 'UNAUTHORIZED'));
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch {
    return next(new AppError('Invalid or expired session. Please log in again.', 401, 'INVALID_TOKEN'));
  }

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this session no longer exists.', 401, 'USER_NOT_FOUND'));
  }

  // Invalidate tokens issued before a password change.
  if (decoded.iat && currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('Password was recently changed. Please log in again.', 401, 'PASSWORD_CHANGED'));
  }

  req.user = currentUser;
  next();
});

const restrictToVerified = (req, _res, next) => {
  if (!req.user?.isVerified) {
    return next(new AppError('Please verify your email to access this resource.', 403, 'NOT_VERIFIED'));
  }
  next();
};

/**
 * Restricts a route to users whose `role` is in the given allow-list.
 * Must run after `protect` so `req.user` is populated.
 * @param  {...('jobseeker'|'recruiter'|'admin')} roles
 */
const restrictTo = (...roles) => {
  return (req, _res, next) => {
    if (!roles.includes(req.user?.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403, 'FORBIDDEN'));
    }
    next();
  };
};

module.exports = { protect, restrictToVerified, restrictTo };
