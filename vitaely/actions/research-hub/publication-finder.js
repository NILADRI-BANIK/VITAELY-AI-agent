"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { searchJournals as fetchDoajJournals } from "@/lib/doaj";
import { fetchCrossrefJournals } from "@/lib/crossref";
import { searchVenues as fetchDblpVenues } from "@/lib/dblp";

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
      update: { data: JSON.stringify(data), updatedAt: new Date() },
      create: { cacheKey, data: JSON.stringify(data) },
    });
  } catch {
    // non-fatal
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildCacheSlug(str) {
  return String(str).toLowerCase().replace(/\s+/g, "_").slice(0, 50);
}

async function getDbUser(clerkUserId) {
  return db.user.findUnique({ where: { clerkUserId } });
}

function normalizeDoajJournal(j) {
  if (!j) return null;
  return {
    id: j.id ?? j.issns?.[0] ?? null,
    title: j.title ?? "",
    publisher: j.publisher ?? "",
    issn: j.issns?.[0] ?? null,
    url: j.url ?? null,
    openAccess: true,
    impactFactor: null,
    subjects: Array.isArray(j.subjects) ? j.subjects : [],
    language: Array.isArray(j.language) ? j.language : [],
    reviewProcess: Array.isArray(j.reviewProcess)
      ? j.reviewProcess[0] ?? null
      : j.reviewProcess ?? null,
    type: "journal",
    source: "doaj",
  };
}

function normalizeCrossrefJournal(j) {
  if (!j) return null;
  return {
    id: j.ISSN?.[0] ?? j.DOI ?? null,
    title: Array.isArray(j.title) ? j.title[0] : (j.title ?? ""),
    publisher: j.publisher ?? "",
    issn: j.ISSN?.[0] ?? null,
    url: j.URL ?? null,
    openAccess: false,
    impactFactor: null,
    subjects: Array.isArray(j.subject) ? j.subject : [],
    language: [],
    reviewProcess: null,
    type: "journal",
    source: "crossref",
  };
}

function normalizeDblpVenue(v) {
  if (!v) return null;
  return {
    id: v.url ?? v.acronym ?? null,
    title: v.venue ?? v.title ?? "",
    publisher: v.publisher ?? "DBLP",
    issn: null,
    url: v.url ?? null,
    openAccess: false,
    impactFactor: null,
    subjects: ["Computer Science"],
    language: ["English"],
    reviewProcess: "peer-reviewed",
    type:
      typeof v.type === "string" && v.type.toLowerCase().includes("conf")
        ? "conference"
        : "journal",
    source: "dblp",
  };
}

function deduplicateVenues(venues) {
  const seen = new Map();
  for (const v of venues) {
    if (!v) continue;
    const key = v.issn ?? v.id ?? v.title?.toLowerCase().trim();
    if (!key) continue;
    if (!seen.has(key)) seen.set(key, v);
  }
  return Array.from(seen.values());
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export async function searchPublications({ query, type = "all", limit = 20 }) {
  if (!query?.trim()) return { success: false, error: "query is required" };

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  const safeLimit = Math.min(Number(limit) || 20, 50);
  const validTypes = ["all", "journal", "conference", "workshop"];
  const safeType = validTypes.includes(type) ? type : "all";
  const cacheKey = `pub_search_${dbUser.id}_${buildCacheSlug(query)}_${safeType}`;

  const cached = await getCached(cacheKey);
  if (cached) return { success: true, data: cached, fromCache: true };

  try {
    const [doajResult, crossrefResult, dblpResult] = await Promise.allSettled([
      safeType === "conference"
        ? Promise.resolve({ results: [] })
        : fetchDoajJournals(query.trim(), { pageSize: safeLimit }),
      safeType === "conference"
        ? Promise.resolve([])
        : fetchCrossrefJournals({ query: query.trim(), limit: safeLimit }),
      safeType === "journal"
        ? Promise.resolve({ results: [] })
        : fetchDblpVenues(query.trim(), { hits: safeLimit }),
    ]);

    const doaj =
      doajResult.status === "fulfilled"
        ? (Array.isArray(doajResult.value)
            ? doajResult.value
            : (doajResult.value?.results ?? [])
          )
            .map(normalizeDoajJournal)
            .filter(Boolean)
        : [];

    const crossref =
      crossrefResult.status === "fulfilled"
        ? (Array.isArray(crossrefResult.value)
            ? crossrefResult.value
            : (crossrefResult.value?.message?.items ??
              crossrefResult.value?.items ??
              [])
          )
            .map(normalizeCrossrefJournal)
            .filter(Boolean)
        : [];

    const dblp =
      dblpResult.status === "fulfilled"
        ? (Array.isArray(dblpResult.value)
            ? dblpResult.value
            : (dblpResult.value?.results ?? [])
          )
            .map(normalizeDblpVenue)
            .filter(Boolean)
        : [];

    const merged = deduplicateVenues([...doaj, ...crossref, ...dblp]).slice(
      0,
      safeLimit,
    );

    await setCached(cacheKey, merged);
    return { success: true, data: merged, fromCache: false };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to search publications",
    };
  }
}

export async function getOpenAccessJournals({ query, limit = 20 }) {
  if (!query?.trim()) return { success: false, error: "query is required" };

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  const safeLimit = Math.min(Number(limit) || 20, 50);
  const cacheKey = `oa_journals_${dbUser.id}_${buildCacheSlug(query)}`;
  const cached = await getCached(cacheKey);
  if (cached) return { success: true, data: cached, fromCache: true };

  try {
    const result = await fetchDoajJournals(query.trim(), {
      pageSize: safeLimit,
    });

    const journals = (
      Array.isArray(result) ? result : (result?.results ?? [])
    )
      .map(normalizeDoajJournal)
      .filter(Boolean)
      .slice(0, safeLimit);

    await setCached(cacheKey, journals);
    return { success: true, data: journals, fromCache: false };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch open access journals",
    };
  }
}

export async function getCSConferences({ query, limit = 20 }) {
  if (!query?.trim()) return { success: false, error: "query is required" };

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  const safeLimit = Math.min(Number(limit) || 20, 50);
  const cacheKey = `cs_conferences_${dbUser.id}_${buildCacheSlug(query)}`;
  const cached = await getCached(cacheKey);
  if (cached) return { success: true, data: cached, fromCache: true };

  try {
    const result = await fetchDblpVenues(query.trim(), { hits: safeLimit });

    const conferences = (
      Array.isArray(result) ? result : (result?.results ?? [])
    )
      .map(normalizeDblpVenue)
      .filter((v) => v && v.type === "conference")
      .slice(0, safeLimit);

    await setCached(cacheKey, conferences);
    return { success: true, data: conferences, fromCache: false };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch CS conferences",
    };
  }
}

export async function getJournalsBySubject({ subject, limit = 20 }) {
  if (!subject?.trim()) return { success: false, error: "subject is required" };

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  const safeLimit = Math.min(Number(limit) || 20, 50);
  const cacheKey = `journals_subject_${dbUser.id}_${buildCacheSlug(subject)}`;
  const cached = await getCached(cacheKey);
  if (cached) return { success: true, data: cached, fromCache: true };

  try {
    const [doajResult, crossrefResult] = await Promise.allSettled([
      fetchDoajJournals(subject.trim(), { pageSize: safeLimit }),
      fetchCrossrefJournals({ query: subject.trim(), limit: safeLimit }),
    ]);

    const doaj =
      doajResult.status === "fulfilled"
        ? (Array.isArray(doajResult.value)
            ? doajResult.value
            : (doajResult.value?.results ?? [])
          )
            .map(normalizeDoajJournal)
            .filter(Boolean)
        : [];

    const crossref =
      crossrefResult.status === "fulfilled"
        ? (Array.isArray(crossrefResult.value)
            ? crossrefResult.value
            : (crossrefResult.value?.message?.items ??
              crossrefResult.value?.items ??
              [])
          )
            .map(normalizeCrossrefJournal)
            .filter(Boolean)
        : [];

    const merged = deduplicateVenues([...doaj, ...crossref]).slice(
      0,
      safeLimit,
    );

    await setCached(cacheKey, merged);
    return { success: true, data: merged, fromCache: false };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch journals by subject",
    };
  }
}

export async function getPublicationDetails({ id, source }) {
  if (!id) return { success: false, error: "id is required" };
  if (!source) return { success: false, error: "source is required" };

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  const validSources = ["doaj", "crossref", "dblp"];
  if (!validSources.includes(source)) {
    return { success: false, error: "Invalid source" };
  }

  const cacheKey = `pub_detail_${dbUser.id}_${buildCacheSlug(source)}_${buildCacheSlug(String(id))}`;
  const cached = await getCached(cacheKey);
  if (cached) return { success: true, data: cached, fromCache: true };

  try {
    let normalized = null;

    if (source === "doaj") {
      const result = await fetchDoajJournals(String(id), { pageSize: 1 });
      const raw = Array.isArray(result)
        ? result[0]
        : (result?.results ?? [])[0];
      normalized = normalizeDoajJournal(raw ?? null);
    } else if (source === "crossref") {
      const result = await fetchCrossrefJournals({
        query: String(id),
        limit: 1,
      });
      const raw = Array.isArray(result)
        ? result[0]
        : (result?.message?.items ?? result?.items ?? [])[0];
      normalized = normalizeCrossrefJournal(raw ?? null);
    } else if (source === "dblp") {
      const result = await fetchDblpVenues(String(id), { hits: 1 });
      const raw = Array.isArray(result)
        ? result[0]
        : (result?.results ?? [])[0];
      normalized = normalizeDblpVenue(raw ?? null);
    }

    if (!normalized) {
      return { success: false, error: "Publication not found" };
    }

    await setCached(cacheKey, normalized);
    return { success: true, data: normalized, fromCache: false };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch publication details",
    };
  }
}

export async function savePublication(publication) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  const pubId = publication?.id ?? publication?.issn ?? publication?.url;
  if (!pubId || !publication?.title?.trim()) {
    return { success: false, error: "Invalid publication data" };
  }

  try {
    const existing = await db.savedPublication.findFirst({
      where: { userId: dbUser.id, publicationId: String(pubId) },
    });

    if (existing) return { success: false, error: "Publication already saved" };

    const saved = await db.savedPublication.create({
      data: {
        userId: dbUser.id,
        publicationId: String(pubId),
        title: publication.title.trim(),
        publisher: publication.publisher ?? null,
        issn: publication.issn ?? null,
        url: publication.url ?? null,
        openAccess: publication.openAccess ?? false,
        type: publication.type ?? "journal",
        source: publication.source ?? "unknown",
        subjects: Array.isArray(publication.subjects)
          ? publication.subjects
          : [],
      },
    });

    return { success: true, data: saved };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to save publication",
    };
  }
}

export async function getSavedPublications() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  try {
    const publications = await db.savedPublication.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: publications };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch saved publications",
    };
  }
}

export async function deleteSavedPublication(savedPublicationId) {
  if (!savedPublicationId)
    return { success: false, error: "savedPublicationId is required" };

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  try {
    const record = await db.savedPublication.findUnique({
      where: { id: savedPublicationId },
    });

    if (!record) return { success: false, error: "Publication not found" };
    if (record.userId !== dbUser.id)
      return { success: false, error: "Forbidden" };

    await db.savedPublication.delete({ where: { id: savedPublicationId } });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete saved publication",
    };
  }
}