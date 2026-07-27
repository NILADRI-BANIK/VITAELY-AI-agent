"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import {
  buildTopicWorkspaceData,
  buildTopicQuery,
} from "@/lib/topic-workspace";

async function getDbUser(clerkUserId) {
  return db.user.findUnique({ where: { clerkUserId } });
}

async function getOwnedSavedTopic(topicId, dbUserId) {
  const savedTopic = await db.savedResearchTopic.findUnique({
    where: { id: topicId },
  });
  if (!savedTopic) return { error: "Topic not found" };
  if (savedTopic.userId !== dbUserId) return { error: "Forbidden" };
  return { savedTopic };
}

export async function getWorkspaceData(topicId, options = {}) {
  if (!topicId) return { success: false, error: "topicId is required" };

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  const { savedTopic, error } = await getOwnedSavedTopic(topicId, dbUser.id);
  if (error) return { success: false, error };

  try {
    const data = await buildTopicWorkspaceData(savedTopic, {
      forceRefresh: !!options.forceRefresh,
    });

    await db.workspaceSession
      .upsert({
        where: { savedTopicId: savedTopic.id },
        update: {},
        create: {
          userId: dbUser.id,
          savedTopicId: savedTopic.id,
        },
      })
      .catch(() => {});

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to load workspace data",
    };
  }
}

export async function refreshWorkspaceData(topicId) {
  return getWorkspaceData(topicId, { forceRefresh: true });
}

export async function getWorkspaceSession(topicId) {
  if (!topicId) return { success: false, error: "topicId is required" };

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  const { savedTopic, error } = await getOwnedSavedTopic(topicId, dbUser.id);
  if (error) return { success: false, error };

  try {
    const session = await db.workspaceSession.findUnique({
      where: { savedTopicId: savedTopic.id },
    });
    return { success: true, data: session };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to load workspace session",
    };
  }
}

export async function markOpenedPaper(topicId, paper) {
  if (!topicId) return { success: false, error: "topicId is required" };
  if (!paper?.title) return { success: false, error: "Invalid paper data" };

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  const { savedTopic, error } = await getOwnedSavedTopic(topicId, dbUser.id);
  if (error) return { success: false, error };

  try {
    const existing = await db.workspaceSession.findUnique({
      where: { savedTopicId: savedTopic.id },
    });

    const openedPapers = Array.isArray(existing?.openedPapers)
      ? existing.openedPapers
      : [];

    const alreadyOpened = openedPapers.some(
      (p) => (p.doi && p.doi === paper.doi) || p.title === paper.title,
    );

    const updatedPapers = alreadyOpened
      ? openedPapers
      : [
          ...openedPapers,
          {
            title: paper.title,
            doi: paper.doi ?? null,
            url: paper.url ?? null,
            source: paper.source ?? null,
            openedAt: new Date().toISOString(),
          },
        ];

    const session = await db.workspaceSession.upsert({
      where: { savedTopicId: savedTopic.id },
      update: { openedPapers: updatedPapers },
      create: {
        userId: dbUser.id,
        savedTopicId: savedTopic.id,
        openedPapers: updatedPapers,
      },
    });

    return { success: true, data: session };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to mark paper opened",
    };
  }
}

export async function markViewedVideo(topicId, video) {
  if (!topicId) return { success: false, error: "topicId is required" };
  if (!video?.title && !video?.videoId) {
    return { success: false, error: "Invalid video data" };
  }

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  const { savedTopic, error } = await getOwnedSavedTopic(topicId, dbUser.id);
  if (error) return { success: false, error };

  try {
    const existing = await db.workspaceSession.findUnique({
      where: { savedTopicId: savedTopic.id },
    });

    const viewedVideos = Array.isArray(existing?.viewedVideos)
      ? existing.viewedVideos
      : [];

    const alreadyViewed = viewedVideos.some(
      (v) => v.videoId && v.videoId === video.videoId,
    );

    const updatedVideos = alreadyViewed
      ? viewedVideos
      : [
          ...viewedVideos,
          {
            videoId: video.videoId ?? null,
            title: video.title ?? null,
            url: video.url ?? null,
            viewedAt: new Date().toISOString(),
          },
        ];

    const session = await db.workspaceSession.upsert({
      where: { savedTopicId: savedTopic.id },
      update: { viewedVideos: updatedVideos },
      create: {
        userId: dbUser.id,
        savedTopicId: savedTopic.id,
        viewedVideos: updatedVideos,
      },
    });

    return { success: true, data: session };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to mark video viewed",
    };
  }
}

export async function markActivityDone(topicId, activity) {
  const validActivities = ["methodologyDone", "gapAnalysisDone", "roadmapDone"];
  if (!topicId) return { success: false, error: "topicId is required" };
  if (!validActivities.includes(activity)) {
    return { success: false, error: "Invalid activity type" };
  }

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  const { savedTopic, error } = await getOwnedSavedTopic(topicId, dbUser.id);
  if (error) return { success: false, error };

  try {
    const session = await db.workspaceSession.upsert({
      where: { savedTopicId: savedTopic.id },
      update: { [activity]: true },
      create: {
        userId: dbUser.id,
        savedTopicId: savedTopic.id,
        [activity]: true,
      },
    });

    return { success: true, data: session };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update activity status",
    };
  }
}

export async function addTopicNote(topicId, content) {
  if (!topicId) return { success: false, error: "topicId is required" };
  if (!content?.trim()) return { success: false, error: "Note cannot be empty" };

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  const { savedTopic, error } = await getOwnedSavedTopic(topicId, dbUser.id);
  if (error) return { success: false, error };

  try {
    const note = await db.topicNote.create({
      data: {
        userId: dbUser.id,
        savedTopicId: savedTopic.id,
        content: content.trim(),
      },
    });
    return { success: true, data: note };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add note",
    };
  }
}

export async function updateTopicNote(noteId, content) {
  if (!noteId) return { success: false, error: "noteId is required" };
  if (!content?.trim()) return { success: false, error: "Note cannot be empty" };

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  try {
    const existing = await db.topicNote.findUnique({ where: { id: noteId } });
    if (!existing) return { success: false, error: "Note not found" };
    if (existing.userId !== dbUser.id) return { success: false, error: "Forbidden" };

    const note = await db.topicNote.update({
      where: { id: noteId },
      data: { content: content.trim() },
    });
    return { success: true, data: note };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update note",
    };
  }
}

export async function deleteTopicNote(noteId) {
  if (!noteId) return { success: false, error: "noteId is required" };

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  try {
    const existing = await db.topicNote.findUnique({ where: { id: noteId } });
    if (!existing) return { success: false, error: "Note not found" };
    if (existing.userId !== dbUser.id) return { success: false, error: "Forbidden" };

    await db.topicNote.delete({ where: { id: noteId } });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete note",
    };
  }
}

export async function getTopicNotes(topicId) {
  if (!topicId) return { success: false, error: "topicId is required" };

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  const { savedTopic, error } = await getOwnedSavedTopic(topicId, dbUser.id);
  if (error) return { success: false, error };

  try {
    const notes = await db.topicNote.findMany({
      where: { savedTopicId: savedTopic.id, userId: dbUser.id },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: notes };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch notes",
    };
  }
}

export async function addPaperToCollection(topicId, paper, collection = "reading_list") {
  if (!topicId) return { success: false, error: "topicId is required" };
  if (!paper?.id && !paper?.title) {
    return { success: false, error: "Invalid paper data" };
  }

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  const { savedTopic, error } = await getOwnedSavedTopic(topicId, dbUser.id);
  if (error) return { success: false, error };

  const key = String(paper.id ?? paper.doi ?? paper.title);

  try {
    const entry = await db.paperCollection.upsert({
      where: {
        userId_savedTopicId_paperId_collection: {
          userId: dbUser.id,
          savedTopicId: savedTopic.id,
          paperId: key,
          collection,
        },
      },
      update: {},
      create: {
        userId: dbUser.id,
        savedTopicId: savedTopic.id,
        paperId: key,
        title: paper.title,
        collection,
      },
    });
    return { success: true, data: entry };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to add paper to collection",
    };
  }
}

export async function removePaperFromCollection(topicId, paperId, collection = "reading_list") {
  if (!topicId) return { success: false, error: "topicId is required" };
  if (!paperId) return { success: false, error: "paperId is required" };

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  const { savedTopic, error } = await getOwnedSavedTopic(topicId, dbUser.id);
  if (error) return { success: false, error };

  try {
    await db.paperCollection.deleteMany({
      where: {
        userId: dbUser.id,
        savedTopicId: savedTopic.id,
        paperId: String(paperId),
        collection,
      },
    });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to remove paper from collection",
    };
  }
}

export async function getPaperCollections(topicId) {
  if (!topicId) return { success: false, error: "topicId is required" };

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  const { savedTopic, error } = await getOwnedSavedTopic(topicId, dbUser.id);
  if (error) return { success: false, error };

  try {
    const collections = await db.paperCollection.findMany({
      where: { savedTopicId: savedTopic.id, userId: dbUser.id },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: collections };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch paper collections",
    };
  }
}

export async function getTopicWorkspaceQuery(topicId) {
  if (!topicId) return { success: false, error: "topicId is required" };

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  const { savedTopic, error } = await getOwnedSavedTopic(topicId, dbUser.id);
  if (error) return { success: false, error };

  try {
    const query = buildTopicQuery(savedTopic);
    return { success: true, data: query };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to build query",
    };
  }
}

export async function getSavedTopicById(topicId) {
  if (!topicId) return { success: false, error: "topicId is required" };

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await getDbUser(clerkUserId);
  if (!dbUser) return { success: false, error: "User not found" };

  const { savedTopic, error } = await getOwnedSavedTopic(topicId, dbUser.id);
  if (error) return { success: false, error };

  return { success: true, data: savedTopic };
}