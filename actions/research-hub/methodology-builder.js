"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import Groq from "groq-sdk";
import { generateMethodologyRecommendation } from "./methodology-recommendation";

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

const CACHE_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours
// ─── Cache Helpers ────────────────────────────────────────────────────────────

async function getCached(cacheKey) {
  try {
    const cached = await db.researchCache.findUnique({ where: { cacheKey } });
    if (!cached) return null;
    const isExpired =
      Date.now() - new Date(cached.updatedAt).getTime() > CACHE_TTL_MS;
    if (isExpired) {
      await db.researchCache.delete({ where: { cacheKey } }).catch(() => {});
      return null;
    }
    return typeof cached.data === "string"
      ? JSON.parse(cached.data)
      : cached.data;
  } catch {
    return null;
  }
}

async function setCached(cacheKey, data) {
  try {
    await db.researchCache.upsert({
      where: { cacheKey },
      update: { data, updatedAt: new Date() },
      create: { cacheKey, data },
    });
  } catch {
    // non-fatal
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildCacheSlug(str) {
  return String(str).toLowerCase().replace(/\s+/g, "_").slice(0, 50);
}

function validateMethodologyType(type) {
  const valid = [
    "qualitative",
    "quantitative",
    "mixed-methods",
    "experimental",
    "survey",
    "case-study",
    "systematic-review",
    "action-research",
  ];
  return valid.includes(type?.toLowerCase()) ? type.toLowerCase() : null;
}

// ─── Groq Helpers ─────────────────────────────────────────────────────────────

async function generateMethodologyWithGroq(prompt) {
  if (!groq) throw new Error("Groq API not configured");

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
    max_tokens: 2048,
    messages: [
      {
        role: "system",
        content: `You are an expert research methodology advisor.
Always respond with a valid JSON object.
The object must have:
  - "overview": string (2-3 sentence summary of the methodology)
  - "researchDesign": string (detailed research design description)
  - "dataCollection": { "method": string, "description": string, "tools": string[] }[] (2-4 data collection methods)
  - "dataAnalysis": { "technique": string, "description": string }[] (2-3 analysis techniques)
  - "sampling": { "strategy": string, "description": string, "sampleSize": string }
  - "validity": { "type": string, "measures": string[] }[] (2-3 validity/reliability measures)
  - "limitations": string[] (3-4 limitations)
  - "ethicalConsiderations": string[] (2-3 ethical points)
  - "timeline": { "phase": string, "duration": string, "activities": string[] }[] (4-6 phases)
  - "tools": string[] (recommended software/tools)
Do not include any text outside the JSON object.`,
      },
      { role: "user", content: prompt },
    ],
  });

  const raw = completion.choices?.[0]?.message?.content ?? "";
  const clean = raw.replace(/```json|```/g, "").trim();

  let parsed;
  try {
    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : clean);
  } catch {
    throw new Error("Groq returned invalid JSON");
  }

  if (typeof parsed !== "object" || Array.isArray(parsed) || parsed === null) {
    throw new Error("Groq response is not a valid object");
  }

  return {
    overview: typeof parsed.overview === "string" ? parsed.overview : "",
    researchDesign:
      typeof parsed.researchDesign === "string" ? parsed.researchDesign : "",
    dataCollection: Array.isArray(parsed.dataCollection)
      ? parsed.dataCollection.filter(
          (d) =>
            d &&
            typeof d.method === "string" &&
            typeof d.description === "string" &&
            Array.isArray(d.tools),
        )
      : [],
    dataAnalysis: Array.isArray(parsed.dataAnalysis)
      ? parsed.dataAnalysis.filter(
          (a) =>
            a &&
            typeof a.technique === "string" &&
            typeof a.description === "string",
        )
      : [],
    sampling:
      parsed.sampling && typeof parsed.sampling.strategy === "string"
        ? parsed.sampling
        : { strategy: "", description: "", sampleSize: "" },
    validity: Array.isArray(parsed.validity)
      ? parsed.validity.filter(
          (v) => v && typeof v.type === "string" && Array.isArray(v.measures),
        )
      : [],
    limitations: Array.isArray(parsed.limitations)
      ? parsed.limitations.filter((l) => typeof l === "string")
      : [],
    ethicalConsiderations: Array.isArray(parsed.ethicalConsiderations)
      ? parsed.ethicalConsiderations.filter((e) => typeof e === "string")
      : [],
    timeline: Array.isArray(parsed.timeline)
      ? parsed.timeline.filter(
          (t) =>
            t &&
            typeof t.phase === "string" &&
            typeof t.duration === "string" &&
            Array.isArray(t.activities),
        )
      : [],
    tools: Array.isArray(parsed.tools)
      ? parsed.tools.filter((t) => typeof t === "string")
      : [],
  };
}

async function generateSectionWithGroq(prompt) {
  if (!groq) throw new Error("Groq API not configured");

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
    max_tokens: 1024,
    messages: [
      {
        role: "system",
        content: `You are an expert research methodology advisor.
Respond with a valid JSON object containing:
  - "content": string (the written methodology section text)
Do not include any text outside the JSON object.`,
      },
      { role: "user", content: prompt },
    ],
  });

  const raw = completion.choices?.[0]?.message?.content ?? "";
  const clean = raw.replace(/```json|```/g, "").trim();

  let parsed;
  try {
    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : clean);
  } catch {
    throw new Error("Groq returned invalid JSON for section");
  }

  if (typeof parsed?.content !== "string") {
    throw new Error("Groq section response missing content field");
  }

  return parsed.content;
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export async function generateMethodology({
  topic,
  methodologyType,
  researchObjectives = [],
  targetPopulation = "",
  constraints = [],
  useLiteratureEvidence = true,
  estimatedPopulationSize = null,
  dataType = null,
  analysisGoal = null,
  modelType = "none",
}) {
  if (!topic?.trim()) return { success: false, error: "topic is required" };
  if (!methodologyType?.trim())
    return { success: false, error: "methodologyType is required" };

  const validType = validateMethodologyType(methodologyType);
  if (!validType)
    return {
      success: false,
      error: `Invalid methodologyType: ${methodologyType}`,
    };

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await db.user.findUnique({ where: { clerkUserId } });
  if (!dbUser) return { success: false, error: "User not found" };
  const userId = dbUser.id;

  const safeObjectives = Array.isArray(researchObjectives)
    ? researchObjectives
    : [];
  const safeConstraints = Array.isArray(constraints) ? constraints : [];

  const slug = `${buildCacheSlug(topic)}_${buildCacheSlug(validType)}_${buildCacheSlug(dataType ?? "na")}_${buildCacheSlug(analysisGoal ?? "na")}_${buildCacheSlug(modelType ?? "none")}`;
  const cacheKey = `methodology_${userId}_${slug}`;

  const cached = await getCached(cacheKey);
  if (cached) return { success: true, data: cached, fromCache: true };

  try {
    const prompt = buildMethodologyPrompt({
      topic: topic.trim(),
      methodologyType: validType,
      objectives: safeObjectives,
      targetPopulation: targetPopulation?.trim() ?? "",
      constraints: safeConstraints,
    });

    const methodology = await generateMethodologyWithGroq(prompt);

    let recommendationBundle = null;
    let recommendationError = null;
    try {
      const recResult = await generateMethodologyRecommendation({
        topic: topic.trim(),
        methodologyType: validType,
        researchObjectives: safeObjectives,
        targetPopulation: targetPopulation?.trim() ?? "",
        constraints: safeConstraints,
        useLiteratureEvidence,
        estimatedPopulationSize,
        dataType,
        analysisGoal,
        modelType,
      });
      if (recResult.success) {
        recommendationBundle = recResult.data;
      } else {
        recommendationError = recResult.error;
      }
    } catch (recError) {
      recommendationError =
        recError instanceof Error ? recError.message : "Failed to generate recommendation bundle";
    }

    const result = {
      topic: topic.trim(),
      methodologyType: validType,
      objectives: safeObjectives,
      targetPopulation: targetPopulation?.trim() ?? "",
      constraints: safeConstraints,
      methodology,
      recommendationBundle,
      recommendationError,
      generatedAt: new Date().toISOString(),
    };

    await setCached(cacheKey, result);

    return { success: true, data: result, fromCache: false };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate methodology",
    };
  }
}

export async function generateMethodologySection({
  topic,
  methodologyType,
  sectionType,
}) {
  if (!topic?.trim()) return { success: false, error: "topic is required" };
  if (!methodologyType?.trim())
    return { success: false, error: "methodologyType is required" };
  if (!sectionType?.trim())
    return { success: false, error: "sectionType is required" };

  const validType = validateMethodologyType(methodologyType);
  if (!validType)
    return {
      success: false,
      error: `Invalid methodologyType: ${methodologyType}`,
    };

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await db.user.findUnique({ where: { clerkUserId } });
  if (!dbUser) return { success: false, error: "User not found" };
  const userId = dbUser.id;

  const cacheKey = `methodology_section_${userId}_${buildCacheSlug(topic)}_${buildCacheSlug(validType)}_${buildCacheSlug(sectionType)}`;
  const cached = await getCached(cacheKey);
  if (cached) return { success: true, data: cached, fromCache: true };

  try {
    const prompt = `Write the "${sectionType}" section of a ${validType} research methodology for the topic: "${topic.trim()}". Be academic, specific, and actionable.`;

    const content = await generateSectionWithGroq(prompt);

    const result = {
      topic: topic.trim(),
      methodologyType: validType,
      sectionType: sectionType.trim(),
      content,
      generatedAt: new Date().toISOString(),
    };

    await setCached(cacheKey, result);

    return { success: true, data: result, fromCache: false };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate methodology section",
    };
  }
}

export async function compareMethodologies({ topic, types = [] }) {
  if (!topic?.trim()) return { success: false, error: "topic is required" };
  if (!Array.isArray(types) || types.length < 2)
    return { success: false, error: "At least 2 methodology types required" };

  const validTypes = types.map(validateMethodologyType).filter(Boolean);

  if (validTypes.length < 2)
    return {
      success: false,
      error: "At least 2 valid methodology types required",
    };

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await db.user.findUnique({ where: { clerkUserId } });
  if (!dbUser) return { success: false, error: "User not found" };
  const userId = dbUser.id;

  const typeSlug = validTypes.sort().join("_");
  const cacheKey = `methodology_compare_${userId}_${buildCacheSlug(topic)}_${buildCacheSlug(typeSlug)}`;
  const cached = await getCached(cacheKey);
  if (cached) return { success: true, data: cached, fromCache: true };

  try {
    if (!groq) throw new Error("Groq API not configured");

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 2048,
      messages: [
        {
          role: "system",
          content: `You are an expert research methodology advisor.
Respond with a valid JSON object containing:
  - "comparison": { "type": string, "strengths": string[], "weaknesses": string[], "bestFor": string }[] (one per methodology)
  - "recommendation": string (which is best for this topic and why)
  - "hybrid": string | null (suggestion for combining approaches if applicable)
Do not include any text outside the JSON object.`,
        },
        {
          role: "user",
          content: `Compare these research methodologies for the topic "${topic.trim()}": ${validTypes.join(", ")}. Which is most suitable?`,
        },
      ],
    });

    const raw = completion.choices?.[0]?.message?.content ?? "";
    const clean = raw.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      const jsonMatch = clean.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : clean);
    } catch {
      throw new Error("Groq returned invalid JSON for comparison");
    }

    const result = {
      topic: topic.trim(),
      types: validTypes,
      comparison: Array.isArray(parsed?.comparison) ? parsed.comparison : [],
      recommendation:
        typeof parsed?.recommendation === "string" ? parsed.recommendation : "",
      hybrid: typeof parsed?.hybrid === "string" ? parsed.hybrid : null,
      generatedAt: new Date().toISOString(),
    };

    await setCached(cacheKey, result);

    return { success: true, data: result, fromCache: false };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to compare methodologies",
    };
  }
}

export async function saveMethodology(methodologyData) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await db.user.findUnique({ where: { clerkUserId } });
  if (!dbUser) return { success: false, error: "User not found" };
  const userId = dbUser.id;

  if (!methodologyData?.topic?.trim() || !methodologyData?.methodologyType) {
    return { success: false, error: "Invalid methodology data" };
  }

  try {
    const existing = await db.savedMethodology.findFirst({
      where: {
        userId,
        topic: methodologyData.topic.trim(),
        methodologyType: methodologyData.methodologyType,
      },
    });

    if (existing) {
      const updated = await db.savedMethodology.update({
        where: { id: existing.id },
        data: {
          methodologyData,
        },
      });
      return { success: true, data: updated };
    }

    const saved = await db.savedMethodology.create({
      data: {
        userId,
        topic: methodologyData.topic.trim(),
        methodologyType: methodologyData.methodologyType,
        methodologyData,
      },
    });

    return { success: true, data: saved };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to save methodology",
    };
  }
}

export async function getSavedMethodologies() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await db.user.findUnique({ where: { clerkUserId } });
  if (!dbUser) return { success: false, error: "User not found" };
  const userId = dbUser.id;

  try {
    const methodologies = await db.savedMethodology.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        topic: true,
        methodologyType: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return { success: true, data: methodologies };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch saved methodologies",
    };
  }
}

export async function getSavedMethodologyById(methodologyId) {
  if (!methodologyId)
    return { success: false, error: "methodologyId is required" };

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await db.user.findUnique({ where: { clerkUserId } });
  if (!dbUser) return { success: false, error: "User not found" };
  const userId = dbUser.id;

  try {
    const record = await db.savedMethodology.findUnique({
      where: { id: methodologyId },
    });

    if (!record) return { success: false, error: "Methodology not found" };
    if (record.userId !== userId) return { success: false, error: "Forbidden" };

    const methodologyData = record.methodologyData;
    return { success: true, data: { ...record, methodologyData } };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch methodology",
    };
  }
}

export async function deleteSavedMethodology(methodologyId) {
  if (!methodologyId)
    return { success: false, error: "methodologyId is required" };

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await db.user.findUnique({ where: { clerkUserId } });
  if (!dbUser) return { success: false, error: "User not found" };
  const userId = dbUser.id;

  try {
    const record = await db.savedMethodology.findUnique({
      where: { id: methodologyId },
    });

    if (!record) return { success: false, error: "Methodology not found" };
    if (record.userId !== userId) return { success: false, error: "Forbidden" };

    await db.savedMethodology.delete({ where: { id: methodologyId } });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete methodology",
    };
  }
}

export async function getMethodologyTypes() {
  return {
    success: true,
    data: [
      {
        id: "qualitative",
        label: "Qualitative",
        description:
          "In-depth exploration of phenomena through non-numerical data",
      },
      {
        id: "quantitative",
        label: "Quantitative",
        description:
          "Statistical analysis of numerical data to test hypotheses",
      },
      {
        id: "mixed-methods",
        label: "Mixed Methods",
        description: "Combines qualitative and quantitative approaches",
      },
      {
        id: "experimental",
        label: "Experimental",
        description:
          "Controlled experiments to establish cause-effect relationships",
      },
      {
        id: "survey",
        label: "Survey",
        description: "Structured data collection from a sample population",
      },
      {
        id: "case-study",
        label: "Case Study",
        description: "In-depth investigation of a specific instance or group",
      },
      {
        id: "systematic-review",
        label: "Systematic Review",
        description: "Comprehensive synthesis of existing research literature",
      },
      {
        id: "action-research",
        label: "Action Research",
        description: "Iterative research aimed at solving practical problems",
      },
    ],
  };
}

// ─── Prompt Builder ───────────────────────────────────────────────────────────

function buildMethodologyPrompt({
  topic,
  methodologyType,
  objectives,
  targetPopulation,
  constraints,
}) {
  const objectivesText = objectives.length
    ? `Research objectives: ${objectives.join("; ")}.`
    : "";
  const populationText = targetPopulation
    ? `Target population: ${targetPopulation}.`
    : "";
  const constraintsText = constraints.length
    ? `Constraints: ${constraints.join(", ")}.`
    : "";

  return `Generate a complete ${methodologyType} research methodology for the topic: "${topic}". ${objectivesText} ${populationText} ${constraintsText} Provide a detailed, academically rigorous methodology plan.`.trim();
}