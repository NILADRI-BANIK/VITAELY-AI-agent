"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { fetchSemanticScholarPapers } from "@/lib/semantic-scholar";
import { fetchArxivPapers } from "@/lib/arxiv";
import { fetchCorePapers } from "@/lib/core";

const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours

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
    return cached.data;
  } catch {
    return null;
  }
}

async function setCached(cacheKey, data) {
  try {
    await db.researchCache.upsert({
      where: { cacheKey },
      // NEW
      update: { data, updatedAt: new Date() },
      create: { cacheKey, data },
    });
  } catch {
    // non-fatal
  }
}

// ADD — after setCached() function
async function getDbUser(clerkUserId) {
  return db.user.findUnique({ where: { clerkUserId } });
}
// ─── Normalization Helpers ────────────────────────────────────────────────────

function normalizeSemanticPaper(paper) {
  if (!paper) return null;
  return {
    id: paper.paperId ?? paper.externalIds?.DOI ?? null,
    title: paper.title ?? "",
    abstract: paper.abstract ?? "",
    authors: Array.isArray(paper.authors)
      ? paper.authors.map((a) => a.name ?? "").filter(Boolean)
      : [],
    year: paper.year ?? null,
    citationCount: paper.citationCount ?? 0,
    referenceCount: paper.referenceCount ?? 0,
    url:
      paper.url ??
      (paper.externalIds?.DOI
        ? `https://doi.org/${paper.externalIds.DOI}`
        : null),
    openAccess: paper.isOpenAccess ?? false,
    source: "semantic-scholar",
    doi: paper.externalIds?.DOI ?? null,
    fieldsOfStudy: Array.isArray(paper.fieldsOfStudy)
      ? paper.fieldsOfStudy
      : [],
  };
}

function normalizeArxivPaper(paper) {
  if (!paper) return null;
  return {
    id: paper.id ?? paper.arxivId ?? null,
    title: paper.title ?? "",
    abstract: paper.summary ?? paper.abstract ?? "",
    authors: Array.isArray(paper.authors)
      ? paper.authors.map((a) => a.name ?? a).filter(Boolean)
      : [],
    year: paper.published ? new Date(paper.published).getFullYear() : null,
    citationCount: 0,
    referenceCount: 0,
    url: paper.link ?? paper.id ?? null,
    openAccess: true,
    source: "arxiv",
    doi: paper.doi ?? null,
    fieldsOfStudy: Array.isArray(paper.categories) ? paper.categories : [],
  };
}

function normalizeCorePaper(paper) {
  if (!paper) return null;
  return {
    id: paper.id ?? paper.doi ?? null,
    title: paper.title ?? "",
    abstract: paper.abstract ?? paper.description ?? "",
    authors: Array.isArray(paper.authors)
      ? paper.authors.map((a) => a.name ?? a).filter(Boolean)
      : [],
    year: paper.yearPublished ?? paper.year ?? null,
    citationCount: paper.citationCount ?? 0,
    referenceCount: 0,
    url:
      paper.downloadUrl ?? paper.fullTextLink ?? paper.links?.[0]?.url ?? null,
    openAccess: true,
    source: "core",
    doi: paper.doi ?? null,
    fieldsOfStudy: [],
  };
}

function deduplicatePapers(papers) {
  const seen = new Map();
  for (const paper of papers) {
    if (!paper) continue;
    const key = paper.doi ?? paper.id ?? paper.title?.toLowerCase().trim();
    if (!key) continue;
    if (!seen.has(key)) seen.set(key, paper);
  }
  return Array.from(seen.values());
}

// NEW
function buildCacheSlug(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 50);
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export async function getLatestPapers({ query, limit = 20 }) {
  if (!query?.trim()) return { success: false, error: "query is required" };

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  // NEW
  const cacheKey = `latest_papers_${dbUser.id}_${buildCacheSlug(query)}`;
  const cached = await getCached(cacheKey);
  if (cached) return { success: true, data: cached, fromCache: true };

  try {
    const safeLimit = Math.min(Number(limit) || 20, 50);

    const [semanticResult, arxivResult, coreResult] = await Promise.allSettled([
      fetchSemanticScholarPapers({
        query: query.trim(),
        limit: safeLimit,
        sort: "recency",
      }),
      fetchArxivPapers({
        query: query.trim(),
        maxResults: safeLimit,
        sortBy: "submittedDate",
      }),
      fetchCorePapers({ query: query.trim(), limit: safeLimit }),
    ]);

    const semanticPapers =
      semanticResult.status === "fulfilled"
        ? (semanticResult.value?.data ?? semanticResult.value ?? [])
            .map(normalizeSemanticPaper)
            .filter(Boolean)
        : [];

    const arxivPapers =
      arxivResult.status === "fulfilled"
        ? (arxivResult.value?.entries ?? arxivResult.value ?? [])
            .map(normalizeArxivPaper)
            .filter(Boolean)
        : [];

    const corePapers =
      coreResult.status === "fulfilled"
        ? (coreResult.value?.results ?? coreResult.value ?? [])
            .map(normalizeCorePaper)
            .filter(Boolean)
        : [];

    const merged = deduplicatePapers([
      ...semanticPapers,
      ...arxivPapers,
      ...corePapers,
    ]);
    const sorted = merged
      .sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
      .slice(0, safeLimit);

    await setCached(cacheKey, sorted);

    return { success: true, data: sorted, fromCache: false };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch latest papers",
    };
  }
}

export async function getMostCitedPapers({ query, limit = 20 }) {
  if (!query?.trim()) return { success: false, error: "query is required" };

  // NEW
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  const cacheKey = `cited_papers_${dbUser.id}_${buildCacheSlug(query)}`;
  const cached = await getCached(cacheKey);
  if (cached) return { success: true, data: cached, fromCache: true };

  try {
    const safeLimit = Math.min(Number(limit) || 20, 50);

    const [semanticResult, coreResult] = await Promise.allSettled([
      fetchSemanticScholarPapers({
        query: query.trim(),
        limit: safeLimit,
        sort: "citationCount",
      }),
      fetchCorePapers({ query: query.trim(), limit: safeLimit }),
    ]);

    const semanticPapers =
      semanticResult.status === "fulfilled"
        ? (semanticResult.value?.data ?? semanticResult.value ?? [])
            .map(normalizeSemanticPaper)
            .filter(Boolean)
        : [];

    const corePapers =
      coreResult.status === "fulfilled"
        ? (coreResult.value?.results ?? coreResult.value ?? [])
            .map(normalizeCorePaper)
            .filter(Boolean)
        : [];

    const merged = deduplicatePapers([...semanticPapers, ...corePapers]);
    const sorted = merged
      .sort((a, b) => (b.citationCount ?? 0) - (a.citationCount ?? 0))
      .slice(0, safeLimit);

    await setCached(cacheKey, sorted);

    return { success: true, data: sorted, fromCache: false };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch cited papers",
    };
  }
}

export async function getSurveyPapers({ query, limit = 20 }) {
  if (!query?.trim()) return { success: false, error: "query is required" };

  // NEW
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  const cacheKey = `survey_papers_${dbUser.id}_${buildCacheSlug(query)}`;
  const cached = await getCached(cacheKey);
  if (cached) return { success: true, data: cached, fromCache: true };

  try {
    const safeLimit = Math.min(Number(limit) || 20, 50);
    const surveyQuery = `survey review ${query.trim()}`;

    const [semanticResult, arxivResult, coreResult] = await Promise.allSettled([
      fetchSemanticScholarPapers({ query: surveyQuery, limit: safeLimit }),
      fetchArxivPapers({ query: surveyQuery, maxResults: safeLimit }),
      fetchCorePapers({ query: surveyQuery, limit: safeLimit }),
    ]);

    const semanticPapers =
      semanticResult.status === "fulfilled"
        ? (semanticResult.value?.data ?? semanticResult.value ?? [])
            .map(normalizeSemanticPaper)
            .filter(Boolean)
        : [];

    const arxivPapers =
      arxivResult.status === "fulfilled"
        ? (arxivResult.value?.entries ?? arxivResult.value ?? [])
            .map(normalizeArxivPaper)
            .filter(Boolean)
        : [];

    const corePapers =
      coreResult.status === "fulfilled"
        ? (coreResult.value?.results ?? coreResult.value ?? [])
            .map(normalizeCorePaper)
            .filter(Boolean)
        : [];

    const merged = deduplicatePapers([
      ...semanticPapers,
      ...arxivPapers,
      ...corePapers,
    ]);

    const surveys = merged
      .filter((p) => {
        const t = (p.title ?? "").toLowerCase();
        return (
          t.includes("survey") || t.includes("review") || t.includes("overview")
        );
      })
      .slice(0, safeLimit);

    const result = surveys.length ? surveys : merged.slice(0, safeLimit);

    await setCached(cacheKey, result);

    return { success: true, data: result, fromCache: false };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch survey papers",
    };
  }
}

export async function getPapersByAuthor({ authorName, limit = 20 }) {
  if (!authorName?.trim())
    return { success: false, error: "authorName is required" };

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  const cacheKey = `author_papers_${dbUser.id}_${buildCacheSlug(authorName)}`;
  const cached = await getCached(cacheKey);
  if (cached) return { success: true, data: cached, fromCache: true };

  try {
    const safeLimit = Math.min(Number(limit) || 20, 50);

    const [semanticResult, arxivResult] = await Promise.allSettled([
      fetchSemanticScholarPapers({
        query: authorName.trim(),
        limit: safeLimit,
        searchFields: "author",
      }),
      fetchArxivPapers({
        query: `au:${authorName.trim()}`,
        maxResults: safeLimit,
      }),
    ]);

    const semanticPapers =
      semanticResult.status === "fulfilled"
        ? (semanticResult.value?.data ?? semanticResult.value ?? [])
            .map(normalizeSemanticPaper)
            .filter(Boolean)
        : [];

    const arxivPapers =
      arxivResult.status === "fulfilled"
        ? (arxivResult.value?.entries ?? arxivResult.value ?? [])
            .map(normalizeArxivPaper)
            .filter(Boolean)
        : [];

    const merged = deduplicatePapers([...semanticPapers, ...arxivPapers])
      .sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
      .slice(0, safeLimit);

    await setCached(cacheKey, merged);

    return { success: true, data: merged, fromCache: false };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch author papers",
    };
  }
}

export async function getOpenAccessPapers({ query, limit = 20 }) {
  if (!query?.trim()) return { success: false, error: "query is required" };

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  const cacheKey = `oa_papers_${dbUser.id}_${buildCacheSlug(query)}`;
  const cached = await getCached(cacheKey);
  if (cached) return { success: true, data: cached, fromCache: true };

  try {
    const safeLimit = Math.min(Number(limit) || 20, 50);

    const [semanticResult, arxivResult, coreResult] = await Promise.allSettled([
      fetchSemanticScholarPapers({
        query: query.trim(),
        limit: safeLimit,
        openAccessOnly: true,
      }),
      fetchArxivPapers({ query: query.trim(), maxResults: safeLimit }),
      fetchCorePapers({ query: query.trim(), limit: safeLimit }),
    ]);

    const semanticPapers =
      semanticResult.status === "fulfilled"
        ? (semanticResult.value?.data ?? semanticResult.value ?? [])
            .map(normalizeSemanticPaper)
            .filter((p) => p && p.openAccess)
        : [];

    const arxivPapers =
      arxivResult.status === "fulfilled"
        ? (arxivResult.value?.entries ?? arxivResult.value ?? [])
            .map(normalizeArxivPaper)
            .filter(Boolean)
        : [];

    const corePapers =
      coreResult.status === "fulfilled"
        ? (coreResult.value?.results ?? coreResult.value ?? [])
            .map(normalizeCorePaper)
            .filter(Boolean)
        : [];

    const merged = deduplicatePapers([
      ...semanticPapers,
      ...arxivPapers,
      ...corePapers,
    ])
      .sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
      .slice(0, safeLimit);

    await setCached(cacheKey, merged);

    return { success: true, data: merged, fromCache: false };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch open access papers",
    };
  }
}

export async function savePaper(paper) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  const rawPaperId = paper?.id ?? paper?.paperId ?? paper?.doi ?? paper?.url;
  const paperId = rawPaperId != null ? String(rawPaperId).trim() : "";
  if (!paperId || !paper?.title?.trim()) {
    return { success: false, error: "Invalid paper data" };
  }

  try {
    const existing = await db.savedPaper.findUnique({
      where: { userId_paperId: { userId: dbUser.id, paperId } },
    });

    if (existing) return { success: false, error: "Paper already saved" };

    const saved = await db.savedPaper.create({
      data: {
        userId: dbUser.id,
        paperId,
        title: paper.title.trim(),
        abstract: paper.abstract ?? "",
        authors: Array.isArray(paper.authors) ? paper.authors : [],
        year: paper.year ?? null,
        citationCount: paper.citationCount ?? 0,
        paperUrl: paper.url ?? null,
        openAccess: paper.openAccess ?? false,
        source: paper.source ?? "unknown",
        doi: paper.doi ?? null,
      },
    });

    return { success: true, data: saved };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save paper",
    };
  }
}

export async function getSavedPapers() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  try {
    const papers = await db.savedPaper.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: papers };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch saved papers",
    };
  }
}

// NEW
export async function deleteSavedPaper(savedPaperId) {
  if (!savedPaperId)
    return { success: false, error: "savedPaperId is required" };

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  try {
    const record = await db.savedPaper.findUnique({
      where: { id: savedPaperId },
    });
    if (!record) return { success: false, error: "Paper not found" };
    if (record.userId !== dbUser.id)
      return { success: false, error: "Forbidden" };

    await db.savedPaper.delete({ where: { id: savedPaperId } });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete saved paper",
    };
  }
}
