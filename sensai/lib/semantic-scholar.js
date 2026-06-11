import { getCache, setCache } from "./cache";

const BASE_URL = "https://api.semanticscholar.org/graph/v1";

const HEADERS = {
  "Content-Type": "application/json",
};

const DEFAULT_PAPER_FIELDS =
  "paperId,title,abstract,year,citationCount,referenceCount,authors,journal,externalIds,openAccessPdf,url,fieldsOfStudy,tldr";

const DEFAULT_AUTHOR_FIELDS =
  "authorId,name,affiliations,paperCount,citationCount,hIndex";

async function fetchSemanticScholar(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value);
    }
  });

  const cacheKey = url.toString();
  const cached = getCache("semanticscholar", cacheKey);
  if (cached) return cached;

  const res = await fetch(url.toString(), { headers: HEADERS });

  if (res.status === 429) {
    throw new Error(
      "Semantic Scholar rate limit reached. Please try again later.",
    );
  }
  if (!res.ok) {
    throw new Error(`Semantic Scholar error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  setCache("semanticscholar", cacheKey, data);
  return data;
}

export async function searchPapers(query, options = {}) {
  const {
    limit = 10,
    offset = 0,
    fields = DEFAULT_PAPER_FIELDS,
    year = "",
    openAccessPdf = false,
  } = options;

  const params = {
    query,
    limit,
    offset,
    fields,
  };

  if (year) params.year = year;
  if (openAccessPdf) params.openAccessPdf = true;

  return fetchSemanticScholar("/paper/search", params);
}

export async function getPaperById(paperId, options = {}) {
  const { fields = DEFAULT_PAPER_FIELDS } = options;
  return fetchSemanticScholar(`/paper/${paperId}`, { fields });
}

export async function getPaperByDOI(doi, options = {}) {
  const { fields = DEFAULT_PAPER_FIELDS } = options;
  return fetchSemanticScholar(`/paper/DOI:${encodeURIComponent(doi)}`, {
    fields,
  });
}

export async function getPaperByArXivId(arxivId, options = {}) {
  const { fields = DEFAULT_PAPER_FIELDS } = options;
  return fetchSemanticScholar(`/paper/ARXIV:${arxivId}`, { fields });
}

export async function getPaperCitations(paperId, options = {}) {
  const { limit = 10, offset = 0, fields = DEFAULT_PAPER_FIELDS } = options;
  return fetchSemanticScholar(`/paper/${paperId}/citations`, {
    limit,
    offset,
    fields: `citingPaper.${fields}`,
  });
}

export async function getPaperReferences(paperId, options = {}) {
  const { limit = 10, offset = 0, fields = DEFAULT_PAPER_FIELDS } = options;
  return fetchSemanticScholar(`/paper/${paperId}/references`, {
    limit,
    offset,
    fields: `citedPaper.${fields}`,
  });
}

export async function getAuthorById(authorId, options = {}) {
  const { fields = DEFAULT_AUTHOR_FIELDS } = options;
  return fetchSemanticScholar(`/author/${authorId}`, { fields });
}

export async function searchAuthors(query, options = {}) {
  const { limit = 10, offset = 0, fields = DEFAULT_AUTHOR_FIELDS } = options;
  return fetchSemanticScholar("/author/search", {
    query,
    limit,
    offset,
    fields,
  });
}

export async function getAuthorPapers(authorId, options = {}) {
  const { limit = 10, offset = 0, fields = DEFAULT_PAPER_FIELDS } = options;
  return fetchSemanticScholar(`/author/${authorId}/papers`, {
    limit,
    offset,
    fields,
  });
}

export async function getPaperRecommendations(paperId, options = {}) {
  const { limit = 10, fields = DEFAULT_PAPER_FIELDS } = options;
  const url = new URL(
    `https://api.semanticscholar.org/recommendations/v1/papers/forpaper/${paperId}`,
  );
  url.searchParams.set("limit", limit);
  url.searchParams.set("fields", fields);

  const cacheKey = url.toString();
  const cached = getCache("semanticscholar", cacheKey);
  if (cached) return cached;

  let res;
  try {
    res = await fetch(url.toString(), { headers: HEADERS });
  } catch (error) {
    throw new Error(`Semantic Scholar request failed: ${error.message}`);
  }

  if (res.status === 429) {
    throw new Error("Semantic Scholar rate limit reached. Please try again later.");
  }
  if (!res.ok) {
    throw new Error(`Semantic Scholar error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  setCache("semanticscholar", cacheKey, data);
  return data;
}
export async function getMultiplePapers(paperIds, options = {}) {
  const { fields = DEFAULT_PAPER_FIELDS } = options;

  const cacheKey = `batch::${[...paperIds].sort().join(",")}::${fields}`;
  const cached = getCache("semanticscholar", cacheKey);
  if (cached) return cached;

  const batchUrl = `${BASE_URL}/paper/batch?fields=${encodeURIComponent(fields)}`;
  const res = await fetch(batchUrl, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ ids: paperIds }),
  });

  if (res.status === 429) {
    throw new Error(
      "Semantic Scholar rate limit reached. Please try again later.",
    );
  }
  if (!res.ok) {
    throw new Error(
      `Semantic Scholar batch error: ${res.status} ${res.statusText}`,
    );
  }

  const data = await res.json();
  setCache("semanticscholar", cacheKey, data);
  return data;
}

export async function getTrendingPapers(fieldsOfStudy, options = {}) {
  const { limit = 10, fields = DEFAULT_PAPER_FIELDS } = options;
  const params = {
    query: fieldsOfStudy,
    limit,
    fields,
    sort: "citationCount",
  };
  return fetchSemanticScholar("/paper/search", params);
}

export async function getSurveyPapers(query, options = {}) {
  const { limit = 10, fields = DEFAULT_PAPER_FIELDS } = options;
  return fetchSemanticScholar("/paper/search", {
    query: `survey ${query}`,
    limit,
    fields,
  });
}

export async function getHighlyCitedPapers(query, options = {}) {
  const { limit = 10, fields = DEFAULT_PAPER_FIELDS } = options;
  return fetchSemanticScholar("/paper/search", {
    query,
    limit,
    fields,
    sort: "citationCount",
  });
}

export async function getLatestPapers(query, options = {}) {
  const { limit = 10, fields = DEFAULT_PAPER_FIELDS } = options;
  return fetchSemanticScholar("/paper/search", {
    query,
    limit,
    fields,
    sort: "publicationDate",
  });
}

export async function getOpenAccessPapers(query, options = {}) {
  const { limit = 10, fields = DEFAULT_PAPER_FIELDS } = options;
  return fetchSemanticScholar("/paper/search", {
    query,
    limit,
    fields,
    openAccessPdf: "",
  });
}

export async function getPaperTLDR(paperId) {
  const data = await fetchSemanticScholar(`/paper/${paperId}`, {
    fields: "tldr",
  });
  return data?.tldr?.text ?? null;
}
