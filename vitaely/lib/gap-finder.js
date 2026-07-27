import { db } from "@/lib/prisma";
import Groq from "groq-sdk";
import { fetchOpenAlexSearch, getPapersPerYear } from "@/lib/openalex";
import { fetchSemanticScholarPapers } from "@/lib/semantic-scholar";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const DB_CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours

async function withRetry(fn, retries = 2, delayMs = 500) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, delayMs * (attempt + 1)));
    }
  }
}

// ─── DB Cache Helpers ─────────────────────────────────────────────────────────

export async function getDbCached(cacheKey) {
  try {
    const cached = await db.researchCache.findUnique({ where: { cacheKey } });
    if (!cached) return null;
    const isExpired =
      Date.now() - new Date(cached.updatedAt).getTime() > DB_CACHE_TTL_MS;
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

export async function setDbCached(cacheKey, data) {
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

// ─── Groq Generation ──────────────────────────────────────────────────────────

export async function analyzeGapsWithGroq(prompt) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.4,
    max_tokens: 2000,
    messages: [
      {
        role: "system",
        content: `You are a research gap analysis engine.
Always respond with a valid JSON array of objects.
Each object must have:
  - "gap": string (concise research gap title)
  - "type": "gap" | "open_problem" | "trending"
  - "description": string (2-3 sentences explaining the gap)
  - "why": string (one sentence on why it matters)
  - "opportunity": string (1-2 sentences on the research opportunity and expected contribution)
  - "domain": string (short domain/field label, e.g. "Computer Vision")
  - "keywords": string[] (3-5 search keywords)
  - "difficulty": "low" | "medium" | "high"
  - "confidence": number (0-100, how confident you are this is a genuine, addressable gap)
Do not include any text outside the JSON array.`,
      },
      { role: "user", content: prompt },
    ],
  });

  const raw = completion.choices?.[0]?.message?.content ?? "";
  const clean = raw.replace(/```json|```/g, "").trim();

  let parsed;
  try {
    const jsonMatch = clean.match(/\[[\s\S]*\]/);
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : clean);
  } catch {
    throw new Error("Groq returned invalid JSON");
  }

  if (!Array.isArray(parsed)) throw new Error("Groq response is not an array");

  return parsed
    .filter(
      (g) =>
        g &&
        typeof g.gap === "string" &&
        typeof g.description === "string" &&
        typeof g.why === "string" &&
        Array.isArray(g.keywords) &&
        ["low", "medium", "high"].includes(g.difficulty)
    )
    .map((g) => ({
      gap: g.gap,
      type: ["gap", "open_problem", "trending"].includes(g.type)
        ? g.type
        : "gap",
      description: g.description,
      why: g.why,
      opportunity: typeof g.opportunity === "string" ? g.opportunity : "",
      domain: typeof g.domain === "string" ? g.domain : "",
      keywords: g.keywords,
      difficulty: g.difficulty,
      confidence:
        typeof g.confidence === "number"
          ? Math.min(100, Math.max(0, Math.round(g.confidence)))
          : 70,
    }));
}

// ─── Supporting Papers ─────────────────────────────────────────────────────────

export async function fetchSupportingPapers(gap, limit = 3) {
  const query = gap.keywords?.join(" ") || gap.gap;

  try {
    const result = await withRetry(() =>
      fetchSemanticScholarPapers({ query, limit })
    );
    const papers = Array.isArray(result?.data) ? result.data : [];

    return papers.map((p) => ({
      title: p.title ?? "Untitled",
      authors: Array.isArray(p.authors)
        ? p.authors.map((a) => a.name).filter(Boolean)
        : [],
      year: p.year ?? null,
      citationCount: p.citationCount ?? 0,
      url:
        p.url ??
        (p.externalIds?.DOI ? `https://doi.org/${p.externalIds.DOI}` : null),
      paperId: p.paperId ?? null,
    }));
  } catch (error) {
    console.error("fetchSupportingPapers error:", error.message);
    return [];
  }
}

// ─── Validation + Enrichment ────────────────────────────────────────────────────

export async function validateGapsWithSources(gaps) {
  const validated = await Promise.allSettled(
    gaps.map(async (gap) => {
      try {
        const query = gap.keywords?.join(" ") || gap.gap;

        const [openAlexResult, semanticResult, supportingPapers] =
          await Promise.allSettled([
            withRetry(() => fetchOpenAlexSearch({ query, perPage: 1 })),
            withRetry(() => fetchSemanticScholarPapers({ query, limit: 1 })),
            fetchSupportingPapers(gap, 3),
          ]);

        const openAlexCount =
          openAlexResult.status === "fulfilled"
            ? (openAlexResult.value?.meta?.count ??
              openAlexResult.value?.count ??
              openAlexResult.value?.total ??
              0)
            : 0;

        const semanticCount =
          semanticResult.status === "fulfilled"
            ? (semanticResult.value?.total ?? semanticResult.value?.length ?? 0)
            : 0;

        const papers =
          supportingPapers.status === "fulfilled" ? supportingPapers.value : [];

        return {
          ...gap,
          openAlexCount,
          semanticCount,
          totalPaperCount: openAlexCount + semanticCount,
          supportingPapers: papers,
          validated: true,
        };
      } catch (error) {
        console.error("validateGapsWithSources error:", error.message);
        return {
          ...gap,
          openAlexCount: 0,
          semanticCount: 0,
          totalPaperCount: 0,
          supportingPapers: [],
          validated: false,
        };
      }
    })
  );

  return validated
    .filter((r) => r.status === "fulfilled")
    .map((r) => r.value);
}

// ─── Scoring ────────────────────────────────────────────────────────────────────

export function computeImpactScore(gap) {
  const difficultyWeight =
    gap.difficulty === "low" ? 1 : gap.difficulty === "medium" ? 0.7 : 0.4;
  const confidenceWeight = (gap.confidence ?? 70) / 100;
  const paperWeight = Math.min((gap.totalPaperCount ?? 0) / 500, 1);

  const impact =
    difficultyWeight * 0.35 + confidenceWeight * 0.35 + paperWeight * 0.3;

  return Math.round(impact * 100) / 10;
}

export function scoreAndRankGaps(gaps) {
  return gaps
    .map((g) => {
      const difficultyScore =
        g.difficulty === "low" ? 1 : g.difficulty === "medium" ? 0.6 : 0.3;
      const paperScore = Math.min((g.totalPaperCount ?? 0) / 1000, 1);
      const confidenceScore = (g.confidence ?? 70) / 100;
      const impactScore = computeImpactScore(g);
      const impactWeight = impactScore / 10;

      const score =
        difficultyScore * 0.3 +
        paperScore * 0.25 +
        confidenceScore * 0.2 +
        impactWeight * 0.25;

      return {
        ...g,
        score: parseFloat(score.toFixed(4)),
        impactScore,
      };
    })
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
}

// ─── Prompt Builders ──────────────────────────────────────────────────────────

export function buildOpenProblemsPrompt(domainId) {
  return `List 6 significant open problems and unsolved research challenges in the academic domain: "${domainId}". Focus on problems with active but insufficient research coverage.`;
}

export function buildGapPrompt({ topic, skills = [] }) {
  const skillsText = skills.length
    ? `The researcher has skills in: ${skills.join(", ")}.`
    : "";
  return `Identify 8 specific research gaps and open problems in the area of "${topic}". ${skillsText} Focus on gaps with real opportunities for new contributions.`.trim();
}

export function buildSkillGapsPrompt(skills) {
  return `Identify 6 research gaps that someone with the following skills could uniquely address: ${skills.join(", ")}. Focus on interdisciplinary opportunities.`;
}

// ─── Timeline (for trend-chart.jsx) ───────────────────────────────────────────

export async function getGapTimeline(gap) {
  const query = gap.keywords?.join(" ") || gap.gap;
  try {
    return await getPapersPerYear(query, {
      fromYear: new Date().getFullYear() - 9,
      toYear: new Date().getFullYear(),
    });
  } catch (error) {
    console.error("getGapTimeline error:", error.message);
    return [];
  }
}

// ─── High-level orchestrators (used by actions/research-hub/gap-finder.js) ────

export async function generateAndRankGaps({ prompt, cacheKey }) {
  const cached = await getDbCached(cacheKey);
  if (cached) return { data: cached, fromCache: true };

  const rawGaps = await analyzeGapsWithGroq(prompt);
  if (!rawGaps.length) {
    throw new Error("No gaps generated");
  }

  const validated = await validateGapsWithSources(rawGaps);
  const ranked = scoreAndRankGaps(validated);

  await setDbCached(cacheKey, ranked);

  return { data: ranked, fromCache: false };
}