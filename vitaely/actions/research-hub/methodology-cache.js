import { db } from "@/lib/prisma";

const DEFAULT_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

const TTL_BY_PREFIX = {
  methodology: 1000 * 60 * 60 * 12,
  literature_analysis: 1000 * 60 * 60 * 24,
  statistics_recommendation: 1000 * 60 * 60 * 24,
  validation_recommendation: 1000 * 60 * 60 * 24,
  methodology_recommendation: 1000 * 60 * 60 * 12,
  methodology_compare: 1000 * 60 * 60 * 12,
};

function resolveTTL(cacheKey) {
  const prefix = Object.keys(TTL_BY_PREFIX).find((p) =>
    cacheKey.startsWith(p),
  );
  return prefix ? TTL_BY_PREFIX[prefix] : DEFAULT_TTL_MS;
}

export function buildCacheSlug(str) {
  return String(str ?? "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 50);
}

export function buildMethodologyCacheKey(prefix, userId, ...parts) {
  const slugParts = parts.map((p) => buildCacheSlug(p)).filter(Boolean);
  return [prefix, userId, ...slugParts].join("_");
}

export async function getCachedMethodologyData(cacheKey) {
  if (!cacheKey) return null;

  try {
    const cached = await db.researchCache.findUnique({ where: { cacheKey } });
    if (!cached) return null;

    const ttl = resolveTTL(cacheKey);
    const isExpired = Date.now() - new Date(cached.updatedAt).getTime() > ttl;

    if (isExpired) {
      await db.researchCache.delete({ where: { cacheKey } }).catch(() => {});
      return null;
    }

    return typeof cached.data === "string"
      ? JSON.parse(cached.data)
      : cached.data;
  } catch {
    return null;
  }
}

export async function setCachedMethodologyData(cacheKey, data) {
  if (!cacheKey) return false;

  try {
    await db.researchCache.upsert({
      where: { cacheKey },
      update: { data, updatedAt: new Date() },
      create: { cacheKey, data },
    });
    return true;
  } catch {
    return false;
  }
}

export async function deleteCachedMethodologyData(cacheKey) {
  if (!cacheKey) return false;

  try {
    await db.researchCache.delete({ where: { cacheKey } });
    return true;
  } catch {
    return false;
  }
}

export async function invalidateMethodologyCacheByPrefix(prefix, userId) {
  if (!prefix || !userId) return 0;

  try {
    const keyPrefix = `${prefix}_${userId}_`;
    const matches = await db.researchCache.findMany({
      where: { cacheKey: { startsWith: keyPrefix } },
      select: { cacheKey: true },
    });

    if (matches.length === 0) return 0;

    await db.researchCache.deleteMany({
      where: { cacheKey: { in: matches.map((m) => m.cacheKey) } },
    });

    return matches.length;
  } catch {
    return 0;
  }
}

export async function getOrSetCachedMethodologyData(cacheKey, computeFn) {
  const cached = await getCachedMethodologyData(cacheKey);
  if (cached) return { data: cached, fromCache: true };

  const computed = await computeFn();
  await setCachedMethodologyData(cacheKey, computed);
  return { data: computed, fromCache: false };
}

export async function purgeExpiredMethodologyCache() {
  try {
    const allKeys = await db.researchCache.findMany({
      where: {
        OR: Object.keys(TTL_BY_PREFIX).map((prefix) => ({
          cacheKey: { startsWith: prefix },
        })),
      },
      select: { cacheKey: true, updatedAt: true },
    });

    const now = Date.now();
    const expiredKeys = allKeys
      .filter((entry) => {
        const ttl = resolveTTL(entry.cacheKey);
        return now - new Date(entry.updatedAt).getTime() > ttl;
      })
      .map((entry) => entry.cacheKey);

    if (expiredKeys.length === 0) return 0;

    await db.researchCache.deleteMany({
      where: { cacheKey: { in: expiredKeys } },
    });

    return expiredKeys.length;
  } catch {
    return 0;
  }
}