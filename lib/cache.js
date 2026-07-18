const cache = new Map();

const TTL = {
  openalex: 1000 * 60 * 60 * 6,
  semanticscholar: 1000 * 60 * 60 * 6,
  arxiv: 1000 * 60 * 60 * 3,
  crossref: 1000 * 60 * 60 * 12,
  doaj: 1000 * 60 * 60 * 12,
  dblp: 1000 * 60 * 60 * 12,
  zenodo: 1000 * 60 * 60 * 6,
  default: 1000 * 60 * 60 * 1,
};

function buildKey(source, query) {
  return `${source}::${JSON.stringify(query)}`;
}

function getTTL(source) {
  return TTL[source.toLowerCase()] ?? TTL.default;
}

export function getCache(source, query) {
  const key = buildKey(source, query);
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

export function setCache(source, query, data) {
  const key = buildKey(source, query);
  cache.set(key, {
    data,
    expiresAt: Date.now() + getTTL(source),
  });
}

export function deleteCache(source, query) {
  const key = buildKey(source, query);
  cache.delete(key);
}

export function clearCacheBySource(source) {
  const prefix = `${source}::`;
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}

export function clearAllCache() {
  cache.clear();
}

export function getCacheStats() {
  const now = Date.now();
  let active = 0;
  let expired = 0;
  for (const entry of cache.values()) {
    if (now > entry.expiresAt) expired++;
    else active++;
  }
  return { total: cache.size, active, expired };
}

export function purgeExpired() {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (now > entry.expiresAt) cache.delete(key);
  }
}