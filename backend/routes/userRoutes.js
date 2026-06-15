const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const DailyCheckin = require('../models/DailyCheckin');
const redisClient = require('../config/redis');

const router = express.Router();

router.use(authMiddleware);

router.get('/profile', async (req, res) => {
  const uid = req.user.uid;
  const cacheKey = `cache:user:${uid}`;
  const cached = await redisClient.get(cacheKey);
  if (cached) return res.json({ success: true, data: JSON.parse(cached) });

  const user = await User.findOne({ uid }).lean();
  if (user) {
    delete user._id;
    await redisClient.setex(cacheKey, 300, JSON.stringify(user));
  }
  res.json({ success: true, data: user });
});

router.put('/profile', async (req, res) => {
  res.json({ success: true });
});

router.post('/checkin', async (req, res) => {
  try {
    const { sleepQuality, stressLevel, waterIntake, skinFeel, notes } = req.body;
    const uid = req.user.uid;
    const today = new Date();
    today.setHours(0,0,0,0);

    const checkin = await DailyCheckin.findOneAndUpdate(
      { user: uid, date: today },
      { sleepQuality, stressLevel, waterIntake, skinFeel, notes },
      { upsert: true, new: true }
    );

    await User.findOneAndUpdate({ uid }, {
      $set: {
        'lifestyleProfile.sleepQuality': sleepQuality,
        'lifestyleProfile.stressLevel': stressLevel,
        'lifestyleProfile.waterIntake': waterIntake
      }
    });

    res.json({ success: true, data: checkin });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

router.get('/checkin/today', async (req, res) => {
  try {
    const uid = req.user.uid;
    const today = new Date();
    today.setHours(0,0,0,0);
    const checkin = await DailyCheckin.findOne({ user: uid, date: today });
    res.json({ success: true, data: checkin });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

module.exports = router;