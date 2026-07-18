"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { fetchCrossrefByDoi, fetchCrossrefJournals } from "@/lib/crossref";
import { fetchSemanticScholarPaper } from "@/lib/semantic-scholar";

const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

// ─── Cache Helpers ────────────────────────────────────────────────────────────

async function getCached(cacheKey) {
  try {
    const cached = await db.researchCache.findUnique({ where: { cacheKey } });
    if (!cached) return null;
    const isExpired =
      Date.now() - new Date(cached.updatedAt).getTime() > CACHE_TTL_MS;
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

async function setCached(cacheKey, data) {
  try {
    await db.researchCache.upsert({
      where: { cacheKey },
      update: { data: JSON.stringify(data), updatedAt: new Date() },
      create: { cacheKey, data: JSON.stringify(data) },
    });
  } catch {
    // non-fatal
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildCacheSlug(str) {
  return String(str).toLowerCase().replace(/\s+/g, "_").slice(0, 80);
}

async function getDbUser(clerkUserId) {
  return db.user.findUnique({ where: { clerkUserId } });
}

function escapeBibtex(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/([{}])/g, "\\$1")
    .replace(/([%&#_$])/g, "\\$1");
}

function formatAuthors(authors = []) {
  if (!Array.isArray(authors) || authors.length === 0) return [];
  return authors.map((a) => {
    if (typeof a === "string") return a;
    const given = a.given ?? a.firstName ?? "";
    const family = a.family ?? a.lastName ?? a.name ?? "";
    return family ? `${family}, ${given}`.trim().replace(/,\s*$/, "") : given;
  });
}

function extractYear(dateRaw) {
  if (!dateRaw) return null;
  if (typeof dateRaw === "number") return dateRaw;
  if (typeof dateRaw === "string") {
    const m = dateRaw.match(/\d{4}/);
    return m ? parseInt(m[0]) : null;
  }
  if (dateRaw?.["date-parts"]?.[0]?.[0]) return dateRaw["date-parts"][0][0];
  return null;
}

function normalizeCrossrefWork(work) {
  if (!work) return null;
  return {
    doi: work.DOI ?? null,
    title: Array.isArray(work.title) ? work.title[0] : (work.title ?? ""),
    authors: formatAuthors(work.authors ?? work.author ?? []),
    year: extractYear(
      work.issued ??
        work["published-print"] ??
        work["published-online"] ??
        null,
    ),
    journal: Array.isArray(work["container-title"])
      ? work["container-title"][0]
      : (work["container-title"] ?? null),
    volume: work.volume ?? null,
    issue: work.issue ?? null,
    pages: work.page ?? null,
    publisher: work.publisher ?? null,
    url: work.URL ?? (work.DOI ? `https://doi.org/${work.DOI}` : null),
    type: work.type ?? "journal-article",
    source: "crossref",
  };
}

function normalizeSemanticScholarWork(paper) {
  if (!paper) return null;
  return {
    doi: paper.externalIds?.DOI ?? null,
    title: paper.title ?? "",
    authors: formatAuthors(
      (paper.authors ?? []).map((a) => ({ name: a.name ?? a })),
    ),
    year: paper.year ?? null,
    journal: paper.venue ?? paper.journal?.name ?? null,
    volume: paper.journal?.volume ?? null,
    issue: null,
    pages: paper.journal?.pages ?? null,
    publisher: null,
    url:
      paper.url ??
      (paper.externalIds?.DOI
        ? `https://doi.org/${paper.externalIds.DOI}`
        : null),
    type: "journal-article",
    source: "semantic_scholar",
  };
}

// ─── Citation Formatters ──────────────────────────────────────────────────────

function formatAPA(work) {
  const authors = work.authors ?? [];
  let authorStr = "";
  if (authors.length === 0) {
    authorStr = "Unknown Author";
  } else if (authors.length === 1) {
    authorStr = authors[0];
  } else if (authors.length === 2) {
    authorStr = `${authors[0]}, & ${authors[1]}`;
  } else if (authors.length <= 20) {
    authorStr =
      authors.slice(0, -1).join(", ") + ", & " + authors[authors.length - 1];
  } else {
    authorStr =
      authors.slice(0, 19).join(", ") + ", ... " + authors[authors.length - 1];
  }

  const year = work.year ? `(${work.year})` : "(n.d.)";
  const title = work.title ?? "Untitled";
  const journal = work.journal ? `*${work.journal}*` : null;
  const volume = work.volume ? `*${work.volume}*` : null;
  const issue = work.issue ? `(${work.issue})` : null;
  const pages = work.pages ?? null;
  const doi = work.doi ? `https://doi.org/${work.doi}` : (work.url ?? null);

  let citation = `${authorStr}. ${year}. ${title}.`;
  if (journal) {
    citation += ` ${journal}`;
    if (volume) citation += `, ${volume}`;
    if (issue) citation += `${issue}`;
    if (pages) citation += `, ${pages}`;
    citation += ".";
  }
  if (doi) citation += ` ${doi}`;

  return citation.trim();
}

function formatIEEE(work) {
  const authors = work.authors ?? [];
  let authorStr = "";
  if (authors.length === 0) {
    authorStr = "Unknown Author";
  } else {
    const ieeeAuthors = authors.map((a) => {
      const parts = a.split(",").map((p) => p.trim());
      if (parts.length === 2) {
        const initials = parts[1]
          .split(" ")
          .filter(Boolean)
          .map((n) => n[0] + ".")
          .join(" ");
        return `${initials} ${parts[0]}`;
      }
      return a;
    });
    authorStr =
      ieeeAuthors.length > 1
        ? ieeeAuthors.slice(0, -1).join(", ") +
          ", and " +
          ieeeAuthors[ieeeAuthors.length - 1]
        : ieeeAuthors[0];
  }

  const title = `"${work.title ?? "Untitled"}"`;
  const journal = work.journal ? `*${work.journal}*` : null;
  const volume = work.volume ? `vol. ${work.volume}` : null;
  const issue = work.issue ? `no. ${work.issue}` : null;
  const pages = work.pages ? `pp. ${work.pages}` : null;
  const year = work.year ?? "n.d.";
  const doi = work.doi ? `doi: ${work.doi}` : null;

  const parts = [
    authorStr,
    title,
    journal,
    volume,
    issue,
    pages,
    year,
    doi,
  ].filter(Boolean);
  return parts.join(", ") + ".";
}

function formatMLA(work) {
  const authors = work.authors ?? [];
  let authorStr = "";
  if (authors.length === 0) {
    authorStr = "Unknown Author";
  } else if (authors.length === 1) {
    authorStr = authors[0];
  } else if (authors.length === 2) {
    authorStr = `${authors[0]}, and ${authors[1]}`;
  } else {
    authorStr = `${authors[0]}, et al`;
  }

  const title = `"${work.title ?? "Untitled"}."`;
  const journal = work.journal ? `*${work.journal}*` : null;
  const volume = work.volume ? `vol. ${work.volume}` : null;
  const issue = work.issue ? `no. ${work.issue}` : null;
  const year = work.year ?? "n.d.";
  const pages = work.pages ?? null;
  const doi = work.doi ? `https://doi.org/${work.doi}` : (work.url ?? null);

  let citation = `${authorStr}. ${title}`;
  if (journal) citation += ` ${journal},`;
  if (volume) citation += ` ${volume},`;
  if (issue) citation += ` ${issue},`;
  citation += ` ${year}`;
  if (pages) citation += `, pp. ${pages}`;
  citation += ".";
  if (doi) citation += ` ${doi}.`;

  return citation.trim();
}

function formatChicago(work) {
  const authors = work.authors ?? [];
  let authorStr = "";
  if (authors.length === 0) {
    authorStr = "Unknown Author";
  } else if (authors.length === 1) {
    authorStr = authors[0];
  } else if (authors.length <= 3) {
    authorStr =
      authors.slice(0, -1).join(", ") + ", and " + authors[authors.length - 1];
  } else {
    authorStr = `${authors[0]} et al`;
  }

  const title = `"${work.title ?? "Untitled"}."`;
  const journal = work.journal ? `*${work.journal}*` : null;
  const volume = work.volume ?? null;
  const issue = work.issue ? `no. ${work.issue}` : null;
  const year = work.year ? `(${work.year})` : "(n.d.)";
  const pages = work.pages ?? null;
  const doi = work.doi ? `https://doi.org/${work.doi}` : (work.url ?? null);

  let citation = `${authorStr}. ${title}`;
  if (journal) {
    citation += ` ${journal}`;
    if (volume) citation += ` ${volume}`;
    if (issue) citation += `, ${issue}`;
    citation += ` ${year}`;
    if (pages) citation += `: ${pages}`;
    citation += ".";
  }
  if (doi) citation += ` ${doi}.`;

  return citation.trim();
}

function buildCitations(work) {
  return {
    apa: formatAPA(work),
    ieee: formatIEEE(work),
    mla: formatMLA(work),
    chicago: formatChicago(work),
  };
}

// ─── Fetch Raw Work ───────────────────────────────────────────────────────────

async function resolveWork(doi, title) {
  if (doi) {
    const cacheKey = `cite_doi_${buildCacheSlug(doi)}`;
    const cached = await getCached(cacheKey);
    if (cached) return cached;

    const [crResult, ssResult] = await Promise.allSettled([
      fetchCrossrefByDoi(doi),
      fetchSemanticScholarPaper(doi),
    ]);

    let work = null;

    if (crResult.status === "fulfilled" && crResult.value) {
      work = normalizeCrossrefWork(crResult.value);
    } else if (ssResult.status === "fulfilled" && ssResult.value) {
      work = normalizeSemanticScholarWork(ssResult.value);
    }

    if (work) {
      await setCached(cacheKey, work);
      return work;
    }
  }

  if (title) {
    const cacheKey = `cite_title_${buildCacheSlug(title)}`;
    const cached = await getCached(cacheKey);
    if (cached) return cached;

    const [crResult, ssResult] = await Promise.allSettled([
      fetchCrossrefJournals({ query: title, limit: 3 }),
      fetchSemanticScholarPaper(title),
    ]);

    let work = null;

    if (crResult.status === "fulfilled") {
      const items = Array.isArray(crResult.value)
        ? crResult.value
        : (crResult.value?.message?.items ?? crResult.value?.items ?? []);
      if (items.length > 0) {
        const candidate = normalizeCrossrefWork(items[0]);
        if (candidate?.title && candidate?.authors?.length > 0)
          work = candidate;
      }
    }

    if (!work && ssResult.status === "fulfilled" && ssResult.value) {
      work = normalizeSemanticScholarWork(ssResult.value);
    }

    if (work) {
      await setCached(cacheKey, work);
      return work;
    }
  }

  return null;
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export async function generateCitation({ doi, title, style = "all" }) {
  if (!doi?.trim() && !title?.trim()) {
    return { success: false, error: "doi or title is required" };
  }

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  const validStyles = ["all", "apa", "ieee", "mla", "chicago"];
  const safeStyle = validStyles.includes(style) ? style : "all";

  try {
    const work = await resolveWork(doi?.trim() ?? null, title?.trim() ?? null);

    if (!work) {
      return { success: false, error: "Could not find paper metadata" };
    }

    const citations = buildCitations(work);
    const result =
      safeStyle === "all" ? citations : { [safeStyle]: citations[safeStyle] };

    try {
      await db.citationHistory.create({
        data: {
          userId: dbUser.id,
          doi: work.doi ?? doi?.trim() ?? null,
          title: work.title,
          authors: work.authors,
          year: work.year ?? null,
          journal: work.journal ?? null,
          source: work.source,
          citations,
        },
      });
    } catch {
      // non-fatal — citation still returned
    }

    return { success: true, data: { work, citations: result } };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to generate citation",
    };
  }
}

export async function generateBulkCitations({ items, style = "all" }) {
  if (!Array.isArray(items) || items.length === 0) {
    return { success: false, error: "items array is required" };
  }

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  const safeItems = items.slice(0, 20);
  const validStyles = ["all", "apa", "ieee", "mla", "chicago"];
  const safeStyle = validStyles.includes(style) ? style : "all";

  const results = await Promise.allSettled(
    safeItems.map((item) =>
      resolveWork(item.doi?.trim() ?? null, item.title?.trim() ?? null),
    ),
  );

  const citations = results.map((r, i) => {
    if (r.status === "rejected" || !r.value) {
      return {
        input: safeItems[i],
        success: false,
        error: "Could not resolve paper metadata",
      };
    }
    const work = r.value;
    const all = buildCitations(work);
    return {
      input: safeItems[i],
      success: true,
      work,
      citations: safeStyle === "all" ? all : { [safeStyle]: all[safeStyle] },
    };
  });

  const successful = citations.filter((c) => c.success);

  if (successful.length > 0) {
    try {
      await db.citationHistory.createMany({
        data: successful.map((c) => ({
          userId: dbUser.id,
          doi: c.work.doi ?? c.input.doi ?? null,
          title: c.work.title,
          authors: c.work.authors,
          year: c.work.year ?? null,
          journal: c.work.journal ?? null,
          source: c.work.source,
          citations: buildCitations(c.work),
        })),
      });
    } catch {
      // non-fatal
    }
  }

  return {
    success: true,
    data: {
      results: citations,
      total: citations.length,
      resolved: successful.length,
      failed: citations.length - successful.length,
    },
  };
}

export async function getCitationHistory({ limit = 20, offset = 0 } = {}) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  const safeLimit = Math.min(Number(limit) || 20, 50);
  const safeOffset = Math.max(Number(offset) || 0, 0);

  try {
    const [history, total] = await Promise.all([
      db.citationHistory.findMany({
        where: { userId: dbUser.id },
        orderBy: { createdAt: "desc" },
        take: safeLimit,
        skip: safeOffset,
      }),
      db.citationHistory.count({ where: { userId: dbUser.id } }),
    ]);

    return {
      success: true,
      data: { history, total, limit: safeLimit, offset: safeOffset },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch citation history",
    };
  }
}

export async function deleteCitationEntry(citationId) {
  if (!citationId) return { success: false, error: "citationId is required" };

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  try {
    const record = await db.citationHistory.findUnique({
      where: { id: citationId },
    });

    if (!record) return { success: false, error: "Citation not found" };
    if (record.userId !== dbUser.id)
      return { success: false, error: "Forbidden" };

    await db.citationHistory.delete({ where: { id: citationId } });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete citation",
    };
  }
}

export async function exportCitations({ ids, style = "apa", format = "text" }) {
  if (!Array.isArray(ids) || ids.length === 0) {
    return { success: false, error: "ids array is required" };
  }

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  const validStyles = ["apa", "ieee", "mla", "chicago"];
  const safeStyle = validStyles.includes(style) ? style : "apa";
  const validFormats = ["text", "bibtex", "json"];
  const safeFormat = validFormats.includes(format) ? format : "text";

  try {
    const records = await db.citationHistory.findMany({
      where: { id: { in: ids }, userId: dbUser.id },
    });

    if (records.length === 0) {
      return { success: false, error: "No matching citation records found" };
    }

    if (safeFormat === "json") {
      return {
        success: true,
        data: {
          format: "json",
          style: safeStyle,
          citations: records.map((r) => ({
            id: r.id,
            title: r.title,
            authors: r.authors,
            year: r.year,
            journal: r.journal,
            citation:
              typeof r.citations === "object" && r.citations !== null
                ? (r.citations[safeStyle] ?? null)
                : null,
          })),
        },
      };
    }

    if (safeFormat === "bibtex") {
      const entries = records.map((r, i) => {
        const key = `ref${i + 1}_${r.year ?? "nd"}`;
       const authors = Array.isArray(r.authors)
         ? r.authors.map(escapeBibtex).join(" and ")
         : "";

        return [
          `@article{${key},`,
          `  title = {${escapeBibtex(r.title ?? "")}},`,
          `  author = {${authors}},`,
          `  year = {${r.year ?? ""}},`,
          `  journal = {${escapeBibtex(r.journal ?? "")}},`,
          r.doi ? `  doi = {${r.doi}},` : null,
          `}`,
        ]
          .filter(Boolean)
          .join("\n");
      });

      return {
        success: true,
        data: { format: "bibtex", content: entries.join("\n\n") },
      };
    }

    // text format
    const lines = records
      .map((r, i) => {
        const citation =
          typeof r.citations === "object" && r.citations !== null
            ? (r.citations[safeStyle] ?? null)
            : null;
        return citation ? `[${i + 1}] ${citation}` : null;
      })
      .filter(Boolean);

    return {
      success: true,
      data: {
        format: "text",
        style: safeStyle,
        content: lines.join("\n\n"),
      },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to export citations",
    };
  }
}
