const Routine = require('../models/Routine');
const RoutineStreak = require('../models/RoutineStreak');
const ProductReaction = require('../models/ProductReaction');
const User = require('../models/User');
const SkinAnalysis = require('../models/SkinAnalysis');
const DailyCheckin = require('../models/DailyCheckin');
const { getWeather } = require('../services/weatherService');
const { generateRoutine } = require('../services/routineGenerator');
const redis = require('../config/redis');
const { getIo } = require('../services/socketService');

const getRoutines = async (req, res) => {
  try {
    const { type } = req.query;
    const uid = req.user.uid;
    const cacheKey = `cache:routine:${uid}:${type || 'all'}`;
    const cached = await redis.get(cacheKey);
    if (cached) return res.json({ success: true, data: JSON.parse(cached) });

    const filter = { user: uid, isActive: true };
    if (type && type !== 'all') filter.routineType = type;
    
    const routines = await Routine.find(filter).sort({ createdAt: -1 });
    await redis.setex(cacheKey, 86400, JSON.stringify(routines));

    res.json({ success: true, data: routines });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

const createRoutineGeneration = async (req, res) => {
  try {
    const { routineType, analysisId, forceRegenerate } = req.body;
    const uid = req.user.uid;

    const user = await User.findOne({ uid });
    if (!user) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });

    let analysis = null;
    if (analysisId) {
      analysis = await SkinAnalysis.findById(analysisId);
    } else {
      analysis = await SkinAnalysis.findOne({ user: uid }).sort({ createdAt: -1 });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayCheckin = await DailyCheckin.findOne({ user: uid, date: { $gte: todayStart } });

    const weatherData = await getWeather(user.lastWeatherContext?.city || 'New York');

    const recentReactions = await ProductReaction.find({ user: uid }).sort({ createdAt: -1 }).limit(10);
    const currentRoutine = await Routine.findOne({ user: uid, routineType, isActive: true }).sort({ createdAt: -1 });

    const context = {
      skinType: user.skinProfile?.skinType || null,
      concerns: user.skinProfile?.concerns || [],
      allergies: user.skinProfile?.allergies || [],
      fitzpatrick: analysis?.fitzpatrickAtAnalysis ?? user.skinProfile?.fitzpatrickEstimate ?? null,
      ageRange: user.skinProfile?.ageRange || null,
      budget: user.preferences?.budget || null,
      routineLevel: user.preferences?.routineLevel || null,
      routineType,
      latestSeverity: analysis?.severity ?? null,
      zonalSeverity: analysis?.zonalSeverity ?? null,
      igaGrade: analysis?.igaGrade ?? null,
      overallScore: analysis?.overallScore ?? null,
      humidity: weatherData?.humidity ?? null,
      uvIndex: weatherData?.uvIndex ?? null,
      aqi: weatherData?.aqi ?? null,
      temperature: weatherData?.temperature ?? null,
      sleepQuality: todayCheckin?.sleepQuality ?? user.lifestyleProfile?.sleepQuality ?? null,
      stressLevel: todayCheckin?.stressLevel ?? user.lifestyleProfile?.stressLevel ?? null,
      waterIntake: todayCheckin?.waterIntake ?? null,
      skinFeel: todayCheckin?.skinFeel ?? null,
      productHistory: recentReactions.map(r => ({
        productType: r.productType,
        reaction: r.reaction,
        weeksUsed: r.weeksUsed
      })),
      previousRoutineSteps: currentRoutine?.steps.map(s => s.title) ?? []
    };

    let generated;
    try {
      generated = await generateRoutine(context);
    } catch (e) {
      console.error('LLM generation failed:', e);
      generated = {
        steps: [{
          stepOrder: 1, title: 'Basic Cleanser', productType: 'cleanser',
          recommendedIngredients: [], avoidIngredients: [], instructions: 'Wash face',
          rationale: 'Basic fallback', estimatedTime: 1
        }],
        ingredientConflictsResolved: [],
        allergyMatchesAvoided: [],
        contextSummary: 'Fallback routine'
      };
    }

    if (currentRoutine) {
      currentRoutine.isActive = false;
      await currentRoutine.save();
    }

    const newRoutine = new Routine({
      user: uid,
      analysisId: analysis?._id,
      routineType,
      steps: generated.steps,
      contextUsed: {
        humidity: context.humidity,
        uvIndex: context.uvIndex,
        aqi: context.aqi,
        temperature: context.temperature,
        sleepQuality: context.sleepQuality,
        stressLevel: context.stressLevel
      },
      ingredientConflictsResolved: generated.ingredientConflictsResolved,
      allergyMatchesAvoided: generated.allergyMatchesAvoided,
      generatedBy: 'llm-v1',
      llmModel: 'claude-sonnet-4-20250514'
    });

    await newRoutine.save();
    
    await redis.del(`cache:routine:${uid}:all`);
    await redis.del(`cache:routine:${uid}:${routineType}`);

    res.json({ success: true, data: newRoutine });

  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

const completeSteps = async (req, res) => {
  try {
    const { stepIds } = req.body;
    const routineId = req.params.id;
    const uid = req.user.uid;

    const routine = await Routine.findOne({ _id: routineId, user: uid });
    if (!routine) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Routine not found' } });

    routine.steps.forEach(s => {
      if (stepIds.includes(s._id.toString())) {
        s.isCompleted = true;
        s.completedAt = new Date();
      }
    });

    await routine.save();

    const allComplete = routine.steps.every(s => s.isCompleted);
    let streakInfo = null;

    if (allComplete) {
      const io = getIo();
      io.to(`user:${uid}`).emit('routine:completed', { message: 'Routine complete!' });
      
      let streak = await RoutineStreak.findOne({ user: uid });
      if (!streak) streak = new RoutineStreak({ user: uid });
      streak.currentStreak += 1;
      if (streak.currentStreak > streak.longestStreak) streak.longestStreak = streak.currentStreak;
      streak.totalCompletions += 1;
      streak.lastCompletedDate = new Date();
      await streak.save();
      streakInfo = streak;
    }

    res.json({ success: true, data: { routine, streakInfo } });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

const addReaction = async (req, res) => {
  try {
    const { stepTitle, productType, ingredients, reaction, weeksUsed, notes } = req.body;
    const uid = req.user.uid;

    const newReaction = new ProductReaction({
      user: uid,
      routineId: req.params.id,
      stepTitle, productType, ingredients, reaction, weeksUsed, notes
    });

    await newReaction.save();
    res.json({ success: true, data: newReaction });
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
};

module.exports = {
  getRoutines,
  createRoutineGeneration,
  completeSteps,
  addReaction
};
