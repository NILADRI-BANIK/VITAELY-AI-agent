import { getCache, setCache } from "./cache";

const BASE_URL = "https://api.openalex.org";

const HEADERS = {
  "User-Agent": "SensAI/1.0 (mailto:support@sensai.com)",
};

async function fetchOpenAlex(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value);
    }
  });

  const cacheKey = url.toString();
  const cached = getCache("openalex", cacheKey);
  if (cached) return cached;

  const res = await fetch(url.toString(), { headers: HEADERS });
  if (!res.ok) throw new Error(`OpenAlex error: ${res.status} ${res.statusText}`);

  const data = await res.json();
  setCache("openalex", cacheKey, data);
  return data;
}

export async function searchWorks(query, options = {}) {
  const {
    page = 1,
    perPage = 10,
    sortBy = "relevance_score",
    filter = "",
  } = options;

  const params = {
    search: query,
    page,
    "per-page": perPage,
    sort: sortBy,
  };
  if (filter) params.filter = filter;

  return fetchOpenAlex("/works", params);
}

export async function getWorkById(openAlexId) {
  return fetchOpenAlex(`/works/${openAlexId}`);
}

export async function searchConcepts(query, options = {}) {
  const { page = 1, perPage = 10 } = options;
  return fetchOpenAlex("/concepts", {
    search: query,
    page,
    "per-page": perPage,
  });
}

export async function getConceptById(conceptId) {
  return fetchOpenAlex(`/concepts/${conceptId}`);
}

export async function searchAuthors(query, options = {}) {
  const { page = 1, perPage = 10 } = options;
  return fetchOpenAlex("/authors", {
    search: query,
    page,
    "per-page": perPage,
  });
}

export async function getAuthorById(authorId) {
  return fetchOpenAlex(`/authors/${authorId}`);
}

export async function searchInstitutions(query, options = {}) {
  const { page = 1, perPage = 10 } = options;
  return fetchOpenAlex("/institutions", {
    search: query,
    page,
    "per-page": perPage,
  });
}

export async function searchJournals(query, options = {}) {
  const { page = 1, perPage = 10 } = options;
  return fetchOpenAlex("/sources", {
    search: query,
    page,
    "per-page": perPage,
  });
}

export async function getJournalById(sourceId) {
  return fetchOpenAlex(`/sources/${sourceId}`);
}

export async function getWorksByDomain(domainConcept, options = {}) {
  const { page = 1, perPage = 10, sortBy = "cited_by_count" } = options;
  return fetchOpenAlex("/works", {
    filter: `concepts.id:${domainConcept}`,
    page,
    "per-page": perPage,
    sort: sortBy,
  });
}

export async function getTrendingWorks(options = {}) {
  const { perPage = 10, filter = "" } = options;
  const params = {
    sort: "publication_date",
    "per-page": perPage,
    filter: filter || "publication_year:2024|2025",
  };
  return fetchOpenAlex("/works", params);
}

export async function getCitedByCount(openAlexId) {
  const data = await fetchOpenAlex(`/works/${openAlexId}`);
  return data?.cited_by_count ?? 0;
}

export async function getRelatedWorks(openAlexId, options = {}) {
  const { perPage = 10 } = options;
  const work = await fetchOpenAlex(`/works/${openAlexId}`);
  const conceptIds = (work?.concepts ?? [])
    .slice(0, 3)
    .map((c) => c.id.replace("https://openalex.org/", ""))
    .join("|");

  if (!conceptIds) return { results: [] };

  return fetchOpenAlex("/works", {
    filter: `concepts.id:${conceptIds}`,
    "per-page": perPage,
    sort: "cited_by_count",
  });
}

export async function getDomainConcepts(options = {}) {
  const { perPage = 20 } = options;
  return fetchOpenAlex("/concepts", {
    filter: "level:0",
    "per-page": perPage,
    sort: "works_count",
  });
}

export async function getSubConcepts(parentConceptId, options = {}) {
  const { perPage = 20 } = options;
  return fetchOpenAlex("/concepts", {
    filter: `ancestors.id:${parentConceptId}`,
    "per-page": perPage,
    sort: "works_count",
  });
}

export async function searchWorksByFilter(filter, options = {}) {
  const { page = 1, perPage = 10, sortBy = "cited_by_count" } = options;
  return fetchOpenAlex("/works", {
    filter,
    page,
    "per-page": perPage,
    sort: sortBy,
  });
}