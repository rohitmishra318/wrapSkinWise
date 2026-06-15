const mongoose = require('mongoose');

const skinAnalysisSchema = new mongoose.Schema({
  user: { type: String, required: true, index: true },
  
  imageMetadata: {
    originalResolution: String,
    srApplied: { type: Boolean, default: false },
    srModel: { type: String, default: null },
    originalImageKey: String,
    enhancedImageKey: String,
    analysisImageKey: String,
    annotatedImageKey: String,
    qualityFlags: [{ type: String }],
    qualityScore: Number
  },

  raw: {
    acne: { label: String, count: Number, totalArea: Number },
    blackheads: { count: Number },
    wrinkles: { edgeDensity: Number },
    pigmentation: { count: Number, uniformityScore: Number },
    hydration: { textureScore: Number }
  },

  severity: {
    acne: { type: Number, min: 0, max: 100 },
    blackheads: { type: Number, min: 0, max: 100 },
    wrinkles: { type: Number, min: 0, max: 100 },
    pigmentation: { type: Number, min: 0, max: 100 },
    hydration: { type: Number, min: 0, max: 100 }
  },

  zonalSeverity: {
    tZone:      { acne: Number, oiliness: Number, hydration: Number },
    leftCheek:  { acne: Number, pigmentation: Number, hydration: Number },
    rightCheek: { acne: Number, pigmentation: Number, hydration: Number },
    forehead:   { acne: Number, wrinkles: Number, oiliness: Number },
    perioral:   { acne: Number, dryness: Number }
  },

  overallScore: { type: Number, min: 0, max: 100 },
  igaGrade: { type: Number, min: 0, max: 4 },
  fitzpatrickAtAnalysis: { type: Number, min: 1, max: 6 },

  delta: {
    acne: Number,
    blackheads: Number,
    wrinkles: Number,
    pigmentation: Number,
    hydration: Number,
    overall: Number
  },

  contextAtAnalysis: {
    humidity: Number,
    uvIndex: Number,
    aqi: Number,
    temperature: Number,
    userSleepQuality: Number,
    userStressLevel: Number
  },

  notes: String,
  modelVersion: { type: String, default: 'v2.0' },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

skinAnalysisSchema.index({ user: 1, createdAt: -1 });
skinAnalysisSchema.index({ createdAt: -1 });

module.exports = mongoose.model('SkinAnalysis', skinAnalysisSchema);
