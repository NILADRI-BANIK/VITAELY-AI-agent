"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import Groq from "groq-sdk";
import {
  fetchOpenAlexSearch,
  getWorksByYearRange,
  getOpenAccessStats,
  getCitationStats,
} from "@/lib/openalex";

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

async function getDbUser(clerkUserId) {
  return db.user.findUnique({ where: { clerkUserId } });
}

function buildCacheSlug(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 50);
}

const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours

// ─── Cache Helpers ───────────────────────────────────────────────────────────

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

// ─── Groq Helper ─────────────────────────────────────────────────────────────

async function generateTopicsWithGroq(prompt) {
  if (!groq) throw new Error("Groq API not configured");
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.5,
    max_tokens: 1024,
    messages: [
      {
        role: "system",
        content: `You are a research topic recommendation engine.
Always respond with a valid JSON array of objects.
Each object must have:
  - "topic": string (concise research topic name)
  - "rationale": string (one sentence why it is relevant)
  - "keywords": string[] (3-5 search keywords)
Do not include any text outside the JSON array.`,
      },
      { role: "user", content: prompt },
    ],
  });

  const raw = completion.choices?.[0]?.message?.content ?? "";
  const clean = raw.replace(/```json|```/g, "").trim();

  let parsed;
  try {
    const jsonMatch = clean.match(/\[[\s\S]*\]/);
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : clean);
  } catch {
    throw new Error("Groq returned invalid JSON");
  }

  if (!Array.isArray(parsed)) throw new Error("Groq response is not an array");

  return parsed.filter(
    (t) =>
      t &&
      typeof t.topic === "string" &&
      typeof t.rationale === "string" &&
      Array.isArray(t.keywords),
  );
}

// ─── Scoring Helpers ─────────────────────────────────────────────────────────

function computeTrendScore(recentCount, olderCount) {
  if (recentCount == null || olderCount == null) return null;
  if (olderCount === 0 && recentCount === 0) return 0;
  if (olderCount === 0) return 100;
  const growth = ((recentCount - olderCount) / olderCount) * 100;
  return Math.max(0, Math.min(100, Math.round(50 + growth / 4)));
}

function computeNoveltyScore(totalPaperCount) {
  if (totalPaperCount == null) return null;
  if (totalPaperCount === 0) return 100;
  if (totalPaperCount < 500) return 85;
  if (totalPaperCount < 5000) return 65;
  if (totalPaperCount < 50000) return 40;
  return 15;
}

function computeFeasibilityScore(topic) {
  const text = `${topic.topic ?? ""} ${topic.rationale ?? ""} ${(topic.keywords ?? []).join(" ")}`.toLowerCase();
  const hardSignals = [
    "clinical",
    "hospital",
    "patient",
    "mri",
    "ethics approval",
    "proprietary",
    "confidential",
    "quantum hardware",
    "large-scale cluster",
  ];
  const easySignals = [
    "kaggle",
    "public dataset",
    "open dataset",
    "benchmark",
    "simulation",
    "synthetic",
  ];
  let score = 60;
  hardSignals.forEach((s) => {
    if (text.includes(s)) score -= 15;
  });
  easySignals.forEach((s) => {
    if (text.includes(s)) score += 10;
  });
  return Math.max(0, Math.min(100, score));
}

function computeHasDataset(topic) {
  const text = `${topic.topic ?? ""} ${topic.rationale ?? ""} ${(topic.keywords ?? []).join(" ")}`.toLowerCase();
  const datasetSignals = [
    "kaggle",
    "public dataset",
    "open dataset",
    "benchmark",
    "huggingface",
    "uci repository",
    "imagenet",
    "coco",
  ];
  return datasetSignals.some((s) => text.includes(s));
}

function computeCompetitionLevel(totalPaperCount) {
  if (totalPaperCount == null) return null;
  if (totalPaperCount < 1000) return "Low";
  if (totalPaperCount < 20000) return "Medium";
  return "High";
}

function computeCitationVelocity(citationStats) {
  if (!citationStats) return null;
  const { totalCitations, avgCitationsPerYear } = citationStats;
  if (avgCitationsPerYear == null) return null;
  return Math.round(avgCitationsPerYear);
}

// ─── OpenAlex Validation + Scoring ───────────────────────────────────────────

async function validateTopicsWithOpenAlex(topics) {
  const currentYear = new Date().getFullYear();

  const validated = await Promise.allSettled(
    topics.map(async (topic) => {
      try {
        const query = topic.keywords?.join(" ") || topic.topic;

        const [
          totalResults,
          recentResults,
          olderResults,
          openAccessResults,
          citationResults,
        ] = await Promise.allSettled([
          fetchOpenAlexSearch({ query, perPage: 1 }),
          getWorksByYearRange(query, currentYear - 2, currentYear),
          getWorksByYearRange(query, currentYear - 5, currentYear - 3),
          getOpenAccessStats(query),
          getCitationStats(query),
        ]);

        const totalCount =
          totalResults.status === "fulfilled"
            ? (totalResults.value?.meta?.count ??
              totalResults.value?.count ??
              totalResults.value?.total ??
              0)
            : 0;

        const recentCount =
          recentResults.status === "fulfilled"
            ? (recentResults.value?.meta?.count ?? 0)
            : null;

        const olderCount =
          olderResults.status === "fulfilled"
            ? (olderResults.value?.meta?.count ?? 0)
            : null;

        const openAccessRatio =
          openAccessResults.status === "fulfilled"
            ? (openAccessResults.value?.openAccessRatio ?? null)
            : null;

        const citationStats =
          citationResults.status === "fulfilled"
            ? citationResults.value
            : null;

        return {
          ...topic,
          paperCount: totalCount,
          trendScore: computeTrendScore(recentCount, olderCount),
          noveltyScore: computeNoveltyScore(totalCount),
          feasibilityScore: computeFeasibilityScore(topic),
          hasDataset: computeHasDataset(topic),
          competitionLevel: computeCompetitionLevel(totalCount),
          openAccessRatio,
          citationVelocity: computeCitationVelocity(citationStats),
          source: "OpenAlex",
          validated: true,
        };
      } catch {
        return {
          ...topic,
          paperCount: null,
          trendScore: null,
          noveltyScore: null,
          feasibilityScore: computeFeasibilityScore(topic),
          hasDataset: computeHasDataset(topic),
          competitionLevel: null,
          openAccessRatio: null,
          citationVelocity: null,
          source: "AI Generated",
          validated: false,
        };
      }
    }),
  );

  return validated
    .filter((r) => r.status === "fulfilled")
    .map((r) => r.value)
    .filter((t) => t.paperCount === null || t.paperCount > 0)
    .sort((a, b) => (b.paperCount ?? 0) - (a.paperCount ?? 0));
}

// ─── Exports ─────────────────────────────────────────────────────────────────

export async function getRecommendedTopics({
  industry,
  skills = [],
  interests = [],
  domainId = null,
  subfieldId = null,
}) {
  if (!industry?.trim())
    return { success: false, error: "Industry is required" };

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  const industrySlug = industry
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .slice(0, 50);

  const safeSkillsForCache = Array.isArray(skills) ? skills : [];
  const safeInterestsForCache = Array.isArray(interests) ? interests : [];
  const skillsSlug = safeSkillsForCache
    .map((s) => String(s).toLowerCase().trim())
    .sort()
    .join("-")
    .slice(0, 50);
  const interestsSlug = safeInterestsForCache
    .map((s) => String(s).toLowerCase().trim())
    .sort()
    .join("-")
    .slice(0, 50);
  const domainSlug = domainId ? buildCacheSlug(String(domainId)) : "";
  const subfieldSlug = subfieldId ? buildCacheSlug(String(subfieldId)) : "";
  const cacheKey = `topic_rec_${dbUser.id}_${industrySlug}_${skillsSlug}_${interestsSlug}_${domainSlug}_${subfieldSlug}`;
  const cached = await getCached(cacheKey);
  if (cached) return { success: true, data: cached, fromCache: true };

  try {
    const prompt = buildRecommendationPrompt({
      industry,
      skills,
      interests,
      domainId,
      subfieldId,
    });
    const rawTopics = await generateTopicsWithGroq(prompt);

    if (!rawTopics.length) {
      return { success: false, error: "No topics generated" };
    }

    const validated = await validateTopicsWithOpenAlex(rawTopics);

    if (!validated.length) {
      return {
        success: false,
        error: "No topics could be validated with real paper data",
      };
    }

    await setCached(cacheKey, validated);

    return { success: true, data: validated, fromCache: false };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get recommendations",
    };
  }
}

export async function getTopicsByDomain(domainId, subfieldId = null) {
  if (!domainId) return { success: false, error: "domainId is required" };

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  const cacheKey = `domain_topics_${dbUser.id}_${buildCacheSlug(String(domainId))}_${subfieldId ? buildCacheSlug(String(subfieldId)) : ""}`;

  const cached = await getCached(cacheKey);
  if (cached) return { success: true, data: cached, fromCache: true };

  try {
    const prompt = subfieldId
      ? `Suggest 8 specific research topics within the academic domain ID: "${domainId}", subfield ID: "${subfieldId}". Focus on emerging and high-impact areas.`
      : `Suggest 8 specific research topics within the academic domain ID: "${domainId}". Focus on emerging and high-impact areas.`;
    const rawTopics = await generateTopicsWithGroq(prompt);

    if (!rawTopics.length) {
      return { success: false, error: "No topics generated for domain" };
    }

    const validated = await validateTopicsWithOpenAlex(rawTopics);

    if (!validated.length) {
      return {
        success: false,
        error: "No topics could be validated with real paper data",
      };
    }

    await setCached(cacheKey, validated);

    return { success: true, data: validated, fromCache: false };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get domain topics",
    };
  }
}

export async function getTrendingTopics(field) {
  if (!field?.trim()) return { success: false, error: "Field is required" };

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  const cacheKey = `trending_topics_${dbUser.id}_${field.trim().toLowerCase().replace(/\s+/g, "_").slice(0, 50)}`;
  const cached = await getCached(cacheKey);
  if (cached) return { success: true, data: cached, fromCache: true };

  try {
    const currentYear = new Date().getFullYear();
    const prompt = `List 8 trending research topics in "${field}" as of ${currentYear}. Focus on topics gaining momentum in recent publications.`;
    const rawTopics = await generateTopicsWithGroq(prompt);

    if (!rawTopics.length) {
      return { success: false, error: "No trending topics generated" };
    }

    const validated = await validateTopicsWithOpenAlex(rawTopics);

    if (!validated.length) {
      return {
        success: false,
        error: "No topics could be validated with real paper data",
      };
    }

    await setCached(cacheKey, validated);

    return { success: true, data: validated, fromCache: false };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get trending topics",
    };
  }
}

export async function getSimilarTopics(topicName) {
  if (!topicName?.trim())
    return { success: false, error: "Topic name is required" };

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  const cacheKey = `similar_topics_${dbUser.id}_${topicName.trim().toLowerCase().replace(/\s+/g, "_").slice(0, 50)}`;
  const cached = await getCached(cacheKey);
  if (cached) return { success: true, data: cached, fromCache: true };

  try {
    const prompt = `Suggest 6 research topics closely related to "${topicName}". Include adjacent and interdisciplinary areas.`;
    const rawTopics = await generateTopicsWithGroq(prompt);

    if (!rawTopics.length) {
      return { success: false, error: "No similar topics generated" };
    }

    const validated = await validateTopicsWithOpenAlex(rawTopics);

    if (!validated.length) {
      return {
        success: false,
        error: "No topics could be validated with real paper data",
      };
    }

    await setCached(cacheKey, validated);

    return { success: true, data: validated, fromCache: false };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get similar topics",
    };
  }
}

export async function saveTopicToProfile(topic) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  if (!topic?.topic?.trim()) {
    return { success: false, error: "Invalid topic data" };
  }

  try {
    const normalizedTopic = topic.topic.trim().toLowerCase();

    const existing = await db.savedResearchTopic.findFirst({
      where: { userId: dbUser.id, topicName: normalizedTopic },
    });

    if (existing) {
      return { success: false, error: "Topic already saved", data: existing };
    }

    const saved = await db.savedResearchTopic.create({
      data: {
        userId: dbUser.id,
        topicName: normalizedTopic,
        rationale: topic.rationale ?? "",
        keywords: topic.keywords ?? [],
        paperCount: topic.paperCount ?? 0,
        trendScore: topic.trendScore ?? null,
        noveltyScore: topic.noveltyScore ?? null,
        feasibilityScore: topic.feasibilityScore ?? null,
        competitionLevel: topic.competitionLevel ?? null,
        hasDataset: topic.hasDataset ?? false,
        openAccessRatio: topic.openAccessRatio ?? null,
        domainId: topic.domainId ?? null,
        subfieldId: topic.subfieldId ?? null,
      },
    });

    return { success: true, data: saved };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save topic",
    };
  }
}

export async function getSavedTopics() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  try {
    const topics = await db.savedResearchTopic.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: topics };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch saved topics",
    };
  }
}

export async function deleteSavedTopic(topicId) {
  if (!topicId) return { success: false, error: "topicId is required" };

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  try {
    const record = await db.savedResearchTopic.findUnique({
      where: { id: topicId },
    });
    if (!record) return { success: false, error: "Topic not found" };
    if (record.userId !== dbUser.id)
      return { success: false, error: "Forbidden" };

    await db.savedResearchTopic.delete({ where: { id: topicId } });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete topic",
    };
  }
}

// ─── Prompt Builder ──────────────────────────────────────────────────────────

function buildRecommendationPrompt({
  industry,
  skills,
  interests,
  domainId,
  subfieldId,
}) {
  const safeSkills = Array.isArray(skills) ? skills : [];
  const safeInterests = Array.isArray(interests) ? interests : [];
  const skillsText = safeSkills.length
    ? `Skills: ${safeSkills.join(", ")}.`
    : "";
  const interestsText = safeInterests.length
    ? `Interests: ${safeInterests.join(", ")}.`
    : "";
  const contextText = domainId
    ? `Context: within academic domain "${domainId}"${subfieldId ? `, subfield "${subfieldId}"` : ""}.`
    : "";
  return `Suggest 8 specific, actionable research topics for someone working in "${industry}". ${skillsText} ${interestsText} ${contextText} Focus on topics with strong academic publication activity.`.trim();
}