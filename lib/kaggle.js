import { getCache, setCache } from "./cache";

const BASE_URL = "https://www.kaggle.com/api/v1";

function getAuthHeader() {
  const username = process.env.KAGGLE_USERNAME;
  const key = process.env.KAGGLE_KEY;
  if (!username || !key) {
    throw new Error(
      "Kaggle credentials missing. Set KAGGLE_USERNAME and KAGGLE_KEY in .env",
    );
  }
  const token = Buffer.from(`${username}:${key}`).toString("base64");
  return { Authorization: `Basic ${token}` };
}

async function fetchKaggle(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  const cacheKey = url.toString();
  const cached = getCache("kaggle", cacheKey);
  if (cached) return cached;

  const res = await fetch(url.toString(), {
    headers: { ...getAuthHeader(), "Content-Type": "application/json" },
  });

  if (res.status === 401) {
    throw new Error("Kaggle authentication failed. Check KAGGLE_USERNAME/KAGGLE_KEY.");
  }
  if (res.status === 429) {
    throw new Error("Kaggle rate limit reached. Please try again later.");
  }
  if (!res.ok) {
    throw new Error(`Kaggle error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  setCache("kaggle", cacheKey, data);
  return data;
}

export async function fetchKaggleDatasets(options = {}) {
  const { search = "", limit = 10, sortBy = "hottest" } = options;
  try {
    const data = await fetchKaggle("/datasets/list", {
      search,
      page: 1,
      pageSize: limit,
      sortBy,
    });
    return { results: Array.isArray(data) ? data : [] };
  } catch {
    return { results: [] };
  }
}