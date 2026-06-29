const { GoogleGenAI } = require('@google/genai');
const { RoutineOutputSchema } = require('../schemas/routineSchema');
const ROUTINE_SYSTEM_PROMPT = require('../prompts/routineSystemPrompt');

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || 'dummy_key'
});

const generateRoutine = async (context) => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Generate a ${context.routineType} skincare routine for this user:\n${JSON.stringify(context, null, 2)}`,
    config: {
      systemInstruction: ROUTINE_SYSTEM_PROMPT,
      responseMimeType: 'application/json',
    }
  });

  const rawText = response.text;
  console.log(rawText);

  const cleanJson = rawText.replace(/```json|```/g, '').trim();

  const parsed = JSON.parse(cleanJson);
  return RoutineOutputSchema.parse(parsed);
};

module.exports = {
  generateRoutine
};
