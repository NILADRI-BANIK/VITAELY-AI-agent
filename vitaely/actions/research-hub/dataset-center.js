"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { fetchKaggleDatasets } from "@/lib/kaggle";
import { fetchHuggingFaceDatasets } from "@/lib/huggingface-datasets";
import { fetchZenodoDatasets } from "@/lib/zenodo";

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildCacheSlug(str) {
  return String(str).toLowerCase().replace(/\s+/g, "_").slice(0, 50);
}

function normalizeKaggleDataset(d) {
  if (!d) return null;
  return {
    id: d.ref ?? d.id ?? null,
    title: d.title ?? "",
    description: d.subtitle ?? d.description ?? "",
    url: d.url ?? (d.ref ? `https://www.kaggle.com/datasets/${d.ref}` : null),
    size: d.totalBytes ?? d.size ?? null,
    downloadCount: d.downloadCount ?? d.totalDownloads ?? 0,
    voteCount: d.voteCount ?? d.totalVotes ?? 0,
    tags: Array.isArray(d.tags) ? d.tags.map((t) => t.name ?? t) : [],
    license: d.licenseName ?? d.license ?? null,
    lastUpdated: d.lastUpdated ?? d.updatedAt ?? null,
    source: "kaggle",
  };
}

function normalizeHuggingFaceDataset(d) {
  if (!d) return null;
  return {
    id: d.id ?? d.modelId ?? null,
    title: d.id ?? d.name ?? "",
    description: d.description ?? d.cardData?.description ?? "",
    url: d.id ? `https://huggingface.co/datasets/${d.id}` : null,
    size: null,
    downloadCount: d.downloads ?? d.downloadsAllTime ?? 0,
    voteCount: d.likes ?? 0,
    tags: Array.isArray(d.tags) ? d.tags : [],
    license: d.cardData?.license ?? d.license ?? null,
    lastUpdated: d.lastModified ?? d.updatedAt ?? null,
    source: "huggingface",
  };
}

function normalizeZenodoDataset(d) {
  if (!d) return null;
  const meta = d.metadata ?? d;
  return {
    id: d.id ?? d.doi ?? null,
    title: meta.title ?? d.title ?? "",
    description: meta.description ?? d.description ?? "",
    url: d.links?.html || (d.doi ? `https://doi.org/${d.doi}` : null),
    size: null,
    downloadCount: d.stats?.downloads ?? 0,
    voteCount: 0,
    tags: Array.isArray(meta.keywords) ? meta.keywords : [],
    license: meta.license?.id ?? meta.license ?? null,
    lastUpdated: meta.publication_date ?? d.updated ?? null,
    source: "zenodo",
  };
}

function deduplicateDatasets(datasets) {
  const seen = new Map();
  for (const d of datasets) {
    if (!d) continue;
    const key = d.id ?? d.title?.toLowerCase().trim();
    if (!key) continue;
    if (!seen.has(key)) seen.set(key, d);
  }
  return Array.from(seen.values());
}

// ─── Exports ─────────────────────────────────────────────────────────────────

export async function getDatasets({ query = "", limit = 20 } = {}) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const dbUser = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!dbUser) return { success: false, error: "User not found" };

  const safeLimit = Math.min(Number(limit) || 20, 50);
  const slug = query.trim() ? buildCacheSlug(query) : "all";
  const cacheKey = `datasets_${dbUser.id}_${slug}`;

  const cached = await getCached(cacheKey);
  if (cached) return { success: true, data: cached, fromCache: true };

  try {
    const [kaggleResult, hfResult, zenodoResult] = await Promise.allSettled([
      fetchKaggleDatasets({
        search: query.trim() || undefined,
        limit: safeLimit,
      }),
      fetchHuggingFaceDatasets({
        search: query.trim() || undefined,
        limit: safeLimit,
      }),
      fetchZenodoDatasets({
        query: query.trim() || undefined,
        limit: safeLimit,
      }),
    ]);

    const kaggle =
      kaggleResult.status === "fulfilled"
        ? (Array.isArray(kaggleResult.value)
            ? kaggleResult.value
            : (kaggleResult.value?.results ??
              kaggleResult.value?.datasets ??
              [])
          )
            .map(normalizeKaggleDataset)
            .filter(Boolean)
        : [];

    const hf =
      hfResult.status === "fulfilled"
        ? (Array.isArray(hfResult.value)
            ? hfResult.value
            : (hfResult.value?.datasets ?? [])
          )
            .map(normalizeHuggingFaceDataset)
            .filter(Boolean)
        : [];

    const zenodo =
      zenodoResult.status === "fulfilled"
        ? (Array.isArray(zenodoResult.value)
            ? zenodoResult.value
            : (zenodoResult.value?.hits?.hits ??
              zenodoResult.value?.results ??
              [])
          )
            .map(normalizeZenodoDataset)
            .filter(Boolean)
        : [];

    const merged = deduplicateDatasets([...kaggle, ...hf, ...zenodo]).slice(
      0,
      safeLimit,
    );

    await setCached(cacheKey, merged);

    return { success: true, data: merged, fromCache: false };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch datasets",
    };
  }
}

export async function getDatasetsByCategory({ category, limit = 20 }) {
  if (!category?.trim())
    return { success: false, error: "category is required" };

  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const dbUser = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!dbUser) return { success: false, error: "User not found" };

  const safeLimit = Math.min(Number(limit) || 20, 50);
  const cacheKey = `datasets_category_${dbUser.id}_${buildCacheSlug(category)}`;

  const cached = await getCached(cacheKey);
  if (cached) return { success: true, data: cached, fromCache: true };

  try {
    const [kaggleResult, hfResult, zenodoResult] = await Promise.allSettled([
      fetchKaggleDatasets({ search: category.trim(), limit: safeLimit }),
      fetchHuggingFaceDatasets({ search: category.trim(), limit: safeLimit }),
      fetchZenodoDatasets({ query: category.trim(), limit: safeLimit }),
    ]);

    const kaggle =
      kaggleResult.status === "fulfilled"
        ? (Array.isArray(kaggleResult.value)
            ? kaggleResult.value
            : (kaggleResult.value?.results ??
              kaggleResult.value?.datasets ??
              [])
          )
            .map(normalizeKaggleDataset)
            .filter(Boolean)
        : [];

    const hf =
      hfResult.status === "fulfilled"
        ? (Array.isArray(hfResult.value)
            ? hfResult.value
            : (hfResult.value?.datasets ?? [])
          )
            .map(normalizeHuggingFaceDataset)
            .filter(Boolean)
        : [];

    const zenodo =
      zenodoResult.status === "fulfilled"
        ? (Array.isArray(zenodoResult.value)
            ? zenodoResult.value
            : (zenodoResult.value?.hits?.hits ??
              zenodoResult.value?.results ??
              [])
          )
            .map(normalizeZenodoDataset)
            .filter(Boolean)
        : [];

    const merged = deduplicateDatasets([...kaggle, ...hf, ...zenodo]).slice(
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
          : "Failed to fetch datasets by category",
    };
  }
}

export async function getTrendingDatasets({ limit = 20 } = {}) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const dbUser = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!dbUser) return { success: false, error: "User not found" };

  const safeLimit = Math.min(Number(limit) || 20, 50);
  const cacheKey = `datasets_trending_${dbUser.id}`;

  const cached = await getCached(cacheKey);
  if (cached) return { success: true, data: cached, fromCache: true };

  try {
    const [kaggleResult, hfResult] = await Promise.allSettled([
      fetchKaggleDatasets({ limit: safeLimit, sortBy: "hottest" }),
      fetchHuggingFaceDatasets({ limit: safeLimit, sort: "trending" }),
    ]);

    const kaggle =
      kaggleResult.status === "fulfilled"
        ? (Array.isArray(kaggleResult.value)
            ? kaggleResult.value
            : (kaggleResult.value?.results ??
              kaggleResult.value?.datasets ??
              [])
          )
            .map(normalizeKaggleDataset)
            .filter(Boolean)
        : [];

    const hf =
      hfResult.status === "fulfilled"
        ? (Array.isArray(hfResult.value)
            ? hfResult.value
            : (hfResult.value?.datasets ?? [])
          )
            .map(normalizeHuggingFaceDataset)
            .filter(Boolean)
        : [];

    const merged = deduplicateDatasets([...kaggle, ...hf])
      .sort((a, b) => (b.downloadCount ?? 0) - (a.downloadCount ?? 0))
      .slice(0, safeLimit);

    await setCached(cacheKey, merged);

    return { success: true, data: merged, fromCache: false };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch trending datasets",
    };
  }
}

export async function getDatasetDetails({ datasetId, source }) {
  if (!datasetId) return { success: false, error: "datasetId is required" };
  if (!source) return { success: false, error: "source is required" };

  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const dbUser = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!dbUser) return { success: false, error: "User not found" };

  const cacheKey = `dataset_detail_${dbUser.id}_${buildCacheSlug(source)}_${buildCacheSlug(String(datasetId))}`;
  const cached = await getCached(cacheKey);
  if (cached) return { success: true, data: cached, fromCache: true };

  try {
    let normalized = null;

    if (source === "kaggle") {
      const results = await fetchKaggleDatasets({
        search: String(datasetId),
        limit: 1,
      });
      const raw = Array.isArray(results)
        ? results[0]
        : (results?.results ?? results?.datasets ?? [])[0];
      normalized = normalizeKaggleDataset(raw ?? null);
    } else if (source === "huggingface") {
      const results = await fetchHuggingFaceDatasets({
        search: String(datasetId),
        limit: 1,
      });
      const raw = Array.isArray(results)
        ? results[0]
        : (results?.datasets ?? [])[0];
      normalized = normalizeHuggingFaceDataset(raw ?? null);
    } else if (source === "zenodo") {
      const results = await fetchZenodoDatasets({
        query: String(datasetId),
        limit: 1,
      });
      const raw = Array.isArray(results)
        ? results[0]
        : (results?.hits?.hits ?? results?.results ?? [])[0];
      normalized = normalizeZenodoDataset(raw ?? null);
    } else {
      return { success: false, error: "Invalid source" };
    }

    if (!normalized) {
      return { success: false, error: "Dataset not found" };
    }

    await setCached(cacheKey, normalized);

    return { success: true, data: normalized, fromCache: false };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch dataset details",
    };
  }
}

export async function searchDatasets({ query, limit = 20 }) {
  if (!query?.trim()) return { success: false, error: "query is required" };

  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const dbUser = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!dbUser) return { success: false, error: "User not found" };

  const safeLimit = Math.min(Number(limit) || 20, 50);
  const cacheKey = `datasets_search_${dbUser.id}_${buildCacheSlug(query)}`;

  const cached = await getCached(cacheKey);
  if (cached) return { success: true, data: cached, fromCache: true };

  try {
    const [kaggleResult, hfResult, zenodoResult] = await Promise.allSettled([
      fetchKaggleDatasets({ search: query.trim(), limit: safeLimit }),
      fetchHuggingFaceDatasets({ search: query.trim(), limit: safeLimit }),
      fetchZenodoDatasets({ query: query.trim(), limit: safeLimit }),
    ]);

    const kaggle =
      kaggleResult.status === "fulfilled"
        ? (Array.isArray(kaggleResult.value)
            ? kaggleResult.value
            : (kaggleResult.value?.results ??
              kaggleResult.value?.datasets ??
              [])
          )
            .map(normalizeKaggleDataset)
            .filter(Boolean)
        : [];

    const hf =
      hfResult.status === "fulfilled"
        ? (Array.isArray(hfResult.value)
            ? hfResult.value
            : (hfResult.value?.datasets ?? [])
          )
            .map(normalizeHuggingFaceDataset)
            .filter(Boolean)
        : [];

    const zenodo =
      zenodoResult.status === "fulfilled"
        ? (Array.isArray(zenodoResult.value)
            ? zenodoResult.value
            : (zenodoResult.value?.hits?.hits ??
              zenodoResult.value?.results ??
              [])
          )
            .map(normalizeZenodoDataset)
            .filter(Boolean)
        : [];

    const merged = deduplicateDatasets([...kaggle, ...hf, ...zenodo]).slice(
      0,
      safeLimit,
    );

    await setCached(cacheKey, merged);

    return { success: true, data: merged, fromCache: false };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Search failed",
    };
  }
}

export async function saveDataset(dataset) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const datasetId = dataset?.id ?? dataset?.ref ?? dataset?.doi;
  if (!datasetId || !dataset?.title?.trim()) {
    return { success: false, error: "Invalid dataset data" };
  }

  const dbUser = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!dbUser) return { success: false, error: "User not found" };
  try {
    const existing = await db.savedDataset.findFirst({
      where: { userId: dbUser.id, datasetId: String(datasetId) },
    });

    if (existing) return { success: false, error: "Dataset already saved" };

    const saved = await db.savedDataset.create({
      data: {
        userId: dbUser.id,
        datasetId: String(datasetId),
        title: dataset.title.trim(),
        description: dataset.description ?? null,
        url: dataset.url ?? null,
        source: dataset.source ?? "unknown",
        tags: Array.isArray(dataset.tags) ? dataset.tags : [],
        license: dataset.license ?? null,
        downloadCount: dataset.downloadCount ?? 0,
      },
    });

    return { success: true, data: saved };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save dataset",
    };
  }
}

export async function getSavedDatasets() {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };
  const dbUser = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!dbUser) return { success: false, error: "User not found" };
  try {
    const datasets = await db.savedDataset.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: datasets };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch saved datasets",
    };
  }
}

export async function deleteSavedDataset(savedDatasetId) {
  if (!savedDatasetId)
    return { success: false, error: "savedDatasetId is required" };

  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };
  const dbUser = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!dbUser) return { success: false, error: "User not found" };
  try {
    const record = await db.savedDataset.findUnique({
      where: { id: savedDatasetId },
    });

    if (!record) return { success: false, error: "Dataset not found" };
    if (record.userId !== dbUser.id)
      return { success: false, error: "Forbidden" };

    await db.savedDataset.delete({ where: { id: savedDatasetId } });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete saved dataset",
    };
  }
}
