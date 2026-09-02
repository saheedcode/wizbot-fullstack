const mongoose = require('mongoose');
const { Schema } = mongoose;

const applicationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    // Set when this application was submitted automatically by a Wizbot,
    // so bot performance/conversion metrics can be derived from real
    // application outcomes rather than a separate counter.
    bot: { type: Schema.Types.ObjectId, ref: 'Bot', default: null, index: true },
    status: {
      type: String,
      enum: ['applied', 'interview', 'offer', 'rejected'],
      default: 'applied',
    },
    appliedAt: { type: Date, default: Date.now },
    notes: { type: String, maxlength: 2000 },

    // Resume/document uploaded to Cloudinary at application time.
    resumeUrl: { type: String, default: '' },
    resumePublicId: { type: String, default: '', select: false },
    coverLetter: { type: String, maxlength: 5000 },
  },
  { timestamps: true }
);

// A user may only apply once per job.
applicationSchema.index({ user: 1, job: 1 }, { unique: true });
// Fast lookup of "all applications for this job" (recruiter view) and status filtering.
applicationSchema.index({ job: 1, status: 1 });
// Fast lookup of "all applications by this user" sorted by recency.
applicationSchema.index({ user: 1, createdAt: -1 });

const Application =
  mongoose.models.Application || mongoose.model('Application', applicationSchema);

module.exports = Application;
