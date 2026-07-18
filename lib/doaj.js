const DOAJ_BASE_URL = "https://doaj.org/api";

function formatJournalRecord(journal) {
  const bibjson = journal.bibjson || {};
  return {
    id: journal.id || null,
    title: bibjson.title || "Untitled",
    alternativeTitle: bibjson.alternative_title || null,
    issns: [
      ...new Set([
        ...(bibjson.pissn ? [bibjson.pissn] : []),
        ...(bibjson.eissn ? [bibjson.eissn] : []),
      ]),
    ],
    publisher:
      typeof bibjson.publisher === "string"
        ? bibjson.publisher
        : bibjson.publisher?.name || null,
    country: bibjson.country || null,
    language: Array.isArray(bibjson.language) ? bibjson.language : [],
    subjects: Array.isArray(bibjson.subject)
      ? bibjson.subject.map((s) => s.term).filter(Boolean)
      : [],
    keywords: Array.isArray(bibjson.keywords)
      ? bibjson.keywords.filter(Boolean)
      : [],
    license: Array.isArray(bibjson.license)
      ? bibjson.license.map((l) => l.type).filter(Boolean)
      : [],
    apcAmount: bibjson.apc?.max?.[0]?.price ?? null,
    apcCurrency: bibjson.apc?.max?.[0]?.currency ?? null,
    apcFree:
      bibjson.apc == null
        ? true
        : bibjson.apc?.has_apc === false
        ? true
        : false,
    url: bibjson.ref?.journal || null,
    aimAndScope: bibjson.aims_scope || null,
    reviewProcess: Array.isArray(bibjson.editorial?.review_process)
      ? bibjson.editorial.review_process
      : bibjson.editorial?.review_process
      ? [bibjson.editorial.review_process]
      : [],
    submissionUrl: bibjson.ref?.submission || null,
    createdDate: journal.created_date || null,
    lastUpdated: journal.last_updated || null,
  };
}

function formatArticleRecord(article) {
  const bibjson = article.bibjson || {};
  return {
    id: article.id || null,
    title: bibjson.title || "Untitled",
    abstract:
      typeof bibjson.abstract === "string"
        ? bibjson.abstract.replace(/<[^>]+>/g, "").slice(0, 1000)
        : null,
    authors: Array.isArray(bibjson.author)
      ? bibjson.author
          .map((a) => a.name)
          .filter(Boolean)
          .join(", ")
      : null,
    journal: bibjson.journal?.title || null,
    issns: [
      ...new Set([
        ...(bibjson.journal?.pissn ? [bibjson.journal.pissn] : []),
        ...(bibjson.journal?.issns || []),
      ]),
    ],
    year: bibjson.year || null,
    month: bibjson.month || null,
    volume: bibjson.journal?.volume || null,
    number: bibjson.journal?.number || null,
    startPage: bibjson.start_page || null,
    endPage: bibjson.end_page || null,
    doi: Array.isArray(bibjson.identifier)
      ? (bibjson.identifier.find((i) => i.type === "doi")?.id ?? null)
      : null,
    keywords: Array.isArray(bibjson.keywords)
      ? bibjson.keywords.filter(Boolean)
      : [],
    subjects: Array.isArray(bibjson.subject)
      ? bibjson.subject.map((s) => s.term).filter(Boolean)
      : [],
    fullTextUrl: Array.isArray(bibjson.link)
      ? (bibjson.link.find(
          (l) => l.type?.toLowerCase() === "fulltext"
        )?.url ?? null)
      : null,
    createdDate: article.created_date || null,
    lastUpdated: article.last_updated || null,
  };
}

async function searchJournals(query, options = {}) {
  if (!query?.trim()) return { total: 0, page: 1, pageSize: 10, results: [] };

  const { page = 1, pageSize = 10 } = options;

  const encodedQuery = encodeURIComponent(query.trim());
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  try {
    const res = await fetch(
      `${DOAJ_BASE_URL}/search/journals/${encodedQuery}?${params.toString()}`,
      {
        headers: { "Content-Type": "application/json" },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) throw new Error(`DOAJ searchJournals failed: ${res.status}`);

    const data = await res.json();
    return {
      total: data.total || 0,
      page: data.page || page,
      pageSize: data.pageSize || pageSize,
      results: (data.results || []).map(formatJournalRecord),
    };
  } catch (error) {
    console.error("doaj.searchJournals error:", error.message);
    return { total: 0, page, pageSize, results: [] };
  }
}

async function getJournal(journalId) {
  if (!journalId) return null;

  try {
    const res = await fetch(`${DOAJ_BASE_URL}/journals/${journalId}`, {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error(`DOAJ getJournal failed: ${res.status}`);

    const data = await res.json();
    const record = data.bibjson ? data : data.results?.[0] ?? null;
    return record ? formatJournalRecord(record) : null;
  } catch (error) {
    console.error("doaj.getJournal error:", error.message);
    return null;
  }
}

async function searchArticles(query, options = {}) {
  if (!query?.trim()) return { total: 0, page: 1, pageSize: 10, results: [] };

  const { page = 1, pageSize = 10, sort = "score" } = options;

  const params = new URLSearchParams({
    q: query.trim(),
    page: String(page),
    pageSize: String(pageSize),
    sort,
  });

  try {
    const res = await fetch(
      `${DOAJ_BASE_URL}/search/articles?${params.toString()}`,
      {
        headers: { "Content-Type": "application/json" },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) throw new Error(`DOAJ searchArticles failed: ${res.status}`);

    const data = await res.json();
    return {
      total: data.total || 0,
      page: data.page || page,
      pageSize: data.pageSize || pageSize,
      results: (data.results || []).map(formatArticleRecord),
    };
  } catch (error) {
    console.error("doaj.searchArticles error:", error.message);
    return { total: 0, page, pageSize, results: [] };
  }
}

async function getArticle(articleId) {
  if (!articleId) return null;

  try {
    const res = await fetch(`${DOAJ_BASE_URL}/articles/${articleId}`, {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error(`DOAJ getArticle failed: ${res.status}`);

    const data = await res.json();
    const record = data.bibjson ? data : data.results?.[0] ?? null;
    return record ? formatArticleRecord(record) : null;
  } catch (error) {
    console.error("doaj.getArticle error:", error.message);
    return null;
  }
}

async function searchByISSN(issn) {
  if (!issn) return null;

  const cleanISSN = issn.replace(/[^0-9X-]/gi, "").toUpperCase();
  if (!cleanISSN) return null;

  try {
    const res = await fetch(
      `${DOAJ_BASE_URL}/search/journals?q=${encodeURIComponent(
        `issn:${cleanISSN}`
      )}&pageSize=1`,
      {
        headers: { "Content-Type": "application/json" },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) throw new Error(`DOAJ searchByISSN failed: ${res.status}`);

    const data = await res.json();
    const results = data.results || [];
    return results.length > 0 ? formatJournalRecord(results[0]) : null;
  } catch (error) {
    console.error("doaj.searchByISSN error:", error.message);
    return null;
  }
}

async function searchBySubject(subject, options = {}) {
  if (!subject?.trim()) return { total: 0, page: 1, pageSize: 10, results: [] };

  const { page = 1, pageSize = 10 } = options;

  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  try {
    const res = await fetch(
      `${DOAJ_BASE_URL}/search/journals?q=${encodeURIComponent(
        `subject:"${subject.trim()}"`
      )}&${params.toString()}`,
      {
        headers: { "Content-Type": "application/json" },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) throw new Error(`DOAJ searchBySubject failed: ${res.status}`);

    const data = await res.json();
    return {
      total: data.total || 0,
      page: data.page || page,
      pageSize: data.pageSize || pageSize,
      results: (data.results || []).map(formatJournalRecord),
    };
  } catch (error) {
    console.error("doaj.searchBySubject error:", error.message);
    return { total: 0, page, pageSize, results: [] };
  }
}

async function getLatestJournals(options = {}) {
  const { pageSize = 10 } = options;

  const params = new URLSearchParams({
    q: "*",
    pageSize: String(pageSize),
    sort: "created_date:desc",
  });

  try {
    const res = await fetch(
      `${DOAJ_BASE_URL}/search/journals?${params.toString()}`,
      {
        headers: { "Content-Type": "application/json" },
        next: { revalidate: 1800 },
      }
    );

    if (!res.ok)
      throw new Error(`DOAJ getLatestJournals failed: ${res.status}`);

    const data = await res.json();
    return (data.results || []).map(formatJournalRecord);
  } catch (error) {
    console.error("doaj.getLatestJournals error:", error.message);
    return [];
  }
}

export {
  searchJournals,
  getJournal,
  searchArticles,
  getArticle,
  searchByISSN,
  searchBySubject,
  getLatestJournals,
  formatJournalRecord,
  formatArticleRecord,
};