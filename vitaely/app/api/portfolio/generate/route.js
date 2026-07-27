import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { generatePortfolioData } from "@/lib/portfolio/generatePortfolio";

export async function POST(req) {
  try {
    // ── 1. Auth check ──────────────────────────────────────────────
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // ── 2. Get user from DB ────────────────────────────────────────
    const user = await db.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found in database." },
        { status: 404 }
      );
    }

    // ── 3. Parse request body ──────────────────────────────────────
    const body = await req.json();
    const { portfolioId, formData } = body;

    // ── 4. Validate required fields ────────────────────────────────
    if (!portfolioId || !portfolioId.trim()) {
      return NextResponse.json(
        { error: "Portfolio ID is required." },
        { status: 400 }
      );
    }

    if (!formData || typeof formData !== "object") {
      return NextResponse.json(
        { error: "Form data is required." },
        { status: 400 }
      );
    }

    // ── 5. Verify portfolio ownership ──────────────────────────────
    const portfolio = await db.portfolio.findFirst({
      where: { id: portfolioId, userId: user.id },
    });

    if (!portfolio) {
      return NextResponse.json(
        { error: "Portfolio not found or unauthorized." },
        { status: 404 }
      );
    }

    // ── 6. Generate portfolio using AI ────────────────────────────
    let generatedData;
    try {
      generatedData = await generatePortfolioData(formData);
    } catch (aiError) {
      console.error("Portfolio generation error:", aiError);
      return NextResponse.json(
        { error: aiError.message || "AI generation failed. Please try again." },
        { status: 500 }
      );
    }

    // ── 7. Save generated data to DB ───────────────────────────────
    await db.portfolio.update({
      where: { id: portfolioId },
      data: {
        generatedData,
        status: "generated",
      },
    });

    // ── 8. Success response ────────────────────────────────────────
    return NextResponse.json(
      {
        success: true,
        data: generatedData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error in portfolio generate route:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal server error. Please try again.",
      },
      { status: 500 }
    );
  }
}