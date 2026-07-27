"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { generateGroqJSON } from "@/lib/groq";
import { fetchRequiredSkillsForRole } from "@/lib/adzuna";
import { fetchProjectsBySkills } from "@/lib/github";
import { fetchVideosForMissingSkills } from "@/lib/youtube";
import {
  skillGapSchema,
  progressUpdateSchema,
  skillGapIdSchema,
} from "@/validators/skill-gap-schema";
import {
  SKILL_GAP_SYSTEM_PROMPT,
  buildSkillGapPrompt,
} from "@/constants/skill-gap-prompts";
import {
  parseGroqSkillGapResponse,
  deduplicateSkills,
} from "@/lib/skill-gap-utils";

const getAuthenticatedUser = async () => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");
  return user;
};

export const analyzeSkillGap = async (formData) => {
  try {
    const validated = skillGapSchema.safeParse(formData);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Invalid input",
      };
    }

    const user = await getAuthenticatedUser();
    const { targetRole, currentSkills, experience } = validated.data;

    const [rawAnalysis, adzunaSkills, githubProjects] =
      await Promise.allSettled([
        generateGroqJSON(
          SKILL_GAP_SYSTEM_PROMPT,
          buildSkillGapPrompt(targetRole, currentSkills, experience),
        ),
        fetchRequiredSkillsForRole(targetRole),
        fetchProjectsBySkills(currentSkills, { limit: 6 }),
      ]);

    const groqResult =
      rawAnalysis.status === "fulfilled" ? rawAnalysis.value : null;
    if (!groqResult) throw new Error("AI analysis failed");

    const parsed = parseGroqSkillGapResponse(groqResult);

    const enrichedMissingSkills = deduplicateSkills([
      ...parsed.missingSkills,
      ...(adzunaSkills.status === "fulfilled"
        ? adzunaSkills.value.filter(
            (s) =>
              !currentSkills
                .map((c) => c.toLowerCase())
                .includes(s.toLowerCase()),
          )
        : []),
    ]);

    const youtubeVideos = await fetchVideosForMissingSkills(
      enrichedMissingSkills,
      {
        skillsLimit: 5,
        videosPerSkill: 3,
      },
    );

    const enrichedProjects =
      githubProjects.status === "fulfilled" && githubProjects.value.length
        ? [
            ...parsed.projects,
            ...githubProjects.value.map((repo) => ({
              title: repo.title,
              description: repo.description,
              skills: repo.topics.length
                ? repo.topics
                : currentSkills.slice(0, 3),
              difficulty:
                experience === "beginner" ? "beginner" : "intermediate",
              url: repo.url,
              stars: repo.stars,
            })),
          ]
        : parsed.projects;

    const saved = await db.skillGapAnalysis.create({
      data: {
        userId: user.id,
        targetRole,
        experience,
        currentSkills,
        matchScore: parsed.matchScore,
        missingSkills: enrichedMissingSkills,
        prioritySkills: parsed.prioritySkills,
        roadmap: parsed.roadmap,
        courses: parsed.courses,
        projects: enrichedProjects,
        timeline: parsed.timeline,
      },
    });

    return {
      success: true,
      matchScore: saved.matchScore,
      missingSkills: saved.missingSkills,
      prioritySkills: saved.prioritySkills,
      learningRoadmap: saved.roadmap,
      recommendedCourses: saved.courses,
      projectRecommendations: saved.projects,
      learningTimeline: saved.timeline,
      youtubeVideos,
      id: saved.id,
    };
  } catch (error) {
    console.error("analyzeSkillGap error:", error.message);
    return { success: false, error: error.message || "Analysis failed" };
  }
};

export const saveAnalysis = async (analysisData) => {
  try {
    const user = await getAuthenticatedUser();

    if (!analysisData || typeof analysisData !== "object") {
      return {
        success: false,
        error: "Invalid analysis data",
      };
    }

    const saved = await db.skillGapAnalysis.create({
      data: {
        userId: user.id,
        ...analysisData,
      },
    });

    return { success: true, data: saved };
  } catch (error) {
    console.error("saveAnalysis error:", error.message);
    return { success: false, error: error.message || "Save failed" };
  }
};

export const updateProgress = async (progressData) => {
  try {
    const validated = progressUpdateSchema.safeParse(progressData);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Invalid input",
      };
    }

    const user = await getAuthenticatedUser();
    const { analysisId, skillName, completed } = validated.data;

    const existing = await db.skillProgress.findFirst({
      where: { userId: user.id, analysisId, skillName },
    });

    const result = existing
      ? await db.skillProgress.update({
          where: { id: existing.id },
          data: {
            completed,
            completedAt: completed ? new Date() : null,
          },
        })
      : await db.skillProgress.create({
          data: {
            userId: user.id,
            analysisId,
            skillName,
            completed,
            completedAt: completed ? new Date() : null,
          },
        });

    return { success: true, data: result };
  } catch (error) {
    console.error("updateProgress error:", error.message);
    return { success: false, error: error.message || "Update failed" };
  }
};

export const getAnalysisById = async (id) => {
  try {
    const validated = skillGapIdSchema.safeParse({ id });
    if (!validated.success) {
      return { success: false, error: "Invalid ID" };
    }

    const user = await getAuthenticatedUser();

    const analysis = await db.skillGapAnalysis.findFirst({
      where: { id, userId: user.id },
      include: { progress: true },
    });

    if (!analysis) return { success: false, error: "Analysis not found" };

    return { success: true, data: analysis };
  } catch (error) {
    console.error("getAnalysisById error:", error.message);
    return { success: false, error: error.message || "Fetch failed" };
  }
};

export const getAllAnalyses = async () => {
  try {
    const user = await getAuthenticatedUser();

    const analyses = await db.skillGapAnalysis.findMany({
      where: { userId: user.id },
      include: { progress: true },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: analyses };
  } catch (error) {
    console.error("getAllAnalyses error:", error.message);
    return { success: false, error: error.message || "Fetch failed" };
  }
};

export const deleteAnalysis = async (id) => {
  try {
    const validated = skillGapIdSchema.safeParse({ id });
    if (!validated.success) {
      return { success: false, error: "Invalid ID" };
    }

    const user = await getAuthenticatedUser();

    const analysis = await db.skillGapAnalysis.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!analysis) {
      return {
        success: false,
        error: "Analysis not found",
      };
    }

    await db.skillGapAnalysis.delete({
      where: {
        id: analysis.id,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("deleteAnalysis error:", error.message);
    return { success: false, error: error.message || "Delete failed" };
  }
};
