const User = require('../models/User');
const AppError = require('../utils/AppError');
const { generateOtp, hashValue, generateRandomToken, signToken } = require('../utils/token');
const { sendOtpEmail } = require('./emailService');
const { env } = require('../config/env');

/**
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @param {'jobseeker' | 'recruiter'} [role]
 */
const registerUser = async (name, email, password, role) => {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new AppError('An account with this email already exists.', 409, 'EMAIL_IN_USE');
  }
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    ...(role ? { role } : {}),
  });
  const token = signToken(user.id);
  return { user, token };
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Incorrect email or password.', 401, 'INVALID_CREDENTIALS');
  }
  const token = signToken(user.id);
  return { user, token };
};

/**
 * Generates and stores a hashed OTP for the given purpose, and "sends" it via emailService.
 * Returns the plaintext OTP only when not in production, so the caller can optionally
 * surface it for development/testing convenience (per project requirements).
 * @param {string} email
 * @param {'reset_password' | 'verify_email'} purpose
 */
const requestOtp = async (email, purpose) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    // BUGFIX: this used to throw ACCOUNT_NOT_FOUND here, which let anyone probe
    // whether an email was registered (account enumeration) via forgot-password.
    // Stay silent instead: respond exactly as if a code had been sent.
    return { devOtp: undefined };
  }

  const otp = generateOtp(6);
  user.otpHash = hashValue(otp);
  user.otpPurpose = purpose;
  user.otpExpiresAt = new Date(Date.now() + env.OTP_EXPIRES_IN_MINUTES * 60 * 1000);
  user.otpAttempts = 0;
  user.otpVerifiedToken = undefined;
  user.otpVerifiedTokenExpiresAt = undefined;
  await user.save({ validateBeforeSave: false });

  await sendOtpEmail({ to: user.email, name: user.name, otp, purpose });

  return { devOtp: env.isProd ? undefined : otp, user };
};

/**
 * @param {string} email
 * @param {string} otp
 * @param {'reset_password' | 'verify_email'} purpose
 */
const verifyOtp = async (email, otp, purpose) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    '+otpHash +otpPurpose +otpExpiresAt +otpAttempts'
  );

  if (!user || !user.otpHash || user.otpPurpose !== purpose) {
    throw new AppError('No pending verification request found. Please request a new code.', 400, 'NO_OTP_PENDING');
  }

  if (!user.otpExpiresAt || user.otpExpiresAt.getTime() < Date.now()) {
    throw new AppError('This code has expired. Please request a new one.', 400, 'OTP_EXPIRED');
  }

  if (user.otpAttempts >= env.OTP_MAX_ATTEMPTS) {
    throw new AppError('Too many incorrect attempts. Please request a new code.', 429, 'OTP_MAX_ATTEMPTS');
  }

  const isMatch = user.otpHash === hashValue(otp);
  if (!isMatch) {
    user.otpAttempts += 1;
    await user.save({ validateBeforeSave: false });
    const remaining = env.OTP_MAX_ATTEMPTS - user.otpAttempts;
    throw new AppError(`Incorrect code. ${remaining} attempt(s) remaining.`, 400, 'OTP_INCORRECT');
  }

  // OTP correct: clear it, and if this was for password reset, issue a short-lived reset token
  user.otpHash = undefined;
  user.otpAttempts = 0;

  let resetToken;
  if (purpose === 'reset_password') {
    resetToken = generateRandomToken(32);
    user.otpVerifiedToken = hashValue(resetToken);
    user.otpVerifiedTokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min window to reset
  } else if (purpose === 'verify_email') {
    user.isVerified = true;
  }

  user.otpExpiresAt = undefined;
  user.otpPurpose = undefined;
  await user.save({ validateBeforeSave: false });

  return { resetToken };
};

const resetPassword = async (email, resetToken, newPassword) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    '+otpVerifiedToken +otpVerifiedTokenExpiresAt +password'
  );

  if (
    !user ||
    !user.otpVerifiedToken ||
    !user.otpVerifiedTokenExpiresAt ||
    user.otpVerifiedTokenExpiresAt.getTime() < Date.now() ||
    user.otpVerifiedToken !== hashValue(resetToken)
  ) {
    throw new AppError(
      'Invalid or expired reset session. Please restart the password reset process.',
      400,
      'INVALID_RESET_TOKEN'
    );
  }

  user.password = newPassword;
  user.otpVerifiedToken = undefined;
  user.otpVerifiedTokenExpiresAt = undefined;
  await user.save();

  const token = signToken(user.id);
  return { user, token };
};

const updatePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
  }
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new AppError('Current password is incorrect.', 401, 'INVALID_CURRENT_PASSWORD');
  }
  user.password = newPassword;
  await user.save();

  const token = signToken(user.id);
  return { user, token };
};

module.exports = {
  registerUser,
  loginUser,
  requestOtp,
  verifyOtp,
  resetPassword,
  updatePassword,
};
