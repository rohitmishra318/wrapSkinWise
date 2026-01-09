// backend/models/RoutineStreak.js
const mongoose = require('mongoose');

const routineStreakSchema = new mongoose.Schema(
  {
    user: {
      type: String, // Firebase UID
      required: true,
      unique: true,
    },

    currentStreak: {
      type: Number,
      default: 0,
    },

    longestStreak: {
      type: Number,
      default: 0,
    },

    lastCompletedDate: {
      type: Date,
      default: null,
    },

    // Optional but VERY useful later (analytics, charts)
    history: [
      {
        date: { type: Date },
        completed: { type: Boolean },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('RoutineStreak', routineStreakSchema);
