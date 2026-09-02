const { Router } = require('express');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { updateProfileSchema } = require('../validators/authValidators');
const { upload } = require('../middleware/upload');

const router = Router();

// Every route below requires authentication.
router.use(protect);

router.patch('/me', validate(updateProfileSchema), userController.updateMe);
router.post('/me/avatar', upload.single('avatar'), userController.uploadAvatar);
router.delete('/me/avatar', userController.deleteAvatar);

module.exports = router;
