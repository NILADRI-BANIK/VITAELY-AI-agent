"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import {
  fetchOpenAlexDomains,
  fetchOpenAlexSubfields,
  searchOpenAlexSubfieldsByName,
  fetchOpenAlexTopics,
} from "@/lib/openalex";
import { fetchSemanticScholarTopics } from "@/lib/semantic-scholar";

const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

const CURATED_DOMAINS = [
  "Computer Science",
  "Engineering",
  "Information Technology",
  "Mathematics",
  "Formal Sciences",
  "Business",
  "Economics",
  "Social Sciences",
  "Political Science",
  "Law",
  "Education",
  "Psychology",
  "Health Sciences",
  "Medicine",
  "Life Sciences",
  "Environmental Sciences",
  "Physical Sciences",
  "Language & Linguistics",
  "Arts & Humanities",
  "Philosophy",
];

async function getCachedDomains(cacheKey) {
  try {
    const cached = await db.researchCache.findUnique({
      where: { cacheKey },
    });
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

async function setCachedDomains(cacheKey, data) {
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

export async function getResearchDomains() {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const cacheKey = "research_domains_curated";
  const cached = await getCachedDomains(cacheKey);
  if (cached) return { success: true, data: cached, fromCache: true };

  try {
    const openAlexDomains = await fetchOpenAlexDomains({ perPage: 20 });
    const curated = buildCuratedDomainList(openAlexDomains);

    await setCachedDomains(cacheKey, curated);

    return { success: true, data: curated, fromCache: false };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch domains",
    };
  }
}

export async function getSubfieldsByDomain(domainId) {
  if (!domainId) return { success: false, error: "domainId is required" };

  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const isNumericOpenAlexId =
    /^(https?:\/\/openalex\.org\/domains\/)?\d+$/.test(String(domainId));
  const cacheKey = `research_subfields_${domainId}`;
  const cached = await getCachedDomains(cacheKey);
  if (cached) return { success: true, data: cached, fromCache: true };

  try {
    const subfields = isNumericOpenAlexId
      ? await fetchOpenAlexSubfields(domainId)
      : await searchOpenAlexSubfieldsByName(domainId);

    if (!Array.isArray(subfields)) {
      return { success: false, error: "Invalid subfield response" };
    }

    const normalized = normalizeSubfields(subfields);

    await setCachedDomains(cacheKey, normalized);

    return { success: true, data: normalized, fromCache: false };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch subfields",
    };
  }
}

export async function getTopicsBySubfield(subfieldId) {
  if (!subfieldId) return { success: false, error: "subfieldId is required" };
  if (!/^(https?:\/\/openalex\.org\/subfields\/)?\d+$/.test(String(subfieldId))) {
    return { success: false, error: "Invalid subfieldId format" };
  }

  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const cacheKey = `research_topics_${subfieldId}`;
  const cached = await getCachedDomains(cacheKey);
  if (cached) return { success: true, data: cached, fromCache: true };

  try {
    const topics = await fetchOpenAlexTopics(subfieldId);

    if (!Array.isArray(topics)) {
      return { success: false, error: "Invalid topic response" };
    }

    const normalized = normalizeTopics(topics);

    await setCachedDomains(cacheKey, normalized);

    return { success: true, data: normalized, fromCache: false };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch topics",
    };
  }
}

export async function searchDomains(query) {
  if (!query?.trim()) return { success: false, error: "Query is required" };

  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const [openAlexResults, semanticResults] = await Promise.allSettled([
      fetchOpenAlexDomains({ search: query.trim() }),
      fetchSemanticScholarTopics({ search: query.trim() }),
    ]);

    const domains =
      openAlexResults.status === "fulfilled" ? openAlexResults.value : [];
    const topics =
      semanticResults.status === "fulfilled" ? semanticResults.value : [];

    const merged = mergeDomainData(domains, topics);

    return { success: true, data: merged };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Search failed",
    };
  }
}

export async function getDomainStats(domainId) {
  if (!domainId) return { success: false, error: "domainId is required" };

  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const cacheKey = `domain_stats_${domainId}`;
  const cached = await getCachedDomains(cacheKey);
  if (cached) return { success: true, data: cached, fromCache: true };

  try {
    const isNumericOpenAlexId =
    /^(https?:\/\/openalex\.org\/domains\/)?\d+$/.test(String(domainId));
    const subfields = isNumericOpenAlexId
      ? await fetchOpenAlexSubfields(domainId)
      : await searchOpenAlexSubfieldsByName(domainId);

    if (!Array.isArray(subfields)) {
      return { success: false, error: "Invalid response for domain stats" };
    }

    const stats = computeDomainStats(domainId, subfields);

    await setCachedDomains(cacheKey, stats);

    return { success: true, data: stats, fromCache: false };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch domain stats",
    };
  }
}

export async function getPopularDomains() {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const cacheKey = "research_domains_popular";
  const cached = await getCachedDomains(cacheKey);
  if (cached) return { success: true, data: cached, fromCache: true };

  try {
    const [openAlexDomains, semanticTopics] = await Promise.allSettled([
      fetchOpenAlexDomains({ sort: "works_count:desc", perPage: 20 }),
      fetchSemanticScholarTopics({ limit: 20 }),
    ]);

    const domains =
      openAlexDomains.status === "fulfilled" ? openAlexDomains.value : [];
    const topics =
      semanticTopics.status === "fulfilled" ? semanticTopics.value : [];

    const merged = mergeDomainData(domains, topics).slice(0, 20);

    await setCachedDomains(cacheKey, merged);

    return { success: true, data: merged, fromCache: false };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch popular domains",
    };
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function mergeDomainData(openAlexDomains = [], semanticTopics = []) {
  const map = new Map();

  for (const domain of openAlexDomains) {
    const id = domain.id ?? domain.display_name;
    if (!id) continue;
    map.set(id, {
      id,
      name: domain.display_name ?? domain.name ?? "",
      worksCount: domain.works_count ?? 0,
      citedByCount: domain.cited_by_count ?? 0,
      source: "openalex",
      subfields: [],
    });
  }

  for (const topic of semanticTopics) {
    const id = topic.topicId ?? topic.name;
    if (!id) continue;
    if (map.has(id)) {
      const existing = map.get(id);
      map.set(id, {
        ...existing,
        paperCount: topic.paperCount ?? existing.worksCount,
        source: "both",
      });
    } else {
      map.set(id, {
        id,
        name: topic.name ?? "",
        worksCount: topic.paperCount ?? 0,
        citedByCount: 0,
        source: "semantic-scholar",
        subfields: [],
      });
    }
  }

  return Array.from(map.values());
}

function buildCuratedDomainList(openAlexDomains = []) {
  const byName = new Map();
  for (const d of openAlexDomains) {
    const name = d.display_name ?? d.name ?? "";
    if (name) byName.set(name.toLowerCase(), d);
  }

  return CURATED_DOMAINS.map((name) => {
    const match = byName.get(name.toLowerCase());
    if (match) {
      return {
        id: match.id ?? name,
        name,
        worksCount: match.works_count ?? 0,
        citedByCount: match.cited_by_count ?? 0,
        source: "openalex",
        subfields: [],
      };
    }
    return {
      id: name,
      name,
      worksCount: null,
      citedByCount: null,
      source: "curated",
      subfields: [],
    };
  });
}

function normalizeSubfields(subfields = []) {
  return subfields
    .filter((s) => s && (s.display_name ?? s.name))
    .map((s) => ({
      id: s.id ?? s.display_name ?? s.name,
      name: s.display_name ?? s.name ?? "",
      worksCount: s.works_count ?? 0,
      citedByCount: s.cited_by_count ?? 0,
      topics: Array.isArray(s.topics) ? s.topics : [],
    }));
}

function normalizeTopics(topics = []) {
  return topics
    .filter((t) => t && (t.display_name ?? t.name))
    .map((t) => ({
      id: t.id ?? t.display_name ?? t.name,
      name: t.display_name ?? t.name ?? "",
      worksCount: t.works_count ?? 0,
      citedByCount: t.cited_by_count ?? 0,
      keywords: Array.isArray(t.keywords) ? t.keywords : [],
    }));
}

function computeDomainStats(domainId, subfields = []) {
  const normalized = normalizeSubfields(subfields);
  const totalWorks = normalized.reduce(
    (sum, s) => sum + (s.worksCount ?? 0),
    0,
  );
  const totalCited = normalized.reduce(
    (sum, s) => sum + (s.citedByCount ?? 0),
    0,
  );

  return {
    domainId,
    subfieldCount: normalized.length,
    totalWorksCount: totalWorks,
    totalCitedByCount: totalCited,
    topSubfields: [...normalized]
      .sort((a, b) => (b.worksCount ?? 0) - (a.worksCount ?? 0))
      .slice(0, 5),
  };
}
