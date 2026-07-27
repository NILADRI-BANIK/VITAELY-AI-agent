/**
 * Multi-provider AI text generation with automatic fallback.
 *
 * Provider order: DeepSeek (primary) → Groq (fallback) → Gemini (final
 * AI fallback) → template-based generator (last resort, never fails).
 *
 * Each AI provider gets its own retry-with-backoff before the chain
 * moves to the next provider, so a transient blip on one provider
 * doesn't immediately burn through the whole chain.
 */

import OpenAI from "openai";
import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ── Client setup ──
// Clients are only constructed if their API key is present, so a
// missing key (e.g. DEEPSEEK_API_KEY not yet set) cleanly skips that
// provider instead of throwing at module load time.

const deepseek = process.env.DEEPSEEK_API_KEY
  ? new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: "https://api.deepseek.com",
    })
  : null;

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// ── Shared retry helpers ──

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Identifies errors worth retrying on the SAME provider before moving
 * to the next one in the chain. 503 = overloaded, 429 = rate limited.
 * Different SDKs surface this differently, so check several shapes.
 */
function isRetryableError(err) {
  const status =
    err?.status ?? err?.response?.status ?? err?.error?.status ?? null;
  if (status === 503 || status === 429) return true;

  // Some SDKs (notably fetch-based ones) throw network errors without a
  // status code at all — treat connection failures as retryable too,
  // since they're often transient.
  const message = String(err?.message ?? "").toLowerCase();
  if (
    message.includes("econnreset") ||
    message.includes("etimedout") ||
    message.includes("fetch failed") ||
    message.includes("overloaded") ||
    message.includes("rate limit")
  ) {
    return true;
  }

  return false;
}

/**
 * Runs `fn` with exponential backoff retries. `fn` should throw on
 * failure and return the generated text string on success.
 */
async function withRetry(fn, { maxAttempts = 3, label = "provider" } = {}) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      console.error(`[ai-providers] ${label} attempt ${attempt} failed:`, err?.message ?? err);

      if (!isRetryableError(err) || attempt === maxAttempts) {
        break;
      }

      const delayMs = 1000 * 2 ** (attempt - 1); // 1s, 2s, 4s...
      await sleep(delayMs);
    }
  }

  throw lastError;
}

// ── Individual provider callers ──
// Each returns the generated text string, or throws.

async function callDeepSeek(prompt) {
  if (!deepseek) {
    throw new Error("DeepSeek not configured (missing DEEPSEEK_API_KEY)");
  }

  return withRetry(
    async () => {
      const response = await deepseek.chat.completions.create({
        model: "deepseek-v4-flash",
        messages: [{ role: "user", content: prompt }],
      });
      const text = response?.choices?.[0]?.message?.content;
      if (!text) throw new Error("DeepSeek returned an empty response");
      return text;
    },
    { label: "DeepSeek" }
  );
}

async function callGroq(prompt) {
  if (!groq) {
    throw new Error("Groq not configured (missing GROQ_API_KEY)");
  }

  return withRetry(
    async () => {
      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
      });
      const text = response?.choices?.[0]?.message?.content;
      if (!text) throw new Error("Groq returned an empty response");
      return text;
    },
    { label: "Groq" }
  );
}

async function callGemini(prompt) {
  if (!genAI) {
    throw new Error("Gemini not configured (missing GEMINI_API_KEY)");
  }

  // Try the standard flash model first, then fall back to other Gemini
  // models if that specific one is overloaded — this nests inside the
  // outer DeepSeek→Groq→Gemini chain as Gemini's own internal fallback.
  const geminiModels = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-pro"];
  let lastError;

  for (const modelName of geminiModels) {
    try {
      return await withRetry(
        async () => {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          const text = result?.response?.text();
          if (!text) throw new Error("Gemini returned an empty response");
          return text;
        },
        { label: `Gemini (${modelName})` }
      );
    } catch (err) {
      lastError = err;
      if (!isRetryableError(err)) break;
    }
  }

  throw lastError;
}

/**
 * Last-resort, non-AI fallback. Builds a clean, professional cover
 * letter directly from the structured fields the user provided, with
 * no AI call at all. This guarantees the feature can never fully fail
 * — even if every AI provider is down, the user still gets a usable,
 * if more generic, letter rather than an error screen.
 */
function generateTemplateBasedFallback({
  yourName,
  yourSkills,
  yourExperience,
  jobTitle,
  companyName,
  jobDescription,
  tone,
  additionalInfo,
}) {
  const name = yourName || "the applicant";
  const skillsLine = yourSkills
    ? `My core skills include ${yourSkills}, which I believe align closely with what you're looking for in this role.`
    : "I bring a strong, well-rounded skill set relevant to this role.";
  const experienceLine = yourExperience
    ? `With ${yourExperience} of relevant experience, I have developed a solid foundation for tackling the responsibilities this position requires.`
    : "My professional background has prepared me well for the responsibilities this position requires.";
  const additionalLine = additionalInfo
    ? `${additionalInfo}\n\n`
    : "";

  return `Dear Hiring Manager,

I am writing to express my interest in the ${jobTitle || "position"} role at ${companyName || "your company"}. After reviewing the job description, I am confident that my background and skills make me a strong fit for this opportunity.

${experienceLine} ${skillsLine}

${additionalLine}I am particularly drawn to this role because of the opportunity to contribute meaningfully to ${companyName || "your organization"}'s goals. I am confident that my dedication, adaptability, and relevant expertise would allow me to make a positive impact on your team.

I would welcome the opportunity to discuss how my background aligns with your needs. Thank you for considering my application.`;
}

// ── Public entry point ──

/**
 * Generates cover letter text using the full provider chain:
 * DeepSeek → Groq → Gemini → template-based fallback.
 *
 * Returns { content, providerUsed }. `providerUsed` is one of
 * "deepseek" | "groq" | "gemini" | "template" — useful for logging/
 * debugging which tier actually served the request.
 *
 * This function never throws under normal operation — the template
 * fallback guarantees a result. It can still throw if `fields` is
 * malformed in a way that breaks even the template fallback (e.g.
 * fields being null), which should not happen if callers validate
 * input first.
 */
export async function generateWithFallbackChain(prompt, fields) {
  const providers = [
    { name: "deepseek", call: callDeepSeek },
    { name: "groq", call: callGroq },
    { name: "gemini", call: callGemini },
  ];

  for (const provider of providers) {
    try {
      const content = await provider.call(prompt);
      return { content, providerUsed: provider.name };
    } catch (err) {
      console.error(`[ai-providers] ${provider.name} exhausted, moving to next provider:`, err?.message ?? err);
      // Always move to the next provider on failure, regardless of
      // error type — even a "not configured" error should just skip
      // to the next tier rather than abort the whole chain.
    }
  }

  // Every AI provider failed (or none were configured) — fall back to
  // the deterministic template generator so the feature never fully
  // breaks for the user.
  console.error("[ai-providers] All AI providers failed — using template-based fallback");
  const content = generateTemplateBasedFallback(fields);
  return { content, providerUsed: "template" };
}

/**
 * Lightweight health check for each configured provider. Does NOT make
 * a real generation call (to avoid burning quota/cost on every health
 * check) — it only verifies that an API key is present and the client
 * was constructed. For a deeper live check, see `pingProvider` below.
 */
export function getProviderStatus() {
  return {
    deepseek: { configured: Boolean(deepseek) },
    groq: { configured: Boolean(groq) },
    gemini: { configured: Boolean(genAI) },
  };
}

/**
 * Optional deeper health check that makes a minimal real request to a
 * provider to confirm it's actually reachable and responding, not just
 * configured. Use sparingly (e.g. on an admin diagnostics page), not
 * on every generation request.
 */
export async function pingProvider(providerName) {
  const pingPrompt = "Reply with just the word OK.";
  try {
    if (providerName === "deepseek") {
      const text = await callDeepSeek(pingPrompt);
      return { ok: true, sample: text.slice(0, 50) };
    }
    if (providerName === "groq") {
      const text = await callGroq(pingPrompt);
      return { ok: true, sample: text.slice(0, 50) };
    }
    if (providerName === "gemini") {
      const text = await callGemini(pingPrompt);
      return { ok: true, sample: text.slice(0, 50) };
    }
    return { ok: false, error: `Unknown provider: ${providerName}` };
  } catch (err) {
    return { ok: false, error: err?.message ?? String(err) };
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// RESUME MODULE — isolated DeepSeek client + dedicated generation helpers
//
// Uses DEEPSEEK_KEY_RESUME (separate from the Cover Letter DEEPSEEK_API_KEY)
// so Resume and Cover Letter quota/keys are independently managed.
// Follows the identical retry-with-backoff + provider-chain pattern above.
// ─────────────────────────────────────────────────────────────────────────────

const deepseekResume = process.env.DEEPSEEK_KEY_RESUME
  ? new OpenAI({
      apiKey: process.env.DEEPSEEK_KEY_RESUME,
      baseURL: "https://api.deepseek.com",
    })
  : null;

/**
 * Resume-specific DeepSeek caller — plain text output.
 * Used by improveWithAI, improveSummaryWithAI, categorizeSkills.
 */
async function callDeepSeekResume(prompt, systemPrompt) {
  if (!deepseekResume) {
    throw new Error("DeepSeek Resume not configured (missing DEEPSEEK_KEY_RESUME)");
  }

  return withRetry(
    async () => {
      const response = await deepseekResume.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      });
      const text = response?.choices?.[0]?.message?.content;
      if (!text) throw new Error("DeepSeek Resume returned an empty response");
      return text.trim();
    },
    { label: "DeepSeek-Resume" }
  );
}

/**
 * Resume-specific DeepSeek caller — structured JSON output.
 * Used by analyzeResumeWithGemini (ATS) and parse-resume route.
 */
async function callDeepSeekResumeJSON(prompt, systemPrompt) {
  if (!deepseekResume) {
    throw new Error("DeepSeek Resume not configured (missing DEEPSEEK_KEY_RESUME)");
  }

  return withRetry(
    async () => {
      const response = await deepseekResume.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: 0.1,
        max_tokens: 4096,
        response_format: { type: "json_object" },
      });
      const text = response?.choices?.[0]?.message?.content;
      if (!text) throw new Error("DeepSeek Resume JSON returned an empty response");
      return text.trim();
    },
    { label: "DeepSeek-Resume-JSON" }
  );
}

/**
 * Groq plain-text caller reused for Resume fallback.
 * Accepts a systemPrompt to match Resume's two-message pattern.
 */
async function callGroqResumeText(prompt, systemPrompt) {
  if (!groq) {
    throw new Error("Groq not configured (missing GROQ_API_KEY)");
  }

  return withRetry(
    async () => {
      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      });
      const text = response?.choices?.[0]?.message?.content;
      if (!text) throw new Error("Groq Resume returned an empty response");
      return text.trim();
    },
    { label: "Groq-Resume-Text" }
  );
}

/**
 * Groq JSON caller reused for Resume fallback.
 * Groq supports response_format json_object on llama-3.3-70b-versatile.
 */
async function callGroqResumeJSON(prompt, systemPrompt) {
  if (!groq) {
    throw new Error("Groq not configured (missing GROQ_API_KEY)");
  }

  return withRetry(
    async () => {
      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: 0.1,
        max_tokens: 4096,
        response_format: { type: "json_object" },
      });
      const text = response?.choices?.[0]?.message?.content;
      if (!text) throw new Error("Groq Resume JSON returned an empty response");
      return text.trim();
    },
    { label: "Groq-Resume-JSON" }
  );
}

/**
 * Gemini plain-text caller reused for Resume final fallback.
 */
async function callGeminiResumeText(prompt) {
  if (!genAI) {
    throw new Error("Gemini not configured (missing GEMINI_API_KEY)");
  }

  const geminiModels = ["gemini-2.5-flash", "gemini-2.0-flash"];
  let lastError;

  for (const modelName of geminiModels) {
    try {
      return await withRetry(
        async () => {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          const text = result?.response?.text();
          if (!text) throw new Error("Gemini Resume returned an empty response");
          return text.trim();
        },
        { label: `Gemini-Resume (${modelName})` }
      );
    } catch (err) {
      lastError = err;
      if (!isRetryableError(err)) break;
    }
  }

  throw lastError;
}

/**
 * Gemini JSON caller for Resume final fallback.
 * Gemini doesn't support response_format, so we strip markdown fences.
 */
async function callGeminiResumeJSON(prompt) {
  if (!genAI) {
    throw new Error("Gemini not configured (missing GEMINI_API_KEY)");
  }

  const geminiModels = ["gemini-2.5-flash", "gemini-2.0-flash"];
  let lastError;

  for (const modelName of geminiModels) {
    try {
      return await withRetry(
        async () => {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          const raw = result?.response?.text();
          if (!raw) throw new Error("Gemini Resume JSON returned an empty response");
          // Strip markdown fences Gemini sometimes wraps JSON in
          return raw
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/```\s*$/i, "")
            .trim();
        },
        { label: `Gemini-Resume-JSON (${modelName})` }
      );
    } catch (err) {
      lastError = err;
      if (!isRetryableError(err)) break;
    }
  }

  throw lastError;
}

/**
 * Public: Generate plain text for Resume features.
 * Chain: DeepSeek (DEEPSEEK_KEY_RESUME) → Groq → Gemini
 *
 * @param {string} prompt      - The user/task prompt
 * @param {string} systemPrompt - Role/instruction for the model
 * @returns {Promise<string>}  - Generated text
 */
export async function generateResumeText(prompt, systemPrompt) {
  const providers = [
    { name: "deepseek-resume", call: () => callDeepSeekResume(prompt, systemPrompt) },
    { name: "groq-resume", call: () => callGroqResumeText(prompt, systemPrompt) },
    { name: "gemini-resume", call: () => callGeminiResumeText(prompt) },
  ];

  let lastError;
  for (const provider of providers) {
    try {
      const text = await provider.call();
      console.log(`[resume] Text generated via ${provider.name}`);
      return text;
    } catch (err) {
      lastError = err;
      console.error(
        `[resume] ${provider.name} failed, trying next:`,
        err?.message ?? err
      );
    }
  }

  throw lastError ?? new Error("All AI providers failed for Resume text generation");
}

/**
 * Public: Generate structured JSON for Resume features.
 * Chain: DeepSeek (DEEPSEEK_KEY_RESUME) → Groq → Gemini
 *
 * Returns a parsed plain JSON string (not yet parsed to object —
 * callers do their own JSON.parse so they can handle errors in context).
 *
 * @param {string} prompt       - The user/task prompt
 * @param {string} systemPrompt - Role/instruction for the model
 * @returns {Promise<string>}   - Raw JSON string
 */
export async function generateResumeJSON(prompt, systemPrompt) {
  const providers = [
    { name: "deepseek-resume", call: () => callDeepSeekResumeJSON(prompt, systemPrompt) },
    { name: "groq-resume", call: () => callGroqResumeJSON(prompt, systemPrompt) },
    { name: "gemini-resume", call: () => callGeminiResumeJSON(prompt) },
  ];

  let lastError;
  for (const provider of providers) {
    try {
      const raw = await provider.call();
      console.log(`[resume] JSON generated via ${provider.name}`);
      return raw;
    } catch (err) {
      lastError = err;
      console.error(
        `[resume] ${provider.name} failed, trying next:`,
        err?.message ?? err
      );
    }
  }

  throw lastError ?? new Error("All AI providers failed for Resume JSON generation");
}