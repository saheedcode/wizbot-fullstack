const { env } = require('../config/env');

/**
 * Sends the OTP email. In production, wire this up to a real provider
 * (SendGrid, Resend, SES, Postmark, etc). For now it logs to the server console
 * so the flow is fully testable without external credentials.
 * @param {{ to: string, name: string, otp: string, purpose: 'reset_password' | 'verify_email' }} params
 */
const sendOtpEmail = async ({ to, name, otp, purpose }) => {
  const subject =
    purpose === 'reset_password' ? 'Your WizJobAI password reset code' : 'Verify your WizJobAI account';

  if (!env.isProd) {
    console.log(
      `\n[email:dev] To: ${to}\nSubject: ${subject}\nHi ${name}, your OTP code is: ${otp}\nExpires in ${env.OTP_EXPIRES_IN_MINUTES} minutes.\n`
    );
    return;
  }

  // Production integration placeholder:
  // await sendgrid.send({ to, from: 'no-reply@wizjobai.com', subject, text: `Your code is ${otp}` });
};

module.exports = { sendOtpEmail };
