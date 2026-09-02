const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');
const User = require('../models/User');
const { uploadBufferToCloudinary, deleteFromCloudinary } = require('../services/cloudinaryService');

const updateMe = catchAsync(async (req, res) => {
  const { name, profile, onboardingStep, isOnboarded } = req.body;

  const update = {};
  if (name !== undefined) update.name = name;
  if (onboardingStep !== undefined) update.onboardingStep = onboardingStep;
  if (isOnboarded !== undefined) update.isOnboarded = isOnboarded;
  if (profile !== undefined) {
    for (const [key, value] of Object.entries(profile)) {
      update[`profile.${key}`] = value;
    }
  }

  const user = await User.findByIdAndUpdate(req.user.id, { $set: update }, { new: true, runValidators: true });
  return sendSuccess(res, 200, 'Profile updated successfully.', { user });
});

const uploadAvatar = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new AppError('Please provide an image file.', 400, 'NO_FILE');
  }

  const user = await User.findById(req.user.id).select('+avatarPublicId');
  if (!user) {
    throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
  }

  const previousPublicId = user.avatarPublicId;
  const { url, publicId } = await uploadBufferToCloudinary(req.file.buffer);

  user.avatarUrl = url;
  user.avatarPublicId = publicId;
  await user.save({ validateBeforeSave: false });

  if (previousPublicId) {
    await deleteFromCloudinary(previousPublicId).catch(() => undefined);
  }

  return sendSuccess(res, 200, 'Profile picture updated successfully.', { user });
});

const deleteAvatar = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id).select('+avatarPublicId');
  if (!user) {
    throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
  }
  if (user.avatarPublicId) {
    await deleteFromCloudinary(user.avatarPublicId).catch(() => undefined);
  }
  user.avatarUrl = '';
  user.avatarPublicId = '';
  await user.save({ validateBeforeSave: false });
  return sendSuccess(res, 200, 'Profile picture removed.', { user });
});

module.exports = { updateMe, uploadAvatar, deleteAvatar };
