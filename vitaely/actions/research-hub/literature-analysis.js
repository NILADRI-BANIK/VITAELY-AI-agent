"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import Groq from "groq-sdk";
import {
  searchWorks as searchOpenAlexWorks,
  getPapersPerYear,
} from "@/lib/openalex";
import { searchPapers as searchSemanticScholarPapers } from "@/lib/semantic-scholar";
import { searchWorks as searchCrossrefWorks } from "@/lib/crossref";
import {
  buildCacheSlug,
  buildMethodologyCacheKey,
  getCachedMethodologyData,
  setCachedMethodologyData,
} from "./methodology-cache";

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

const METHODOLOGY_KEYWORDS = {
  quantitative: [
    "quantitative",
    "statistical analysis",
    "regression",
    "survey questionnaire",
    "numerical data",
  ],
  qualitative: [
    "qualitative",
    "interview",
    "thematic analysis",
    "grounded theory",
    "case study",
    "ethnograph",
  ],
  "mixed-methods": ["mixed method", "mixed-method", "triangulation"],
  experimental: [
    "experimental design",
    "randomized controlled",
    "control group",
    "treatment group",
  ],
  survey: ["survey design", "questionnaire", "likert"],
  "case-study": ["case study", "case-study"],
  "systematic-review": [
    "systematic review",
    "meta-analysis",
    "prisma",
    "literature review",
  ],
  "action-research": ["action research", "participatory research"],
};

const VALIDATION_KEYWORDS = [
  "cross-validation",
  "cross validation",
  "k-fold",
  "holdout",
  "bootstrap",
  "cronbach",
  "cronbach's alpha",
  "test-retest",
  "inter-rater",
  "kappa",
  "rmsea",
  "confirmatory factor",
  "precision",
  "recall",
  "f1-score",
  "f1 score",
  "auc",
  "roc curve",
  "pilot study",
  "expert validation",
];

function extractAbstractText(abstract) {
  if (!abstract) return "";
  if (typeof abstract === "string") return abstract;
  return "";
}

function reconstructOpenAlexAbstract(invertedIndex) {
  if (!invertedIndex || typeof invertedIndex !== "object") return "";
  const positions = [];
  Object.entries(invertedIndex).forEach(([word, idxArr]) => {
    idxArr.forEach((idx) => {
      positions[idx] = word;
    });
  });
  return positions.filter(Boolean).join(" ");
}

function detectMethodologyType(text) {
  const lower = text.toLowerCase();
  const scores = {};

  Object.entries(METHODOLOGY_KEYWORDS).forEach(([type, keywords]) => {
    scores[type] = keywords.reduce(
      (count, kw) => count + (lower.includes(kw) ? 1 : 0),
      0,
    );
  });

  const [bestType, bestScore] = Object.entries(scores).sort(
    (a, b) => b[1] - a[1],
  )[0];

  return bestScore > 0 ? bestType : null;
}

function detectValidationMethods(text) {
  const lower = text.toLowerCase();
  return VALIDATION_KEYWORDS.filter((kw) => lower.includes(kw));
}

function extractSampleSize(text) {
  if (!text) return null;
  const patterns = [
    /\bn\s*=\s*(\d{2,6})\b/i,
    /\bsample\s+size\s+of\s+(\d{2,6})\b/i,
    /\b(\d{2,6})\s+participants\b/i,
    /\b(\d{2,6})\s+respondents\b/i,
    /\b(\d{2,6})\s+subjects\b/i,
];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const value = parseInt(match[1], 10);
      if (!Number.isNaN(value) && value > 0 && value < 10000000) {
        return value;
      }
    }
  }
  return null;
}

function extractPopulationHint(text) {
  if (!text) return null;
  const patterns = [
    /(?:among|of)\s+([a-z][a-z\s]{3,60}?)\s+(?:were|was|in|from)/i,
    /(?:population\s+of|target\s+population[:\s]+)([a-z][a-z\s]{3,60})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  return null;
}

async function fetchOpenAlexPapers(topic, limit) {
  try {
    const data = await searchOpenAlexWorks(topic, { perPage: limit });
    const results = data?.results ?? [];
    return results.map((w) => ({
      source: "openalex",
      id: w.id ?? null,
      title: w.title ?? w.display_name ?? "",
      abstract: reconstructOpenAlexAbstract(w.abstract_inverted_index),
      year: w.publication_year ?? null,
      citationCount: w.cited_by_count ?? 0,
      doi: w.doi ?? null,
      url: w.id ?? null,
      openAccess: w.open_access?.is_oa ?? false,
    }));
  } catch {
    return [];
  }
}

async function fetchSemanticScholarPapersInternal(topic, limit) {
  try {
    const data = await searchSemanticScholarPapers(topic, { limit });
    const results = data?.data ?? [];
    return results.map((p) => ({
      source: "semantic_scholar",
      id: p.paperId ?? null,
      title: p.title ?? "",
      abstract: extractAbstractText(p.abstract),
      year: p.year ?? null,
      citationCount: p.citationCount ?? 0,
      doi: p.externalIds?.DOI ?? null,
      url: p.url ?? null,
      openAccess: Boolean(p.openAccessPdf),
    }));
  } catch {
    return [];
  }
}

async function fetchCrossrefPapers(topic, limit) {
  try {
    const data = await searchCrossrefWorks(topic, { rows: limit });
    const items = data?.items ?? [];
    return items.map((w) => ({
      source: "crossref",
      id: w.doi ?? null,
      title: w.title ?? "",
      abstract: extractAbstractText(w.abstract),
      year: w.year ?? null,
      citationCount: w.citationCount ?? 0,
      doi: w.doi ?? null,
      url: w.url ?? null,
      openAccess: w.openAccess ?? false,
    }));
  } catch {
    return [];
  }
}

function deduplicatePapers(papers) {
  const seen = new Set();
  const unique = [];

  for (const paper of papers) {
    const key = (paper.doi || paper.title || "").toLowerCase().trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    unique.push(paper);
  }

  return unique;
}

function analyzePaper(paper) {
  const combinedText = `${paper.title ?? ""} ${paper.abstract ?? ""}`;

  const methodologyType = detectMethodologyType(combinedText);
  const validationMethods = detectValidationMethods(combinedText);
  const sampleSize = extractSampleSize(combinedText);
  const populationHint = extractPopulationHint(combinedText);

  return {
    ...paper,
    detectedMethodologyType: methodologyType,
    detectedValidationMethods: validationMethods,
    detectedSampleSize: sampleSize,
    detectedPopulationHint: populationHint,
    hasExtractableData: Boolean(
      methodologyType || validationMethods.length || sampleSize,
    ),
  };
}

function aggregateMethodologyDistribution(analyzedPapers) {
  const counts = {};
  let totalWithType = 0;

  analyzedPapers.forEach((p) => {
    if (!p.detectedMethodologyType) return;
    counts[p.detectedMethodologyType] =
      (counts[p.detectedMethodologyType] || 0) + 1;
    totalWithType += 1;
  });

  const distribution = Object.entries(counts)
    .map(([type, count]) => ({
      type,
      count,
      percentage:
        totalWithType > 0 ? Number(((count / totalWithType) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    distribution,
    totalAnalyzedWithType: totalWithType,
    dominantMethodology: distribution[0]?.type ?? null,
    dominantMethodologyConfidence: distribution[0]?.percentage ?? 0,
  };
}

function aggregateValidationMethods(analyzedPapers) {
  const counts = {};

  analyzedPapers.forEach((p) => {
    (p.detectedValidationMethods || []).forEach((method) => {
      counts[method] = (counts[method] || 0) + 1;
    });
  });

  return Object.entries(counts)
    .map(([method, count]) => ({ method, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function aggregateSampleSizes(analyzedPapers) {
  const sizes = analyzedPapers
    .map((p) => p.detectedSampleSize)
    .filter((s) => typeof s === "number" && s > 0);

  if (sizes.length === 0) {
    return { count: 0, min: null, max: null, median: null, average: null };
  }

  const sorted = [...sizes].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 !== 0
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;
  const average = sizes.reduce((sum, s) => sum + s, 0) / sizes.length;

  return {
    count: sizes.length,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    median: Math.round(median),
    average: Math.round(average),
    allValues: sizes,
  };
}

async function generateLiteratureSummaryWithGroq(topic, analyzedPapers) {
  if (!groq) return null;

  const paperSummaries = analyzedPapers
    .slice(0, 15)
    .map(
      (p, i) =>
        `${i + 1}. "${p.title}" (${p.year ?? "n.d."}, ${p.citationCount} citations) - Detected methodology: ${p.detectedMethodologyType ?? "unclear"}`,
    )
    .join("\n");

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 1024,
      messages: [
        {
          role: "system",
          content: `You are a research literature analyst. Respond with a valid JSON object containing:
  - "keyFindings": string[] (3-5 key methodological patterns observed across papers)
  - "researchGapObservation": string (1-2 sentences on what's underexplored)
  - "recommendedFocus": string (1-2 sentences on what methodology fits this topic best)
Do not include any text outside the JSON object.`,
        },
        {
          role: "user",
          content: `Topic: "${topic}"\n\nAnalyzed papers:\n${paperSummaries}`,
        },
      ],
    });

    const raw = completion.choices?.[0]?.message?.content ?? "";
    const clean = raw.replace(/```json|```/g, "").trim();
    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : clean);

    return {
      keyFindings: Array.isArray(parsed.keyFindings) ? parsed.keyFindings : [],
      researchGapObservation:
        typeof parsed.researchGapObservation === "string"
          ? parsed.researchGapObservation
          : "",
      recommendedFocus:
        typeof parsed.recommendedFocus === "string"
          ? parsed.recommendedFocus
          : "",
    };
  } catch {
    return null;
  }
}

export async function analyzeLiteratureForTopic({
  topic,
  methodologyType = null,
  paperLimit = 20,
  includeSemanticScholar = true,
  includeCrossref = true,
}) {
  if (!topic?.trim()) return { success: false, error: "topic is required" };

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await db.user.findUnique({ where: { clerkUserId } });
  if (!dbUser) return { success: false, error: "User not found" };
  const userId = dbUser.id;

  const cacheKey = buildMethodologyCacheKey(
    "literature_analysis",
    userId,
    topic,
    methodologyType ?? "any",
  );

  const cached = await getCachedMethodologyData(cacheKey);
  if (cached) return { success: true, data: cached, fromCache: true };

  try {
    const perSourceLimit = Math.max(5, Math.ceil(paperLimit / 3));

    const fetchTasks = [fetchOpenAlexPapers(topic.trim(), perSourceLimit)];
    if (includeSemanticScholar) {
      fetchTasks.push(
        fetchSemanticScholarPapersInternal(topic.trim(), perSourceLimit),
      );
    }
    if (includeCrossref) {
      fetchTasks.push(fetchCrossrefPapers(topic.trim(), perSourceLimit));
    }

    const results = await Promise.allSettled(fetchTasks);
    const rawPapers = results
      .filter((r) => r.status === "fulfilled")
      .flatMap((r) => r.value);

    const uniquePapers = deduplicatePapers(rawPapers).slice(0, paperLimit);
    const analyzedPapers = uniquePapers.map(analyzePaper);

    let publicationTrend = [];
    try {
      publicationTrend = await getPapersPerYear(topic.trim());
    } catch {
      publicationTrend = [];
    }

    const methodologyDistribution =
      aggregateMethodologyDistribution(analyzedPapers);
    const validationMethods = aggregateValidationMethods(analyzedPapers);
    const sampleSizeStats = aggregateSampleSizes(analyzedPapers);

    const populationHints = analyzedPapers
      .map((p) => p.detectedPopulationHint)
      .filter(Boolean)
      .slice(0, 10);

    const aiSummary = await generateLiteratureSummaryWithGroq(
      topic.trim(),
      analyzedPapers,
    );

    const result = {
      topic: topic.trim(),
      methodologyTypeFilter: methodologyType,
      totalPapersFetched: rawPapers.length,
      totalUniquePapers: uniquePapers.length,
      papers: analyzedPapers,
      methodologyDistribution,
      validationMethods,
      sampleSizeStats,
      populationHints,
      publicationTrend,
      aiSummary,
      sourcesUsed: [
        "openalex",
        ...(includeSemanticScholar ? ["semantic_scholar"] : []),
        ...(includeCrossref ? ["crossref"] : []),
      ],
      generatedAt: new Date().toISOString(),
    };

    await setCachedMethodologyData(cacheKey, result);

    return { success: true, data: result, fromCache: false };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to analyze literature",
    };
  }
}

export async function saveLiteratureAnalysis(analysisData) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await db.user.findUnique({ where: { clerkUserId } });
  if (!dbUser) return { success: false, error: "User not found" };
  const userId = dbUser.id;

  if (!analysisData?.topic?.trim()) {
    return { success: false, error: "Invalid analysis data" };
  }

  try {
    const saved = await db.literatureAnalysis.create({
      data: {
        userId,
        topic: analysisData.topic.trim(),
        methodologyType: analysisData.methodologyTypeFilter ?? null,
        paperCount: analysisData.totalUniquePapers ?? 0,
        analysisData,
      },
    });
    return { success: true, data: saved };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to save literature analysis",
    };
  }
}

export async function getSavedLiteratureAnalyses() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await db.user.findUnique({ where: { clerkUserId } });
  if (!dbUser) return { success: false, error: "User not found" };
  const userId = dbUser.id;

  try {
    const analyses = await db.literatureAnalysis.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        topic: true,
        methodologyType: true,
        paperCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return { success: true, data: analyses };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch literature analyses",
    };
  }
}

export async function getLiteratureAnalysisById(analysisId) {
  if (!analysisId) return { success: false, error: "analysisId is required" };

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await db.user.findUnique({ where: { clerkUserId } });
  if (!dbUser) return { success: false, error: "User not found" };
  const userId = dbUser.id;

  try {
    const record = await db.literatureAnalysis.findUnique({
      where: { id: analysisId },
    });

    if (!record) return { success: false, error: "Analysis not found" };
    if (record.userId !== userId) return { success: false, error: "Forbidden" };

    return { success: true, data: record };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch literature analysis",
    };
  }
}

export async function deleteLiteratureAnalysis(analysisId) {
  if (!analysisId) return { success: false, error: "analysisId is required" };

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await db.user.findUnique({ where: { clerkUserId } });
  if (!dbUser) return { success: false, error: "User not found" };
  const userId = dbUser.id;

  try {
    const record = await db.literatureAnalysis.findUnique({
      where: { id: analysisId },
    });

    if (!record) return { success: false, error: "Analysis not found" };
    if (record.userId !== userId) return { success: false, error: "Forbidden" };

    await db.literatureAnalysis.delete({ where: { id: analysisId } });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete literature analysis",
    };
  }
}