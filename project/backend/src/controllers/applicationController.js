const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/apiResponse');
const AppError = require('../utils/AppError');
const Application = require('../models/Application');
const Job = require('../models/Job');
const Bot = require('../models/Bot');
const { uploadDocumentToCloudinary, deleteFromCloudinary } = require('../services/cloudinaryService');

/**
 * POST /api/applications/:jobId
 * Authenticated user applies to a job, optionally attaching a resume/CV
 * document which is streamed to Cloudinary.
 */
const applyToJob = catchAsync(async (req, res) => {
  const { jobId } = req.params;
  const { coverLetter } = req.body;

  const job = await Job.findById(jobId).select('_id').lean();
  if (!job) {
    throw new AppError('Job not found.', 404, 'JOB_NOT_FOUND');
  }

  const existing = await Application.findOne({ user: req.user.id, job: jobId }).select('_id').lean();
  if (existing) {
    throw new AppError('You have already applied to this job.', 409, 'ALREADY_APPLIED');
  }

  let resumeUrl = '';
  let resumePublicId = '';
  if (req.file) {
    const uploaded = await uploadDocumentToCloudinary(req.file.buffer, 'wizjobai/resumes', req.file.originalname);
    resumeUrl = uploaded.url;
    resumePublicId = uploaded.publicId;
  }

  try {
    const application = await Application.create({
      user: req.user.id,
      job: jobId,
      resumeUrl,
      resumePublicId,
      ...(coverLetter ? { coverLetter } : {}),
    });
    return sendSuccess(res, 201, 'Application submitted successfully.', { application });
  } catch (err) {
    // Clean up the uploaded file if the DB write failed (e.g. race on the
    // unique user+job index), so we don't leak orphaned Cloudinary assets.
    if (resumePublicId) {
      await deleteFromCloudinary(resumePublicId, 'raw').catch(() => undefined);
    }
    if (err.code === 11000) {
      throw new AppError('You have already applied to this job.', 409, 'ALREADY_APPLIED');
    }
    throw err;
  }
});

/**
 * GET /api/applications/me
 * All applications submitted by the logged-in user, with pagination.
 */
const getUserApplications = catchAsync(async (req, res) => {
  const { page = '1', limit = '10', status } = req.query;
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);

  const filter = { user: req.user.id };
  if (status) filter.status = status;

  const [applications, total] = await Promise.all([
    Application.find(filter)
      .select('-resumePublicId')
      .populate('job', 'title company companyLogoUrl location employmentType workMode')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean(),
    Application.countDocuments(filter),
  ]);

  return sendSuccess(res, 200, 'Applications fetched successfully.', { applications }, {
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum) || 1,
  });
});

/**
 * GET /api/applications/job/:jobId
 * All applications submitted for a specific job posting. Restricted to the
 * recruiter who owns the job (or an admin).
 */
const getJobApplications = catchAsync(async (req, res) => {
  const { jobId } = req.params;
  const { page = '1', limit = '10', status } = req.query;
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);

  const job = await Job.findById(jobId).select('postedBy').lean();
  if (!job) {
    throw new AppError('Job not found.', 404, 'JOB_NOT_FOUND');
  }
  if (req.user.role !== 'admin' && job.postedBy.toString() !== req.user.id) {
    throw new AppError('You do not have permission to view these applications.', 403, 'FORBIDDEN');
  }

  const filter = { job: jobId };
  if (status) filter.status = status;

  const [applications, total] = await Promise.all([
    Application.find(filter)
      .select('-resumePublicId')
      .populate('user', 'name email avatarUrl profile.headline profile.skills')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean(),
    Application.countDocuments(filter),
  ]);

  return sendSuccess(res, 200, 'Job applications fetched successfully.', { applications }, {
    page: pageNum,
    limit: limitNum,
    total,
    totalPages: Math.ceil(total / limitNum) || 1,
  });
});

/**
 * PATCH /api/applications/:id/status
 * Updates the status of an application (e.g. applied -> interview -> offer/rejected).
 * Restricted to the recruiter who owns the application's job (or an admin).
 */
const updateApplicationStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  const application = await Application.findById(id).populate('job', 'postedBy');
  if (!application) {
    throw new AppError('Application not found.', 404, 'APPLICATION_NOT_FOUND');
  }
  if (!application.job) {
    throw new AppError('Job not found.', 404, 'JOB_NOT_FOUND');
  }
  if (req.user.role !== 'admin' && application.job.postedBy.toString() !== req.user.id) {
    throw new AppError('You do not have permission to manage this application.', 403, 'FORBIDDEN');
  }

  application.status = status;
  if (notes !== undefined) application.notes = notes;
  await application.save();

  // Keep a bot's "Offers" counter in sync when one of its applications lands an offer.
  if (status === 'offer' && application.bot) {
    await Bot.updateOne({ _id: application.bot }, { $inc: { 'stats.offersReceived': 1 } });
  }

  return sendSuccess(res, 200, 'Application status updated successfully.', { application });
});

module.exports = {
  applyToJob,
  getUserApplications,
  getJobApplications,
  updateApplicationStatus,
};
