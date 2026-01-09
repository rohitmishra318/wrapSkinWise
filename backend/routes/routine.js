// backend/routes/routine.js
const express = require('express');
const RoutineStreak = require('../models/RoutineStreak');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/complete', authMiddleware, async (req, res) => {
  const uid = req.user.uid;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = await RoutineStreak.findOne({ user: uid });

  if (!streak) {
    streak = await RoutineStreak.create({
      user: uid,
      currentStreak: 1,
      longestStreak: 1,
      lastCompletedDate: today,
      history: [{ date: today, completed: true }],
    });

    return res.json(streak);
  }

  const lastDate = streak.lastCompletedDate
    ? new Date(streak.lastCompletedDate)
    : null;

  if (lastDate) lastDate.setHours(0, 0, 0, 0);

  const diffDays =
    lastDate ? (today - lastDate) / (1000 * 60 * 60 * 24) : null;

  if (diffDays === 1) {
    streak.currentStreak += 1;
  } else if (diffDays > 1) {
    streak.currentStreak = 1;
  }
  // if diffDays === 0 → already marked today

  streak.longestStreak = Math.max(
    streak.longestStreak,
    streak.currentStreak
  );

  streak.lastCompletedDate = today;
  streak.history.push({ date: today, completed: true });

  await streak.save();

  res.json(streak);
});



router.get('/streak', authMiddleware, async (req, res) => {
  const streak = await RoutineStreak.findOne({ user: req.user.uid });
  res.json(streak || null);
});


module.exports = router;
