const mongoose = require('mongoose');

const productReactionSchema = new mongoose.Schema({
  user: { type: String, required: true, index: true },
  routineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Routine' },
  stepTitle: String,
  productType: String,
  ingredients: [{ type: String }],
  reaction: { type: String, enum: ['positive', 'neutral', 'irritation', 'breakout', 'no_effect'], required: true },
  weeksUsed: Number,
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

productReactionSchema.index({ user: 1, productType: 1 });

module.exports = mongoose.model('ProductReaction', productReactionSchema);
