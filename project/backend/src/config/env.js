const dotenv = require('dotenv');
const path = require('path');

// Load .env.test when running tests, otherwise .env
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });
// Fallback to .env if .env.test doesn't exist
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * @param {string} key
 * @param {string} [fallback]
 * @returns {string}
 */
function required(key, fallback) {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5003', 10),

  MONGO_URI:
    process.env.NODE_ENV === 'test'
      ? process.env.MONGO_URI_TEST || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/wizjobai_test'
      : required('MONGO_URI', 'mongodb://127.0.0.1:27017/wizjobai'),

  JWT_SECRET: required('JWT_SECRET', 'dev_only_insecure_secret'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_COOKIE_EXPIRES_IN: parseInt(process.env.JWT_COOKIE_EXPIRES_IN || '7', 10),

  // Next.js dev server defaults to :3000 — keep this in sync with frontend/.env.local's
  // NEXT_PUBLIC_API_URL host, or CORS will reject every request from the browser.
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',

  OTP_EXPIRES_IN_MINUTES: parseInt(process.env.OTP_EXPIRES_IN_MINUTES || '10', 10),
  OTP_MAX_ATTEMPTS: parseInt(process.env.OTP_MAX_ATTEMPTS || '5', 10),

  RATE_LIMIT_WINDOW_MINUTES: parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES || '15', 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  AUTH_RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS || '10', 10),

  get isProd() {
    return process.env.NODE_ENV === 'production';
  },
  get isTest() {
    return process.env.NODE_ENV === 'test';
  },
};

module.exports = { env };
