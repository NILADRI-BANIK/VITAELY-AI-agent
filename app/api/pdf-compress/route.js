import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { compressPdf } from "@/lib/compress/compressPdf";

// Max file size: 20MB
const MAX_FILE_SIZE = 20 * 1024 * 1024;

export async function POST(req) {
  let user = null;
  let fileName = "unknown.pdf";
  let originalSize = 0;

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
    const targetSizeRaw = formData.get("targetSize");

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded." },
        { status: 400 }
      );
    }

    // 4. Validate file type
    fileName = file.name || "document.pdf";
    if (!fileName.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Only PDF files are supported." },
        { status: 400 }
      );
    }

    // 5. Validate and parse targetSize
    let targetSize = null;
    if (targetSizeRaw && targetSizeRaw.trim() !== "") {
      const parsed = parseInt(targetSizeRaw, 10);
      if (isNaN(parsed) || parsed <= 0) {
        return NextResponse.json(
          { error: "Invalid target size. Must be a positive number in bytes." },
          { status: 400 }
        );
      }
      if (parsed < 10 * 1024) {
        return NextResponse.json(
          { error: "Target size must be at least 10 KB (10240 bytes)." },
          { status: 400 }
        );
      }
      targetSize = parsed;
    }

    // 6. Validate file size
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    originalSize = buffer.length;

    if (originalSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds the 20MB limit." },
        { status: 400 }
      );
    }

    // 7. Validate target vs original
    if (targetSize !== null && targetSize >= originalSize) {
      return NextResponse.json(
        {
          error: `Target size (${targetSize} bytes) must be smaller than the original file size (${originalSize} bytes).`,
        },
        { status: 400 }
      );
    }

    // 8. Compress PDF — pass targetSize if provided
    const { compressedBuffer, achievedTarget } = await compressPdf(
      buffer,
      targetSize
    );

    // 9. Calculate stats
    const compressedSize = compressedBuffer.length;
    const savedBytes = originalSize - compressedSize;
    const savedPercentage =
      originalSize > 0
        ? parseFloat(((savedBytes / originalSize) * 100).toFixed(2))
        : 0;

    // Determine compression level label for DB record
    let compressionLevel = "auto";
    if (targetSize) {
      const reductionNeeded = (savedBytes / originalSize) * 100;
      compressionLevel =
        reductionNeeded >= 60
          ? "high"
          : reductionNeeded >= 35
          ? "medium"
          : "low";
    }

    // 10. Save compression record to DB
    await db.compressionRecord.create({
      data: {
        userId: user.id,
        fileName: fileName,
        originalSize: originalSize,
        compressedSize: compressedSize,
        savedPercentage: savedPercentage,
        compressionLevel: compressionLevel,
        status: "success",
      },
    });

    // 11. Return compressed PDF with full stats in headers
    const outputFileName = fileName.replace(/\.pdf$/i, "_compressed.pdf");

    return new NextResponse(compressedBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${outputFileName}"`,
        "Content-Length": compressedSize.toString(),
        "x-original-size": originalSize.toString(),
        "x-compressed-size": compressedSize.toString(),
        "x-saved-percentage": savedPercentage.toString(),
        "x-compression-level": compressionLevel,
        "x-target-size": targetSize ? targetSize.toString() : "none",
        "x-achieved-target": (
          targetSize === null || compressedSize <= targetSize
        ).toString(),
      },
    });
  } catch (error) {
    console.error("PDF compression error:", error);

    // Save failed record to DB
    if (user) {
      try {
        await db.compressionRecord.create({
          data: {
            userId: user.id,
            fileName: fileName,
            originalSize: originalSize,
            compressedSize: 0,
            savedPercentage: 0,
            compressionLevel: "auto",
            status: "failed",
          },
        });
      } catch (dbError) {
        console.error("Failed to log compression error to DB:", dbError);
      }
    }

    return NextResponse.json(
      {
        error:
          error.message || "PDF compression failed. Please try again.",
      },
      { status: 500 }
    );
  }
}