const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');
const Bot = require('../models/Bot');
const Application = require('../models/Application');

// Cap on stored activity-log rows per bot - the UI only shows a recent feed,
// so we keep the newest N and drop the rest rather than growing unbounded.
const MAX_ACTIVITY_LOG_ENTRIES = 200;

const findOwnedBotOrFail = async (botId, userId) => {
  const bot = await Bot.findOne({ _id: botId, user: userId });
  if (!bot) throw new AppError('Bot not found.', 404, 'BOT_NOT_FOUND');
  return bot;
};

/**
 * POST /api/bots
 * Creates a new auto-apply Wizbot for the logged-in user ("Create New Bot").
 */
const createBot = catchAsync(async (req, res) => {
  const { name, avatar, config } = req.body;

  const bot = await Bot.create({
    user: req.user.id,
    name,
    ...(avatar ? { avatar } : {}),
    config,
  });

  return sendSuccess(res, 201, 'Bot created successfully.', { bot });
});

/**
 * GET /api/bots
 * Lists all of the logged-in user's bots for the "Manage Wizbot" dashboard.
 * Activity log is excluded here - the list view only needs summary stats.
 */
const listBots = catchAsync(async (req, res) => {
  const bots = await Bot.find({ user: req.user.id }).select('-activityLog').sort({ createdAt: -1 }).lean();
  return sendSuccess(res, 200, 'Bots fetched successfully.', { bots });
});

/**
 * GET /api/bots/:id
 * Bot detail: config, stats, a page of the activity log, and a conversion
 * funnel computed from the real Applications this bot has filed.
 */
const getBot = catchAsync(async (req, res) => {
  const bot = await findOwnedBotOrFail(req.params.id, req.user.id);

  const funnel = await Application.aggregate([
    { $match: { bot: bot._id } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const conversionFunnel = { applied: 0, interview: 0, offer: 0, rejected: 0 };
  for (const entry of funnel) {
    conversionFunnel[entry._id] = entry.count;
  }

  return sendSuccess(res, 200, 'Bot fetched successfully.', {
    bot: {
      ...bot.toObject(),
      activityLog: bot.activityLog.slice(0, 50),
    },
    conversionFunnel,
  });
});

/**
 * PATCH /api/bots/:id
 * Updates a bot's name, avatar, and/or search criteria ("Edit Bot").
 */
const updateBot = catchAsync(async (req, res) => {
  const bot = await findOwnedBotOrFail(req.params.id, req.user.id);
  const { name, avatar, config } = req.body;

  if (name !== undefined) bot.name = name;
  if (avatar !== undefined) bot.avatar = avatar;
  if (config !== undefined) bot.config = { ...bot.config.toObject(), ...config };

  await bot.save();
  return sendSuccess(res, 200, 'Bot updated successfully.', { bot });
});

/**
 * PATCH /api/bots/:id/pause
 */
const pauseBot = catchAsync(async (req, res) => {
  const bot = await findOwnedBotOrFail(req.params.id, req.user.id);
  bot.status = 'paused';
  await bot.save();
  return sendSuccess(res, 200, 'Bot paused.', { bot });
});

/**
 * PATCH /api/bots/:id/resume
 */
const resumeBot = catchAsync(async (req, res) => {
  const bot = await findOwnedBotOrFail(req.params.id, req.user.id);
  bot.status = 'active';
  await bot.save();
  return sendSuccess(res, 200, 'Bot resumed.', { bot });
});

/**
 * DELETE /api/bots/:id
 */
const deleteBot = catchAsync(async (req, res) => {
  const bot = await findOwnedBotOrFail(req.params.id, req.user.id);
  await bot.deleteOne();
  return sendSuccess(res, 200, 'Bot deleted successfully.');
});

/**
 * POST /api/bots/:id/activity
 * Records one activity-log row for a bot (scanned/applied/skipped/error),
 * bumps the matching counter, and - when the action is "applied" against a
 * real job in our Jobs collection - files an Application linked to this bot
 * so the conversion funnel reflects real outcomes.
 */
const addActivity = catchAsync(async (req, res) => {
  const bot = await findOwnedBotOrFail(req.params.id, req.user.id);
  const { action, jobTitle, company, message, jobId } = req.body;

  bot.activityLog.unshift({ action, jobTitle, company, message, timestamp: new Date() });
  if (bot.activityLog.length > MAX_ACTIVITY_LOG_ENTRIES) {
    bot.activityLog = bot.activityLog.slice(0, MAX_ACTIVITY_LOG_ENTRIES);
  }

  if (action === 'scanned') bot.stats.jobsScanned += 1;
  if (action === 'applied') bot.stats.applied += 1;
  if (action === 'error') bot.stats.errors += 1;

  await bot.save();

  if (action === 'applied' && jobId) {
    await Application.findOneAndUpdate(
      { user: req.user.id, job: jobId },
      { user: req.user.id, job: jobId, bot: bot._id },
      { upsert: true, setDefaultsOnInsert: true }
    ).catch(() => undefined); // a duplicate/invalid job id shouldn't fail the activity log write
  }

  return sendSuccess(res, 201, 'Activity recorded.', { bot });
});

module.exports = { createBot, listBots, getBot, updateBot, pauseBot, resumeBot, deleteBot, addActivity };
