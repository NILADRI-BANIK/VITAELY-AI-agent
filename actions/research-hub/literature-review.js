"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import Groq from "groq-sdk";
import { fetchSemanticScholarPapers } from "@/lib/semantic-scholar";

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours

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
  return String(str).toLowerCase().replace(/\s+/g, "_").slice(0, 50);
}

async function getDbUser(clerkUserId) {
  return db.user.findUnique({ where: { clerkUserId } });
}

function normalizePaper(paper) {
  if (!paper) return null;
  return {
    id: paper.paperId ?? paper.externalIds?.DOI ?? null,
    title: paper.title ?? "",
    abstract: paper.abstract ?? "",
    authors: Array.isArray(paper.authors)
      ? paper.authors.map((a) => a.name ?? "").filter(Boolean)
      : [],
    year: paper.year ?? null,
    citationCount: paper.citationCount ?? 0,
    url:
      paper.url ??
      (paper.externalIds?.DOI
        ? `https://doi.org/${paper.externalIds.DOI}`
        : null),
    openAccess: paper.isOpenAccess ?? false,
    doi: paper.externalIds?.DOI ?? null,
    venue: paper.venue ?? paper.journal?.name ?? "",
  };
}

function buildPaperContext(papers) {
  return papers
    .filter((p) => p.title && p.abstract)
    .map((p, i) => {
      const authors =
        Array.isArray(p.authors) && p.authors.length
          ? p.authors.slice(0, 3).join(", ")
          : "Unknown";
      return `[${i + 1}] "${p.title}" (${p.year ?? "n.d."}) by ${authors}\nAbstract: ${(p.abstract ?? "").slice(0, 250)}`;
    })
    .join("\n\n");
}

// ─── Groq Helpers ─────────────────────────────────────────────────────────────

async function generateReviewWithGroq(prompt) {
  if (!groq) throw new Error("Groq API not configured");
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
    max_tokens: 4096,
    messages: [
      {
        role: "system",
        content: `You are an academic literature review writer.
Always respond with a valid JSON object.
The object must have:
  - "summary": string (2-3 paragraph overview of the topic)
  - "themes": { "theme": string, "description": string }[] (3-5 key themes)
  - "consensus": string (what researchers agree on)
  - "debates": string (ongoing debates or contradictions)
  - "futureDirections": string[] (3-5 suggested future research directions)
  - "methodology": string (common methodologies used)
Do not include any text outside the JSON object.`,
      },
      { role: "user", content: prompt },
    ],
  });

  const raw = completion.choices?.[0]?.message?.content ?? "";
  const clean = raw.replace(/```json|```/g, "").trim();

  let parsed;
  try {
    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : clean);
  } catch {
    throw new Error("Groq returned invalid JSON");
  }

  if (typeof parsed !== "object" || Array.isArray(parsed) || parsed === null) {
    throw new Error("Groq response is not a valid object");
  }

  return {
    summary: typeof parsed.summary === "string" ? parsed.summary : "",
    themes: Array.isArray(parsed.themes)
      ? parsed.themes.filter(
          (t) =>
            t &&
            typeof t.theme === "string" &&
            typeof t.description === "string",
        )
      : [],
    consensus: typeof parsed.consensus === "string" ? parsed.consensus : "",
    debates: typeof parsed.debates === "string" ? parsed.debates : "",
    futureDirections: Array.isArray(parsed.futureDirections)
      ? parsed.futureDirections.filter((d) => typeof d === "string")
      : [],
    methodology:
      typeof parsed.methodology === "string" ? parsed.methodology : "",
  };
}

async function generateSectionWithGroq(prompt) {
  if (!groq) throw new Error("Groq API not configured");
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
    max_tokens: 1024,
    messages: [
      {
        role: "system",
        content: `You are an academic writing assistant.
Respond with a valid JSON object containing:
  - "content": string (the written section text)
Do not include any text outside the JSON object.`,
      },
      { role: "user", content: prompt },
    ],
  });

  const raw = completion.choices?.[0]?.message?.content ?? "";
  const clean = raw.replace(/```json|```/g, "").trim();

  let parsed;
  try {
    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : clean);
  } catch {
    throw new Error("Groq returned invalid JSON for section");
  }

  if (typeof parsed?.content !== "string") {
    throw new Error("Groq section response missing content field");
  }

  return parsed.content;
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export async function generateLiteratureReview({ topic, limit = 15 }) {
  if (!topic?.trim()) return { success: false, error: "topic is required" };

  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const safeLimit = Math.min(Number(limit) || 15, 20);
  const cacheKey = `lit_review_${userId}_${buildCacheSlug(topic)}`;
  const cached = await getCached(cacheKey);
  if (cached) return { success: true, data: cached, fromCache: true };

  try {
    const papersResult = await fetchSemanticScholarPapers({
      query: topic.trim(),
      limit: safeLimit,
      fields:
        "title,abstract,authors,year,citationCount,isOpenAccess,externalIds,url,venue,journal",
    });

    const rawPapers = Array.isArray(papersResult)
      ? papersResult
      : (papersResult?.data ?? []);

    const papers = rawPapers.map(normalizePaper).filter(Boolean);

    if (!papers.length) {
      return { success: false, error: "No papers found for this topic" };
    }

    const context = buildPaperContext(papers);
    const prompt = `Generate a comprehensive literature review on "${topic.trim().slice(0, 300)}" based on these ${papers.length} papers:\n\n${context}`;

    const review = await generateReviewWithGroq(prompt);

    const result = {
      topic: topic.trim(),
      paperCount: papers.length,
      papers,
      review,
      generatedAt: new Date().toISOString(),
    };

    await setCached(cacheKey, result);

    return { success: true, data: result, fromCache: false };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate literature review",
    };
  }
}

export async function generateReviewSection({
  topic,
  sectionType,
  papers = [],
}) {
  if (!topic?.trim()) return { success: false, error: "topic is required" };
  if (!sectionType?.trim())
    return { success: false, error: "sectionType is required" };

  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const safePapers = Array.isArray(papers) ? papers : [];
  const cacheKey = `review_section_${userId}_${buildCacheSlug(topic)}_${buildCacheSlug(sectionType)}`;
  const cached = await getCached(cacheKey);
  if (cached) return { success: true, data: cached, fromCache: true };

  try {
    const context = safePapers.length ? buildPaperContext(safePapers) : "";
    const contextText = context
      ? `Based on these papers:\n\n${context}\n\n`
      : "";

    const prompt = `${contextText}Write the "${sectionType}" section of a literature review on "${topic.trim()}". Be academic, concise, and well-structured.`;

    const content = await generateSectionWithGroq(prompt);

    const result = {
      topic: topic.trim(),
      sectionType: sectionType.trim(),
      content,
      generatedAt: new Date().toISOString(),
    };

    await setCached(cacheKey, result);

    return { success: true, data: result, fromCache: false };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate review section",
    };
  }
}

export async function summarizePaper({
  title,
  abstract,
  authors = [],
  year = null,
}) {
  if (!title?.trim()) return { success: false, error: "title is required" };
  if (!abstract?.trim())
    return { success: false, error: "abstract is required" };

  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const cacheKey = `paper_summary_${userId}_${buildCacheSlug(title)}`;
  const cached = await getCached(cacheKey);
  if (cached) return { success: true, data: cached, fromCache: true };

  try {
    if (!groq) throw new Error("Groq API not configured");
    const safeAuthors = Array.isArray(authors) ? authors : [];
    const authorText = safeAuthors.length
      ? `Authors: ${safeAuthors.slice(0, 3).join(", ")}`
      : "";
    const yearText = year ? `Year: ${year}` : "";

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 512,
      messages: [
        {
          role: "system",
          content: `You are an academic paper summarizer.
Respond with a valid JSON object containing:
  - "summary": string (3-4 sentence plain language summary)
  - "keyFindings": string[] (3 key findings)
  - "contribution": string (main contribution in one sentence)
Do not include any text outside the JSON object.`,
        },
        {
          role: "user",
          content: `Summarize this paper:\nTitle: "${title.trim()}"\n${authorText}\n${yearText}\nAbstract: ${abstract.trim()}`,
        },
      ],
    });

    const raw = completion.choices?.[0]?.message?.content ?? "";
    const clean = raw.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      const jsonMatch = clean.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : clean);
    } catch {
      throw new Error("Groq returned invalid JSON for summary");
    }

    const result = {
      title: title.trim(),
      summary: typeof parsed?.summary === "string" ? parsed.summary : "",
      keyFindings: Array.isArray(parsed?.keyFindings)
        ? parsed.keyFindings.filter((f) => typeof f === "string")
        : [],
      contribution:
        typeof parsed?.contribution === "string" ? parsed.contribution : "",
      generatedAt: new Date().toISOString(),
    };

    await setCached(cacheKey, result);

    return { success: true, data: result, fromCache: false };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to summarize paper",
    };
  }
}

export async function saveReview(reviewData) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  if (!reviewData?.topic?.trim()) {
    return { success: false, error: "Invalid review data" };
  }

  try {
    const existing = await db.savedLiteratureReview.findFirst({
      where: { userId: dbUser.id, topic: reviewData.topic.trim() },
    });

    if (existing) {
      const updated = await db.savedLiteratureReview.update({
        where: { id: existing.id },
        data: {
          topic: reviewData.topic.trim(),
          reviewData: JSON.stringify(reviewData),
        },
      });
      return { success: true, data: updated };
    }

    const saved = await db.savedLiteratureReview.create({
      data: {
        userId: dbUser.id,
        topic: reviewData.topic.trim(),
        reviewData: JSON.stringify(reviewData),
      },
    });

    return { success: true, data: saved };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save review",
    };
  }
}

export async function getSavedReviews() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  try {
    const reviews = await db.savedLiteratureReview.findMany({
      where: { userId: dbUser.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        topic: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return { success: true, data: reviews };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch saved reviews",
    };
  }
}

export async function getSavedReviewById(reviewId) {
  if (!reviewId) return { success: false, error: "reviewId is required" };

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  try {
    const record = await db.savedLiteratureReview.findUnique({
      where: { id: reviewId },
    });

    if (!record) return { success: false, error: "Review not found" };
    if (record.userId !== dbUser.id) return { success: false, error: "Forbidden" };

    const reviewData = record.reviewData;

    return { success: true, data: { ...record, reviewData } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch review",
    };
  }
}

export async function deleteSavedReview(reviewId) {
  if (!reviewId) return { success: false, error: "reviewId is required" };

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  try {
    const record = await db.savedLiteratureReview.findUnique({
      where: { id: reviewId },
    });

    if (!record) return { success: false, error: "Review not found" };
    if (record.userId !== dbUser.id) return { success: false, error: "Forbidden" };

    await db.savedLiteratureReview.delete({ where: { id: reviewId } });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete review",
    };
  }
}