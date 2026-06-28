const fs = require('fs');
const path = require('path');
const { PutObjectCommand, GetObjectCommand, ListObjectsV2Command, DeleteObjectsCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const s3Client = require('../config/s3');
const logger = require('../config/logger');

const BUCKET_NAME = process.env.S3_BUCKET_NAME;
const UPLOADS_DIR = path.join(__dirname, '../uploads');

// Ensure uploads directory exists
if (!BUCKET_NAME && !fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const deleteS3Prefix = async (prefix) => {
  if (!BUCKET_NAME) {
    logger.info(`Skipping S3 deletion for ${prefix}, running in local mode`);
    return;
  }
  
  try {
    let isTruncated = true;
    let continuationToken = undefined;

    while (isTruncated) {
      const listCommand = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: prefix,
        ContinuationToken: continuationToken
      });
      
      const listResponse = await s3Client.send(listCommand);
      
      if (listResponse.Contents && listResponse.Contents.length > 0) {
        const deleteCommand = new DeleteObjectsCommand({
          Bucket: BUCKET_NAME,
          Delete: {
            Objects: listResponse.Contents.map(obj => ({ Key: obj.Key }))
          }
        });
        await s3Client.send(deleteCommand);
      }
      
      isTruncated = listResponse.IsTruncated;
      continuationToken = listResponse.NextContinuationToken;
    }
  } catch (error) {
    logger.warn('Failed to delete S3 objects by prefix (possible permission issue)', { prefix, error: error.message });
    // We intentionally don't throw to prevent blocking the account deletion flow
  }
};

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
  downloadS3ToBuffer,
  deleteS3Prefix
};
