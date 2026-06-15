const mongoose = require('mongoose');

const analysisJobSchema = new mongoose.Schema({
  jobId: { type: String, required: true, unique: true },
  user: { type: String, required: true, index: true },
  status: { type: String, enum: ['queued', 'sr_processing', 'analyzing', 'complete', 'failed'], default: 'queued' },
  imageS3Key: String,
  resultAnalysisId: { type: mongoose.Schema.Types.ObjectId, ref: 'SkinAnalysis', default: null },
  errorMessage: String,
  queuedAt: { type: Date, default: Date.now },
  completedAt: Date
});

module.exports = mongoose.model('AnalysisJob', analysisJobSchema);
