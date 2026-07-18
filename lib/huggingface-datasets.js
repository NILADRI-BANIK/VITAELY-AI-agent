import { getCache, setCache } from "./cache";

const BASE_URL = "https://huggingface.co/api";
const DATASETS_URL = "https://datasets-server.huggingface.co";

function getAuthHeader() {
  const key = process.env.HUGGINGFACE_API_KEY;
  if (!key) {
    throw new Error(
      "HuggingFace API key missing. Set HUGGINGFACE_API_KEY in .env.local",
    );
  }
  return { Authorization: `Bearer ${key}` };
}

async function fetchHuggingFace(baseUrl, endpoint, params = {}) {
  const url = new URL(`${baseUrl}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  const cacheKey = url.toString();
  const cached = getCache("huggingface", cacheKey);
  if (cached) return cached;

  const res = await fetch(url.toString(), {
    headers: {
      ...getAuthHeader(),
      "Content-Type": "application/json",
    },
  });

  if (res.status === 401) {
    throw new Error(
      "HuggingFace authentication failed. Check HUGGINGFACE_API_KEY.",
    );
  }
  if (res.status === 403) {
    throw new Error(
      "HuggingFace access forbidden. Verify your API key permissions.",
    );
  }
  if (res.status === 429) {
    throw new Error("HuggingFace rate limit reached. Please try again later.");
  }
  if (!res.ok) {
    throw new Error(`HuggingFace error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  setCache("huggingface", cacheKey, data);
  return data;
}

async function fetchDatasetsServer(endpoint, params = {}) {
  const url = new URL(`${DATASETS_URL}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  const cacheKey = url.toString();
  const cached = getCache("huggingface", cacheKey);
  if (cached) return cached;

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`HuggingFace datasets-server error: ${res.status} ${res.statusText}`);

  const data = await res.json();
  setCache("huggingface", cacheKey, data);
  return data;
}

function normalizeDataset(item) {
  if (!item) return null;
  return {
    id: item.id ?? "",
    author: item.author ?? "",
    title: item.id?.split("/")[1] ?? item.id ?? "",
    description: item.description ?? item.cardData?.pretty_name ?? "",
    tags: Array.isArray(item.tags) ? item.tags : [],
    downloads: item.downloads ?? 0,
    likes: item.likes ?? 0,
    lastModified: item.lastModified ?? null,
    createdAt: item.createdAt ?? null,
    private: item.private ?? false,
    gated: item.gated ?? false,
    disabled: item.disabled ?? false,
    license: item.cardData?.license ?? "",
    language: item.cardData?.language ?? [],
    task: item.cardData?.task_categories ?? [],
    size: item.cardData?.size_categories ?? [],
    url: `https://huggingface.co/datasets/${item.id ?? ""}`,
    paperWithCode: item.paperswithcode_id ?? null,
  };
}

export async function searchDatasets(query, options = {}) {
  const {
    limit = 10,
    offset = 0,
    sort = "downloads",
    direction = "down",
    full = false,
  } = options;

  const data = await fetchHuggingFace(BASE_URL, "/datasets", {
    search: query,
    limit,
    offset,
    sort,
    direction,
    full,
  });

  return Array.isArray(data) ? data.map(normalizeDataset).filter(Boolean) : [];
}

export async function getDatasetById(datasetId) {
  const data = await fetchHuggingFace(BASE_URL, `/datasets/${datasetId}`);
  return normalizeDataset(data);
}

export async function getDatasetsByTask(task, options = {}) {
  const { limit = 10, offset = 0 } = options;
  const data = await fetchHuggingFace(BASE_URL, "/datasets", {
    filter: `task_categories:${task}`,
    limit,
    offset,
    sort: "downloads",
    direction: "down",
  });
  return Array.isArray(data) ? data.map(normalizeDataset).filter(Boolean) : [];
}

export async function getDatasetsByLanguage(language, options = {}) {
  const { limit = 10, offset = 0 } = options;
  const data = await fetchHuggingFace(BASE_URL, "/datasets", {
    filter: `language:${language}`,
    limit,
    offset,
    sort: "downloads",
    direction: "down",
  });
  return Array.isArray(data) ? data.map(normalizeDataset).filter(Boolean) : [];
}

export async function getDatasetsByLicense(license, options = {}) {
  const { limit = 10, offset = 0 } = options;
  const data = await fetchHuggingFace(BASE_URL, "/datasets", {
    filter: `license:${license}`,
    limit,
    offset,
    sort: "downloads",
    direction: "down",
  });
  return Array.isArray(data) ? data.map(normalizeDataset).filter(Boolean) : [];
}

export async function getTrendingDatasets(options = {}) {
  const { limit = 10, offset = 0 } = options;
  const data = await fetchHuggingFace(BASE_URL, "/datasets", {
    limit,
    offset,
    sort: "likes",
    direction: "down",
  });
  return Array.isArray(data) ? data.map(normalizeDataset).filter(Boolean) : [];
}

export async function getMostDownloadedDatasets(options = {}) {
  const { limit = 10, offset = 0 } = options;
  const data = await fetchHuggingFace(BASE_URL, "/datasets", {
    limit,
    offset,
    sort: "downloads",
    direction: "down",
  });
  return Array.isArray(data) ? data.map(normalizeDataset).filter(Boolean) : [];
}

export async function getNewestDatasets(options = {}) {
  const { limit = 10, offset = 0 } = options;
  const data = await fetchHuggingFace(BASE_URL, "/datasets", {
    limit,
    offset,
    sort: "createdAt",
    direction: "down",
  });
  return Array.isArray(data) ? data.map(normalizeDataset).filter(Boolean) : [];
}

export async function getDatasetsByAuthor(author, options = {}) {
  const { limit = 10, offset = 0 } = options;
  const data = await fetchHuggingFace(BASE_URL, "/datasets", {
    author,
    limit,
    offset,
    sort: "downloads",
    direction: "down",
  });
  return Array.isArray(data) ? data.map(normalizeDataset).filter(Boolean) : [];
}

export async function getDatasetSplits(datasetId) {
  const data = await fetchDatasetsServer("/splits", { dataset: datasetId });
  return data?.splits ?? [];
}

export async function getDatasetInfo(datasetId, config = null) {
  const params = { dataset: datasetId };
  if (config) params.config = config;
  const data = await fetchDatasetsServer("/info", params);
  return data?.dataset_info ?? null;
}

export async function getDatasetParquetFiles(
  datasetId,
  config = null,
  split = null,
) {
  const params = { dataset: datasetId };
  if (config) params.config = config;
  if (split) params.split = split;
  const data = await fetchDatasetsServer("/parquet", params);
  return data?.parquet_files ?? [];
}

export async function getDatasetPreview(
  datasetId,
  config = null,
  split = "train",
  options = {},
) {
  const { offset = 0, length = 5 } = options;
  const params = { dataset: datasetId, split, offset, length };
  if (config) params.config = config;
  const data = await fetchDatasetsServer("/rows", params);
  return {
    rows: data?.rows ?? [],
    features: data?.features ?? [],
    total: data?.num_rows_total ?? 0,
  };
}

export async function getDatasetsByCategory(category, options = {}) {
  const categoryQueryMap = {
    nlp: "text-classification",
    "computer-vision": "image-classification",
    audio: "audio-classification",
    translation: "translation",
    summarization: "summarization",
    "question-answering": "question-answering",
    "token-classification": "token-classification",
    "text-generation": "text-generation",
    tabular: "tabular-classification",
    "reinforcement-learning": "reinforcement-learning",
  };

  const task = categoryQueryMap[category] ?? category;
  return getDatasetsByTask(task, options);
}

export async function fetchHuggingFaceDatasets(options = {}) {
  const { search = "", limit = 10 } = options;
  try {
    const datasets = await searchDatasets(search, { limit });
    return { datasets };
  } catch {
    return { datasets: [] };
  }
}