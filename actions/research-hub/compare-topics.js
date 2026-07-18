"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

async function getDbUser(clerkUserId) {
  return db.user.findUnique({ where: { clerkUserId } });
}

export async function getAllSavedTopicsList() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  try {
    const topics = await db.savedResearchTopic.findMany({
      where: { userId: dbUser.id },
      select: {
        id: true,
        topicName: true,
        trendScore: true,
        noveltyScore: true,
        feasibilityScore: true,
        paperCount: true,
        competitionLevel: true,
        hasDataset: true,
        openAccessRatio: true,
        keywords: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: topics };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch topics",
    };
  }
}

export async function getTopicsByIds(topicIds) {
  if (!Array.isArray(topicIds) || topicIds.length === 0) {
    return { success: false, error: "topicIds is required" };
  }

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  try {
    const topics = await db.savedResearchTopic.findMany({
      where: { id: { in: topicIds }, userId: dbUser.id },
      select: {
        id: true,
        topicName: true,
        rationale: true,
        trendScore: true,
        noveltyScore: true,
        feasibilityScore: true,
        paperCount: true,
        competitionLevel: true,
        hasDataset: true,
        openAccessRatio: true,
        keywords: true,
      },
    });
    return { success: true, data: topics };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch topics",
    };
  }
}