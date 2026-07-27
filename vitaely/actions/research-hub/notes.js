"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error("User not found");
  return user;
}

export async function getTopicNotes(savedTopicId) {
  const user = await getCurrentUser();
  return db.topicNote.findMany({
    where: { userId: user.id, savedTopicId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createTopicNote(savedTopicId, content) {
  const user = await getCurrentUser();
  if (!content?.trim()) throw new Error("Note content cannot be empty");
  const note = await db.topicNote.create({
    data: { userId: user.id, savedTopicId, content: content.trim() },
  });
  revalidatePath("/research-hub");
  return note;
}

export async function updateTopicNote(noteId, content) {
  const user = await getCurrentUser();
  if (!content?.trim()) throw new Error("Note content cannot be empty");
  const existing = await db.topicNote.findUnique({ where: { id: noteId } });
  if (!existing || existing.userId !== user.id) throw new Error("Note not found");
  const note = await db.topicNote.update({
    where: { id: noteId },
    data: { content: content.trim() },
  });
  revalidatePath("/research-hub");
  return note;
}

export async function deleteTopicNote(noteId) {
  const user = await getCurrentUser();
  const existing = await db.topicNote.findUnique({ where: { id: noteId } });
  if (!existing || existing.userId !== user.id) throw new Error("Note not found");
  await db.topicNote.delete({ where: { id: noteId } });
  revalidatePath("/research-hub");
  return { success: true };
}