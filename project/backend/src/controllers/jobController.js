const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');
const Job = require('../models/Job');
const SavedJob = require('../models/SavedJob');
const JobReport = require('../models/JobReport');

// Fields returned in the jobs listing - trimmed to what the list view needs,
// so we don't ship the full description/requirements payload over the wire.
const LIST_FIELDS =
  'title company companyLogoUrl location employmentType workMode salaryMin salaryMax currency skills postedAt';

// Sort options exposed to the jobs listing endpoint. Keys are what the
// frontend sends as `?sort=`; values are the Mongoose sort spec applied.
const SORT_OPTIONS = {
  newest: { postedAt: -1 },
  salary_high: { salaryMax: -1, salaryMin: -1 },
  salary_low: { salaryMin: 1, salaryMax: 1 },
};

const listJobs = catchAsync(async (req, res) => {
  const {
    search,
    workMode,
    employmentType,
    location,
    company,
    minSalary,
    sort = 'newest',
    page = '1',
    limit = '10',
  } = req.query;

  const filter = {};
  if (search) filter.$text = { $search: search };
  if (workMode) filter.workMode = workMode;
  if (employmentType) filter.employmentType = employmentType;
  // Free-text location match (city/country) - separate from the keyword
  // search above so the UI can offer distinct "keyword" and "location" fields.
  if (location) filter.location = { $regex: String(location).trim(), $options: 'i' };
  // Exact company match, used to power "more jobs at this company" on the
  // job details view.
  if (company) filter.company = company;
  if (minSalary) {
    const min = Number(minSalary);
    if (!Number.isNaN(min)) {
      // A job clears the bar if either end of its range meets the minimum,
      // so postings that only set salaryMin (or only salaryMax) still match.
      filter.$or = [{ salaryMin: { $gte: min } }, { salaryMax: { $gte: min } }];
    }
  }

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
  const sortSpec = SORT_OPTIONS[sort] || SORT_OPTIONS.newest;

  const [jobs, total] = await Promise.all([
    Job.find(filter)
      .select(LIST_FIELDS)
      .sort(sortSpec)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      // lean() skips Mongoose document hydration for read-only lists -
      // meaningfully faster and lighter on memory for high-traffic listing endpoints.
      .lean(),
    Job.countDocuments(filter),
  ]);

  // Public, read-mostly list: safe to let clients/CDNs cache briefly.
  res.set('Cache-Control', 'public, max-age=60');

  return sendSuccess(res, 200, 'Jobs fetched successfully.', { jobs }, {
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum) || 1,
  });
});

const getJob = catchAsync(async (req, res) => {
  const job = await Job.findById(req.params.id).lean();
  if (!job) throw new AppError('Job not found.', 404, 'JOB_NOT_FOUND');

  res.set('Cache-Control', 'public, max-age=120');
  return sendSuccess(res, 200, 'Job fetched successfully.', { job });
});

// Fields a recruiter is allowed to set when creating/updating their job posting.
const WRITABLE_FIELDS = [
  'title',
  'company',
  'companyLogoUrl',
  'location',
  'employmentType',
  'workMode',
  'salaryMin',
  'salaryMax',
  'currency',
  'description',
  'requirements',
  'skills',
];

const pickWritableFields = (body) => {
  return WRITABLE_FIELDS.reduce((fields, key) => {
    if (body[key] !== undefined) fields[key] = body[key];
    return fields;
  }, {});
};

/**
 * Loads a job by id and ensures the current user is allowed to modify it
 * (either the recruiter who posted it, or an admin). Throws 404/403 as
 * appropriate; otherwise returns the job document.
 */
const findOwnedJobOrFail = async (jobId, user) => {
  const job = await Job.findById(jobId);
  if (!job) {
    throw new AppError('Job not found.', 404, 'JOB_NOT_FOUND');
  }
  if (user.role !== 'admin' && job.postedBy.toString() !== user.id) {
    throw new AppError('You do not have permission to manage this job.', 403, 'FORBIDDEN');
  }
  return job;
};

/**
 * POST /api/jobs
 * Recruiter/admin creates a new job posting, owned by the creating user.
 */
const createJob = catchAsync(async (req, res) => {
  const job = await Job.create({ ...pickWritableFields(req.body), postedBy: req.user.id });
  return sendSuccess(res, 201, 'Job created successfully.', { job });
});

/**
 * PATCH /api/jobs/:id
 * Recruiter updates their own job posting (or admin updates any job).
 */
const updateJob = catchAsync(async (req, res) => {
  const job = await findOwnedJobOrFail(req.params.id, req.user);

  Object.assign(job, pickWritableFields(req.body));
  await job.save();

  return sendSuccess(res, 200, 'Job updated successfully.', { job });
});

/**
 * DELETE /api/jobs/:id
 * Recruiter deletes their own job posting (or admin deletes any job).
 */
const deleteJob = catchAsync(async (req, res) => {
  const job = await findOwnedJobOrFail(req.params.id, req.user);
  await job.deleteOne();

  return sendSuccess(res, 200, 'Job deleted successfully.');
});

/**
 * GET /api/jobs/saved/me
 * Lists the logged-in user's saved/bookmarked jobs, most recently saved first.
 */
const getSavedJobs = catchAsync(async (req, res) => {
  const { page = '1', limit = '10' } = req.query;
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);

  const [saved, total] = await Promise.all([
    SavedJob.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate('job', LIST_FIELDS)
      .lean(),
    SavedJob.countDocuments({ user: req.user.id }),
  ]);

  // Drop any saved-job rows whose job was since deleted.
  const jobs = saved.filter((s) => s.job).map((s) => ({ ...s.job, savedAt: s.createdAt }));

  return sendSuccess(res, 200, 'Saved jobs fetched successfully.', { jobs }, {
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum) || 1,
  });
});

/**
 * POST /api/jobs/:id/save
 * Bookmarks a job for the logged-in user. Idempotent - saving twice is a no-op.
 */
const saveJob = catchAsync(async (req, res) => {
  const job = await Job.findById(req.params.id).select('_id').lean();
  if (!job) throw new AppError('Job not found.', 404, 'JOB_NOT_FOUND');

  await SavedJob.findOneAndUpdate(
    { user: req.user.id, job: req.params.id },
    { user: req.user.id, job: req.params.id },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return sendSuccess(res, 200, 'Job saved successfully.');
});

/**
 * DELETE /api/jobs/:id/save
 * Removes a job from the logged-in user's saved list.
 */
const unsaveJob = catchAsync(async (req, res) => {
  await SavedJob.findOneAndDelete({ user: req.user.id, job: req.params.id });
  return sendSuccess(res, 200, 'Job removed from saved jobs.');
});

/**
 * POST /api/jobs/:id/report
 * Files (or updates) a "Report this job" submission from the logged-in user.
 */
const reportJob = catchAsync(async (req, res) => {
  const job = await Job.findById(req.params.id).select('_id').lean();
  if (!job) throw new AppError('Job not found.', 404, 'JOB_NOT_FOUND');

  const { reason, description } = req.body;

  const report = await JobReport.findOneAndUpdate(
    { user: req.user.id, job: req.params.id },
    { user: req.user.id, job: req.params.id, reason, description, status: 'pending' },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return sendSuccess(res, 201, 'Report submitted. Our team will review it shortly.', { report });
});

module.exports = {
  listJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getSavedJobs,
  saveJob,
  unsaveJob,
  reportJob,
};
