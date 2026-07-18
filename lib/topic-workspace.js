// lib/topic-workspace.js
import { getCache, setCache } from "./cache";
import {
  fetchOpenAlexSearch,
  getPapersPerYear,
  getOpenAccessStats,
  getCitationStats,
  getWorksByYearRange,
  fetchOpenAlexTopics,
  searchOpenAlexSubfieldsByName,
} from "./openalex";
import { fetchArxivPapers } from "./arxiv";
import { searchWorks as searchCrossrefWorks } from "./crossref";
import { searchPublications as searchDblpPublications } from "./dblp";
import { fetchKaggleDatasets } from "./kaggle";
import { fetchHuggingFaceDatasets } from "./huggingface-datasets";
import { fetchZenodoDatasets } from "./zenodo";
import { searchJournals as searchDoajJournals } from "./doaj";
import { fetchYouTubeVideos } from "./youtube";

const WORKSPACE_CACHE_SOURCE = "topic_workspace";

function buildQueryFromTopic(topic) {
  if (!topic) return "";
  const name = (topic.topicName ?? topic.topic ?? topic.title ?? "").trim();
  const keywords = Array.isArray(topic.keywords) ? topic.keywords : [];

  const nameWords = new Set(
    name.toLowerCase().split(/\s+/).filter(Boolean),
  );

  const extraKeywords = keywords
    .filter((k) => typeof k === "string" && k.trim())
    .filter((k) => !nameWords.has(k.trim().toLowerCase()))
    .slice(0, 3);

  return extraKeywords.length > 0
    ? `${name} ${extraKeywords.join(" ")}`.trim()
    : name;
}

function safeSettledValue(result, fallback) {
  return result.status === "fulfilled" ? result.value : fallback;
}

function normalizeSemanticScholarPaper(paper) {
  if (!paper) return null;
  return {
    id: paper.paperId ?? null,
    title: paper.title ?? "Untitled",
    authors: Array.isArray(paper.authors)
      ? paper.authors.map((a) => a.name).filter(Boolean)
      : [],
    year: paper.year ?? null,
    venue: paper.venue ?? null,
    citationCount: paper.citationCount ?? 0,
    abstract: paper.abstract ?? null,
    openAccess: !!paper.isOpenAccess,
    url: paper.url ?? null,
    doi: paper.externalIds?.DOI ?? null,
    source: "Semantic Scholar",
  };
}

async function fetchSemanticScholarPapers(query, limit = 10) {
  if (!query?.trim()) return [];
  try {
    const fields =
      "title,authors,year,venue,citationCount,abstract,isOpenAccess,url,externalIds";
    const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(
      query,
    )}&limit=${limit}&fields=${fields}`;

    const cacheKey = url;
    const cached = getCache("semanticscholar", cacheKey);
    if (cached) return cached;

    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const papers = Array.isArray(data?.data)
      ? data.data.map(normalizeSemanticScholarPaper).filter(Boolean)
      : [];

    setCache("semanticscholar", cacheKey, papers);
    return papers;
  } catch {
    return [];
  }
}

function normalizeOpenAlexPaper(work) {
  if (!work) return null;
  const authors = Array.isArray(work.authorships)
    ? work.authorships.map((a) => a.author?.display_name).filter(Boolean)
    : [];
  return {
    id: work.id ?? null,
    title: work.title ?? work.display_name ?? "Untitled",
    authors,
    year: work.publication_year ?? null,
    venue: work.primary_location?.source?.display_name ?? null,
    citationCount: work.cited_by_count ?? 0,
    abstract: null,
    openAccess: !!work.open_access?.is_oa,
    url: work.primary_location?.landing_page_url ?? work.id ?? null,
    doi: work.doi ?? null,
    source: "OpenAlex",
  };
}

function normalizeArxivPaper(entry) {
  if (!entry) return null;
  return {
    id: entry.arxivId ?? null,
    title: entry.title ?? "Untitled",
    authors: entry.authors ?? [],
    year: entry.year ?? null,
    venue: "arXiv",
    citationCount: null,
    abstract: entry.abstract ?? null,
    openAccess: true,
    url: entry.htmlUrl ?? null,
    doi: entry.doi || null,
    source: "arXiv",
  };
}

function normalizeCrossrefPaper(work) {
  if (!work) return null;
  return {
    id: work.doi ?? null,
    title: work.title ?? "Untitled",
    authors: Array.isArray(work.authors)
      ? work.authors.map((a) => a.fullName).filter(Boolean)
      : [],
    year: work.year ?? null,
    venue: work.journal ?? null,
    citationCount: work.citationCount ?? 0,
    abstract: work.abstract ?? null,
    openAccess: !!work.openAccess,
    url: work.url ?? null,
    doi: work.doi ?? null,
    source: "Crossref",
  };
}

function normalizeDblpPaper(pub) {
  if (!pub) return null;
  return {
    id: pub.key ?? null,
    title: pub.title ?? "Untitled",
    authors: pub.authors ?? [],
    year: pub.year ? parseInt(pub.year, 10) : null,
    venue: pub.venue ?? null,
    citationCount: null,
    abstract: null,
    openAccess: pub.access === "open",
    url: pub.ee?.[0] ?? pub.url ?? null,
    doi: pub.doi ?? null,
    source: "DBLP",
  };
}

function dedupePapers(papers) {
  const seen = new Set();
  const result = [];
  for (const paper of papers) {
    if (!paper) continue;
    const key = (paper.doi || paper.title || "").toLowerCase().trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(paper);
  }
  return result;
}

export async function aggregatePapers(query, options = {}) {
  const { limit = 20 } = options;
  if (!query?.trim()) return { papers: [], total: 0 };

  const [openAlexRes, semanticRes, arxivRes, crossrefRes, dblpRes] =
    await Promise.allSettled([
      fetchOpenAlexSearch({ query, perPage: limit }),
      fetchSemanticScholarPapers(query, limit),
      fetchArxivPapers({ query, maxResults: limit }),
      searchCrossrefWorks(query, { rows: limit }),
      searchDblpPublications(query, { hits: limit }),
    ]);

  const openAlexPapers =
    safeSettledValue(openAlexRes, { results: [] }).results
      ?.map(normalizeOpenAlexPaper)
      .filter(Boolean) ?? [];

  const semanticPapers = safeSettledValue(semanticRes, []);

  const arxivPapers = (safeSettledValue(arxivRes, { entries: [] }).entries ?? [])
    .map(normalizeArxivPaper)
    .filter(Boolean);

  const crossrefPapers = (
    safeSettledValue(crossrefRes, { items: [] }).items ?? []
  )
    .map(normalizeCrossrefPaper)
    .filter(Boolean);

  const dblpPapers = (
    safeSettledValue(dblpRes, { results: [] }).results ?? []
  )
    .map(normalizeDblpPaper)
    .filter(Boolean);

  const merged = dedupePapers([
    ...openAlexPapers,
    ...semanticPapers,
    ...arxivPapers,
    ...crossrefPapers,
    ...dblpPapers,
  ]).sort((a, b) => (b.citationCount ?? 0) - (a.citationCount ?? 0));

  return { papers: merged.slice(0, limit), total: merged.length };
}

export async function aggregateYouTubeVideos(query, options = {}) {
  const { maxResults = 6 } = options;
  if (!query?.trim()) return [];
  try {
    return await fetchYouTubeVideos(query, { maxResults });
  } catch {
    return [];
  }
}

export async function aggregateDatasets(query, options = {}) {
  const { limit = 8 } = options;
  if (!query?.trim()) return [];

  const [kaggleRes, hfRes, zenodoRes] = await Promise.allSettled([
    fetchKaggleDatasets({ search: query, limit }),
    fetchHuggingFaceDatasets({ search: query, limit }),
    fetchZenodoDatasets({ query, limit }),
  ]);

  const kaggleDatasets = (
    safeSettledValue(kaggleRes, { results: [] }).results ?? []
  ).map((d) => ({
    id: d.ref ?? d.id ?? null,
    name: d.title ?? d.ref ?? "Untitled Dataset",
    size: d.size ? `${d.size}` : null,
    license: d.licenseName ?? null,
    url: d.ref ? `https://www.kaggle.com/datasets/${d.ref}` : null,
    source: "Kaggle",
  }));

  const hfDatasets = (
    safeSettledValue(hfRes, { datasets: [] }).datasets ?? []
  ).map((d) => ({
    id: d.id ?? null,
    name: d.title ?? d.id ?? "Untitled Dataset",
    size: Array.isArray(d.size) ? d.size.join(", ") : null,
    license: d.license || null,
    url: d.url ?? null,
    source: "Hugging Face",
  }));

  const zenodoDatasets = (
    safeSettledValue(zenodoRes, { results: [] }).results ?? []
  ).map((d) => ({
    id: d.id ?? null,
    name: d.title ?? "Untitled Dataset",
    size: d.fileSize ? `${Math.round(d.fileSize / 1024 / 1024)} MB` : null,
    license: d.license ?? null,
    url: d.htmlUrl ?? null,
    source: "Zenodo",
  }));

  return [...kaggleDatasets, ...hfDatasets, ...zenodoDatasets].slice(0, limit);
}

export async function aggregatePublications(query, options = {}) {
  const { limit = 8 } = options;
  if (!query?.trim()) return [];
  try {
    const result = await searchDoajJournals(query, { pageSize: limit });
    return (result?.results ?? []).map((j) => ({
      id: j.id ?? null,
      title: j.title ?? "Untitled",
      publisher: j.publisher ?? null,
      issn: j.issns?.[0] ?? null,
      url: j.url ?? null,
      openAccess: true,
      subjects: j.subjects ?? [],
      source: "DOAJ",
    }));
  } catch {
    return [];
  }
}

export async function aggregateStats(query) {
  if (!query?.trim()) {
    return {
      totalPapers: 0,
      papersThisYear: 0,
      avgCitationVelocity: null,
      openAccessPercentage: null,
    };
  }

  const currentYear = new Date().getFullYear();

  const [totalRes, thisYearRes, citationRes, openAccessRes] =
    await Promise.allSettled([
      fetchOpenAlexSearch({ query, perPage: 1 }),
      getWorksByYearRange(query, currentYear, currentYear),
      getCitationStats(query),
      getOpenAccessStats(query),
    ]);

  const totalPapers =
    safeSettledValue(totalRes, { meta: { count: 0 } })?.meta?.count ?? 0;

  const papersThisYear =
    safeSettledValue(thisYearRes, { meta: { count: 0 } })?.meta?.count ?? 0;

  const citationStats = safeSettledValue(citationRes, {
    totalCitations: null,
    avgCitationsPerYear: null,
  });

  const openAccessStats = safeSettledValue(openAccessRes, {
    openAccessRatio: null,
  });

  return {
    totalPapers,
    papersThisYear,
    currentYear,
    avgCitationVelocity: citationStats?.avgCitationsPerYear ?? null,
    openAccessPercentage: openAccessStats?.openAccessRatio ?? null,
  };
}

export async function aggregateTimeline(query, options = {}) {
  const { fromYear, toYear } = options;
  if (!query?.trim()) return [];
  try {
    return await getPapersPerYear(query, { fromYear, toYear });
  } catch {
    return [];
  }
}

export async function aggregateSimilarTopics(topic, options = {}) {
  const { limit = 6 } = options;
  const subfieldId = topic?.subfieldId ?? null;

  if (subfieldId) {
    try {
      const topics = await fetchOpenAlexTopics(subfieldId, { perPage: limit });
      if (topics.length > 0) {
        return topics.map((t) => ({
          id: t.id ?? null,
          name: t.display_name ?? "Untitled Topic",
          description: t.description ?? null,
          worksCount: t.works_count ?? null,
        }));
      }
    } catch {
      // fall through to name-based fallback
    }
  }

  const query = buildQueryFromTopic(topic);
  if (!query.trim()) return [];

  try {
    const matches = await searchOpenAlexSubfieldsByName(query, { perPage: limit });
    return matches.map((t) => ({
      id: t.id ?? null,
      name: t.display_name ?? "Untitled Topic",
      description: t.description ?? null,
      worksCount: t.works_count ?? null,
    }));
  } catch {
    return [];
  }
}

export async function buildTopicWorkspaceData(topic, options = {}) {
  if (!topic) throw new Error("Topic is required to build workspace data");

  const query = buildQueryFromTopic(topic);
  const cacheKey = `${WORKSPACE_CACHE_SOURCE}::${topic.id ?? query}`;

  const cached = getCache(WORKSPACE_CACHE_SOURCE, cacheKey);
  if (cached && !options.forceRefresh) return cached;

  const [
    papersRes,
    videosRes,
    datasetsRes,
    publicationsRes,
    statsRes,
    timelineRes,
    similarTopicsRes,
  ] = await Promise.allSettled([
    aggregatePapers(query, { limit: 20 }),
    aggregateYouTubeVideos(query, { maxResults: 6 }),
    aggregateDatasets(query, { limit: 8 }),
    aggregatePublications(query, { limit: 8 }),
    aggregateStats(query),
    aggregateTimeline(query),
    aggregateSimilarTopics(topic, { limit: 6 }),
  ]);

  const data = {
    topic,
    query,
    papers: safeSettledValue(papersRes, { papers: [], total: 0 }),
    videos: safeSettledValue(videosRes, []),
    datasets: safeSettledValue(datasetsRes, []),
    publications: safeSettledValue(publicationsRes, []),
    stats: safeSettledValue(statsRes, {}),
    timeline: safeSettledValue(timelineRes, []),
    similarTopics: safeSettledValue(similarTopicsRes, []),
    generatedAt: new Date().toISOString(),
  };

  setCache(WORKSPACE_CACHE_SOURCE, cacheKey, data);

  return data;
}

export function buildTopicQuery(topic) {
  return buildQueryFromTopic(topic);
}