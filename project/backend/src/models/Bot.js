const mongoose = require('mongoose');
const { Schema } = mongoose;

// Matches the fixed set of icons offered in the "Select Bot Avatar" modal.
const BOT_AVATARS = ['bot-blue', 'bot-green', 'bot-red', 'bot-purple', 'bot-orange', 'bot-teal'];

const BOT_ACTIVITY_ACTIONS = ['scanned', 'applied', 'skipped', 'error'];

// Individual rows in a bot's "Live Activity Log".
const activitySchema = new Schema(
  {
    action: { type: String, enum: BOT_ACTIVITY_ACTIONS, required: true },
    jobTitle: { type: String, trim: true, maxlength: 200 },
    company: { type: String, trim: true, maxlength: 150 },
    message: { type: String, trim: true, maxlength: 500 },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

// The bot's search/apply criteria, set on creation via "Create New Bot" and
// editable afterwards via "Edit Bot".
const botConfigSchema = new Schema(
  {
    jobTitle: { type: String, trim: true, required: true, maxlength: 150 },
    jobType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
      default: 'Full-time',
    },
    workMode: { type: String, enum: ['Remote', 'Hybrid', 'Onsite', 'Any'], default: 'Any' },
    minSalary: { type: Number, min: 0 },
    maxSalary: { type: Number, min: 0 },
    excludedCompanies: [{ type: String, trim: true }],
  },
  { _id: false }
);

const botSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, trim: true, required: true, maxlength: 150 },
    avatar: { type: String, enum: BOT_AVATARS, default: BOT_AVATARS[0] },
    status: { type: String, enum: ['active', 'paused'], default: 'active' },
    config: { type: botConfigSchema, required: true },

    // Running counters shown on the "Manage Wizbot" cards - kept denormalized
    // here so the dashboard list can render without an aggregation per bot.
    stats: {
      jobsScanned: { type: Number, default: 0, min: 0 },
      applied: { type: Number, default: 0, min: 0 },
      offersReceived: { type: Number, default: 0, min: 0 },
      errors: { type: Number, default: 0, min: 0 },
    },

    // Most recent activity first; capped in the controller so a long-running
    // bot doesn't grow this document unbounded.
    activityLog: { type: [activitySchema], default: [] },
  },
  { timestamps: true }
);

botSchema.index({ user: 1, createdAt: -1 });

const Bot = mongoose.models.Bot || mongoose.model('Bot', botSchema);

module.exports = Bot;
module.exports.BOT_AVATARS = BOT_AVATARS;
module.exports.BOT_ACTIVITY_ACTIONS = BOT_ACTIVITY_ACTIONS;
