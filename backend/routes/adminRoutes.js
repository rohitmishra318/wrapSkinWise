// routes/adminRoutes.js
const express = require('express');
const User = require('../models/User');
const SkinAnalysis = require('../models/SkinAnalysis');
const authMiddleware = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/requireAdmin');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrative endpoints
 */

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/users', authMiddleware, requireAdmin, async (req, res) => {
  const users = await User.find().select('username email role createdAt');
  res.json(users);
});

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get platform stats
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Platform statistics
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
 * @swagger
 * /api/admin/user/{id}/role:
 *   patch:
 *     summary: Update user role
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: Role updated
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
