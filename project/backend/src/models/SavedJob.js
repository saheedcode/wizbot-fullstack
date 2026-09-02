const mongoose = require('mongoose');
const { Schema } = mongoose;

const savedJobSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
  },
  { timestamps: true }
);

// A user can only save a given job once.
savedJobSchema.index({ user: 1, job: 1 }, { unique: true });
// Fast lookup of "my saved jobs", most recently saved first.
savedJobSchema.index({ user: 1, createdAt: -1 });

const SavedJob = mongoose.models.SavedJob || mongoose.model('SavedJob', savedJobSchema);

module.exports = SavedJob;
