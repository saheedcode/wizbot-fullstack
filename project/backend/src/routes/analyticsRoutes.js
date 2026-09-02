const { Router } = require('express');
const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

const router = Router();

router.get('/dashboard', protect, analyticsController.getDashboardMetrics);

module.exports = router;
