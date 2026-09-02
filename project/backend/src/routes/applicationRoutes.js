const { Router } = require('express');
const applicationController = require('../controllers/applicationController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { updateApplicationStatusSchema } = require('../validators/miscValidators');
const { uploadResume } = require('../middleware/upload');

const router = Router();

// Every application route requires an authenticated user.
router.use(protect);

// Applicant-facing routes.
router.post('/:jobId', uploadResume.single('resume'), applicationController.applyToJob);
router.get('/me', applicationController.getUserApplications);

// Recruiter/job-owner facing routes.
router.get('/job/:jobId', applicationController.getJobApplications);
router.patch('/:id/status', validate(updateApplicationStatusSchema), applicationController.updateApplicationStatus);

module.exports = router;
