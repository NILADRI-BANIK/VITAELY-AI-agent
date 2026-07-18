"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import {
  generateAndRankGaps,
  buildGapPrompt,
  buildOpenProblemsPrompt,
  buildSkillGapsPrompt,
} from "@/lib/gap-finder";

async function getDbUser(clerkUserId) {
  return db.user.findUnique({ where: { clerkUserId } });
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export async function getResearchGaps({ topic, field, skills = [] }) {
  if (!topic?.trim() && !field?.trim()) {
    return { success: false, error: "topic or field is required" };
  }

  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const safeSkills = Array.isArray(skills) ? skills : [];
  const subject = (topic ?? field).trim();
  const slug = subject.toLowerCase().replace(/\s+/g, "_").slice(0, 50);
  const fieldSlug = field?.trim()
    ? field.trim().toLowerCase().replace(/\s+/g, "_").slice(0, 30)
    : "nofield";
  const skillsSlug = safeSkills.length
    ? safeSkills.map((s) => String(s).toLowerCase().trim()).sort().join("-").slice(0, 40)
    : "noskills";
  const cacheKey = `research_gaps_${userId}_${slug}_${fieldSlug}_${skillsSlug}`;

  try {
    const prompt = buildGapPrompt({ topic: subject, skills: safeSkills });
    const { data, fromCache } = await generateAndRankGaps({ prompt, cacheKey });
    return { success: true, data, fromCache };
  } catch (error) {
    console.error("getResearchGaps error:", error.message);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to find research gaps",
    };
  }
}

export async function getOpenProblems(domainId) {
  if (!domainId) return { success: false, error: "domainId is required" };

  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const cacheKey = `open_problems_${userId}_${String(domainId).slice(0, 50)}`;

  try {
    const prompt = buildOpenProblemsPrompt(domainId);
    const { data, fromCache } = await generateAndRankGaps({ prompt, cacheKey });
    return { success: true, data, fromCache };
  } catch (error) {
    console.error("getOpenProblems error:", error.message);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get open problems",
    };
  }
}

export async function getGapsBySkillSet(skills) {
  if (!Array.isArray(skills) || !skills.length) {
    return { success: false, error: "skills array is required" };
  }

  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const slug = skills
    .map((s) => String(s).toLowerCase().replace(/\s+/g, "_"))
    .sort()
    .join("-")
    .slice(0, 80);
  const cacheKey = `skill_gaps_${userId}_${slug}`;

  try {
    const prompt = buildSkillGapsPrompt(skills);
    const { data, fromCache } = await generateAndRankGaps({ prompt, cacheKey });
    return { success: true, data, fromCache };
  } catch (error) {
    console.error("getGapsBySkillSet error:", error.message);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get skill-based gaps",
    };
  }
}

export async function saveResearchGap(gap) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const dbUser = await getDbUser(userId);
  if (!dbUser) return { success: false, error: "User not found" };

  const title = (gap?.gap ?? gap?.title ?? gap?.gapTitle ?? "").trim();

  if (!title) {
    return { success: false, error: "Invalid gap data" };
  }

  try {
    const existing = await db.savedResearchGap.findFirst({
      where: { userId: dbUser.id, gapTitle: title },
    });

    if (existing) {
      return { success: false, error: "Gap already saved" };
    }

    const saved = await db.savedResearchGap.create({
      data: {
        userId: dbUser.id,
        gapTitle: title,
        description: gap.description ?? "",
        why: gap.why ?? "",
        keywords: Array.isArray(gap.keywords) ? gap.keywords : [],
        difficulty: gap.difficulty ?? "medium",
        openAlexCount: gap.openAlexCount ?? 0,
        semanticCount: gap.semanticCount ?? 0,
        totalPaperCount: gap.totalPaperCount ?? 0,
        score: gap.score ?? 0,
        impactScore: gap.impactScore ?? 0,
        confidence: gap.confidence ?? 70,
        domain: gap.domain ?? null,
        type: gap.type ?? "gap",
        opportunity: gap.opportunity ?? "",
      },
    });

    return { success: true, data: saved };
  } catch (error) {
    console.error("saveResearchGap error:", error.message);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save gap",
    };
  }
}

export async function getSavedGaps() {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const dbUser = await getDbUser(userId);
  if (!dbUser) return { success: false, error: "User not found" };

  try {
    const gaps = await db.savedResearchGap.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: gaps };
  } catch (error) {
    console.error("getSavedGaps error:", error.message);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch saved gaps",
    };
  }
}

export async function deleteSavedGap(gapId) {
  if (!gapId) return { success: false, error: "gapId is required" };

  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const dbUser = await getDbUser(userId);
  if (!dbUser) return { success: false, error: "User not found" };

  try {
    const record = await db.savedResearchGap.findUnique({ where: { id: gapId } });
    if (!record) return { success: false, error: "Gap not found" };
    if (record.userId !== dbUser.id) return { success: false, error: "Forbidden" };

    await db.savedResearchGap.delete({ where: { id: gapId } });
    return { success: true };
  } catch (error) {
    console.error("deleteSavedGap error:", error.message);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete gap",
    };
  }
}

export async function updateGapNotes(gapId, notes) {
  if (!gapId) return { success: false, error: "gapId is required" };

  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const dbUser = await getDbUser(userId);
  if (!dbUser) return { success: false, error: "User not found" };

  try {
    const record = await db.savedResearchGap.findUnique({ where: { id: gapId } });
    if (!record) return { success: false, error: "Gap not found" };
    if (record.userId !== dbUser.id) return { success: false, error: "Forbidden" };

    const updated = await db.savedResearchGap.update({
      where: { id: gapId },
      data: {
        notes: typeof notes === "string" ? notes.trim().slice(0, 2000) : "",
      },
    });

    return { success: true, data: updated };
  } catch (error) {
    console.error("updateGapNotes error:", error.message);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update notes",
    };
  }
}