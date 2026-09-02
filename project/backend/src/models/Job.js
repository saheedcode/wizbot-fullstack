const mongoose = require('mongoose');
const { Schema } = mongoose;

const jobSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    companyLogoUrl: { type: String, default: '' },
    location: { type: String, required: true, trim: true },
    employmentType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
      default: 'Full-time',
    },
    workMode: { type: String, enum: ['Remote', 'Hybrid', 'Onsite'], default: 'Remote' },
    salaryMin: { type: Number, min: 0 },
    salaryMax: { type: Number, min: 0 },
    currency: { type: String, default: 'USD' },
    description: { type: String, required: true },
    requirements: [{ type: String }],
    skills: [{ type: String }],
    postedAt: { type: Date, default: Date.now },
    postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

// Full-text search across the fields job seekers search by most.
jobSchema.index({ title: 'text', company: 'text', skills: 'text' });

// Frequently filtered/sorted fields for the jobs listing endpoint.
jobSchema.index({ postedAt: -1 });
jobSchema.index({ employmentType: 1 });
jobSchema.index({ workMode: 1 });

const Job = mongoose.models.Job || mongoose.model('Job', jobSchema);

module.exports = Job;
