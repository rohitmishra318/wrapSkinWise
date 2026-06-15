const { Anthropic } = require('@anthropic-ai/sdk');
const { RoutineOutputSchema } = require('../schemas/routineSchema');
const ROUTINE_SYSTEM_PROMPT = require('../prompts/routineSystemPrompt');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'dummy_key'
});

const generateRoutine = async (context) => {
  const response = await anthropic.messages.create({
    model: 'claude-3-sonnet-20240229',
    max_tokens: 1500,
    system: ROUTINE_SYSTEM_PROMPT,
    messages: [{
      role: 'user',
      content: `Generate a ${context.routineType} skincare routine for this user:\n${JSON.stringify(context, null, 2)}`
    }]
  });

  const rawText = response.content[0].text;
  
  const cleanJson = rawText.replace(/```json|```/g, '').trim();
  
  const parsed = JSON.parse(cleanJson);
  return RoutineOutputSchema.parse(parsed);
};

module.exports = {
  generateRoutine
};
