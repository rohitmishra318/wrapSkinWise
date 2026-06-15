const mongoose = require('mongoose');

const routineSchema = new mongoose.Schema({
  user: { type: String, required: true, index: true },
  analysisId: { type: mongoose.Schema.Types.ObjectId, ref: 'SkinAnalysis', default: null },

  routineType: { type: String, enum: ['morning', 'night'], required: true },

  steps: [{
    stepOrder: { type: Number, required: true },
    title: { type: String, required: true },
    productType: String,
    recommendedIngredients: [{ type: String }],
    avoidIngredients: [{ type: String }],
    instructions: String,
    rationale: String,
    estimatedTime: Number,
    isCompleted: { type: Boolean, default: false },
    completedAt: Date
  }],

  contextUsed: {
    humidity: Number,
    uvIndex: Number,
    aqi: Number,
    temperature: Number,
    sleepQuality: Number,
    stressLevel: Number
  },

  ingredientConflictsResolved: [{ type: String }],
  allergyMatchesAvoided: [{ type: String }],

  generatedBy: { type: String, enum: ['quiz', 'analysis', 'manual', 'llm-v1'], default: 'llm-v1' },
  llmModel: { type: String, default: null },
  llmPromptVersion: { type: String, default: null },

  isActive: { type: Boolean, default: true },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Routine', routineSchema);
