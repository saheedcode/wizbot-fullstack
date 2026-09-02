const { Router } = require('express');
const jobController = require('../controllers/jobController');
const { protect, restrictTo } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createJobSchema, updateJobSchema, reportJobSchema } = require('../validators/jobValidators');

const router = Router();

// Public job discovery endpoints.
router.get('/', jobController.listJobs);

// Saved jobs - registered before '/:id' so 'saved' isn't parsed as a job id.
router.get('/saved/me', protect, jobController.getSavedJobs);

router.get('/:id', jobController.getJob);

// Bookmarking and reporting a job - any authenticated user.
router.post('/:id/save', protect, jobController.saveJob);
router.delete('/:id/save', protect, jobController.unsaveJob);
router.post('/:id/report', protect, validate(reportJobSchema), jobController.reportJob);

// Recruiter/admin-only job management. Ownership of a specific job (for
// update/delete) is enforced inside the controller once the job is loaded.
router.post('/', protect, restrictTo('recruiter', 'admin'), validate(createJobSchema), jobController.createJob);
router.patch(
  '/:id',
  protect,
  restrictTo('recruiter', 'admin'),
  validate(updateJobSchema),
  jobController.updateJob
);
router.delete('/:id', protect, restrictTo('recruiter', 'admin'), jobController.deleteJob);

module.exports = router;
