const Queue = require('bull');
const dotenv = require('dotenv');
dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';

const analysisQueue = new Queue('skinwise:analysis', redisUrl);

module.exports = {
  analysisQueue
};
