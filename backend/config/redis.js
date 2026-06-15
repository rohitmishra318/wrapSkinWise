const Redis = require('ioredis');
const dotenv = require('dotenv');
dotenv.config();

const redisClient = new Redis(process.env.REDIS_URL || 'redis://redis:6379');

module.exports = redisClient;