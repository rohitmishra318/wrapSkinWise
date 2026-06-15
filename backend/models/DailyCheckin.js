const mongoose = require('mongoose');

const dailyCheckinSchema = new mongoose.Schema({
  user: { type: String, required: true, index: true },
  date: { type: Date, required: true },
  sleepQuality: { type: Number, min: 1, max: 5 },
  stressLevel: { type: Number, min: 1, max: 5 },
  waterIntake: { type: String, enum: ['low', 'standard', 'high'] },
  skinFeel: { type: String, enum: ['great', 'normal', 'oily', 'dry', 'breaking_out', 'sensitive'] },
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

dailyCheckinSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyCheckin', dailyCheckinSchema);
