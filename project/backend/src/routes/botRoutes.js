const { Router } = require('express');
const botController = require('../controllers/botController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createBotSchema, updateBotSchema, addActivitySchema } = require('../validators/botValidators');

const router = Router();

// Every Wizbot route is scoped to the authenticated user's own bots.
router.use(protect);

router.post('/', validate(createBotSchema), botController.createBot);
router.get('/', botController.listBots);
router.get('/:id', botController.getBot);
router.patch('/:id', validate(updateBotSchema), botController.updateBot);
router.patch('/:id/pause', botController.pauseBot);
router.patch('/:id/resume', botController.resumeBot);
router.delete('/:id', botController.deleteBot);
router.post('/:id/activity', validate(addActivitySchema), botController.addActivity);

module.exports = router;
