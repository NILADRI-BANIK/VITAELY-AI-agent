import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Authenticate user
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // 2. Get user from DB
    const user = await db.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found in database." },
        { status: 404 }
      );
    }

    // 3. Fetch latest 5 ATS records
    const records = await db.aTSRecord.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        resumeTitle: true,
        atsScore: true,
        feedback: true,
        suggestions: true,
        keywords: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { success: true, records },
      { status: 200 }
    );

  } catch (error) {
    console.error("ATS history fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch ATS history. Please try again." },
      { status: 500 }
    );
  }
}