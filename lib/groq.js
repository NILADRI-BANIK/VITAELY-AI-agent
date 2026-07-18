import Groq from "groq-sdk";

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is not defined in environment variables");
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const generateGroqCompletion = async (systemPrompt, userPrompt, options = {}) => {
  const response = await groq.chat.completions.create({
    model: options.model || "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: options.temperature ?? 0.7,
    max_tokens: options.max_tokens ?? 4096,
    response_format: options.json ? { type: "json_object" } : undefined,
  });

  return response.choices[0]?.message?.content || null;
};

export const generateGroqJSON = async (systemPrompt, userPrompt, options = {}) => {
  return generateGroqCompletion(systemPrompt, userPrompt, {
    ...options,
    json: true,
    temperature: options.temperature ?? 0.3,
  });
};

export default groq;