const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const DailyCheckin = require('../models/DailyCheckin');
const redisClient = require('../config/redis');
const { deleteUserAccount } = require('../services/userDeletionService');
const validate = require('../middleware/validate');
const { checkinSchema } = require('../schemas/userSchema');

const router = express.Router();

router.use(authMiddleware);

router.delete('/account', async (req, res) => {
  try {
    const uid = req.user.uid;
    await deleteUserAccount(uid);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete account' } });
  }
});

router.get('/profile', async (req, res) => {
  try {
    const uid = req.user.uid;
    const cacheKey = `cache:user:${uid}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) return res.json({ success: true, data: JSON.parse(cached) });

    let user = await User.findOne({ uid }).lean();
    
    // Auto-create user if they don't exist in MongoDB (e.g., registered via Firebase on frontend)
    if (!user) {
      const baseName = req.user.name || req.user.email.split('@')[0];
      const safeUsername = baseName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() + Math.floor(Math.random() * 10000);
      
      const newUser = await User.create({
        uid: req.user.uid,
        email: req.user.email,
        username: safeUsername,
      });
      user = newUser.toObject();
    }

    if (user) {
      delete user._id;
      // Also attach the displayName from Firebase so the frontend can use it if available
      user.name = req.user.name; 
      await redisClient.setex(cacheKey, 300, JSON.stringify(user));
    }
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching profile' });
  }
});

router.put('/profile', async (req, res) => {
  res.json({ success: true });
});

router.post('/checkin', validate(checkinSchema), async (req, res) => {
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