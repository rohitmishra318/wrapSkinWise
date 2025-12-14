const mongoose = require('mongoose');

const routineSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    routineType: {
      type: String,
      enum: ['morning', 'night'],
      required: true,
    },

    steps: [
      {
        stepOrder: Number,
        title: String,
        productType: String,
        ingredients: [String],
        instructions: String,
      },
    ],

    generatedBy: {
      type: String,
      enum: ['quiz', 'analysis', 'manual'],
      default: 'quiz',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Routine', routineSchema);
