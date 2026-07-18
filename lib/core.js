import { getCache, setCache } from "./cache";

const BASE_URL = "https://api.core.ac.uk/v3";

function getHeaders() {
  const headers = { "Content-Type": "application/json" };
  const key = process.env.CORE_API_KEY;
  if (key) headers["Authorization"] = `Bearer ${key}`;
  return headers;
}

async function fetchCore(endpoint, body = {}) {
  const cacheKey = `${endpoint}::${JSON.stringify(body)}`;
  const cached = getCache("core", cacheKey);
  if (cached) return cached;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  if (res.status === 429) {
    throw new Error("CORE rate limit reached. Please try again later.");
  }
  if (!res.ok) {
    throw new Error(`CORE error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  setCache("core", cacheKey, data);
  return data;
}

export async function fetchCorePapers(options = {}) {
  const { query = "", limit = 10, offset = 0 } = options;
  if (!query.trim()) return { results: [], totalHits: 0 };

  try {
    const data = await fetchCore("/search/works", {
      q: query.trim(),
      limit,
      offset,
    });
    return {
      results: data?.results ?? [],
      totalHits: data?.totalHits ?? 0,
    };
  } catch {
    return { results: [], totalHits: 0 };
  }
}