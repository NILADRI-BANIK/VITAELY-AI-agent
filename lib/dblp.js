const DBLP_BASE_URL = "https://dblp.org/search";
const DBLP_API_URL = "https://dblp.org/rec";

function formatPublication(hit) {
  const info = hit?.info || {};
  const authors = info.authors?.author;
  return {
    key: info.key || null,
    title: info.title || "Untitled",
    authors: Array.isArray(authors)
      ? authors
          .map((a) =>
            typeof a === "string" ? a : a?.text || a?.author || null
          )
          .filter(Boolean)
      : typeof authors === "object" && authors !== null
      ? [authors.text || authors.author].filter(Boolean)
      : [],
    venue: info.venue?.trim() || null,
    year: info.year ? String(info.year) : null,
    type: info.type || null,
    doi: info.doi?.trim() || null,
    url: info.url?.trim() || null,
    ee: Array.isArray(info.ee) ? info.ee : info.ee ? [info.ee] : [],
    access: info.access || null,
    pages: info.pages || null,
    volume: info.volume || null,
    number: info.number || null,
    publisher: info.publisher || null,
  };
}

function formatAuthor(hit) {
  const info = hit?.info || {};
  const aliases = info.aliases?.alias;
  return {
    author: info.author || null,
    url: info.url || null,
    aliases: Array.isArray(aliases)
      ? aliases.filter(Boolean)
      : aliases
      ? [aliases]
      : [],
    notes: info.notes?.note
      ? Array.isArray(info.notes.note)
        ? info.notes.note
            .map((n) => (typeof n === "string" ? n : n?.text))
            .filter(Boolean)
        : [
            typeof info.notes.note === "string"
              ? info.notes.note
              : info.notes.note?.text,
          ].filter(Boolean)
      : [],
  };
}

function formatVenue(hit) {
  const info = hit?.info || {};
  return {
    venue: info.venue?.trim() || null,
    acronym: info.acronym || null,
    type: info.type || null,
    url: info.url?.trim() || null,
    editor: info.editor || null,
    publisher: info.publisher || null,
    year: info.year ? String(info.year) : null,
  };
}

async function searchPublications(query, options = {}) {
  if (!query?.trim())
    return { total: 0, first: 0, hits: 10, results: [] };

  const { first = 0, hits = 10 } = options;

  const params = new URLSearchParams({
    q: query.trim(),
    format: "json",
    h: String(hits),
    f: String(first),
  });

  try {
    const res = await fetch(`${DBLP_BASE_URL}/publ/api?${params.toString()}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });

    if (!res.ok)
      throw new Error(`DBLP searchPublications failed: ${res.status}`);

    const data = await res.json();
    const result = data?.result;
    const total = parseInt(
      result?.hits?.["@total"] ?? result?.hits?.total ?? "0",
      10
    );
    const hitList = result?.hits?.hit;

    return {
      total,
      first,
      hits,
      results: Array.isArray(hitList)
        ? hitList.map(formatPublication)
        : hitList
        ? [formatPublication(hitList)]
        : [],
    };
  } catch (error) {
    console.error("dblp.searchPublications error:", error.message);
    return { total: 0, first, hits, results: [] };
  }
}

async function searchAuthors(query, options = {}) {
  if (!query?.trim())
    return { total: 0, first: 0, hits: 10, results: [] };

  const { first = 0, hits = 10 } = options;

  const params = new URLSearchParams({
    q: query.trim(),
    format: "json",
    h: String(hits),
    f: String(first),
  });

  try {
    const res = await fetch(`${DBLP_BASE_URL}/author/api?${params.toString()}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error(`DBLP searchAuthors failed: ${res.status}`);

    const data = await res.json();
    const result = data?.result;
    const total = parseInt(
      result?.hits?.["@total"] ?? result?.hits?.total ?? "0",
      10
    );
    const hitList = result?.hits?.hit;

    return {
      total,
      first,
      hits,
      results: Array.isArray(hitList)
        ? hitList.map(formatAuthor)
        : hitList
        ? [formatAuthor(hitList)]
        : [],
    };
  } catch (error) {
    console.error("dblp.searchAuthors error:", error.message);
    return { total: 0, first, hits, results: [] };
  }
}

async function searchVenues(query, options = {}) {
  if (!query?.trim())
    return { total: 0, first: 0, hits: 10, results: [] };

  const { first = 0, hits = 10 } = options;

  const params = new URLSearchParams({
    q: query.trim(),
    format: "json",
    h: String(hits),
    f: String(first),
  });

  try {
    const res = await fetch(`${DBLP_BASE_URL}/venue/api?${params.toString()}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error(`DBLP searchVenues failed: ${res.status}`);

    const data = await res.json();
    const result = data?.result;
    const total = parseInt(
      result?.hits?.["@total"] ?? result?.hits?.total ?? "0",
      10
    );
    const hitList = result?.hits?.hit;

    return {
      total,
      first,
      hits,
      results: Array.isArray(hitList)
        ? hitList.map(formatVenue)
        : hitList
        ? [formatVenue(hitList)]
        : [],
    };
  } catch (error) {
    console.error("dblp.searchVenues error:", error.message);
    return { total: 0, first, hits, results: [] };
  }
}

async function getAuthorPublications(authorQuery, options = {}) {
  if (!authorQuery?.trim())
    return { total: 0, first: 0, hits: 20, results: [] };

  const { first = 0, hits = 20 } = options;

  const params = new URLSearchParams({
    q: authorQuery.trim(),
    format: "json",
    h: String(hits),
    f: String(first),
  });

  try {
    const res = await fetch(`${DBLP_BASE_URL}/publ/api?${params.toString()}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });

    if (!res.ok)
      throw new Error(`DBLP getAuthorPublications failed: ${res.status}`);

    const data = await res.json();
    const result = data?.result;
    const total = parseInt(
      result?.hits?.["@total"] ?? result?.hits?.total ?? "0",
      10
    );
    const hitList = result?.hits?.hit;

    return {
      total,
      first,
      hits,
      results: Array.isArray(hitList)
        ? hitList.map(formatPublication)
        : hitList
        ? [formatPublication(hitList)]
        : [],
    };
  } catch (error) {
    console.error("dblp.getAuthorPublications error:", error.message);
    return { total: 0, first, hits, results: [] };
  }
}

async function getVenuePublications(venueQuery, options = {}) {
  if (!venueQuery?.trim())
    return { total: 0, first: 0, hits: 20, results: [] };

  const { first = 0, hits = 20 } = options;

  const params = new URLSearchParams({
    q: venueQuery.trim(),
    format: "json",
    h: String(hits),
    f: String(first),
  });

  try {
    const res = await fetch(`${DBLP_BASE_URL}/publ/api?${params.toString()}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });

    if (!res.ok)
      throw new Error(`DBLP getVenuePublications failed: ${res.status}`);

    const data = await res.json();
    const result = data?.result;
    const total = parseInt(
      result?.hits?.["@total"] ?? result?.hits?.total ?? "0",
      10
    );
    const hitList = result?.hits?.hit;

    return {
      total,
      first,
      hits,
      results: Array.isArray(hitList)
        ? hitList.map(formatPublication)
        : hitList
        ? [formatPublication(hitList)]
        : [],
    };
  } catch (error) {
    console.error("dblp.getVenuePublications error:", error.message);
    return { total: 0, first, hits, results: [] };
  }
}

async function getPublication(dblpKey) {
  if (!dblpKey?.trim()) return null;

  const cleanKey = dblpKey.trim().replace(/^\//, "");

  try {
    const res = await fetch(`${DBLP_API_URL}/${cleanKey}.json`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });

    if (!res.ok)
      throw new Error(`DBLP getPublication failed: ${res.status}`);

    const data = await res.json();
    const entry =
      data?.dblp ?? data?.result?.hits?.hit?.[0] ?? null;

    return entry ? formatPublication({ info: entry }) : null;
  } catch (error) {
    console.error("dblp.getPublication error:", error.message);
    return null;
  }
}

export {
  searchPublications,
  searchAuthors,
  searchVenues,
  getAuthorPublications,
  getVenuePublications,
  getPublication,
  formatPublication,
  formatAuthor,
  formatVenue,
};