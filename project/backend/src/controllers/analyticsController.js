const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/apiResponse');
const Application = require('../models/Application');
const Job = require('../models/Job');
const ChatSession = require('../models/ChatSession');
const Bot = require('../models/Bot');

/**
 * GET /api/analytics/dashboard
 * Returns aggregated counts for the logged-in user's dashboard in a single
 * pass per collection (one aggregation for status breakdown, done in
 * parallel with the other lightweight counts) rather than several
 * sequential countDocuments calls.
 */
const getDashboardMetrics = catchAsync(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user.id);

  const [statusBreakdown, totalJobs, chatSessionCount, bots] = await Promise.all([
    Application.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Job.estimatedDocumentCount(),
    ChatSession.countDocuments({ user: userId }),
    Bot.find({ user: userId }).select('status stats').lean(),
  ]);

  const breakdown = { applied: 0, interview: 0, offer: 0, rejected: 0 };
  let totalApplications = 0;
  for (const entry of statusBreakdown) {
    breakdown[entry._id] = entry.count;
    totalApplications += entry.count;
  }

  const successRate =
    totalApplications > 0 ? Number(((breakdown.offer / totalApplications) * 100).toFixed(1)) : 0;

  const botSummary = bots.reduce(
    (acc, bot) => {
      acc.total += 1;
      if (bot.status === 'active') acc.active += 1;
      acc.jobsScanned += bot.stats?.jobsScanned || 0;
      acc.applied += bot.stats?.applied || 0;
      return acc;
    },
    { total: 0, active: 0, jobsScanned: 0, applied: 0 }
  );

  return sendSuccess(res, 200, 'Dashboard metrics fetched successfully.', {
    metrics: {
      totalJobsAvailable: totalJobs,
      totalApplications,
      applied: breakdown.applied,
      interviews: breakdown.interview,
      offers: breakdown.offer,
      rejections: breakdown.rejected,
      successRate,
      chatSessions: chatSessionCount,
      bots: botSummary,
    },
  });
});

module.exports = { getDashboardMetrics };
