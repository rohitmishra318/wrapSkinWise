const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    

    password: {
      type: String,
      required: true,
    },

    // ===== SKIN PROFILE (editable by user) =====
    skinProfile: {
      skinType: {
        type: String,
        enum: ['oily', 'dry', 'combination', 'normal', 'sensitive'],
      },

      concerns: [{
        type: String,
        enum: [
          'acne',
          'pigmentation',
          'blackheads',
          'whiteheads',
          'wrinkles',
          'dark_circles',
          'redness',
        ],
      }],

      allergies: [String],

      ageRange: {
        type: String,
        enum: ['<18', '18-25', '26-35', '36-45', '46+'],
      },
    },

    // ===== USER PREFERENCES =====
    preferences: {
      routineLevel: {
        type: String,
        enum: ['minimal', 'moderate', 'advanced'],
        default: 'minimal',
      },

      budget: {
        type: String,
        enum: ['low', 'medium', 'high'],
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
