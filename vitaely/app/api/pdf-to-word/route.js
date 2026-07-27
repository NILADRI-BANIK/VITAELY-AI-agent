import { NextResponse } from "next/server";
import { convertPdfToDocx } from "@/lib/converters/pdfToDocx";
import { saveConversionRecord } from "@/actions/pdf-to-word";

export const maxDuration = 60;

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    console.log(
      `[pdf-to-word route] Received: ${file.name}, size: ${pdfBuffer.length} bytes`
    );

    const docxBuffer = await convertPdfToDocx(pdfBuffer, file.name);

    try {
      await saveConversionRecord({
        fileName: file.name.replace(/\.pdf$/i, ".docx"),
        fileSize: pdfBuffer.length,
        status: "success",
      });
    } catch (dbError) {
      console.error("[pdf-to-word route] DB save failed:", dbError.message);
    }

    const outputName = file.name.replace(/\.pdf$/i, ".docx");

    return new NextResponse(docxBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${outputName}"`,
        "Content-Length": String(docxBuffer.length),
      },
    });
  } catch (error) {
    console.error("[pdf-to-word route] Error:", error);
    return NextResponse.json(
      { error: error.message || "Conversion failed" },
      { status: 500 }
    );
  }
}
