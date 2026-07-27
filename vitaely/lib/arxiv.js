import { getCache, setCache } from "./cache";

const BASE_URL = "https://export.arxiv.org/api/query";

function parseArXivXML(xmlText) {
  const entries = [];

  const entryMatches = xmlText.match(/<entry>([\s\S]*?)<\/entry>/g);
  if (!entryMatches) return entries;

  for (const entry of entryMatches) {
    const getText = (tag) => {
      const match = entry.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
      return match ? match[1].trim() : "";
    };

    const getAttr = (tag, attr) => {
      const match = entry.match(new RegExp(`<${tag}[^>]*${attr}="([^"]*)"[^>]*>`));
      return match ? match[1].trim() : "";
    };

    const authorMatches = entry.match(/<author>([\s\S]*?)<\/author>/g) || [];
    const authors = authorMatches.map((a) => {
      const nameMatch = a.match(/<name>([\s\S]*?)<\/name>/);
      return nameMatch ? nameMatch[1].trim() : "";
    }).filter(Boolean);

    const categoryMatches = entry.match(/<category[^>]*term="([^"]*)"[^>]*\/>/g) || [];
    const categories = categoryMatches.map((c) => {
      const termMatch = c.match(/term="([^"]*)"/);
      return termMatch ? termMatch[1] : "";
    }).filter(Boolean);

    const linkMatches = entry.match(/<link[^>]*\/>/g) || [];
    let pdfUrl = "";
    let htmlUrl = "";
    for (const link of linkMatches) {
      if (link.includes('type="application/pdf"')) {
        const hrefMatch = link.match(/href="([^"]*)"/);
        if (hrefMatch) pdfUrl = hrefMatch[1];
      }
      if (link.includes('type="text/html"') || link.includes('rel="alternate"')) {
        const hrefMatch = link.match(/href="([^"]*)"/);
        if (hrefMatch) htmlUrl = hrefMatch[1];
      }
    }

    const rawId = getText("id");
    const arxivId = rawId.replace("http://arxiv.org/abs/", "").replace("https://arxiv.org/abs/", "");

    const published = getText("published");
    const updated = getText("updated");
    const year = published ? new Date(published).getFullYear() : null;

    entries.push({
      arxivId,
      title: getText("title").replace(/\s+/g, " "),
      abstract: getText("summary").replace(/\s+/g, " "),
      authors,
      categories,
      published,
      updated,
      year,
      pdfUrl: pdfUrl || `https://arxiv.org/pdf/${arxivId}`,
      htmlUrl: htmlUrl || `https://arxiv.org/abs/${arxivId}`,
      doi: getText("arxiv:doi"),
      journalRef: getText("arxiv:journal_ref"),
      comment: getText("arxiv:comment"),
    });
  }

  return entries;
}

function parseTotalResults(xmlText) {
  const match = xmlText.match(/<opensearch:totalResults[^>]*>(\d+)<\/opensearch:totalResults>/);
  return match ? parseInt(match[1], 10) : 0;
}

async function fetchArXiv(params = {}) {
  const url = new URL(BASE_URL);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  const cacheKey = url.toString();
  const cached = getCache("arxiv", cacheKey);
  if (cached) return cached;

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`arXiv error: ${res.status} ${res.statusText}`);
  }

  const xmlText = await res.text();
  const papers = parseArXivXML(xmlText);
  const total = parseTotalResults(xmlText);

  const data = { papers, total };
  setCache("arxiv", cacheKey, data);
  return data;
}

function buildSearchQuery(query, options = {}) {
  const { searchIn = "all" } = options;
  const fieldMap = {
    all: "all",
    title: "ti",
    abstract: "abs",
    author: "au",
    category: "cat",
  };
  const field = fieldMap[searchIn] || "all";
  return `${field}:${query}`;
}

export async function searchPapers(query, options = {}) {
  const {
    start = 0,
    maxResults = 10,
    sortBy = "relevance",
    sortOrder = "descending",
    searchIn = "all",
    category = "",
  } = options;

  let searchQuery = buildSearchQuery(query, { searchIn });
  if (category) {
    searchQuery = `${searchQuery} AND cat:${category}`;
  }

  return fetchArXiv({
    search_query: searchQuery,
    start,
    max_results: maxResults,
    sortBy,
    sortOrder,
  });
}

export async function searchByCategory(category, options = {}) {
  const {
    start = 0,
    maxResults = 10,
    sortBy = "submittedDate",
    sortOrder = "descending",
  } = options;

  return fetchArXiv({
    search_query: `cat:${category}`,
    start,
    max_results: maxResults,
    sortBy,
    sortOrder,
  });
}

export async function getPaperById(arxivId) {
  const cleanId = arxivId.replace("arxiv:", "").replace("ARXIV:", "");
  return fetchArXiv({ id_list: cleanId });
}

export async function getMultiplePapersById(arxivIds) {
  const cleanIds = arxivIds
    .map((id) => id.replace("arxiv:", "").replace("ARXIV:", ""))
    .join(",");
  return fetchArXiv({ id_list: cleanIds });
}

export async function getLatestPapers(category, options = {}) {
  const { maxResults = 10 } = options;
  return fetchArXiv({
    search_query: `cat:${category}`,
    max_results: maxResults,
    sortBy: "submittedDate",
    sortOrder: "descending",
  });
}

export async function searchByAuthor(authorName, options = {}) {
  const { start = 0, maxResults = 10 } = options;
  return fetchArXiv({
    search_query: `au:${authorName}`,
    start,
    max_results: maxResults,
    sortBy: "submittedDate",
    sortOrder: "descending",
  });
}

export async function searchByTitle(title, options = {}) {
  const { start = 0, maxResults = 10 } = options;
  return fetchArXiv({
    search_query: `ti:${title}`,
    start,
    max_results: maxResults,
    sortBy: "relevance",
    sortOrder: "descending",
  });
}

export async function searchByAbstract(keyword, options = {}) {
  const { start = 0, maxResults = 10 } = options;
  return fetchArXiv({
    search_query: `abs:${keyword}`,
    start,
    max_results: maxResults,
    sortBy: "relevance",
    sortOrder: "descending",
  });
}

export async function getCategorySuggestions() {
  return {
    "Computer Science": [
      "cs.AI", "cs.LG", "cs.CV", "cs.CL", "cs.NE",
      "cs.RO", "cs.IR", "cs.CR", "cs.DB", "cs.SE",
    ],
    "Mathematics": [
      "math.ST", "math.PR", "math.OC", "math.NA",
    ],
    "Physics": [
      "physics.data-an", "physics.comp-ph",
    ],
    "Electrical Engineering": [
      "eess.SP", "eess.IV", "eess.AS",
    ],
    "Statistics": [
      "stat.ML", "stat.AP", "stat.ME",
    ],
    "Quantitative Biology": [
      "q-bio.QM", "q-bio.NC",
    ],
  };
}

export async function getTrendingPapers(options = {}) {
  const { category = "cs.AI", maxResults = 10 } = options;
  return fetchArXiv({
    search_query: `cat:${category}`,
    max_results: maxResults,
    sortBy: "submittedDate",
    sortOrder: "descending",
  });
}

export async function searchCrossField(query, categories = [], options = {}) {
  const { start = 0, maxResults = 10 } = options;
  let searchQuery = `all:${query}`;
  if (categories.length > 0) {
    const catQuery = categories.map((c) => `cat:${c}`).join(" OR ");
    searchQuery = `${searchQuery} AND (${catQuery})`;
  }
  return fetchArXiv({
    search_query: searchQuery,
    start,
    max_results: maxResults,
    sortBy: "relevance",
    sortOrder: "descending",
  });
}

export async function fetchArxivPapers(options = {}) {
  const { query = "", maxResults = 10, sortBy = "relevance" } = options;
  if (!query.trim()) return { entries: [], total: 0 };
  try {
    const data = await searchPapers(query, { maxResults, sortBy });
    return { entries: data?.papers ?? [], total: data?.total ?? 0 };
  } catch {
    return { entries: [], total: 0 };
  }
}