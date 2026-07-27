import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { analyzeResumeWithGemini } from "@/lib/ats/analyzeResume";
import mammoth from "mammoth";
import pdf from "pdf-parse/lib/pdf-parse.js";

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(req) {
  let user = null;

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
    user = await db.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found in database." },
        { status: 404 }
      );
    }

    // 3. Parse form data
    const formData = await req.formData();
    const file = formData.get("file");
    const jobDescription = formData.get("jobDescription") || "";

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded." },
        { status: 400 }
      );
    }

    // 4. Validate file type
    const fileName = file.name || "resume";
    const isPdf = fileName.toLowerCase().endsWith(".pdf");
    const isDocx = fileName.toLowerCase().endsWith(".docx");

    if (!isPdf && !isDocx) {
      return NextResponse.json(
        { error: "Only PDF or DOCX files are supported." },
        { status: 400 }
      );
    }

    // 5. Validate file size
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (buffer.length > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds the 5MB limit." },
        { status: 400 }
      );
    }

    // 6. Extract text from file
    let resumeText = "";

    if (isPdf) {
      const pdfData = await pdf(buffer);
      resumeText = pdfData.text || "";
    } else if (isDocx) {
      const result = await mammoth.extractRawText({ buffer });
      resumeText = result.value || "";
    }

    if (!resumeText.trim()) {
      return NextResponse.json(
        { error: "Could not extract text from the file. Please try a different file." },
        { status: 400 }
      );
    }

    // 7. Analyze with Gemini
    const analysis = await analyzeResumeWithGemini(resumeText, jobDescription);

    // 8. Save ATS record to DB
    await db.aTSRecord.create({
      data: {
        userId: user.id,
        resumeTitle: fileName,
        atsScore: analysis.atsScore,
        feedback: analysis.feedback,
        suggestions: analysis.suggestions,
        keywords: analysis.keywords,
      },
    });

    // 9. Return result
    return NextResponse.json(
      {
        success: true,
        atsScore: analysis.atsScore,
        feedback: analysis.feedback,
        suggestions: analysis.suggestions,
        keywords: analysis.keywords,
        missingKeywords: analysis.missingKeywords,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("ATS analysis error:", error);

    // Try to save failed record
    if (user) {
      try {
        await db.aTSRecord.create({
          data: {
            userId: user.id,
            resumeTitle: "unknown",
            atsScore: 0,
            feedback: "Analysis failed.",
            suggestions: [],
            keywords: [],
          },
        });
      } catch (dbError) {
        console.error("Failed to log ATS error to DB:", dbError);
      }
    }

    return NextResponse.json(
      { error: error.message || "ATS analysis failed. Please try again." },
      { status: 500 }
    );
  }
}