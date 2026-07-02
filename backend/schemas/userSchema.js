const { z } = require('zod');

const checkinSchema = {
  body: z.object({
    sleepQuality: z.string().optional(),
    stressLevel: z.string().optional(),
    waterIntake: z.string().optional(),
    skinFeel: z.string().optional(),
    notes: z.string().optional()
  })
};

module.exports = {
  checkinSchema
};
