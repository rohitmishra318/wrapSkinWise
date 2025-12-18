const mongoose = require('mongoose');

const skinAnalysisSchema = new mongoose.Schema(
  {
    user: {
  type: String, // Firebase UID
  required: true,
  index: true,
}
,

    imageUrl: {
      type: String
    },
     
     modelVersion: {
      type: String,
      default: 'opencv-v1'
    },

    detectedIssues: {
  acne: { count: Number, label: String },
  pigmentation: { count: Number, label: String },
  wrinkles: { density: Number, label: String },
  blackheads: { count: Number },
},

    overallScore: {
      type: Number, // 0–100
    },
    
    
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('SkinAnalysis', skinAnalysisSchema);
