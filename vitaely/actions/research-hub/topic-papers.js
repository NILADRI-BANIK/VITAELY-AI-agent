"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { searchWorks as searchOpenAlexWorks } from "@/lib/openalex";
import { searchPapers as searchSemanticScholarPapers } from "@/lib/semantic-scholar";
import { searchPapers as searchArxivPapers } from "@/lib/arxiv";
import { searchWorks as searchCrossrefWorks } from "@/lib/crossref";
import { fetchCorePapers } from "@/lib/core";

const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

async function getCachedTopicPapers(cacheKey) {
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

async function setCachedTopicPapers(cacheKey, data) {
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

export async function getPapersForTopic(topicName, options = {}) {
  if (!topicName?.trim()) {
    return { success: false, error: "topicName is required" };
  }

  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const { perSourceLimit = 10 } = options;
  const query = topicName.trim();
  const cacheKey = `topic_papers_${query.toLowerCase()}`;

  const cached = await getCachedTopicPapers(cacheKey);
  if (cached) return { success: true, data: cached, fromCache: true };

  try {
    const [
      openAlexResult,
      semanticResult,
      arxivResult,
      crossrefResult,
      coreResult,
    ] = await Promise.allSettled([
      searchOpenAlexWorks(query, { perPage: perSourceLimit }),
      searchSemanticScholarPapers(query, { limit: perSourceLimit }),
      searchArxivPapers(query, { maxResults: perSourceLimit }),
      searchCrossrefWorks(query, { rows: perSourceLimit }),
      fetchCorePapers({ query, limit: perSourceLimit }),
    ]);

    const openAlexPapers =
      openAlexResult.status === "fulfilled"
        ? normalizeOpenAlexPapers(openAlexResult.value?.results)
        : [];
    const semanticPapers =
      semanticResult.status === "fulfilled"
        ? normalizeSemanticScholarPapers(semanticResult.value?.data)
        : [];
    const arxivPapers =
      arxivResult.status === "fulfilled"
        ? normalizeArxivPapers(arxivResult.value?.papers)
        : [];
    const crossrefPapers =
      crossrefResult.status === "fulfilled"
        ? normalizeCrossrefPapers(crossrefResult.value?.items)
        : [];
    const corePapers =
      coreResult.status === "fulfilled"
        ? normalizeCorePapers(coreResult.value?.results)
        : [];

    const merged = mergeAndDedupePapers([
      ...openAlexPapers,
      ...semanticPapers,
      ...arxivPapers,
      ...crossrefPapers,
      ...corePapers,
    ]);

    const categorized = categorizePapers(merged);

    const result = {
      topic: query,
      totalCount: merged.length,
      sourcesQueried: {
        openalex: openAlexResult.status === "fulfilled",
        semanticScholar: semanticResult.status === "fulfilled",
        arxiv: arxivResult.status === "fulfilled",
        crossref: crossrefResult.status === "fulfilled",
        core: coreResult.status === "fulfilled",
      },
      papers: merged,
      latest: categorized.latest,
      highlyCited: categorized.highlyCited,
      openAccess: categorized.openAccess,
      surveys: categorized.surveys,
    };

    await setCachedTopicPapers(cacheKey, result);

    return { success: true, data: result, fromCache: false };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch papers",
    };
  }
}

// ─── Normalizers ────────────────────────────────────────────────────────────

function normalizeOpenAlexPapers(works = []) {
  if (!Array.isArray(works)) return [];
  return works
    .filter((w) => w && (w.title || w.display_name))
    .map((w) => ({
      title: w.display_name ?? w.title ?? "",
      authors: (w.authorships ?? [])
        .map((a) => a.author?.display_name)
        .filter(Boolean),
      year: w.publication_year ?? null,
      journal:
        w.host_venue?.display_name ??
        w.primary_location?.source?.display_name ??
        "",
      doi: w.doi ? w.doi.replace("https://doi.org/", "") : null,
      url: w.id ?? null,
      abstract: null,
      citationCount: w.cited_by_count ?? 0,
      openAccess: w.open_access?.is_oa ?? false,
      source: "openalex",
    }));
}

function normalizeSemanticScholarPapers(papers = []) {
  if (!Array.isArray(papers)) return [];
  return papers
    .filter((p) => p && p.title)
    .map((p) => ({
      title: p.title ?? "",
      authors: (p.authors ?? []).map((a) => a.name).filter(Boolean),
      year: p.year ?? null,
      journal: p.journal?.name ?? "",
      doi: p.externalIds?.DOI ?? null,
      url: p.url ?? null,
      abstract: p.abstract ?? null,
      citationCount: p.citationCount ?? 0,
      openAccess: !!p.openAccessPdf,
      source: "semantic-scholar",
    }));
}

function normalizeArxivPapers(papers = []) {
  if (!Array.isArray(papers)) return [];
  return papers
    .filter((p) => p && p.title)
    .map((p) => ({
      title: p.title ?? "",
      authors: p.authors ?? [],
      year: p.year ?? null,
      journal: p.journalRef ?? "",
      doi: p.doi || null,
      url: p.htmlUrl ?? null,
      abstract: p.abstract ?? null,
      citationCount: 0,
      openAccess: true,
      source: "arxiv",
    }));
}

function normalizeCrossrefPapers(items = []) {
  if (!Array.isArray(items)) return [];
  return items
    .filter((i) => i && i.title)
    .map((i) => ({
      title: i.title ?? "",
      authors: (i.authors ?? []).map((a) => a.fullName).filter(Boolean),
      year: i.year ?? null,
      journal: i.journal ?? "",
      doi: i.doi ?? null,
      url: i.url ?? null,
      abstract: i.abstract ?? null,
      citationCount: i.citationCount ?? 0,
      openAccess: i.openAccess ?? false,
      source: "crossref",
    }));
}

function normalizeCorePapers(results = []) {
  if (!Array.isArray(results)) return [];
  return results
    .filter((r) => r && r.title)
    .map((r) => ({
      title: r.title ?? "",
      authors: (r.authors ?? []).map((a) => a.name ?? a).filter(Boolean),
      year: r.yearPublished ?? null,
      journal: r.publisher ?? "",
      doi: r.doi ?? null,
      url: r.downloadUrl ?? r.sourceFulltextUrls?.[0] ?? null,
      abstract: r.abstract ?? null,
      citationCount: r.citationCount ?? 0,
      openAccess: true,
      source: "core",
    }));
}

// ─── Merge / Dedupe / Categorize ────────────────────────────────────────────

function normalizeTitleKey(title = "") {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function mergeAndDedupePapers(papers = []) {
  const byDoi = new Map();
  const byTitle = new Map();
  const result = [];

  for (const paper of papers) {
    if (!paper.title) continue;

    const doiKey = paper.doi ? paper.doi.toLowerCase() : null;
    const titleKey = normalizeTitleKey(paper.title);

    if (doiKey && byDoi.has(doiKey)) {
      const existing = byDoi.get(doiKey);
      mergeIntoExisting(existing, paper);
      continue;
    }
    if (!doiKey && byTitle.has(titleKey)) {
      const existing = byTitle.get(titleKey);
      mergeIntoExisting(existing, paper);
      continue;
    }

    const entry = { ...paper, sources: [paper.source] };
    delete entry.source;
    result.push(entry);

    if (doiKey) byDoi.set(doiKey, entry);
    byTitle.set(titleKey, entry);
  }

  return result.sort((a, b) => (b.citationCount ?? 0) - (a.citationCount ?? 0));
}

function mergeIntoExisting(existing, incoming) {
  if (!existing.sources.includes(incoming.source)) {
    existing.sources.push(incoming.source);
  }
  if (!existing.abstract && incoming.abstract) {
    existing.abstract = incoming.abstract;
  }
  if (!existing.doi && incoming.doi) {
    existing.doi = incoming.doi;
  }
  if ((incoming.citationCount ?? 0) > (existing.citationCount ?? 0)) {
    existing.citationCount = incoming.citationCount;
  }
  if (!existing.year && incoming.year) {
    existing.year = incoming.year;
  }
  if (!existing.journal && incoming.journal) {
    existing.journal = incoming.journal;
  }
  if (incoming.openAccess) {
    existing.openAccess = true;
  }
}

function categorizePapers(papers = []) {
  const currentYear = new Date().getFullYear();

  const latest = [...papers]
    .filter((p) => p.year && p.year >= currentYear - 2)
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
    .slice(0, 10);

  const highlyCited = [...papers]
    .sort((a, b) => (b.citationCount ?? 0) - (a.citationCount ?? 0))
    .slice(0, 10);

  const openAccess = papers.filter((p) => p.openAccess).slice(0, 10);

  const surveys = papers
    .filter((p) => /survey|review/i.test(p.title))
    .slice(0, 10);

  return { latest, highlyCited, openAccess, surveys };
}
