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

      /* -------- Send image to Flask -------- */
      const form = new FormData();
      form.append('image', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });

      const flaskRes = await axios.post(
        'http://localhost:7000/analyze-image',
        form,
        {
          headers: form.getHeaders(),
          timeout: 60000,
        }
      );

      const data = flaskRes.data;

      /* -------- Normalize results -------- */
      const detectedIssues = {
        acne: data.acne?.count || 0,
        pigmentation: data.pigmentation?.count || 0,
        wrinkles: data.wrinkles?.edge_density
          ? Math.round(data.wrinkles.edge_density * 100)
          : 0,
        blackheads: data.blackheads?.count || 0,
      };

      const overallScore = Math.min(
        100,
        Math.round(
          (detectedIssues.acne +
            detectedIssues.pigmentation +
            detectedIssues.wrinkles +
            detectedIssues.blackheads) / 4
        )
      );

      /* -------- Save to DB -------- */
      const saved = await SkinAnalysis.create({
        user: req.user._id,
        detectedIssues,
        overallScore,
        notes: data.recommendations,
      });

      res.status(201).json({
        message: 'Analysis completed',
        analysis: saved,
      });

      res

      

    } catch (err) {
      console.error('Analyze error:', err.message);
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
      console.log('Fetching latest analysis for user:', req.user.username);
      const latest = await SkinAnalysis
        .findOne({ user: req.user._id })
        .sort({ createdAt: -1 });

      if (!latest) {
        return res.status(404).json({ message: 'No analysis found here' });
      }
      console.log('Latest Analysis:', latest);
      res.json(latest);
    } catch (err) {
      console.log('Fetch latest analysis error:', err.message);
      res.status(500).json({ message: 'Failed to fetch analysis' });
    }
  }
);

module.exports = router;
