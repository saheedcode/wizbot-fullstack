/**
 * Sends a consistent success response shape across the whole API.
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {string} message
 * @param {Record<string, unknown> | unknown[] | null} [data]
 * @param {Record<string, unknown>} [meta]
 */
const sendSuccess = (res, statusCode, message, data, meta) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...(data !== undefined && data !== null ? { data } : {}),
    ...(meta ? { meta } : {}),
  });
};

module.exports = { sendSuccess };
