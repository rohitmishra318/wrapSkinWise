const express = require('express');
const multer = require('multer');
const analyzeController = require('../controllers/analyzeController');
const authMiddleware = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { analyzeQuerySchema } = require('../schemas/analyzeSchema');
const SkinAnalysis = require('../models/SkinAnalysis');
const redisClient = require('../config/redis');
const { analyzeLimiter } = require('../middleware/ratelimiter');

const router = express.Router();
const upload = multer();

/**
 * @swagger
 * tags:
 *   name: Analysis
 *   description: Skin analysis and image processing
 */

/**
 * @swagger
 * /api/analyze:
 *   post:
 *     summary: Upload an image for skin analysis
 *     tags: [Analysis]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               city:
 *                 type: string
 *     responses:
 *       200:
 *         description: Analysis job queued successfully
 */
router.post('/', authMiddleware, analyzeLimiter, upload.single('image'), validate(analyzeQuerySchema), analyzeController.analyzeImage);

/**
 * @swagger
 * /api/analyze/job/{jobId}:
 *   get:
 *     summary: Get the status of an analysis job
 *     tags: [Analysis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job status retrieved
 */
router.get('/job/:jobId', authMiddleware, analyzeController.getJobStatus);

/**
 * @swagger
 * /api/analyze/{id}/image/{type}:
 *   get:
 *     summary: Get a signed URL for an analysis image
 *     tags: [Analysis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [original, enhanced, annotated]
 *     responses:
 *       200:
 *         description: Signed URL generated
 */
router.get('/:id/image/:type', authMiddleware, analyzeController.getAnalysisImage);

/**
 * @swagger
 * /api/analyze/history:
 *   get:
 *     summary: Get a paginated history of user's past analyses
 *     tags: [Analysis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Paginated history array
 */
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const cacheKey = `cache:analysis:history:${req.user.uid}:${page}:${limit}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) return res.json({ success: true, data: JSON.parse(cached) });

    const skip = (page - 1) * limit;
    const totalCount = await SkinAnalysis.countDocuments({ user: req.user.uid });
    const analyses = await SkinAnalysis.find({ user: req.user.uid })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const result = {
      analyses,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit)
    };

    await redisClient.setex(cacheKey, 120, JSON.stringify(result));
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const analysis = await SkinAnalysis.findOne({ _id: req.params.id, user: req.user.uid });
    if (!analysis) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Not found' } });
    res.json({ success: true, data: analysis });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

module.exports = router;