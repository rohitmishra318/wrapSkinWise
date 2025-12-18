// routes/adminRoutes.js
const express = require('express');
const User = require('../models/User');
const SkinAnalysis = require('../models/SkinAnalysis');
const authMiddleware = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/requireAdmin');

const router = express.Router();

/**
 * GET /api/admin/users
 */
router.get('/users', authMiddleware, requireAdmin, async (req, res) => {
  const users = await User.find().select('username email role createdAt');
  res.json(users);
});

/**
 * GET /api/admin/stats
 */
router.get('/stats', authMiddleware, requireAdmin, async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalAnalyses = await SkinAnalysis.countDocuments();

  res.json({
    totalUsers,
    totalAnalyses,
  });
});

/**
 * PATCH /api/admin/user/:id/role
 */
router.patch('/user/:id/role', authMiddleware, requireAdmin, async (req, res) => {
  const { role } = req.body;

  if (!['user', 'admin', 'moderator'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  await User.findByIdAndUpdate(req.params.id, { role });
  res.json({ message: 'Role updated' });
});

module.exports = router;
