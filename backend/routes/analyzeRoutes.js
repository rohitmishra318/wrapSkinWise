const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const SkinAnalysis = require('../models/SkinAnalysis');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

/* ===================== MULTER CONFIG ===================== */

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

/* ===================== POST /api/analyze ===================== */
/**
 * Stores:
 * - image
 * - metadata
 * - analysis result
 * - linked user
 */
router.post(
  '/',
  authMiddleware,
  upload.single('image'),
  async (req, res) => {
    try {
      console.log('Analyze Request Received');

      /* ---------- 1. Parse metadata ---------- */
      const metadata = req.body.metadata
        ? JSON.parse(req.body.metadata)
        : {};

      /* ---------- 2. Image URL ---------- */
      let imageUrl = null;
      if (req.file) {
        imageUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/${req.file.filename}`;
      }

      /* ---------- 3. TEMP analysis (replace with AI later) ---------- */
      const analysisResult = {
        skinType: metadata.skinType || 'combination',
        scores: {
          acne: 35,
          pigmentation: 42,
          wrinkles: 5,
          oiliness: 60
        },
        concerns: ['acne', 'blackheads', 'pigmentation'],
        aiSummary:
          'Mild acne detected with moderate pigmentation. Oil production is slightly high in T-zone.'
      };

      /* ---------- 4. Save to DB ---------- */
      const savedAnalysis = await SkinAnalysis.create({
        user: req.user._id,
        imageUrl,
        skinType: analysisResult.skinType,
        scores: analysisResult.scores,
        concerns: analysisResult.concerns,
        aiSummary: analysisResult.aiSummary
      });

      /* ---------- 5. Respond ---------- */
      res.status(201).json({
        message: 'Skin analysis stored successfully',
        analysis: savedAnalysis
      });

    } catch (error) {
      console.error('Analyze Error:', error);
      res.status(500).json({
        message: 'Failed to analyze and store skin data',
        error: error.message
      });
    }
  }
);

module.exports = router;
