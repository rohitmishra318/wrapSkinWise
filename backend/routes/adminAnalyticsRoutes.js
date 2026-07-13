// routes/adminAnalyticsRoutes.js
const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/requireAdmin');
const User = require('../models/User');
const SkinAnalysis = require('../models/SkinAnalysis');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin Analytics
 *   description: Administrative analytics endpoints
 */

/**
 * @swagger
 * /api/admin/analytics/overview:
 *   get:
 *     summary: Get detailed admin analytics overview
 *     tags: [Admin Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics payload
 *       500:
 *         description: Server error
 */
router.get(
  '/overview',
  authMiddleware,
  requireAdmin,
  async (req, res) => {
    try {
      /* ---------------- USERS ---------------- */
      const totalUsers = await User.countDocuments();

      const usersByRole = await User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]);

      /* ---------------- ANALYSES ---------------- */
      const totalAnalyses = await SkinAnalysis.countDocuments();

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const analysesLast7Days = await SkinAnalysis.countDocuments({
        createdAt: { $gte: sevenDaysAgo }
      });

      /* ---------------- ISSUE DISTRIBUTION ---------------- */
      const issueDistribution = await SkinAnalysis.aggregate([
        {
          $project: {
            acne: '$detectedIssues.acne.count',
            pigmentation: '$detectedIssues.pigmentation.count',
            wrinkles: {
              $cond: [{ $gt: ['$detectedIssues.wrinkles.label', 'Low'] }, 1, 0]
            },
            blackheads: '$detectedIssues.blackheads.count',
          }
        },
        {
          $group: {
            _id: null,
            acne: { $sum: '$acne' },
            pigmentation: { $sum: '$pigmentation' },
            wrinkles: { $sum: '$wrinkles' },
            blackheads: { $sum: '$blackheads' },
          }
        }
      ]);

      res.json({
        totalUsers,
        totalAnalyses,
        analysesLast7Days,
        usersByRole,
        issueDistribution: issueDistribution[0] || {},
      });

    } catch (err) {
      console.error('Admin analytics error:', err.message);
      res.status(500).json({ message: 'Failed to load analytics' });
    }
  }
);

module.exports = router;
