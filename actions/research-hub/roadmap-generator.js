"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import Groq from "groq-sdk";

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

const CACHE_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

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
      update: { data, updatedAt: new Date() },
      create: { cacheKey, data },
    });
  } catch {
    // non-fatal
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildCacheSlug(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 50);
}

function validateDuration(duration) {
  const valid = ["3-months", "6-months", "1-year", "2-years", "3-years"];
  return valid.includes(duration) ? duration : "1-year";
}

function validateResearchLevel(level) {
  const valid = ["undergraduate", "masters", "phd", "postdoc", "independent"];
  return valid.includes(level?.toLowerCase()) ? level.toLowerCase() : "masters";
}

// ─── Groq Helpers ─────────────────────────────────────────────────────────────

async function generateRoadmapWithGroq(prompt) {
  if (!groq) throw new Error("Groq API not configured");

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
    max_tokens: 2048,
    messages: [
      {
        role: "system",
        content: `You are an expert research planning advisor.
Always respond with a valid JSON object.
The object must have:
  - "title": string (roadmap title)
  - "overview": string (2-3 sentence summary)
  - "phases": {
      "phase": number,
      "title": string,
      "duration": string,
      "objectives": string[],
      "milestones": { "title": string, "deliverable": string, "week": number }[],
      "resources": string[],
      "risks": string[]
    }[] (4-6 phases)
  - "keyMilestones": { "title": string, "phase": number, "importance": string }[] (5-7 key milestones)
  - "requiredSkills": string[] (skills to develop)
  - "recommendedTools": string[] (tools and software)
  - "publicationTargets": string[] (suggested journals or conferences)
  - "successMetrics": string[] (how to measure progress)
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
    title: typeof parsed.title === "string" ? parsed.title : "",
    overview: typeof parsed.overview === "string" ? parsed.overview : "",
    phases: Array.isArray(parsed.phases)
      ? parsed.phases.filter(
          (p) =>
            p &&
            typeof p.phase === "number" &&
            typeof p.title === "string" &&
            typeof p.duration === "string" &&
            Array.isArray(p.objectives) &&
            Array.isArray(p.milestones) &&
            Array.isArray(p.resources) &&
            Array.isArray(p.risks),
        )
      : [],
    keyMilestones: Array.isArray(parsed.keyMilestones)
      ? parsed.keyMilestones.filter(
          (m) =>
            m &&
            typeof m.title === "string" &&
            typeof m.phase === "number" &&
            typeof m.importance === "string",
        )
      : [],
    requiredSkills: Array.isArray(parsed.requiredSkills)
      ? parsed.requiredSkills.filter((s) => typeof s === "string")
      : [],
    recommendedTools: Array.isArray(parsed.recommendedTools)
      ? parsed.recommendedTools.filter((t) => typeof t === "string")
      : [],
    publicationTargets: Array.isArray(parsed.publicationTargets)
      ? parsed.publicationTargets.filter((p) => typeof p === "string")
      : [],
    successMetrics: Array.isArray(parsed.successMetrics)
      ? parsed.successMetrics.filter((s) => typeof s === "string")
      : [],
  };
}

async function generateMilestoneWithGroq(prompt) {
  if (!groq) throw new Error("Groq API not configured");

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
    max_tokens: 1024,
    messages: [
      {
        role: "system",
        content: `You are an expert research planning advisor.
Respond with a valid JSON object containing:
  - "milestones": { "title": string, "deliverable": string, "timeframe": string, "dependencies": string[] }[]
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
    throw new Error("Groq returned invalid JSON for milestones");
  }

  if (!Array.isArray(parsed?.milestones)) {
    throw new Error("Groq milestones response missing milestones array");
  }

  return parsed.milestones.filter(
    (m) =>
      m &&
      typeof m.title === "string" &&
      typeof m.deliverable === "string" &&
      typeof m.timeframe === "string" &&
      Array.isArray(m.dependencies),
  );
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export async function generateResearchRoadmap({
  topic,
  duration,
  researchLevel,
  objectives = [],
  skills = [],
  domain = "",
}) {
  if (!topic?.trim()) return { success: false, error: "topic is required" };
  if (!duration) return { success: false, error: "duration is required" };
  if (!researchLevel)
    return { success: false, error: "researchLevel is required" };

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await db.user.findUnique({ where: { clerkUserId } });
  if (!dbUser) return { success: false, error: "User not found" };
  const userId = dbUser.id;

  const safeDuration = validateDuration(duration);
  const safeLevel = validateResearchLevel(researchLevel);
  const safeObjectives = Array.isArray(objectives) ? objectives : [];
  const safeSkills = Array.isArray(skills) ? skills : [];

  const slug = `${buildCacheSlug(topic)}_${buildCacheSlug(safeDuration)}_${buildCacheSlug(safeLevel)}`;
  const cacheKey = `roadmap_${userId}_${slug}`;

  const cached = await getCached(cacheKey);
  if (cached) return { success: true, data: cached, fromCache: true };

  try {
    const prompt = buildRoadmapPrompt({
      topic: topic.trim(),
      duration: safeDuration,
      researchLevel: safeLevel,
      objectives: safeObjectives,
      skills: safeSkills,
      domain: domain?.trim() ?? "",
    });

    const roadmap = await generateRoadmapWithGroq(prompt);

    const result = {
      topic: topic.trim(),
      duration: safeDuration,
      researchLevel: safeLevel,
      domain: domain?.trim() ?? "",
      objectives: safeObjectives,
      skills: safeSkills,
      roadmap,
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
          : "Failed to generate research roadmap",
    };
  }
}

export async function generatePhaseMilestones({
  topic,
  phase,
  phaseName,
  duration,
}) {
  if (!topic?.trim()) return { success: false, error: "topic is required" };
  if (phase === undefined || phase === null || Number.isNaN(Number(phase)))
    return { success: false, error: "phase is required" };
  if (!phaseName?.trim())
    return { success: false, error: "phaseName is required" };

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await db.user.findUnique({ where: { clerkUserId } });
  if (!dbUser) return { success: false, error: "User not found" };
  const userId = dbUser.id;

  const cacheKey = `phase_milestones_${userId}_${buildCacheSlug(topic)}_${buildCacheSlug(phaseName)}_phase${phase}`;

  const cached = await getCached(cacheKey);
  if (cached) return { success: true, data: cached, fromCache: true };

  try {
    const prompt = `Generate detailed milestones for Phase ${phase} "${phaseName}" of a research project on "${topic.trim()}". Duration: ${duration ?? "unknown"}. Include specific deliverables and dependencies.`;

    const milestones = await generateMilestoneWithGroq(prompt);

    const result = {
      topic: topic.trim(),
      phase,
      phaseName: phaseName.trim(),
      milestones,
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
          : "Failed to generate phase milestones",
    };
  }
}

export async function adjustRoadmapTimeline({ roadmapId, newDuration }) {
  if (!roadmapId) return { success: false, error: "roadmapId is required" };
  if (!newDuration) return { success: false, error: "newDuration is required" };

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await db.user.findUnique({ where: { clerkUserId } });
  if (!dbUser) return { success: false, error: "User not found" };
  const userId = dbUser.id;

  const safeDuration = validateDuration(newDuration);

  try {
    const record = await db.researchRoadmap.findUnique({
      where: { id: roadmapId },
    });

    if (!record) return { success: false, error: "Roadmap not found" };
    if (record.userId !== userId) return { success: false, error: "Forbidden" };

    const existingRoadmap = record.roadmap;

    if (!groq) throw new Error("Groq API not configured");

    const innerRoadmap = existingRoadmap?.roadmap ?? existingRoadmap;
    const roadmapForPrompt = {
      title: innerRoadmap?.title,
      overview: innerRoadmap?.overview,
      phases: innerRoadmap?.phases ?? [],
      keyMilestones: innerRoadmap?.keyMilestones ?? [],
      requiredSkills: innerRoadmap?.requiredSkills ?? [],
      recommendedTools: innerRoadmap?.recommendedTools ?? [],
      publicationTargets: innerRoadmap?.publicationTargets ?? [],
      successMetrics: innerRoadmap?.successMetrics ?? [],
    };
    const safeRoadmapJson = JSON.stringify(roadmapForPrompt);
    const prompt = `Adjust the following research roadmap timeline from its current duration to "${safeDuration}". Compress or expand phases proportionally. Return the adjusted roadmap as a JSON object with the same structure (title, overview, phases, keyMilestones, requiredSkills, recommendedTools, publicationTargets, successMetrics).\n\nRoadmap: ${safeRoadmapJson}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 2048,
      messages: [
        {
          role: "system",
          content: `You are an expert research planning advisor.
Respond with a valid JSON object with the same structure as the input roadmap but with adjusted timelines.
Do not include any text outside the JSON object.`,
        },
        { role: "user", content: prompt },
      ],
    });

    const raw = completion.choices?.[0]?.message?.content ?? "";
    const clean = raw.replace(/```json|```/g, "").trim();

    let adjustedRoadmap;
    try {
      const jsonMatch = clean.match(/\{[\s\S]*\}/);
      adjustedRoadmap = JSON.parse(jsonMatch ? jsonMatch[0] : clean);
    } catch {
      throw new Error("Groq returned invalid JSON for timeline adjustment");
    }

    if (
      !adjustedRoadmap ||
      typeof adjustedRoadmap !== "object" ||
      !Array.isArray(adjustedRoadmap.phases)
    ) {
      throw new Error("Invalid roadmap structure returned");
    }

    const updated = await db.researchRoadmap.update({
      where: { id: roadmapId },
      data: {
        roadmap: {
          ...(typeof existingRoadmap === "object" && existingRoadmap !== null
            ? existingRoadmap
            : {}),
          duration: safeDuration,
          roadmap: adjustedRoadmap,
        },
        updatedAt: new Date(),
      },
    });

    return { success: true, data: updated };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to adjust roadmap timeline",
    };
  }
}

export async function saveRoadmap(roadmapData) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await db.user.findUnique({ where: { clerkUserId } });
  if (!dbUser) return { success: false, error: "User not found" };
  const userId = dbUser.id;

  if (!roadmapData?.topic?.trim() || !roadmapData?.roadmap) {
    return { success: false, error: "Invalid roadmap data" };
  }

  const normalizedTopic = roadmapData.topic.trim().toLowerCase();

  try {
    const existing = await db.researchRoadmap.findFirst({
      where: { userId, topic: normalizedTopic },
    });

    if (existing) {
      const updated = await db.researchRoadmap.update({
        where: { id: existing.id },
        data: {
          roadmap: roadmapData,
          domain: roadmapData.domain ?? null,
        },
      });
      return { success: true, data: updated };
    }

    const saved = await db.researchRoadmap.create({
      data: {
        userId,
        topic: normalizedTopic,
        domain: roadmapData.domain ?? null,
        roadmap: roadmapData,
        status: "active",
      },
    });

    return { success: true, data: saved };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save roadmap",
    };
  }
}

export async function getSavedRoadmaps() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await db.user.findUnique({ where: { clerkUserId } });
  if (!dbUser) return { success: false, error: "User not found" };
  const userId = dbUser.id;

  try {
    const roadmaps = await db.researchRoadmap.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        topic: true,
        domain: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return { success: true, data: roadmaps };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch saved roadmaps",
    };
  }
}

export async function getSavedRoadmapById(roadmapId) {
  if (!roadmapId) return { success: false, error: "roadmapId is required" };

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await db.user.findUnique({ where: { clerkUserId } });
  if (!dbUser) return { success: false, error: "User not found" };
  const userId = dbUser.id;

  try {
    const record = await db.researchRoadmap.findUnique({
      where: { id: roadmapId },
    });

    if (!record) return { success: false, error: "Roadmap not found" };
    if (record.userId !== userId) return { success: false, error: "Forbidden" };

    return { success: true, data: record };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch roadmap",
    };
  }
}

export async function updateRoadmapStatus(roadmapId, status) {
  if (!roadmapId) return { success: false, error: "roadmapId is required" };
  if (!status) return { success: false, error: "status is required" };

  const validStatuses = ["active", "completed", "paused", "archived"];
  const normalizedStatus = String(status).toLowerCase().trim();
  if (!validStatuses.includes(normalizedStatus)) {
    return { success: false, error: "Invalid status" };
  }

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await db.user.findUnique({ where: { clerkUserId } });
  if (!dbUser) return { success: false, error: "User not found" };
  const userId = dbUser.id;

  try {
    const record = await db.researchRoadmap.findUnique({
      where: { id: roadmapId },
    });

    if (!record) return { success: false, error: "Roadmap not found" };
    if (record.userId !== userId) return { success: false, error: "Forbidden" };

    const updated = await db.researchRoadmap.update({
      where: { id: roadmapId },
      data: { status: normalizedStatus },
    });

    return { success: true, data: updated };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update roadmap status",
    };
  }
}

export async function deleteSavedRoadmap(roadmapId) {
  if (!roadmapId) return { success: false, error: "roadmapId is required" };

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await db.user.findUnique({ where: { clerkUserId } });
  if (!dbUser) return { success: false, error: "User not found" };
  const userId = dbUser.id;

  try {
    const record = await db.researchRoadmap.findUnique({
      where: { id: roadmapId },
    });

    if (!record) return { success: false, error: "Roadmap not found" };
    if (record.userId !== userId) return { success: false, error: "Forbidden" };

    await db.researchRoadmap.delete({ where: { id: roadmapId } });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete roadmap",
    };
  }
}

// ─── Prompt Builder ───────────────────────────────────────────────────────────

function buildRoadmapPrompt({
  topic,
  duration,
  researchLevel,
  objectives,
  skills,
  domain,
}) {
  const objectivesText = objectives.length
    ? `Research objectives: ${objectives.join("; ")}.`
    : "";
  const skillsText = skills.length
    ? `Current skills: ${skills.join(", ")}.`
    : "";
  const domainText = domain ? `Domain: ${domain}.` : "";

  return `Generate a complete phased research roadmap for a ${researchLevel}-level researcher studying "${topic}" over ${duration}. ${domainText} ${objectivesText} ${skillsText} Include specific milestones, deliverables, and resources for each phase.`.trim();
}
