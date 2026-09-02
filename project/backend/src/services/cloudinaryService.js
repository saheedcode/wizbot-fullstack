const streamifier = require('streamifier');
const cloudinary = require('../config/cloudinary');

/**
 * Uploads an image buffer (e.g. avatar) to Cloudinary.
 * @param {Buffer} buffer
 * @param {string} [folder]
 * @returns {Promise<{ url: string, publicId: string }>}
 */
const uploadBufferToCloudinary = (buffer, folder = 'wizjobai/avatars') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [{ width: 512, height: 512, crop: 'fill', gravity: 'face' }],
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Cloudinary upload failed'));
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Uploads a document buffer (e.g. resume/CV as PDF/DOC/DOCX) to Cloudinary
 * using the "raw" resource type, since these are not images.
 * @param {Buffer} buffer
 * @param {string} [folder]
 * @param {string} [filename]
 * @returns {Promise<{ url: string, publicId: string }>}
 */
const uploadDocumentToCloudinary = (buffer, folder = 'wizjobai/resumes', filename) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'raw',
        ...(filename ? { public_id: filename.replace(/\.[^/.]+$/, '') } : {}),
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Cloudinary upload failed'));
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * @param {string} publicId
 * @param {string} [resourceType]
 */
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};

module.exports = { uploadBufferToCloudinary, uploadDocumentToCloudinary, deleteFromCloudinary };
