const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const redisClient = require('../config/redis'); // <--- IMPORT REDIS CLIENT

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

      // ---------------------------------------------------------
      // [REDIS] CACHE INVALIDATION
      // ---------------------------------------------------------
      // Since we just added new data, the old cached profile is stale.
      // We must delete it so the next GET request fetches fresh data from DB.
      try {
        const cacheKey = `skinwise:profile:${req.user.uid}`;
        await redisClient.del(cacheKey);
        console.log(`🗑️ Invalidated cache for user: ${req.user.uid}`);
      } catch (cacheErr) {
        console.error("Redis delete error (non-critical):", cacheErr);
      }
      // ---------------------------------------------------------

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
// You can leave this uncached if it's rarely used, or cache it similarly.
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

                                   
/* ================= GET /api/analyze/latest-with-delta (CACHED) ================= */
router.get('/latest-with-delta', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.uid;
    const cacheKey = `skinwise:profile:${userId}`;

    // ---------------------------------------------------------
    // [REDIS] 1. CHECK CACHE
    // ---------------------------------------------------------
    try {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        console.log('⚡ Cache Hit');
        return res.json(JSON.parse(cachedData));
      }
    } catch (cacheErr) {
      console.error("Redis read error (continuing to DB):", cacheErr);
    }
    // ---------------------------------------------------------

    console.log('🐢 Cache Miss - Querying DB for:', userId);

    const analyses = await SkinAnalysis
      .find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(2);

    if (analyses.length === 0) {
      return res.status(404).json({ message: 'No analysis found' });
    }

    const latest = analyses[0];
    const previous = analyses[1] || null;

    let delta = null;

    if (previous) {
      delta = {
        acne: latest.overallScore - previous.overallScore, // Kept your original logic
        wrinkles: (latest.raw.wrinkles?.edge_density ?? 0) - (previous.raw.wrinkles?.edge_density ?? 0),
        pigmentation: (latest.raw.pigmentation?.count ?? 0) - (previous.raw.pigmentation?.count ?? 0),
        blackheads: (latest.raw.blackheads?.count ?? 0) - (previous.raw.blackheads?.count ?? 0),
      };
    }

    const responsePayload = {
      analysis: latest,
      previousAnalysis: previous,
      delta,
      hasPrevious: true,
    };

    // ---------------------------------------------------------
    // [REDIS] 2. SAVE TO CACHE
    // ---------------------------------------------------------
    try {
      // Expire in 1 hour (3600 seconds)
      await redisClient.set(cacheKey, JSON.stringify(responsePayload), { EX: 3600 });
      console.log('💾 Data cached in Redis');
    } catch (cacheErr) {
      console.error("Redis write error (non-critical):", cacheErr);
    }
    // ---------------------------------------------------------

    res.json(responsePayload);

  } catch (err) {
    console.log("Error computing delta", err);
    res.status(500).json({ message: 'Failed to compute delta' });
  }
});


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