const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const DailyCheckin = require('../models/DailyCheckin');
const redisClient = require('../config/redis');
const { deleteUserAccount } = require('../services/userDeletionService');
const validate = require('../middleware/validate');
const { checkinSchema } = require('../schemas/userSchema');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile and management endpoints
 */

const router = express.Router();

router.use(authMiddleware);

/**
 * @swagger
 * /api/users/account:
 *   delete:
 *     summary: Delete user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Account successfully deleted
 *       500:
 *         description: Server error
 */
router.delete('/account', async (req, res) => {
  try {
    const uid = req.user.uid;
    await deleteUserAccount(uid);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete account' } });
  }
});

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put('/profile', async (req, res) => {
  res.json({ success: true });
});

/**
 * @swagger
 * /api/users/checkin:
 *   post:
 *     summary: Submit daily check-in
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sleepQuality:
 *                 type: string
 *               stressLevel:
 *                 type: string
 *               waterIntake:
 *                 type: string
 *               skinFeel:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Check-in saved
 */
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

/**
 * @swagger
 * /api/users/checkin/today:
 *   get:
 *     summary: Get today's check-in
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved today's check-in
 */
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