"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

/**
 * Fetch last 5 compression records for the current logged-in user
 * @returns {Promise<Array>} - Last 5 compression records
 */
export async function getLastCompressionRecords() {
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
      throw new Error("User not found.");
    }

    // 3. Fetch last 5 compression records
    const records = await db.compressionRecord.findMany({
      where: {
        userId: user.id,
        status: "success",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        fileName: true,
        originalSize: true,
        compressedSize: true,
        savedPercentage: true,
        compressionLevel: true,
        createdAt: true,
      },
    });

    return { success: true, records };
  } catch (error) {
    console.error("getLastCompressionRecords error:", error);
    return { success: false, records: [], error: error.message };
  }
}

/**
 * Delete a specific compression record by ID
 * @param {string} recordId - The record ID to delete
 * @returns {Promise<Object>} - Success or error
 */
export async function deleteCompressionRecord(recordId) {
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
      throw new Error("User not found.");
    }

    // 3. Make sure record belongs to this user
    const record = await db.compressionRecord.findFirst({
      where: {
        id: recordId,
        userId: user.id,
      },
    });

    if (!record) {
      throw new Error("Record not found or access denied.");
    }

    // 4. Delete the record
    await db.compressionRecord.delete({
      where: { id: recordId },
    });

    return { success: true };
  } catch (error) {
    console.error("deleteCompressionRecord error:", error);
    return { success: false, error: error.message };
  }
}