const cloudinary = require('cloudinary').v2;
require('dotenv').config();

const hasCloudinaryCredentials = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY;

if (hasCloudinaryCredentials) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Uploads a raw encrypted file buffer to Cloudinary
 */
const uploadToCloudinary = (fileBuffer, fileName) => {
  return new Promise((resolve, reject) => {
    if (!hasCloudinaryCredentials) {
      return reject(new Error('Cloudinary credentials not configured.'));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw', // Important for non-image encrypted files
        public_id: fileName,
        folder: 'forensic_evidence'
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(new Error('Failed to upload evidence to Cloudinary'));
        }
        resolve(result.secure_url); // We'll return the full secure URL instead of just the key
      }
    );

    // Write the buffer to the stream
    uploadStream.end(fileBuffer);
  });
};

module.exports = {
  uploadToCloudinary,
  hasCloudinaryCredentials
};
