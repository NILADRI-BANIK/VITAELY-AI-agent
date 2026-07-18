import "server-only";

// File kept as deepseekClient.js so imports elsewhere (generatePortfolio.js,
// parseResume.js, actions/portfolio.js) don't need to change. Internally
// this now calls Groq (free tier) instead of DeepSeek.
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "openai/gpt-oss-120b";

/**
 * Calls Groq's OpenAI-compatible chat completions endpoint with retry/backoff.
 *
 * @param {string} prompt - full user prompt
 * @param {number} retries
 * @param {number} temperature - defaults to 0.7. Pass a lower value (e.g. 0.1)
 *   for rigid structured-extraction tasks like resume parsing, where
 *   determinism matters more than creative variation.
 * @returns {Promise<string>} raw text content from the model
 */
export async function generateWithRetry(prompt, retries = 2, temperature = 0.7) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set in environment variables.");
  }

  let lastError;

  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(GROQ_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [{ role: "user", content: prompt }],
          temperature,
        }),
      });

      if (!response.ok) {
        const status = response.status;
        let errorBody = "";
        try {
          errorBody = await response.text();
        } catch {
          // ignore body read failure
        }

        if (status === 401) {
          throw new Error(`API_KEY_INVALID: ${errorBody}`);
        }
        if (status === 429) {
          throw new Error(`429 quota exceeded: ${errorBody}`);
        }
        if (status === 503) {
          throw new Error(`503 Service Unavailable: ${errorBody}`);
        }

        throw new Error(`Groq API error (${status}): ${errorBody}`);
      }

      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content;

      if (!text) {
        throw new Error("Empty Groq response");
      }

      return text;
    } catch (error) {
      lastError = error;
      console.warn(`Groq attempt ${i + 1} failed:`, error.message);
      if (i < retries) {
        await new Promise((resolve) =>
          setTimeout(resolve, 2000 * Math.pow(2, i)),
        );
      }
    }
  }

  throw lastError;
}
