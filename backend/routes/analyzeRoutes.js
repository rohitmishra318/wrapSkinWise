// backend/src/routes/analyzeRoutes.js

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// ---------- Multer Config ----------
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// ---------- Route: POST /api/analyze ----------
router.post('/', upload.single('image'), async (req, res) => {
  try {
    // 1. Parse metadata
    console.log("Analyze Request Received");
    const metadata = req.body.metadata ? JSON.parse(req.body.metadata) : {};

    // 2. File uploaded?
    let imageUrl = null;

    if (req.file) {
      imageUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/${req.file.filename}`;
    }

    console.log("Received Metadata:", metadata);
    console.log("Image saved at:", imageUrl);

    // 3. Dummy analysis result for now
    const analysisResult = {
      acne: { label: "Mild", count: 3 },
      blackheads: { present: true, count: 6 },
      wrinkles: { label: "None", edge_density: 0.0012 },
      pigmentation: { label: "Moderate", count: 2 },
      imageUrl,
      recommendations: `
✨ Drink 2.5L water daily
✨ Use Niacinamide 5% in the morning
✨ Use Retinol 0.25% every alternate night
✨ Apply Sunscreen SPF 50 every 3 hours
      `
    };

    res.status(200).json(analysisResult);

  } catch (error) {
    console.error("Analyze Error:", error);
    res.status(500).json({ message: "Failed to analyze skin", error: error.message });
  }
});

module.exports = router;
