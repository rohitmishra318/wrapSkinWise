const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  location: { type: String, required: true },
  city: { type: String, required: true },
  bedrooms: { type: Number, required: true },
  bathrooms: { type: Number, required: true },
   imageUrls: [{ type: String, required: true }],
  type: { type: String },

  // --- ADD THIS FIELD ---
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // This links to the User model
    required: true,
  },
  // --------------------
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);