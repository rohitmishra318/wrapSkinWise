const { z } = require('zod');

const StepSchema = z.object({
  stepOrder: z.number().int().min(1).max(10),
  title: z.string().min(2).max(100),
  productType: z.string().min(2).max(60),
  recommendedIngredients: z.array(z.string()).min(1).max(8),
  avoidIngredients: z.array(z.string()).max(6),
  instructions: z.string().min(10).max(300),
  rationale: z.string().min(10).max(200),
  estimatedTime: z.number().int().min(1).max(30)
});

const RoutineOutputSchema = z.object({
  steps: z.array(StepSchema).min(3).max(8),
  ingredientConflictsResolved: z.array(z.string()),
  allergyMatchesAvoided: z.array(z.string()),
  contextSummary: z.string().min(10).max(200)
});

const generateRoutineSchema = {
  body: z.object({
    routineType: z.enum(['morning', 'night']),
    analysisId: z.string().optional(),
    forceRegenerate: z.boolean().optional()
  })
};

const productReactionSchema = {
  body: z.object({
    stepTitle: z.string(),
    productType: z.string(),
    ingredients: z.array(z.string()),
    reaction: z.enum(['positive', 'neutral', 'irritation', 'breakout', 'no_effect']),
    weeksUsed: z.number(),
    notes: z.string().optional()
  })
};

module.exports = {
  RoutineOutputSchema,
  generateRoutineSchema,
  productReactionSchema
};
