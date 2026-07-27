"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function getEmailHistory() {
  try {
    // 1. Authenticate user
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      throw new Error("Unauthorized. Please log in.");
    }

    // 2. Get user from DB
    const user = await db.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      throw new Error("User not found in database.");
    }

    // 3. Fetch last 5 email records
    const records = await db.emailRecord.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        purpose: true,
        tone: true,
        length: true,
        recipientName: true,
        companyName: true,
        jobRole: true,
        skills: true,
        generatedEmail: true,
        receiverEmail: true,
        createdAt: true,
        attachments: {
          select: {
            fileName: true,
            fileUrl: true,
            fileSize: true,
            fileType: true,
          },
        },
      },
    });

    return records;
  } catch (error) {
    console.error("getEmailHistory error:", error);
    throw new Error(error.message || "Failed to fetch email history.");
  }
}
