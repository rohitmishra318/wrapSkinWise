const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  role: { type: String, enum: ['user', 'admin', 'moderator', 'brand_admin'], default: 'user' },
  brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', default: null },

  skinProfile: {
    skinType: { type: String, enum: ['oily', 'dry', 'combination', 'normal', 'sensitive'], default: null },
    concerns: [{ type: String, enum: ['acne', 'pigmentation', 'blackheads', 'wrinkles', 'dryness', 'oiliness', 'sensitivity', 'dullness'] }],
    allergies: [{ type: String }],
    ageRange: { type: String, enum: ['<18', '18-25', '26-35', '36-45', '46+'], default: null },
    fitzpatrickEstimate: { type: Number, min: 1, max: 6, default: null }
  },

  preferences: {
    routineLevel: { type: String, enum: ['minimal', 'moderate', 'advanced'], default: 'moderate' },
    budget: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    notificationsEnabled: { type: Boolean, default: true },
    dataConsentGiven: { type: Boolean, required: true, default: false },
    analyticsConsentGiven: { type: Boolean, default: false }
  },

  lifestyleProfile: {
    sleepQuality: { type: Number, min: 1, max: 5, default: null },
    stressLevel: { type: Number, min: 1, max: 5, default: null },
    waterIntake: { type: String, enum: ['low', 'standard', 'high'], default: null },
    dietType: { type: String, enum: ['standard', 'vegetarian', 'vegan', 'keto', 'other'], default: null }
  },

  lastWeatherContext: {
    city: String,
    humidity: Number,
    uvIndex: Number,
    aqi: Number,
    temperature: Number,
    fetchedAt: Date
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
