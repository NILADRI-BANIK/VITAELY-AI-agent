"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import Groq from "groq-sdk";

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

const MAX_INPUT_LENGTH = 8000;

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getDbUser(clerkUserId) {
  return db.user.findUnique({ where: { clerkUserId } });
}

function cleanJsonResponse(raw) {
  const clean = raw.replace(/```json|```/g, "").trim();
  const jsonMatch = clean.match(/\{[\s\S]*\}/);
  return jsonMatch ? jsonMatch[0] : clean;
}

function buildSystemPrompt(mode) {
  const prompts = {
    improve: `You are an academic writing assistant. Improve the given text for academic tone, grammar, clarity, and structure.
Always respond with valid JSON only, no text outside it. Format:
{
  "improvedText": string,
  "changes": string[],
  "summary": string
}
"changes" should list 3-6 specific improvements made.
"summary" is one sentence describing the overall change.`,

    grammar: `You are a grammar and spelling checker for academic writing. Identify and fix grammar, punctuation, and spelling errors only — do not change tone or structure.
Always respond with valid JSON only, no text outside it. Format:
{
  "correctedText": string,
  "errors": [{ "original": string, "corrected": string, "type": string }]
}
"type" should be one of: "grammar", "spelling", "punctuation".`,

    tone: `You are an academic tone editor. Rewrite the given text to sound more formal, objective, and scholarly without changing its meaning.
Always respond with valid JSON only, no text outside it. Format:
{
  "rewrittenText": string,
  "toneShift": string
}
"toneShift" is one sentence describing how the tone changed.`,

    restructure: `You are an academic structure editor. Reorganize the given text for logical flow, clear paragraphing, and coherent argumentation without losing content.
Always respond with valid JSON only, no text outside it. Format:
{
  "restructuredText": string,
  "structureNotes": string[]
}
"structureNotes" should list 2-5 structural changes made.`,
  };

  return prompts[mode] ?? prompts.improve;
}

async function callGroqWriting(mode, text) {
  if (!groq) throw new Error("Groq API not configured");
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
    max_tokens: 2048,
    messages: [
      { role: "system", content: buildSystemPrompt(mode) },
      { role: "user", content: text },
    ],
  });

  const raw = completion.choices?.[0]?.message?.content ?? "";
  const cleaned = cleanJsonResponse(raw);

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Groq returned invalid JSON");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Groq response is not a valid object");
  }

  return parsed;
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export async function improveAcademicWriting({ text, saveToHistory = true }) {
  if (!text?.trim()) return { success: false, error: "text is required" };
  if (text.trim().length > MAX_INPUT_LENGTH) {

    return {
      success: false,
      error: `Text exceeds maximum length of ${MAX_INPUT_LENGTH} characters`,
    };
  }

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  try {
    const result = await callGroqWriting("improve", text.trim());

    if (typeof result.improvedText !== "string" || !result.improvedText.trim()) {
      return { success: false, error: "Failed to generate improved text" };
    }

    const data = {
      originalText: text.trim(),
      improvedText: result.improvedText,
      changes: Array.isArray(result.changes) ? result.changes : [],
      summary: typeof result.summary === "string" ? result.summary : "",
      mode: "improve",
    };

    if (saveToHistory) {
      try {
        await db.writingHistory.create({
          data: {
            userId: dbUser.id,
            mode: "improve",
            originalText: data.originalText,
            resultText: data.improvedText,
            metadata: { changes: data.changes, summary: data.summary },
          },
        });
      } catch {
        // non-fatal
      }
    }

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to improve writing",
    };
  }
}

export async function checkGrammar({ text, saveToHistory = true }) {
  if (!text?.trim()) return { success: false, error: "text is required" };
  if (text.trim().length > MAX_INPUT_LENGTH) {
    return {
      success: false,
      error: `Text exceeds maximum length of ${MAX_INPUT_LENGTH} characters`,
    };
  }

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  try {
    const result = await callGroqWriting("grammar", text.trim());

    if (
      typeof result.correctedText !== "string" ||
      !result.correctedText.trim()
    ) {
      return { success: false, error: "Failed to check grammar" };
    }

    const data = {
      originalText: text.trim(),
      correctedText: result.correctedText,
      errors: Array.isArray(result.errors) ? result.errors : [],
      mode: "grammar",
    };

    if (saveToHistory) {
      try {
        await db.writingHistory.create({
          data: {
            userId: dbUser.id,
            mode: "grammar",
            originalText: data.originalText,
            resultText: data.correctedText,
            metadata: { errors: data.errors },
          },
        });
      } catch {
        // non-fatal
      }
    }

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to check grammar",
    };
  }
}

export async function improveTone({ text, saveToHistory = true }) {
  if (!text?.trim()) return { success: false, error: "text is required" };
  if (text.trim().length > MAX_INPUT_LENGTH) {
    return {
      success: false,
      error: `Text exceeds maximum length of ${MAX_INPUT_LENGTH} characters`,
    };
  }

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  try {
    const result = await callGroqWriting("tone", text.trim());

    if (
      typeof result.rewrittenText !== "string" ||
      !result.rewrittenText.trim()
    ) {
      return { success: false, error: "Failed to improve tone" };
    }

    const data = {
      originalText: text.trim(),
      rewrittenText: result.rewrittenText,
      toneShift: typeof result.toneShift === "string" ? result.toneShift : "",
      mode: "tone",
    };

    if (saveToHistory) {
      try {
        await db.writingHistory.create({
          data: {
            userId: dbUser.id,
            mode: "tone",
            originalText: data.originalText,
            resultText: data.rewrittenText,
            metadata: { toneShift: data.toneShift },
          },
        });
      } catch {
        // non-fatal
      }
    }

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to improve tone",
    };
  }
}

export async function restructureText({ text, saveToHistory = true }) {
  if (!text?.trim()) return { success: false, error: "text is required" };
  if (text.trim().length > MAX_INPUT_LENGTH) {
    return {
      success: false,
      error: `Text exceeds maximum length of ${MAX_INPUT_LENGTH} characters`,
    };
  }

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  try {
    const result = await callGroqWriting("restructure", text.trim());

    if (
      typeof result.restructuredText !== "string" ||
      !result.restructuredText.trim()
    ) {
      return { success: false, error: "Failed to restructure text" };
    }

    const data = {
      originalText: text.trim(),
      restructuredText: result.restructuredText,
      structureNotes: Array.isArray(result.structureNotes)
        ? result.structureNotes
        : [],
      mode: "restructure",
    };

    if (saveToHistory) {
      try {
        await db.writingHistory.create({
          data: {
            userId: dbUser.id,
            mode: "restructure",
            originalText: data.originalText,
            resultText: data.restructuredText,
            metadata: { structureNotes: data.structureNotes },
          },
        });
      } catch {
        // non-fatal
      }
    }

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to restructure text",
    };
  }
}

export async function getWritingHistory({ limit = 20, offset = 0, mode } = {}) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  const safeLimit = Math.min(Number(limit) || 20, 50);
  const safeOffset = Math.max(Number(offset) || 0, 0);
  const validModes = ["improve", "grammar", "tone", "restructure"];
  const where = {
    userId: dbUser.id,
    ...(validModes.includes(mode) ? { mode } : {}),
  };

  try {
    const [history, total] = await Promise.all([
      db.writingHistory.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: safeLimit,
        skip: safeOffset,
      }),
      db.writingHistory.count({ where }),
    ]);

    return {
      success: true,
      data: { history, total, limit: safeLimit, offset: safeOffset },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch writing history",
    };
  }
}

export async function deleteWritingEntry(entryId) {
  if (!entryId) return { success: false, error: "entryId is required" };

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  try {
    const record = await db.writingHistory.findUnique({
      where: { id: entryId },
    });

    if (!record) return { success: false, error: "Entry not found" };
    if (record.userId !== dbUser.id) return { success: false, error: "Forbidden" };

    await db.writingHistory.delete({ where: { id: entryId } });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete entry",
    };
  }
}