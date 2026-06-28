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

router.post('/', authMiddleware, analyzeLimiter, upload.single('image'), validate(analyzeQuerySchema), analyzeController.analyzeImage);
router.get('/job/:jobId', authMiddleware, analyzeController.getJobStatus);
router.get('/:id/image/:type', authMiddleware, analyzeController.getAnalysisImage);

router.get('/history', authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const cacheKey = `cache:analysis:history:${req.user.uid}:${page}:${limit}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

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