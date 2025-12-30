const mongoose = require('mongoose');

const skinAnalysisSchema = new mongoose.Schema({
  user: {
    type: String, // Firebase UID
    required: true,
    index: true,
  },

  raw: {
    type: Object,
    required: true,
  },

  severity: {
    acne: Number,
    blackheads: Number,
    wrinkles: Number,
    pigmentation: Number,
  },

  overallScore: Number,

  notes: String,

  modelVersion: String,

}, { timestamps: true });


module.exports = mongoose.model('SkinAnalysis', skinAnalysisSchema);
