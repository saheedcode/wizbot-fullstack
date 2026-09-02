const mongoose = require('mongoose');
const { Schema } = mongoose;

// Matches the reasons offered in the "Report this job" modal.
const REPORT_REASONS = [
  'not_accepting_applications',
  'spam',
  'fraud_or_scam',
  'misleading_description',
  'other',
];

const jobReportSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    reason: { type: String, enum: REPORT_REASONS, required: true },
    description: { type: String, trim: true, maxlength: 2000 },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'dismissed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// A user only needs to report a given job once; resubmission just updates it.
jobReportSchema.index({ user: 1, job: 1 }, { unique: true });
jobReportSchema.index({ status: 1, createdAt: -1 });

const JobReport = mongoose.models.JobReport || mongoose.model('JobReport', jobReportSchema);

module.exports = JobReport;
module.exports.REPORT_REASONS = REPORT_REASONS;
