const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config({ path: '../.env' });

async function testS3() {
  const s3Client = new S3Client({
    region: process.env.S3_REGION || 'auto',
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
    }
  });

  try {
    console.log('Testing upload to:', process.env.S3_BUCKET_NAME);
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: 'test-upload.txt',
      Body: 'Hello DigitalOcean Spaces!',
      ContentType: 'text/plain'
    });
    
    await s3Client.send(command);
    console.log('✅ Upload successful!');
  } catch (error) {
    console.error('❌ Upload failed:');
    console.error(error);
  }
}

testS3();
