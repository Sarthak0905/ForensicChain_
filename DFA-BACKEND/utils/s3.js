const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
require('dotenv').config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'placeholder_access_key',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'placeholder_secret_key'
  }
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'dfa-forensic-evidence';

/**
 * Uploads a file buffer to S3
 * @param {Buffer} fileBuffer - The encrypted file buffer
 * @param {String} fileName - The unique file name (evidence ID)
 * @param {String} mimeType - The mime type of the file
 * @returns {Promise<String>} The S3 storage location key
 */
const uploadToS3 = async (fileBuffer, fileName, mimeType) => {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimeType
  });

  try {
    await s3Client.send(command);
    return fileName;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error('Failed to upload evidence to secure storage');
  }
};

/**
 * Generates a pre-signed URL to securely download a file from S3
 * @param {String} fileName - The file key in S3
 * @returns {Promise<String>} The pre-signed URL (valid for 1 hour)
 */
const getSignedDownloadUrl = async (fileName) => {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileName
  });

  try {
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return signedUrl;
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    throw new Error('Failed to generate secure download link');
  }
};

module.exports = {
  uploadToS3,
  getSignedDownloadUrl
};
