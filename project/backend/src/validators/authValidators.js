const { z } = require('zod');

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a number');

// Self-registration may only pick 'jobseeker' or 'recruiter' - 'admin' is
// deliberately excluded here and can only be granted by an existing admin.
const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().trim().email('Please provide a valid email'),
    password: passwordSchema,
    role: z.enum(['jobseeker', 'recruiter']).optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email('Please provide a valid email'),
    password: z.string().min(1, 'Password is required'),
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().trim().email('Please provide a valid email'),
  }),
});

const verifyOtpSchema = z.object({
  body: z.object({
    email: z.string().trim().email('Please provide a valid email'),
    otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must be numeric'),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().trim().email('Please provide a valid email'),
    resetToken: z.string().min(10, 'Invalid or missing reset token'),
    password: passwordSchema,
  }),
});

const updatePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
  }),
});

const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100).optional(),
    profile: z
      .object({
        headline: z.string().trim().max(150).optional(),
        bio: z.string().trim().max(2000).optional(),
        location: z.string().trim().max(150).optional(),
        phone: z.string().trim().max(30).optional(),
        industry: z.string().trim().max(100).optional(),
        skills: z.array(z.string().trim()).optional(),
        jobTypes: z.array(z.string().trim()).optional(),
        experienceLevel: z.string().trim().optional(),
        desiredSalaryMin: z.number().min(0).optional(),
        desiredSalaryMax: z.number().min(0).optional(),
        availability: z.string().trim().optional(),
        openToRemote: z.boolean().optional(),
      })
      .partial()
      .optional(),
    onboardingStep: z.number().min(0).max(10).optional(),
    isOnboarded: z.boolean().optional(),
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  updateProfileSchema,
};
