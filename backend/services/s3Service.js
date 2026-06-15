const { PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const s3Client = require('../config/s3');

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

const uploadBufferToS3 = async (key, buffer, mimetype) => {
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
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key
  });
  return await getSignedUrl(s3Client, command, { expiresIn });
};

const downloadS3ToBuffer = async (key) => {
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
