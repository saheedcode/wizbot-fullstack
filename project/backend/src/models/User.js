const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Schema } = mongoose;

const profileSchema = new Schema(
  {
    headline: { type: String, trim: true, maxlength: 150 },
    bio: { type: String, trim: true, maxlength: 2000 },
    location: { type: String, trim: true, maxlength: 150 },
    phone: { type: String, trim: true, maxlength: 30 },
    industry: { type: String, trim: true, maxlength: 100 },
    skills: [{ type: String, trim: true }],
    jobTypes: [{ type: String, trim: true }],
    experienceLevel: { type: String, trim: true },
    desiredSalaryMin: { type: Number, min: 0 },
    desiredSalaryMax: { type: Number, min: 0 },
    availability: { type: String, trim: true },
    openToRemote: { type: Boolean, default: false },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name must be under 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['jobseeker', 'recruiter', 'admin'],
      default: 'jobseeker',
    },
    avatarUrl: { type: String, default: '' },
    avatarPublicId: { type: String, default: '', select: false },
    isVerified: { type: Boolean, default: false },
    isOnboarded: { type: Boolean, default: false },
    onboardingStep: { type: Number, default: 0 },
    profile: { type: profileSchema, default: () => ({}) },

    otpHash: { type: String, select: false },
    otpPurpose: { type: String, enum: ['reset_password', 'verify_email'], select: false },
    otpExpiresAt: { type: Date, select: false },
    otpAttempts: { type: Number, default: 0, select: false },
    otpVerifiedToken: { type: String, select: false },
    otpVerifiedTokenExpiresAt: { type: Date, select: false },

    passwordChangedAt: { type: Date, select: false },
  },
  { timestamps: true }
);

// `email` already has a unique index via `unique: true` above (frequently
// queried on every login/register/otp request), so no duplicate index needed.

userSchema.pre('save', async function preSave(next) {
  if (!this.isModified('password')) return next();
  try {
    this.password = await bcrypt.hash(this.password, 12);
    if (!this.isNew) {
      // subtract 1s to ensure token issued after this always passes the check
      this.passwordChangedAt = new Date(Date.now() - 1000);
    }
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.changedPasswordAfter = function changedPasswordAfter(jwtTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000);
    return jwtTimestamp < changedTimestamp;
  }
  return false;
};

// Never leak sensitive fields even if accidentally selected
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.otpHash;
    delete ret.otpPurpose;
    delete ret.otpExpiresAt;
    delete ret.otpAttempts;
    delete ret.otpVerifiedToken;
    delete ret.otpVerifiedTokenExpiresAt;
    delete ret.avatarPublicId;
    delete ret.__v;
    return ret;
  },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
