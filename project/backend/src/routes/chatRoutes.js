const { Router } = require('express');
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createSessionSchema, addMessageSchema } = require('../validators/miscValidators');

const router = Router();

// Wizbot sessions are always scoped to the authenticated user.
router.use(protect);

router.post('/sessions', validate(createSessionSchema), chatController.createSession);
router.get('/sessions', chatController.getSessions);
router.get('/sessions/:sessionId', chatController.getSession);
router.post('/sessions/:sessionId/messages', validate(addMessageSchema), chatController.addMessage);
router.delete('/sessions/:sessionId', chatController.deleteSession);

module.exports = router;
