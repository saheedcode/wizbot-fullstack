const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { env } = require('../config/env');

/**
 * @param {string} id
 * @returns {string}
 */
const signToken = (id) => {
  return jwt.sign({ id }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
};

/**
 * @param {string} token
 * @returns {{ id: string, iat: number, exp: number }}
 */
const verifyToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};

/**
 * Generates a numeric one-time-password of the given length (default 6 digits).
 * @param {number} [length]
 */
const generateOtp = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[crypto.randomInt(0, digits.length)];
  }
  return otp;
};

/**
 * Hashes a value (e.g. OTP) using SHA-256 for storage, so raw values are never persisted.
 * @param {string} value
 */
const hashValue = (value) => {
  return crypto.createHash('sha256').update(value).digest('hex');
};

/**
 * Generates a cryptographically secure random token, used e.g. for reset-password session tokens.
 * @param {number} [bytes]
 */
const generateRandomToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

module.exports = { signToken, verifyToken, generateOtp, hashValue, generateRandomToken };
