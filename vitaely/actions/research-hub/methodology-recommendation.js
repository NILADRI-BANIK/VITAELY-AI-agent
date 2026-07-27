"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import Groq from "groq-sdk";
import { analyzeLiteratureForTopic } from "./literature-analysis";
import { calculateCochranSampleSize } from "@/lib/sample-size";
import { recommendStatisticalApproach } from "./statistics-recommender";
import { recommendValidationStrategy } from "./validation-engine";
import {
  buildMethodologyCacheKey,
  getCachedMethodologyData,
  setCachedMethodologyData,
} from "./methodology-cache";

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

const VALID_METHODOLOGY_TYPES = [
  "qualitative",
  "quantitative",
  "mixed-methods",
  "experimental",
  "survey",
  "case-study",
  "systematic-review",
  "action-research",
];

const RESEARCH_DESIGN_LIBRARY = [
  "Experimental",
  "Quasi-Experimental",
  "Survey",
  "Case Study",
  "Exploratory",
  "Descriptive",
  "Correlational",
  "Cross-Sectional",
  "Longitudinal",
];

const SAMPLING_TECHNIQUE_LIBRARY = [
  "Simple Random Sampling",
  "Stratified Sampling",
  "Cluster Sampling",
  "Convenience Sampling",
  "Purposive Sampling",
  "Snowball Sampling",
  "Systematic Sampling",
];

function validateMethodologyType(type) {
  return VALID_METHODOLOGY_TYPES.includes(type?.toLowerCase())
    ? type.toLowerCase()
    : null;
}

function buildLiteratureContext(literatureAnalysis) {
  if (!literatureAnalysis) return "No literature analysis available.";

  const dist = literatureAnalysis.methodologyDistribution;
  const distText = dist?.distribution?.length
    ? dist.distribution
        .map((d) => `${d.type}: ${d.percentage}% (${d.count} papers)`)
        .join(", ")
    : "No clear methodology distribution detected.";

  const sampleStats = literatureAnalysis.sampleSizeStats;
  const sampleText =
    sampleStats?.count > 0
      ? `Sample sizes observed across ${sampleStats.count} papers: min ${sampleStats.min}, max ${sampleStats.max}, median ${sampleStats.median}.`
      : "No sample size data extracted from literature.";

  const validationText = literatureAnalysis.validationMethods?.length
    ? `Common validation methods: ${literatureAnalysis.validationMethods
        .slice(0, 5)
        .map((v) => v.method)
        .join(", ")}.`
    : "No validation method patterns detected.";

  const populationText = literatureAnalysis.populationHints?.length
    ? `Population hints from literature: ${literatureAnalysis.populationHints
        .slice(0, 5)
        .join("; ")}.`
    : "No population hints detected.";

  return [
    `Methodology distribution across ${literatureAnalysis.totalUniquePapers} papers: ${distText}`,
    sampleText,
    validationText,
    populationText,
    literatureAnalysis.aiSummary?.recommendedFocus
      ? `Literature-derived recommendation: ${literatureAnalysis.aiSummary.recommendedFocus}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");
}

async function generateRecommendationWithGroq({
  topic,
  methodologyType,
  researchObjectives,
  targetPopulation,
  constraints,
  literatureContext,
}) {
  if (!groq) throw new Error("Groq API not configured");

  const objectivesText = researchObjectives.length
    ? `Research objectives: ${researchObjectives.join("; ")}.`
    : "";
  const populationText = targetPopulation
    ? `Target population (user-specified): ${targetPopulation}.`
    : "";
  const constraintsText = constraints.length
    ? `Constraints: ${constraints.join(", ")}.`
    : "";

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
    max_tokens: 2048,
    messages: [
      {
        role: "system",
        content: `You are an expert research methodology advisor. Base your recommendations on the provided literature evidence where possible, and state your confidence honestly.
Respond with a valid JSON object containing:
  - "researchDesign": { "recommendation": string, "reason": string, "confidence": number (0-100) }
  - "population": { "recommendation": string, "reason": string, "confidence": number (0-100) }
  - "samplingTechnique": { "recommendation": string, "reason": string, "confidence": number (0-100) }
  - "dataCollection": { "recommendation": string, "reason": string, "confidence": number (0-100) }
  - "instruments": { "name": string, "reason": string }[] (2-4 instruments/tools)
  - "variables": { "independent": string[], "dependent": string[], "moderator": string[], "mediator": string[], "control": string[] }
  - "overallConfidence": number (0-100, weighted average confidence across all recommendations)
Do not include any text outside the JSON object.`,
      },
      {
        role: "user",
        content: `Topic: "${topic}"
Methodology type: ${methodologyType}
${objectivesText}
${populationText}
${constraintsText}

Literature evidence:
${literatureContext}`,
      },
    ],
  });

  const raw = completion.choices?.[0]?.message?.content ?? "";
  const clean = raw.replace(/```json|```/g, "").trim();
  const jsonMatch = clean.match(/\{[\s\S]*\}/);

  let parsed;
  try {
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : clean);
  } catch {
    throw new Error("Groq returned invalid JSON");
  }

  const safeField = (field) =>
    field &&
    typeof field.recommendation === "string" &&
    typeof field.reason === "string"
      ? {
          recommendation: field.recommendation,
          reason: field.reason,
          confidence:
            typeof field.confidence === "number"
              ? Math.max(0, Math.min(100, field.confidence))
              : 50,
        }
      : { recommendation: "", reason: "", confidence: 0 };

  return {
    researchDesign: safeField(parsed.researchDesign),
    population: safeField(parsed.population),
    samplingTechnique: safeField(parsed.samplingTechnique),
    dataCollection: safeField(parsed.dataCollection),
    instruments: Array.isArray(parsed.instruments)
      ? parsed.instruments.filter(
          (i) => i && typeof i.name === "string" && typeof i.reason === "string",
        )
      : [],
    variables: {
      independent: Array.isArray(parsed.variables?.independent)
        ? parsed.variables.independent.filter((v) => typeof v === "string")
        : [],
      dependent: Array.isArray(parsed.variables?.dependent)
        ? parsed.variables.dependent.filter((v) => typeof v === "string")
        : [],
      moderator: Array.isArray(parsed.variables?.moderator)
        ? parsed.variables.moderator.filter((v) => typeof v === "string")
        : [],
      mediator: Array.isArray(parsed.variables?.mediator)
        ? parsed.variables.mediator.filter((v) => typeof v === "string")
        : [],
      control: Array.isArray(parsed.variables?.control)
        ? parsed.variables.control.filter((v) => typeof v === "string")
        : [],
    },
    overallConfidence:
      typeof parsed.overallConfidence === "number"
        ? Math.max(0, Math.min(100, parsed.overallConfidence))
        : 50,
  };
}

export async function generateMethodologyRecommendation({
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

  const validType = validateMethodologyType(methodologyType);
  if (!validType)
    return { success: false, error: `Invalid methodologyType: ${methodologyType}` };

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await db.user.findUnique({ where: { clerkUserId } });
  if (!dbUser) return { success: false, error: "User not found" };
  const userId = dbUser.id;

  const safeObjectives = Array.isArray(researchObjectives)
    ? researchObjectives
    : [];
  const safeConstraints = Array.isArray(constraints) ? constraints : [];

  const cacheKey = buildMethodologyCacheKey(
    "methodology_recommendation",
    userId,
    topic,
    validType,
    useLiteratureEvidence ? "with-lit" : "no-lit",
    dataType ?? "na",
    analysisGoal ?? "na",
    modelType ?? "none",
  );

  const cached = await getCachedMethodologyData(cacheKey);
  if (cached) return { success: true, data: cached, fromCache: true };

  try {
    let literatureAnalysis = null;
    if (useLiteratureEvidence) {
      const litResult = await analyzeLiteratureForTopic({
        topic: topic.trim(),
        methodologyType: validType,
        paperLimit: 20,
      });
      if (litResult.success) {
        literatureAnalysis = litResult.data;
      }
    }

    const literatureContext = buildLiteratureContext(literatureAnalysis);

    const aiRecommendation = await generateRecommendationWithGroq({
      topic: topic.trim(),
      methodologyType: validType,
      researchObjectives: safeObjectives,
      targetPopulation: targetPopulation?.trim() ?? "",
      constraints: safeConstraints,
      literatureContext,
    });

    let sampleSizeSuggestion = null;
    let sampleSizeWarning = null;
    try {
      sampleSizeSuggestion = calculateCochranSampleSize({
        population: estimatedPopulationSize,
      });
    } catch (sizeError) {
      sampleSizeSuggestion = null;
      sampleSizeWarning =
        sizeError instanceof Error ? sizeError.message : "Failed to calculate sample size";
    }

    let statisticsRecommendation = null;
    if (dataType && analysisGoal) {
      const statsResult = await recommendStatisticalApproach({
        topic: topic.trim(),
        dataType,
        analysisGoal,
        sampleSize: sampleSizeSuggestion?.sampleSize ?? null,
      });
      if (statsResult.success) {
        statisticsRecommendation = statsResult.data;
      }
    }

    const validationResult = await recommendValidationStrategy({
      topic: topic.trim(),
      methodologyType: validType,
      modelType: modelType ?? "none",
      sampleSize: sampleSizeSuggestion?.sampleSize ?? null,
      recommendedTests: statisticsRecommendation?.recommendedTests ?? [],
    });
    const validationRecommendation = validationResult.success
      ? validationResult.data
      : null;

    const result = {
      topic: topic.trim(),
      methodologyType: validType,
      researchObjectives: safeObjectives,
      targetPopulation: targetPopulation?.trim() ?? "",
      constraints: safeConstraints,
      literatureBacked: Boolean(literatureAnalysis),
      literatureSummary: literatureAnalysis
        ? {
            totalPapers: literatureAnalysis.totalUniquePapers,
            methodologyDistribution: literatureAnalysis.methodologyDistribution,
            sampleSizeStats: literatureAnalysis.sampleSizeStats,
          }
        : null,
      recommendation: aiRecommendation,
      statisticsRecommendation,
      validationRecommendation,
      sampleSizeSuggestion,
      sampleSizeWarning,
      generatedAt: new Date().toISOString(),
    };

    await setCachedMethodologyData(cacheKey, result);

    return { success: true, data: result, fromCache: false };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate methodology recommendation",
    };
  }
}

export async function getResearchDesignLibrary() {
  return { success: true, data: RESEARCH_DESIGN_LIBRARY };
}

export async function getSamplingTechniqueLibrary() {
  return { success: true, data: SAMPLING_TECHNIQUE_LIBRARY };
}