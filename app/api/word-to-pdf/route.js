import { NextResponse } from "next/server";
import { convertDocxToPdf } from "@/lib/converters/docxToPdf";
import { saveWordToPdfRecord } from "@/actions/word-to-pdf";

export const maxDuration = 60;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".docx")) {
      return NextResponse.json(
        { error: "Only .docx files are supported" },
        { status: 400 }
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size must be under 10MB" },
        { status: 400 }
      );
    }
    const arrayBuffer = await file.arrayBuffer();
    const docxBuffer = Buffer.from(arrayBuffer);

    console.log(
      `[word-to-pdf route] Received: ${file.name}, size: ${docxBuffer.length} bytes`
    );

    const pdfBuffer = await convertDocxToPdf(docxBuffer, file.name);

    try {
      await saveWordToPdfRecord({
        fileName: file.name.replace(/\.docx$/i, ".pdf"),
        fileSize: docxBuffer.length,
        status: "success",
      });
    } catch (dbError) {
      console.error("[word-to-pdf route] DB save failed:", dbError.message);
    }

    const outputName = file.name.replace(/\.docx$/i, ".pdf");

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${outputName}"`,
        "Content-Length": String(pdfBuffer.length),
      },
    });
  } catch (error) {
    console.error("[word-to-pdf route] Error:", error);
    return NextResponse.json(
      { error: error.message || "Conversion failed" },
      { status: 500 }
    );
  }
}

