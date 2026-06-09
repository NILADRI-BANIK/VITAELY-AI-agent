import { NextResponse } from "next/server";
import { convertDocxToPdf } from "@/lib/converters/docxToPdf";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(req) {
  let userId = null;
  let user = null;
  let fileName = "unknown.docx";
  let fileSize = 0;

  try {
    // 1. Authenticate user
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 },
      );
    }
    userId = clerkUserId;

    // 2. Get user from DB
    user = await db.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found in database." },
        { status: 404 },
      );
    }

    // 3. Parse uploaded file from FormData
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    // 4. Validate file type
    fileName = file.name || "document.docx";
    const isDocx =
      fileName.toLowerCase().endsWith(".docx") ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    if (!isDocx) {
      return NextResponse.json(
        { error: "Only .docx files are supported." },
        { status: 400 },
      );
    }

    // 5. Validate file size
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    fileSize = buffer.length;

    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds the 10MB limit." },
        { status: 400 },
      );
    }

    // 6. Convert DOCX → PDF using CloudConvert
    const pdfBuffer = await convertDocxToPdf(buffer, fileName);

    // 7. Save successful conversion record to DB
    await db.conversionRecord.create({
      data: {
        userId: user.id,
        fileName: fileName.replace(/\.docx$/i, ".pdf"),
        fileSize: fileSize,
        status: "success",
      },
    });

    // 8. Return PDF file to client
    const pdfFileName = fileName.replace(/\.docx$/i, ".pdf");

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${pdfFileName}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Word to PDF conversion error:", error);

    // Save failed conversion record to DB if user is known
    if (user) {
      try {
        await db.conversionRecord.create({
          data: {
            userId: user.id,
            fileName: fileName.replace(/\.docx$/i, ".pdf"),
            fileSize: fileSize,
            status: "failed",
          },
        });
      } catch (dbError) {
        console.error("Failed to log error to DB:", dbError);
      }
    }

    // Handle CloudConvert quota error specifically
    // Handle quota/limit error from any conversion service
    if (
      error.message?.includes("quota") ||
      error.message?.includes("limit") ||
      error.message?.includes("exceeded")
    ) {
      return NextResponse.json(
        {
          error: "Daily conversion limit reached. Please try again tomorrow.",
        },
        { status: 429 },
      );
    }

    return NextResponse.json(
      { error: error.message || "Conversion failed. Please try again." },
      { status: 500 },
    );
  }
}
