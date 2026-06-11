import { getCache, setCache } from "./cache";

const BASE_URL = "https://api.crossref.org/v1";

const HEADERS = {
  "User-Agent": "SensAI/1.0 (mailto:support@sensai.com)",
};

async function fetchCrossref(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  const cacheKey = url.toString();
  const cached = getCache("crossref", cacheKey);
  if (cached) return cached;

  const res = await fetch(url.toString(), { headers: HEADERS });

  if (res.status === 429) {
    throw new Error("Crossref rate limit reached. Please try again later.");
  }
  if (!res.ok) {
    throw new Error(`Crossref error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  setCache("crossref", cacheKey, data);
  return data;
}

function normalizeWork(item) {
  if (!item) return null;

  const authors = (item.author || []).map((a) => ({
    given: a.given || "",
    family: a.family || "",
    fullName: `${a.given || ""} ${a.family || ""}`.trim(),
    orcid: a.ORCID || null,
    affiliation: (a.affiliation || []).map((af) => af.name).join(", "),
  }));

  const publishedDate =
    item.published?.["date-parts"]?.[0] ||
    item["published-print"]?.["date-parts"]?.[0] ||
    item["published-online"]?.["date-parts"]?.[0] ||
    null;

  const year = publishedDate?.[0] || null;
  const month = publishedDate?.[1] || null;

  return {
    doi: item.DOI || null,
    title: Array.isArray(item.title) ? item.title[0] : item.title || "",
    authors,
    year,
    month,
    journal:
      Array.isArray(item["container-title"])
        ? item["container-title"][0]
        : item["container-title"] || "",
    publisher: item.publisher || "",
    type: item.type || "",
    volume: item.volume || null,
    issue: item.issue || null,
    pages: item.page || null,
    issn: item.ISSN || [],
    isbn: item.ISBN || [],
    url: item.URL || null,
    abstract: item.abstract || null,
    citationCount: item["is-referenced-by-count"] || 0,
    referenceCount: item["references-count"] || 0,
    subject: item.subject || [],
    language: item.language || null,
    license: (item.license || []).map((l) => l.URL),
    openAccess: item.license?.some((l) =>
      l.URL?.includes("creativecommons")
    ) || false,
    funder: (item.funder || []).map((f) => f.name),
    link: item.link || [],
  };
}

export async function getWorkByDOI(doi) {
  const encoded = encodeURIComponent(doi);
  const data = await fetchCrossref(`/works/${encoded}`);
  return normalizeWork(data?.message);
}

export async function searchWorks(query, options = {}) {
  const {
    rows = 10,
    offset = 0,
    filter = "",
    sort = "relevance",
    order = "desc",
    select = "",
  } = options;

  const params = { query, rows, offset, sort, order };
  if (filter) params.filter = filter;
  if (select) params.select = select;

  const data = await fetchCrossref("/works", params);
  const items = (data?.message?.items || []).map(normalizeWork).filter(Boolean);
  return {
    items,
    total: data?.message?.["total-results"] || 0,
    nextCursor: data?.message?.["next-cursor"] || null,
  };
}

export async function searchByTitle(title, options = {}) {
  const { rows = 10, offset = 0 } = options;
  const data = await fetchCrossref("/works", {
    "query.title": title,
    rows,
    offset,
    sort: "relevance",
    order: "desc",
  });
  const items = (data?.message?.items || []).map(normalizeWork).filter(Boolean);
  return {
    items,
    total: data?.message?.["total-results"] || 0,
  };
}

export async function searchByAuthor(authorName, options = {}) {
  const { rows = 10, offset = 0 } = options;
  const data = await fetchCrossref("/works", {
    "query.author": authorName,
    rows,
    offset,
    sort: "relevance",
    order: "desc",
  });
  const items = (data?.message?.items || []).map(normalizeWork).filter(Boolean);
  return {
    items,
    total: data?.message?.["total-results"] || 0,
  };
}

export async function searchByAffiliation(affiliation, options = {}) {
  const { rows = 10, offset = 0 } = options;
  const data = await fetchCrossref("/works", {
    "query.affiliation": affiliation,
    rows,
    offset,
  });
  const items = (data?.message?.items || []).map(normalizeWork).filter(Boolean);
  return {
    items,
    total: data?.message?.["total-results"] || 0,
  };
}

export async function getJournalByISSN(issn) {
  const data = await fetchCrossref(`/journals/${issn}`);
  const msg = data?.message;
  if (!msg) return null;
  return {
    title: msg.title || "",
    issn: msg.ISSN || [],
    publisher: msg.publisher || "",
    subjects: (msg.subjects || []).map((s) => s.name),
    worksCount: msg["counts"]?.["total-dois"] || 0,
    coverageType: msg["coverage-type"] || null,
    flags: msg.flags || {},
    breakdowns: msg.breakdowns || {},
  };
}

export async function searchJournals(query, options = {}) {
  const { rows = 10, offset = 0 } = options;
  const data = await fetchCrossref("/journals", {
    query,
    rows,
    offset,
  });
  const items = (data?.message?.items || []).map((msg) => ({
    title: msg.title || "",
    issn: msg.ISSN || [],
    publisher: msg.publisher || "",
    subjects: (msg.subjects || []).map((s) => s.name),
    worksCount: msg["counts"]?.["total-dois"] || 0,
  }));
  return {
    items,
    total: data?.message?.["total-results"] || 0,
  };
}

export async function getJournalWorks(issn, options = {}) {
  const { rows = 10, offset = 0, sort = "published", order = "desc" } = options;
  const data = await fetchCrossref(`/journals/${issn}/works`, {
    rows,
    offset,
    sort,
    order,
  });
  const items = (data?.message?.items || []).map(normalizeWork).filter(Boolean);
  return {
    items,
    total: data?.message?.["total-results"] || 0,
  };
}

export async function getPublisherByPrefix(prefix) {
  const data = await fetchCrossref(`/prefixes/${prefix}`);
  const msg = data?.message;
  if (!msg) return null;
  return {
    name: msg.name || "",
    prefix: msg.prefix || "",
    member: msg.member || null,
  };
}

export async function searchMembers(query, options = {}) {
  const { rows = 10, offset = 0 } = options;
  const data = await fetchCrossref("/members", {
    query,
    rows,
    offset,
  });
  return data?.message?.items || [];
}

export async function getWorksByFunder(funderId, options = {}) {
  const { rows = 10, offset = 0 } = options;
  const data = await fetchCrossref(`/funders/${funderId}/works`, {
    rows,
    offset,
    sort: "published",
    order: "desc",
  });
  const items = (data?.message?.items || []).map(normalizeWork).filter(Boolean);
  return {
    items,
    total: data?.message?.["total-results"] || 0,
  };
}

export async function getCitationFormats(doi) {
  const encoded = encodeURIComponent(doi);
  const formats = ["apa", "ieee", "mla", "chicago"];
  const results = {};

  await Promise.allSettled(
    formats.map(async (style) => {
      const url = `https://doi.org/${encoded}`;
      const styleMap = {
        apa: "text/x-bibliography; style=apa",
        ieee: "text/x-bibliography; style=ieee",
        mla: "text/x-bibliography; style=modern-language-association",
        chicago: "text/x-bibliography; style=chicago-author-date",
      };

      const cacheKey = `citation::${doi}::${style}`;
      const cached = getCache("crossref", cacheKey);
      if (cached) {
        results[style] = cached;
        return;
      }

      const res = await fetch(url, {
        headers: {
          Accept: styleMap[style],
          ...HEADERS,
        },
      });

      if (res.ok) {
        const text = await res.text();
        results[style] = text.trim();
        setCache("crossref", cacheKey, text.trim());
      } else {
        results[style] = null;
      }
    })
  );

  return results;
}

export async function getWorksByFilter(filter, options = {}) {
  const { rows = 10, offset = 0, sort = "relevance", order = "desc" } = options;
  const data = await fetchCrossref("/works", {
    filter,
    rows,
    offset,
    sort,
    order,
  });
  const items = (data?.message?.items || []).map(normalizeWork).filter(Boolean);
  return {
    items,
    total: data?.message?.["total-results"] || 0,
  };
}

export async function getOpenAccessWorks(query, options = {}) {
  const { rows = 10, offset = 0 } = options;
  return searchWorks(query, {
    ...options,
    rows,
    offset,
    filter: "license.url:https://creativecommons.org",
  });
}

export async function getRecentWorks(query, options = {}) {
  const { rows = 10, offset = 0 } = options;
  return searchWorks(query, {
    ...options,
    rows,
    offset,
    sort: "published",
    order: "desc",
  });
}

export async function getHighlyCitedWorks(query, options = {}) {
  const { rows = 10, offset = 0 } = options;
  return searchWorks(query, {
    ...options,
    rows,
    offset,
    sort: "is-referenced-by-count",
    order: "desc",
  });
}