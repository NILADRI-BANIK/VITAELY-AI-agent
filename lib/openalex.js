import { getCache, setCache } from "./cache";

const BASE_URL = "https://api.openalex.org";

const HEADERS = {
  "User-Agent": "SensAI/1.0 (mailto:support@sensai.com)",
  "mailto": process.env.OPENALEX_EMAIL || "niladrib657@gmail.com",
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
    filter: filter || `publication_year:${new Date().getFullYear() - 1}|${new Date().getFullYear()}`,
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

export async function fetchOpenAlexDomains(options = {}) {
  const { search = "", sort = "works_count:desc", perPage = 20 } = options;
  const params = { "per-page": perPage, sort };
  if (search) params.search = search;
  const data = await fetchOpenAlex("/domains", params);
  return data?.results ?? [];
}

export async function fetchOpenAlexSubfields(domainId, options = {}) {
  const { perPage = 50 } = options;
const idPart = String(domainId).startsWith("http")
    ? String(domainId).split("/").pop()
    : domainId;
  const data = await fetchOpenAlex("/subfields", {
    filter: `domain.id:${idPart}`,
    "per-page": perPage,
    sort: "works_count",
  });
  return data?.results ?? [];
}

export async function searchOpenAlexSubfieldsByName(name, options = {}) {
  const { perPage = 50 } = options;
  const data = await fetchOpenAlex("/subfields", {
    search: name,
    "per-page": perPage,
    sort: "works_count",
  });
  return data?.results ?? [];
}

export async function fetchOpenAlexTopics(subfieldId, options = {}) {
  const { perPage = 50 } = options;
  const idPart = String(subfieldId).startsWith("http")
    ? String(subfieldId).split("/").pop()
    : subfieldId;
  const data = await fetchOpenAlex("/topics", {
    filter: `subfield.id:${idPart}`,
    "per-page": perPage,
    sort: "works_count",
  });
  return data?.results ?? [];
}

export async function fetchOpenAlexSearch(options = {}) {
  const { query = "", perPage = 10 } = options;
  if (!query.trim()) return { results: [], meta: { count: 0 } };
  return fetchOpenAlex("/works", {
    search: query,
    "per-page": perPage,
  });
}

export async function getWorksByYearRange(query, fromYear, toYear) {
  if (!query?.trim()) return { meta: { count: 0 }, results: [] };
  return fetchOpenAlex("/works", {
    search: query,
    filter: `publication_year:${fromYear}-${toYear}`,
    "per-page": 1,
  });
}

export async function getPapersPerYear(query, options = {}) {
  const { fromYear = new Date().getFullYear() - 9, toYear = new Date().getFullYear() } = options;
  if (!query?.trim()) return [];

  const years = [];
  for (let y = fromYear; y <= toYear; y++) years.push(y);

  const results = await Promise.allSettled(
    years.map((year) =>
      fetchOpenAlex("/works", {
        search: query,
        filter: `publication_year:${year}`,
        "per-page": 1,
      }),
    ),
  );

  return years.map((year, i) => ({
    year,
    count:
      results[i].status === "fulfilled"
        ? (results[i].value?.meta?.count ?? 0)
        : 0,
  }));
}

export async function getOpenAccessStats(query) {
  if (!query?.trim()) return { openAccessRatio: null };

  const [totalRes, openRes] = await Promise.allSettled([
    fetchOpenAlex("/works", { search: query, "per-page": 1 }),
    fetchOpenAlex("/works", {
      search: query,
      filter: "is_oa:true",
      "per-page": 1,
    }),
  ]);

  const total =
    totalRes.status === "fulfilled" ? (totalRes.value?.meta?.count ?? 0) : 0;
  const open =
    openRes.status === "fulfilled" ? (openRes.value?.meta?.count ?? 0) : 0;

  if (total === 0) return { openAccessRatio: null };

  return { openAccessRatio: (open / total) * 100 };
}

export async function getCitationStats(query) {
  if (!query?.trim()) return { totalCitations: null, avgCitationsPerYear: null };

  const currentYear = new Date().getFullYear();

  const data = await fetchOpenAlex("/works", {
    search: query,
    sort: "cited_by_count:desc",
    "per-page": 25,
  });

  const works = data?.results ?? [];
  if (!works.length) return { totalCitations: null, avgCitationsPerYear: null };

  const totalCitations = works.reduce(
    (sum, w) => sum + (w.cited_by_count ?? 0),
    0,
  );

  const oldestYear = works.reduce((min, w) => {
    const y = w.publication_year;
    return y && y < min ? y : min;
  }, currentYear);

  const yearsSpan = Math.max(1, currentYear - oldestYear);

  return {
    totalCitations,
    avgCitationsPerYear: totalCitations / yearsSpan,
  };
}