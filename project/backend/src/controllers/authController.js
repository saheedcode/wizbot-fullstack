const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/apiResponse');
const { env } = require('../config/env');
const authService = require('../services/authService');

const cookieOptions = () => ({
  httpOnly: true,
  secure: env.isProd,
  sameSite: env.isProd ? 'strict' : 'lax',
  maxAge: env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
});

const attachAuthCookie = (res, token) => {
  res.cookie('token', token, cookieOptions());
};

const register = catchAsync(async (req, res) => {
  const { name, email, password, role } = req.body;
  const { user, token } = await authService.registerUser(name, email, password, role);
  attachAuthCookie(res, token);
  return sendSuccess(res, 201, 'Account created successfully.', { user, token });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await authService.loginUser(email, password);
  attachAuthCookie(res, token);
  return sendSuccess(res, 200, 'Logged in successfully.', { user, token });
});

const logout = catchAsync(async (_req, res) => {
  res.clearCookie('token', cookieOptions());
  return sendSuccess(res, 200, 'Logged out successfully.');
});

const getMe = catchAsync(async (req, res) => {
  return sendSuccess(res, 200, 'Current user fetched.', { user: req.user });
});

const sendVerificationOtp = catchAsync(async (req, res) => {
  const { email } = req.body;
  const { devOtp } = await authService.requestOtp(email, 'verify_email');
  return sendSuccess(res, 200, 'A verification code has been sent to your email.', undefined, {
    ...(devOtp ? { devOtp, devNote: 'OTP shown for development only. Never expose this in production.' } : {}),
  });
});

const verifyEmailOtp = catchAsync(async (req, res) => {
  const { email, otp } = req.body;
  await authService.verifyOtp(email, otp, 'verify_email');
  return sendSuccess(res, 200, 'Email verified successfully.');
});

const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const { devOtp } = await authService.requestOtp(email, 'reset_password');
  return sendSuccess(res, 200, 'If an account with that email exists, a reset code has been sent.', undefined, {
    ...(devOtp ? { devOtp, devNote: 'OTP shown for development only. Never expose this in production.' } : {}),
  });
});

const verifyResetOtp = catchAsync(async (req, res) => {
  const { email, otp } = req.body;
  const { resetToken } = await authService.verifyOtp(email, otp, 'reset_password');
  return sendSuccess(res, 200, 'Code verified. You may now reset your password.', { resetToken });
});

const resetPassword = catchAsync(async (req, res) => {
  const { email, resetToken, password } = req.body;
  const { user, token } = await authService.resetPassword(email, resetToken, password);
  attachAuthCookie(res, token);
  return sendSuccess(res, 200, 'Password reset successfully.', { user, token });
});

const updateMyPassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const { user, token } = await authService.updatePassword(req.user.id, currentPassword, newPassword);
  attachAuthCookie(res, token);
  return sendSuccess(res, 200, 'Password updated successfully.', { user, token });
});

module.exports = {
  register,
  login,
  logout,
  getMe,
  sendVerificationOtp,
  verifyEmailOtp,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  updateMyPassword,
};
