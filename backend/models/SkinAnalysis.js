const mongoose = require('mongoose');

const skinAnalysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    imageUrl: {
      type: String,
      required: true,
    },

    detectedIssues: {
      acne: Number,
      pigmentation: Number,
      wrinkles: Number,
      blackheads: Number,
    },

    overallScore: {
      type: Number, // 0–100
    },

    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('SkinAnalysis', skinAnalysisSchema);
