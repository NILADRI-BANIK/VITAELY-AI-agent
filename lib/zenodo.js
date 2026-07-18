const ZENODO_BASE_URL = "https://zenodo.org/api";

function getZenodoHeaders() {
  const headers = { "Content-Type": "application/json" };
  const token = process.env.ZENODO_TOKEN;
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

function formatZenodoRecord(record) {
  const metadata = record.metadata || {};
  return {
    id: record.id,
    doi: record.doi || metadata.doi || null,
    title: metadata.title || "Untitled",
    description: metadata.description
      ? metadata.description.replace(/<[^>]*>/g, "").slice(0, 500)
      : null,
    authors: Array.isArray(metadata.creators)
      ? metadata.creators.map((c) => c.name).join(", ")
      : null,
    keywords: Array.isArray(metadata.keywords) ? metadata.keywords : [],
    resourceType: metadata.resource_type?.type || "unknown",
    publicationDate: metadata.publication_date || null,
    accessRight: metadata.access_right || null,
    license: metadata.license?.id || null,
    files: Array.isArray(record.files)
      ? record.files.map((f) => ({
          name: f.key,
          size: f.size,
          url: f.links?.self,
        }))
      : [],
    htmlUrl: record.links?.html || null,
    fileCount: Array.isArray(record.files) ? record.files.length : 0,
    fileSize: Array.isArray(record.files)
      ? record.files.reduce((acc, f) => acc + (f.size || 0), 0)
      : 0,
    communities: Array.isArray(metadata.communities)
      ? metadata.communities.map((c) => c.identifier)
      : [],
    version: metadata.version || null,
    language: metadata.language || null,
    relatedIdentifiers: Array.isArray(metadata.related_identifiers)
      ? metadata.related_identifiers
      : [],
  };
}

async function searchDatasets(query, options = {}) {
  const {
    page = 1,
    size = 10,
    sort = "mostrecent",
    type = "dataset",
    access = null,
  } = options;

  const params = new URLSearchParams({
    q: `${query} resource_type.type:${type}`,
    page: String(page),
    size: String(size),
    sort,
  });

  if (access) params.set("access_right", access);

  try {
    const res = await fetch(`${ZENODO_BASE_URL}/records?${params.toString()}`, {
      headers: getZenodoHeaders(),
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error(`Zenodo searchDatasets failed: ${res.status}`);

    const data = await res.json();
    return {
      total: data.hits?.total?.value ?? data.hits?.total ?? 0,
      results: (data.hits?.hits || []).map(formatZenodoRecord),
    };
  } catch (error) {
    console.error("zenodo.searchDatasets error:", error.message);
    return { total: 0, results: [] };
  }
}

async function getRecord(recordId) {
  if (!recordId) return null;

  try {
    const res = await fetch(`${ZENODO_BASE_URL}/records/${recordId}`, {
      headers: getZenodoHeaders(),
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error(`Zenodo getRecord failed: ${res.status}`);

    const data = await res.json();
    return formatZenodoRecord(data);
  } catch (error) {
    console.error("zenodo.getRecord error:", error.message);
    return null;
  }
}

async function searchByDOI(doi) {
  if (!doi) return null;

  try {
    const params = new URLSearchParams({ q: `doi:"${doi}"`, size: "1" });
    const res = await fetch(`${ZENODO_BASE_URL}/records?${params.toString()}`, {
      headers: getZenodoHeaders(),
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error(`Zenodo searchByDOI failed: ${res.status}`);

    const data = await res.json();
    const hits = data.hits?.hits || [];
    return hits.length > 0 ? formatZenodoRecord(hits[0]) : null;
  } catch (error) {
    console.error("zenodo.searchByDOI error:", error.message);
    return null;
  }
}

async function searchByKeyword(keyword, options = {}) {
  const { page = 1, size = 10, sort = "mostrecent" } = options;

  const params = new URLSearchParams({
    q: `keywords:"${keyword}"`,
    page: String(page),
    size: String(size),
    sort,
  });

  try {
    const res = await fetch(`${ZENODO_BASE_URL}/records?${params.toString()}`, {
      headers: getZenodoHeaders(),
      next: { revalidate: 3600 },
    });

    if (!res.ok)
      throw new Error(`Zenodo searchByKeyword failed: ${res.status}`);

    const data = await res.json();
    return {
      total: data.hits?.total?.value ?? data.hits?.total ?? 0,
      results: (data.hits?.hits || []).map(formatZenodoRecord),
    };
  } catch (error) {
    console.error("zenodo.searchByKeyword error:", error.message);
    return { total: 0, results: [] };
  }
}

async function getLatestRecords(options = {}) {
  const { size = 10, type = "dataset" } = options;

  const params = new URLSearchParams({
    q: `resource_type.type:${type}`,
    sort: "mostrecent",
    size: String(size),
  });

  try {
    const res = await fetch(`${ZENODO_BASE_URL}/records?${params.toString()}`, {
      headers: getZenodoHeaders(),
      next: { revalidate: 1800 },
    });

    if (!res.ok)
      throw new Error(`Zenodo getLatestRecords failed: ${res.status}`);

    const data = await res.json();
    return (data.hits?.hits || []).map(formatZenodoRecord);
  } catch (error) {
    console.error("zenodo.getLatestRecords error:", error.message);
    return [];
  }
}

async function searchSoftware(query, options = {}) {
  const { page = 1, size = 10 } = options;

  const params = new URLSearchParams({
    q: `${query} resource_type.type:software`,
    page: String(page),
    size: String(size),
    sort: "mostrecent",
  });

  try {
    const res = await fetch(`${ZENODO_BASE_URL}/records?${params.toString()}`, {
      headers: getZenodoHeaders(),
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error(`Zenodo searchSoftware failed: ${res.status}`);

    const data = await res.json();
    return {
      total: data.hits?.total?.value ?? data.hits?.total ?? 0,
      results: (data.hits?.hits || []).map(formatZenodoRecord),
    };
  } catch (error) {
    console.error("zenodo.searchSoftware error:", error.message);
    return { total: 0, results: [] };
  }
}

async function searchByCommunity(communityId, options = {}) {
  if (!communityId) return { total: 0, results: [] };

  const { page = 1, size = 10, sort = "mostrecent" } = options;

  const params = new URLSearchParams({
    q: `communities:${communityId}`,
    page: String(page),
    size: String(size),
    sort,
  });

  try {
    const res = await fetch(`${ZENODO_BASE_URL}/records?${params.toString()}`, {
      headers: getZenodoHeaders(),
      next: { revalidate: 3600 },
    });

    if (!res.ok)
      throw new Error(`Zenodo searchByCommunity failed: ${res.status}`);

    const data = await res.json();
    return {
      total: data.hits?.total?.value ?? data.hits?.total ?? 0,
      results: (data.hits?.hits || []).map(formatZenodoRecord),
    };
  } catch (error) {
    console.error("zenodo.searchByCommunity error:", error.message);
    return { total: 0, results: [] };
  }
}

export {
  searchDatasets,
  getRecord,
  searchByDOI,
  searchByKeyword,
  getLatestRecords,
  searchSoftware,
  searchByCommunity,
  formatZenodoRecord,
  fetchZenodoDatasets,
};

async function fetchZenodoDatasets(options = {}) {
  const { query = "", limit = 10 } = options;
  if (!query.trim()) return { hits: { hits: [] }, results: [] };
  try {
    const data = await searchDatasets(query, { size: limit });
    return { results: data.results ?? [], total: data.total ?? 0 };
  } catch {
    return { results: [], total: 0 };
  }
}