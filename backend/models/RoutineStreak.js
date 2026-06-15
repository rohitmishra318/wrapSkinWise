const mongoose = require('mongoose');

const routineStreakSchema = new mongoose.Schema({
  user: { type: String, unique: true, required: true },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastCompletedDate: Date,
  totalCompletions: { type: Number, default: 0 },
  history: [{
    date: Date,
    completed: Boolean,
    morningCompleted: Boolean,
    nightCompleted: Boolean
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RoutineStreak', routineStreakSchema);
