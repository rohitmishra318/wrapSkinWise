const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');

const SkinAnalysis = require('../models/SkinAnalysis');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

/* ================= MULTER (MEMORY STORAGE) ================= */
const upload = multer();

/* ================= POST /api/analyze ================= */
router.post(
  '/',
  authMiddleware,
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Image file is required' });
      }

      const form = new FormData();
      form.append('image', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });
       console.log("herein");
      const flaskRes = await axios.post(
        'http://localhost:7000/analyze-image',
        form,
        {
          headers: form.getHeaders(),
          timeout: 100000,
        }
      );

      const data = flaskRes.data;
        console.log(data.raw);

      /* -------- Save EXACT ML output -------- */
      const saved = await SkinAnalysis.create({
        user: req.user.uid, // Firebase UID ONLY
        raw: data.raw,
        severity: data.severity,
        overallScore: data.overallScore,
        notes: data.recommendations,
        modelVersion: data.modelVersion,
      });

      res.status(201).json({
        message: 'Analysis completed',
        analysis: saved,
      });

    } catch (err) {
      console.log("here");
      console.error('Analyze error:', err);
      res.status(500).json({ message: 'Skin analysis failed' });
    }
  }
);


/* ================= GET /api/analyze/latest ================= */
router.get(
  '/latest',
  authMiddleware,
  async (req, res) => {
    try {
      console.log('Fetching latest analysis for user:', req.user.uid);

      const latest = await SkinAnalysis
        .findOne({ user: req.user.uid })
        .sort({ createdAt: -1 });

      if (!latest) {
        return res.status(404).json({ message: 'No analysis found' });
      }

      console.log('Latest Analysis:', latest);
      res.json(latest);

    } catch (err) {
      console.error('Fetch latest analysis error:', err.message);
      res.status(500).json({ message: 'Failed to fetch analysis' });
    }
  }
);




router.get('/history', authMiddleware, async (req, res) => {
  try {
    const analyses = await SkinAnalysis.find({ user: req.user.uid })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(analyses);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch history' });
  }
});


module.exports = router;
