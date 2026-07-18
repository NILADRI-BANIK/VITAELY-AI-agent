import { getCache, setCache } from "./cache";

const BASE_URL = "https://www.kaggle.com/api/v1";

function getAuthHeader() {
  const username = process.env.KAGGLE_USERNAME;
  const key = process.env.KAGGLE_KEY;

  if (!username || !key) {
    throw new Error(
      "Kaggle credentials missing. Set KAGGLE_USERNAME and KAGGLE_KEY in .env.local",
    );
  }

  const encoded = Buffer.from(`${username}:${key}`).toString("base64");
  return { Authorization: `Basic ${encoded}` };
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
    headers: {
      ...getAuthHeader(),
      "Content-Type": "application/json",
    },
  });

  if (res.status === 401) {
    throw new Error(
      "Kaggle authentication failed. Check KAGGLE_USERNAME and KAGGLE_KEY.",
    );
  }
  if (res.status === 403) {
    throw new Error("Kaggle access forbidden. Verify your API credentials.");
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

function normalizeDataset(item) {
  if (!item) return null;
  return {
    id: item.id || null,
    ref: item.ref ?? "",
    title: item.title || "",
    subtitle: item.subtitle || "",
    description: item.description || "",
    owner: item.ownerUser || "",
    ownerRef: item.ownerRef || "",
    tags: (item.tags || []).map((t) => t.name || t),
    usabilityRating: item.usabilityRating || 0,
    totalBytes: item.totalBytes || 0,
    totalBytesMB: item.totalBytes
      ? (item.totalBytes / (1024 * 1024)).toFixed(2)
      : "0",
    downloadCount: item.downloadCount || 0,
    voteCount: item.voteCount || 0,
    viewCount: item.viewCount || 0,
    lastUpdated: item.lastUpdated || null,
    isPrivate: item.isPrivate || false,
    licenseName: item.licenseName || "",
    url: `https://www.kaggle.com/datasets/${item.ref || ""}`,
    fileTypes: (item.files || []).map((f) => f.fileType || "").filter(Boolean),
  };
}

export async function searchDatasets(query, options = {}) {
  const {
    page = 1,
    pageSize = 10,
    sortBy = "relevance",
    fileType = "",
    license = "",
    tagIds = "",
    minSize = "",
    maxSize = "",
  } = options;

  const params = {
    search: query,
    page,
    pageSize,
    sortBy,
  };

  if (fileType) params.fileType = fileType;
  if (license) params.license = license;
  if (tagIds) params.tagIds = tagIds;
  if (minSize) params.minSize = minSize;
  if (maxSize) params.maxSize = maxSize;

  const data = await fetchKaggle("/datasets/list", params);
  return Array.isArray(data) ? data.map(normalizeDataset).filter(Boolean) : [];
}
export async function getDatasetByRef(ownerSlug, datasetSlug) {
  const data = await fetchKaggle(`/datasets/${ownerSlug}/${datasetSlug}`);
  return normalizeDataset(data);
}

export async function getDatasetFiles(ownerSlug, datasetSlug) {
  // Kaggle public REST API does not expose a file-listing endpoint.
  // Returns a direct Kaggle page URL for the user to browse files manually.
  return {
    message: "File listing not available via Kaggle public REST API.",
    kaggleUrl: `https://www.kaggle.com/datasets/${ownerSlug}/${datasetSlug}`,
  };
}

export async function listDatasetsByTag(tag, options = {}) {
  const { page = 1, pageSize = 10, sortBy = "hotness" } = options;
  const data = await fetchKaggle("/datasets/list", {
    search: tag,
    page,
    pageSize,
    sortBy,
  });
  return Array.isArray(data) ? data.map(normalizeDataset).filter(Boolean) : [];
}

export async function getTrendingDatasets(options = {}) {
  const { page = 1, pageSize = 10 } = options;
  const data = await fetchKaggle("/datasets/list", {
    sortBy: "hotness",
    page,
    pageSize,
  });
  return Array.isArray(data) ? data.map(normalizeDataset).filter(Boolean) : [];
}

export async function getNewDatasets(options = {}) {
  const { page = 1, pageSize = 10 } = options;
  const data = await fetchKaggle("/datasets/list", {
    sortBy: "published",
    page,
    pageSize,
  });
  return Array.isArray(data) ? data.map(normalizeDataset).filter(Boolean) : [];
}

export async function getMostVotedDatasets(options = {}) {
  const { page = 1, pageSize = 10 } = options;
  const data = await fetchKaggle("/datasets/list", {
    sortBy: "votes",
    page,
    pageSize,
  });
  return Array.isArray(data) ? data.map(normalizeDataset).filter(Boolean) : [];
}

export async function searchCompetitions(query, options = {}) {
  const {
    page = 1,
    pageSize = 10,
    sortBy = "latestDeadline",
    category = "",
  } = options;

  const params = {
    search: query,
    page,
    pageSize,
    sortBy,
  };
  if (category) params.category = category;

  const data = await fetchKaggle("/competitions/list", params);
  return Array.isArray(data)
    ? data.map((c) => ({
        id: c.id || null,
        title: c.title || "",
        description: c.description || "",
        category: c.category || "",
        reward: c.reward || "",
        teamCount: c.teamCount || 0,
        deadline: c.deadline || null,
        isKernelsSubmissionsOnly: c.isKernelsSubmissionsOnly || false,
        url: `https://www.kaggle.com/c/${c.ref || ""}`,
        tags: (c.tags || []).map((t) => t.name || t),
      }))
    : [];
}

export async function getUserDatasets(username, options = {}) {
  const { page = 1, pageSize = 10 } = options;
  const data = await fetchKaggle("/datasets/list", {
    user: username,
    page,
    pageSize,
  });
  return Array.isArray(data) ? data.map(normalizeDataset).filter(Boolean) : [];
}

export async function searchDatasetsByCategory(category, options = {}) {
  const categoryQueryMap = {
    "machine-learning": "machine learning",
    "deep-learning": "deep learning",
    nlp: "natural language processing",
    "computer-vision": "computer vision",
    "time-series": "time series",
    tabular: "tabular data",
    image: "image classification",
    audio: "audio speech",
    healthcare: "healthcare medical",
    finance: "finance stock",
    climate: "climate weather environment",
    social: "social media sentiment",
  };

  const query = categoryQueryMap[category] || category;
  return searchDatasets(query, options);
}

export async function getDatasetDownloadUrl(ownerSlug, datasetSlug) {
  // Direct download requires Kaggle CLI or authenticated session.
  // Returns the dataset page URL as the accessible fallback.
  return `https://www.kaggle.com/datasets/${ownerSlug}/${datasetSlug}`;
}
