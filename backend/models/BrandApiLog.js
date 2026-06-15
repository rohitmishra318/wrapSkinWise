const mongoose = require('mongoose');

const brandApiLogSchema = new mongoose.Schema({
  brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true, index: true },
  endpoint: String,
  requestPayload: Object,
  responseCode: Number,
  latencyMs: Number,
  createdAt: { type: Date, default: Date.now, expires: 7776000 } // 90 days TTL
});

module.exports = mongoose.model('BrandApiLog', brandApiLogSchema);
