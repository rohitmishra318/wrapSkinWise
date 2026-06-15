const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  contactEmail: String,
  apiKey: { type: String, unique: true },
  apiKeyPrefix: String,
  tier: { type: String, enum: ['starter', 'growth', 'enterprise'], default: 'starter' },
  monthlyCallLimit: { type: Number, default: 10000 },
  callsThisMonth: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  catalogProductTypes: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Brand', brandSchema);
