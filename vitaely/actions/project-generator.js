"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { getProjectRoadmap } from "@/lib/project-generator/roadmap";
import { getERDiagram } from "@/lib/project-generator/er-diagram";
import { getReadme } from "@/lib/project-generator/readme";
import {
  getEnhancements,
  getDeploymentSuggestions,
  getDatabaseRecommendation,
  getAPIRecommendations,
} from "@/lib/project-generator/recommendations";
import {
  generateInterviewQuestions,
  generateMentorResponse,
  generateProjectIdeas,
} from "@/lib/project-generator/generator";
import {
  formatInterviewQuestions,
  formatMentorResponse,
  formatProjectIdeas,
} from "@/lib/project-generator/formatter";
import { getScoreSummary } from "@/lib/project-generator/scoring";
import { getGithubStructureGuide } from "@/lib/project-generator/github-structure";

// ─── Helper: get authenticated user ──────────────────────────────────────────
const getAuthUser = async () => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");
  return user;
};

// ─── 1. Generate Project Ideas ────────────────────────────────────────────────
export async function generateAndSaveProjectIdeas({
  skills,
  experienceLevel,
  domain,
  complexity,
  category,
  projectCount = 3,
}) {
  try {
    const user = await getAuthUser();

    const rawProjects = await generateProjectIdeas({
      skills,
      experienceLevel,
      domain,
      complexity,
      category,
      projectCount,
    });

    const formatted = formatProjectIdeas(rawProjects);

    const saved = await Promise.all(
      formatted.map((project) =>
        db.projectIdea.create({
          data: {
            userId: user.id,
            title: project.title,
            description: project.description,
            techStack: project.techStack,
            features: project.coreFeatures,
            difficulty: project.difficulty,
            duration: project.estimatedDuration,
            learningOutcomes: project.learningOutcomes,
            resumeScore: project.resumeImpactScore,
            industryDemand: String(project.industryDemandScore),
            deploymentSuggestions: [],
            apiRecommendations: [],
            interviewQuestions: [],
          },
        }),
      ),
    );

    await db.projectHistory.create({
      data: {
        userId: user.id,
        skills: Array.isArray(skills)
          ? skills
          : skills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
        experienceLevel,
        domain,
        complexity,
        projectCount,
      },
    });

    return { success: true, data: saved };
  } catch (error) {
    console.error("generateAndSaveProjectIdeas error:", error.message);
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

// ─── 2. Get User's Generated Project Ideas ────────────────────────────────────
export async function getProjectIdeas() {
  try {
    const user = await getAuthUser();

    const projects = await db.projectIdea.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: projects };
  } catch (error) {
    console.error("getProjectIdeas error:", error.message);
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

// ─── 3. Get Single Project Idea ───────────────────────────────────────────────
export async function getProjectIdeaById(projectId) {
  try {
    const user = await getAuthUser();

    const project = await db.projectIdea.findFirst({
      where: { id: projectId, userId: user.id },
    });

    if (!project) throw new Error("Project not found");

    return { success: true, data: project };
  } catch (error) {
    console.error("getProjectIdeaById error:", error.message);
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

// ─── 4. Save Project Idea ─────────────────────────────────────────────────────
export async function saveProjectIdea(projectIdeaId) {
  try {
    const user = await getAuthUser();

    const existing = await db.savedProject.findFirst({
      where: { userId: user.id, projectIdeaId },
    });

    if (existing) {
      return { success: false, error: "Project already saved" };
    }

    const saved = await db.savedProject.create({
      data: { userId: user.id, projectIdeaId },
    });

    return { success: true, data: saved };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("saveProjectIdea error:", message);
    return { success: false, error: message };
  }
}

// ─── 5. Unsave Project Idea ───────────────────────────────────────────────────
export async function unsaveProjectIdea(projectIdeaId) {
  try {
    const user = await getAuthUser();

    await db.savedProject.deleteMany({
      where: { userId: user.id, projectIdeaId },
    });

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("unsaveProjectIdea error:", message);
    return { success: false, error: message };
  }
}

// ─── 6. Get Saved Projects ────────────────────────────────────────────────────
export async function getSavedProjects() {
  try {
    const user = await getAuthUser();

    const saved = await db.savedProject.findMany({
      where: { userId: user.id },
      include: { projectIdea: true },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: saved.map((s) => s.projectIdea) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("getSavedProjects error:", message);
    return { success: false, error: message };
  }
}

// ─── 7. Toggle Favorite ───────────────────────────────────────────────────────
export async function toggleFavoriteProject(projectIdeaId) {
  try {
    const user = await getAuthUser();

    const existing = await db.favoriteProject.findFirst({
      where: { userId: user.id, projectIdeaId },
    });

    if (existing) {
      await db.favoriteProject.deleteMany({
        where: { userId: user.id, projectIdeaId },
      });
      return { success: true, favorited: false };
    }

    await db.favoriteProject.create({
      data: { userId: user.id, projectIdeaId },
    });

    return { success: true, favorited: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("toggleFavoriteProject error:", message);
    return { success: false, error: message };
  }
}

// ─── 8. Get Favorite Projects ─────────────────────────────────────────────────
export async function getFavoriteProjects() {
  try {
    const user = await getAuthUser();

    const favorites = await db.favoriteProject.findMany({
      where: { userId: user.id },
      include: { projectIdea: true },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: favorites.map((f) => f.projectIdea) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("getFavoriteProjects error:", message);
    return { success: false, error: message };
  }
}

// ─── 9. Delete Project Idea ───────────────────────────────────────────────────
export async function deleteProjectIdea(projectIdeaId) {
  try {
    const user = await getAuthUser();

    await db.projectIdea.deleteMany({
      where: { id: projectIdeaId, userId: user.id },
    });

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("deleteProjectIdea error:", message);
    return { success: false, error: message };
  }
}

// ─── 10. Get Project History ──────────────────────────────────────────────────
export async function getProjectHistory() {
  try {
    const user = await getAuthUser();

    const history = await db.projectHistory.findMany({
      where: { userId: user.id },
      orderBy: { generatedAt: "desc" },
      take: 20,
    });

    return { success: true, data: history };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("getProjectHistory error:", message);
    return { success: false, error: message };
  }
}

// ─── 11. Track PDF Export ─────────────────────────────────────────────────────
export async function trackProjectExport(projectIdeaId, format = "pdf") {
  try {
    const user = await getAuthUser();

    const exported = await db.projectExport.create({
      data: { userId: user.id, projectIdeaId, format },
    });

    return { success: true, data: exported };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("trackProjectExport error:", message);
    return { success: false, error: message };
  }
}

// ─── 12. Generate Roadmap ─────────────────────────────────────────────────────
export async function getProjectRoadmapAction(projectIdeaId) {
  try {
    const user = await getAuthUser();

    const project = await db.projectIdea.findFirst({
      where: { id: projectIdeaId, userId: user.id },
    });

    if (!project) throw new Error("Project not found");

    const roadmap = await getProjectRoadmap({
      title: project.title,
      description: project.description,
      techStack: project.techStack,
      difficulty: project.difficulty,
    });

    await db.projectIdea.update({
      where: { id: projectIdeaId },
      data: { roadmap },
    });

    return { success: true, data: roadmap };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("getProjectRoadmapAction error:", message);
    return { success: false, error: message };
  }
}

// ─── 13. Generate ER Diagram ──────────────────────────────────────────────────
export async function getProjectERDiagramAction(projectIdeaId) {
  try {
    const user = await getAuthUser();

    const project = await db.projectIdea.findFirst({
      where: { id: projectIdeaId, userId: user.id },
    });

    if (!project) throw new Error("Project not found");

    const erd = await getERDiagram({
      title: project.title,
      description: project.description,
      coreFeatures: project.features,
    });

    await db.projectIdea.update({
      where: { id: projectIdeaId },
      data: { erDiagram: JSON.stringify(erd) },
    });

    return { success: true, data: erd };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("getProjectERDiagramAction error:", message);
    return { success: false, error: message };
  }
}

// ─── 14. Generate README ──────────────────────────────────────────────────────
export async function getProjectReadmeAction(projectIdeaId) {
  try {
    const user = await getAuthUser();

    const project = await db.projectIdea.findFirst({
      where: { id: projectIdeaId, userId: user.id },
    });

    if (!project) throw new Error("Project not found");

    const readme = await getReadme({
      title: project.title,
      description: project.description,
      techStack: project.techStack,
      coreFeatures: project.features,
      difficulty: project.difficulty,
      estimatedDuration: project.duration,
    });

    await db.projectIdea.update({
      where: { id: projectIdeaId },
      data: { readme: JSON.stringify(readme) },
    });

    return { success: true, data: readme };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("getProjectReadmeAction error:", message);
    return { success: false, error: message };
  }
}

// ─── 15. Generate Interview Questions ────────────────────────────────────────
export async function getInterviewQuestionsAction(projectIdeaId) {
  try {
    const user = await getAuthUser();

    const project = await db.projectIdea.findFirst({
      where: { id: projectIdeaId, userId: user.id },
    });

    if (!project) throw new Error("Project not found");

    const raw = await generateInterviewQuestions({
      title: project.title,
      techStack: project.techStack,
      coreFeatures: project.features,
      difficulty: project.difficulty,
    });

    const formatted = formatInterviewQuestions(raw);

    await db.projectIdea.update({
      where: { id: projectIdeaId },
      data: { interviewQuestions: [JSON.stringify(formatted)] },
    });

    return { success: true, data: formatted };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("getInterviewQuestionsAction error:", message);
    return { success: false, error: message };
  }
}

// ─── 16. Generate Enhancements ────────────────────────────────────────────────
export async function getEnhancementsAction(projectIdeaId) {
  try {
    const user = await getAuthUser();

    const project = await db.projectIdea.findFirst({
      where: { id: projectIdeaId, userId: user.id },
    });

    if (!project) throw new Error("Project not found");

    const enhancements = await getEnhancements({
      title: project.title,
      description: project.description,
      techStack: project.techStack,
      coreFeatures: project.features,
    });

    return { success: true, data: enhancements };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("getEnhancementsAction error:", message);
    return { success: false, error: message };
  }
}

// ─── 17. Generate Deployment Suggestions ─────────────────────────────────────
export async function getDeploymentSuggestionsAction(projectIdeaId) {
  try {
    const user = await getAuthUser();

    const project = await db.projectIdea.findFirst({
      where: { id: projectIdeaId, userId: user.id },
    });

    if (!project) throw new Error("Project not found");

    const deployment = await getDeploymentSuggestions({
      title: project.title,
      techStack: project.techStack,
      complexity: project.difficulty,
    });

    await db.projectIdea.update({
      where: { id: projectIdeaId },
      data: {
        deploymentSuggestions:
          deployment.alternatives?.map((a) => a.platform) || [],
      },
    });

    return { success: true, data: deployment };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("getDeploymentSuggestionsAction error:", message);
    return { success: false, error: message };
  }
}

// ─── 18. Get Database Recommendation ─────────────────────────────────────────
export async function getDatabaseRecommendationAction(projectIdeaId) {
  try {
    const user = await getAuthUser();

    const project = await db.projectIdea.findFirst({
      where: { id: projectIdeaId, userId: user.id },
    });

    if (!project) throw new Error("Project not found");

    const dbRec = getDatabaseRecommendation({
      techStack: project.techStack,
      domain: project.description,
      complexity: project.difficulty,
    });

    await db.projectIdea.update({
      where: { id: projectIdeaId },
      data: { databaseRecommendation: dbRec.recommended?.name || "" },
    });

    return { success: true, data: dbRec };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("getDatabaseRecommendationAction error:", message);
    return { success: false, error: message };
  }
}

// ─── 19. Get API Recommendations ─────────────────────────────────────────────
export async function getAPIRecommendationsAction(projectIdeaId) {
  try {
    const user = await getAuthUser();

    const project = await db.projectIdea.findFirst({
      where: { id: projectIdeaId, userId: user.id },
    });

    if (!project) throw new Error("Project not found");

    const apis = getAPIRecommendations({
      domain: project.description,
      coreFeatures: project.features,
      techStack: project.techStack,
    });

    await db.projectIdea.update({
      where: { id: projectIdeaId },
      data: {
        apiRecommendations: apis.recommended?.map((a) => a.name) || [],
      },
    });

    return { success: true, data: apis };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("getAPIRecommendationsAction error:", message);
    return { success: false, error: message };
  }
}

// ─── 20. Mentor Chat ──────────────────────────────────────────────────────────
export async function getMentorResponseAction({
  projectIdeaId,
  conversationHistory = [],
  userMessage,
}) {
  try {
    const user = await getAuthUser();

    const project = await db.projectIdea.findFirst({
      where: { id: projectIdeaId, userId: user.id },
    });

    if (!project) throw new Error("Project not found");

    const raw = await generateMentorResponse({
      project,
      conversationHistory,
      userMessage,
    });

    const formatted = formatMentorResponse(raw);

    return { success: true, data: formatted };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("getMentorResponseAction error:", message);
    return { success: false, error: message };
  }
}

// ─── 21. Get Trending Projects ────────────────────────────────────────────────
export async function getTrendingProjectsAction() {
  try {
    const trending = await db.projectIdea.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        title: true,
        description: true,
        difficulty: true,
        duration: true,
        resumeScore: true,
        techStack: true,
        features: true,
      },
    });

    return { success: true, data: trending };
  } catch (error) {
    console.error("getTrendingProjectsAction error:", error.message);
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

// ─── 22. Search Projects ──────────────────────────────────────────────────────
export async function searchProjectsAction(query = "") {
  try {
    const user = await getAuthUser();

    const results = await db.projectIdea.findMany({
      where: {
        userId: user.id,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { difficulty: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: results };
  } catch (error) {
    console.error("searchProjectsAction error:", error.message);
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

// ─── 23. Get Score Summary ────────────────────────────────────────────────────
export async function getProjectScoreSummaryAction(projectIdeaId) {
  try {
    const user = await getAuthUser();

    const project = await db.projectIdea.findFirst({
      where: { id: projectIdeaId, userId: user.id },
    });

    if (!project) throw new Error("Project not found");

    const summary = getScoreSummary({
      difficulty: project.difficulty,
      techStack: project.techStack,
      coreFeatures: project.features,
      bonusFeatures: [],
      resumeImpactScore: project.resumeScore,
    });

    return { success: true, data: summary };
  } catch (error) {
    console.error("getProjectScoreSummaryAction error:", error.message);
    const message = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: message };
  }
}

// ─── 24. Generate GitHub Structure Guide ─────────────────────────────────────
export async function generateGithubStructureGuideAction(projectIdeaId) {
  try {
    const user = await getAuthUser();

    const project = await db.projectIdea.findFirst({
      where: { id: projectIdeaId, userId: user.id },
    });

    if (!project) throw new Error("Project not found");

    const guide = await getGithubStructureGuide({
      title: project.title,
      description: project.description,
      techStack: [
        ...(project.techStack?.frontend || []),
        ...(project.techStack?.backend || []),
        ...(project.techStack?.database || []),
        ...(project.techStack?.devops || []),
      ],
      coreFeatures: project.features,
      difficulty: project.difficulty,
    });

    return { success: true, data: guide };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("generateGithubStructureGuideAction error:", message);
    return { success: false, error: message };
  }
}
