const multer = require('multer');
const AppError = require('../utils/AppError');

const storage = multer.memoryStorage();

const imageFileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (!allowed.includes(file.mimetype)) {
    return cb(new AppError('Only JPG, PNG or WEBP images are allowed.', 400, 'INVALID_FILE_TYPE'));
  }
  cb(null, true);
};

const documentFileFilter = (_req, file, cb) => {
  const allowed = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  if (!allowed.includes(file.mimetype)) {
    return cb(new AppError('Only PDF, DOC or DOCX files are allowed.', 400, 'INVALID_FILE_TYPE'));
  }
  cb(null, true);
};

// Profile picture uploads.
const upload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Resume / cover-letter document uploads for job applications.
const uploadResume = multer({
  storage,
  fileFilter: documentFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

module.exports = upload;
module.exports.upload = upload;
module.exports.uploadResume = uploadResume;
