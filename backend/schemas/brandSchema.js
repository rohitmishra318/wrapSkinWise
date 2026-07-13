const { z } = require('zod');

const recommendSchema = {
  body: z.object({
    skinProfile: z.any().optional(),
    context: z.any().optional(),
    catalogProductTypes: z.array(z.string()).min(1, 'At least one product type must be specified'),
    budget: z.number().optional(),
    routineType: z.enum(['morning', 'evening', 'both']).optional()
  })
};

const validateKeySchema = {
  body: z.object({}).optional()
};

module.exports = {
  recommendSchema,
  validateKeySchema
};
