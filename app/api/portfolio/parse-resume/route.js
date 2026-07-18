import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { parseResumeFile, detectFileType } from "@/lib/portfolio/parseResume";

export async function POST(request) {
  try {
    // ── 1. Auth check ──────────────────────────────────────────────
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 },
      );
    }

    // ── 2. Read uploaded file ──────────────────────────────────────
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Invalid file upload." },
        { status: 400 },
      );
    }

    // ── 3. Detect file type ────────────────────────────────────────
    const fileType = detectFileType(file);

    if (!fileType) {
      return NextResponse.json(
        { error: "Only PDF and DOCX files are supported." },
        { status: 400 },
      );
    }

    // ── 4. Convert file to buffer ──────────────────────────────────
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ── 5. Parse resume ────────────────────────────────────────────
    let parsed;
    try {
      parsed = await parseResumeFile(buffer, fileType, file.size);
    } catch (parseError) {
      console.error("Resume parse error:", parseError);
      return NextResponse.json(
        { error: parseError.message || "Failed to parse resume. Please try again." },
        { status: 422 },
      );
    }

    // ── 6. Validate parsed data ────────────────────────────────────
    const hasName = parsed?.basicInfo?.fullName?.trim();
    const hasEmail = parsed?.contact?.email?.trim();

    if (!hasName && !hasEmail) {
      return NextResponse.json(
        {
          error:
            "Could not find contact information in the resume. Please check the file and try again.",
        },
        { status: 422 },
      );
    }

    // ── 7. Success response ────────────────────────────────────────
    return NextResponse.json(
      {
        success: true,
        data: parsed,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Unexpected error in portfolio parse-resume route:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Internal server error. Please try again.",
      },
      { status: 500 },
    );
  }
}