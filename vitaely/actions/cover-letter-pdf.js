"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function getCoverLetterForPdf(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error("User not found");

  const coverLetter = await db.coverLetter.findUnique({ where: { id } });
  if (!coverLetter || coverLetter.userId !== user.id) {
    throw new Error("Cover letter not found");
  }

  return {
    id: coverLetter.id,
    title: coverLetter.title,
    content: coverLetter.content,
    // expose as both names so UI components work regardless of which they read
    template: coverLetter.template,
    selectedTemplate: coverLetter.template,
    formData: coverLetter.formData,
  };
}