const fs = require('fs');
const path = require('path');
const { PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const s3Client = require('../config/s3');

const BUCKET_NAME = process.env.S3_BUCKET_NAME;
const UPLOADS_DIR = path.join(__dirname, '../uploads');

// Ensure uploads directory exists
if (!BUCKET_NAME && !fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const uploadBufferToS3 = async (key, buffer, mimetype) => {
  if (!BUCKET_NAME) {
    const filePath = path.join(UPLOADS_DIR, key.replace(/\//g, '_'));
    fs.writeFileSync(filePath, buffer);
    return key;
  }
  
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: mimetype
  });
  await s3Client.send(command);
  return key;
};

const getSignedS3Url = async (key, expiresIn = 900) => {
  if (!BUCKET_NAME) {
    return `http://localhost:5000/uploads/${key.replace(/\//g, '_')}`;
  }

  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key
  });
  return await getSignedUrl(s3Client, command, { expiresIn });
};

const downloadS3ToBuffer = async (key) => {
  if (!BUCKET_NAME) {
    const filePath = path.join(UPLOADS_DIR, key.replace(/\//g, '_'));
    return fs.readFileSync(filePath);
  }

  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key
  });
  const response = await s3Client.send(command);
  const chunks = [];
  for await (const chunk of response.Body) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
};

module.exports = {
  uploadBufferToS3,
  getSignedS3Url,
  downloadS3ToBuffer
};
