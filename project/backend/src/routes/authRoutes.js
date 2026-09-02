const { Router } = require('express');
const authController = require('../controllers/authController');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiters');
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  updatePasswordSchema,
} = require('../validators/authValidators');

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.getMe);

router.post('/otp/send', authLimiter, validate(forgotPasswordSchema), authController.sendVerificationOtp);
router.post('/otp/verify-email', authLimiter, validate(verifyOtpSchema), authController.verifyEmailOtp);

router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/verify-reset-otp', authLimiter, validate(verifyOtpSchema), authController.verifyResetOtp);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), authController.resetPassword);

router.patch('/update-password', protect, validate(updatePasswordSchema), authController.updateMyPassword);

module.exports = router;
