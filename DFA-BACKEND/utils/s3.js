const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const hasAwsCredentials = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_ACCESS_KEY_ID !== 'placeholder_access_key';

let s3Client;
if (hasAwsCredentials) {
  s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });
}

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'dfa-forensic-evidence';
const LOCAL_UPLOAD_DIR = path.join(__dirname, '../uploads');

// Ensure local upload directory exists for fallback
if (!hasAwsCredentials && !fs.existsSync(LOCAL_UPLOAD_DIR)) {
  fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
}

/**
 * Uploads a file buffer to S3 (or falls back to local disk if no AWS credentials)
 */
const uploadToS3 = async (fileBuffer, fileName, mimeType) => {
  if (hasAwsCredentials) {
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
  } else {
    // Fallback: Save locally
    console.warn('⚠️ No AWS Credentials found. Falling back to local disk storage.');
    return new Promise((resolve, reject) => {
      const filePath = path.join(LOCAL_UPLOAD_DIR, fileName);
      fs.writeFile(filePath, fileBuffer, (err) => {
        if (err) {
          console.error('Error saving file locally:', err);
          return reject(new Error('Failed to save evidence locally'));
        }
        resolve(`local://${fileName}`);
      });
    });
  }
};

/**
 * Generates a pre-signed URL to securely download a file from S3 (or mock local URL)
 */
const getSignedDownloadUrl = async (fileName) => {
  // If it was saved locally, it will have the 'local://' prefix
  if (fileName.startsWith('local://') || !hasAwsCredentials) {
    const actualFileName = fileName.replace('local://', '');
    // For a real production app we'd serve this via an Express static route. 
    // For this fallback demo, we'll return a placeholder or local API route.
    return `http://localhost:${process.env.PORT || 5000}/api/evidence/download-local/${actualFileName}`;
  }

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
