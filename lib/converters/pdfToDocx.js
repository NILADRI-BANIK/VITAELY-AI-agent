import ConvertAPI from "convertapi";
import os from "os";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { Document, Paragraph, TextRun, Packer } from "docx";

if (!process.env.CONVERTAPI_SECRET) {
  throw new Error("CONVERTAPI_SECRET is missing.");
}

const convertApi = new ConvertAPI(process.env.CONVERTAPI_SECRET, {
  conversionTimeout: 60,
});

function saveTempFile(buffer, fileName) {
  const tempDir = os.tmpdir();
  const tempPath = path.join(tempDir, `sensai_${Date.now()}_${crypto.randomUUID()}_${fileName}`);
  fs.writeFileSync(tempPath, buffer);
  return tempPath;
}

function deleteTempFile(filePath) {
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (e) {
    console.warn("[pdfToDocx] Could not delete temp file:", filePath);
  }
}

// PRIMARY: ConvertAPI — preserves images, fonts, layout
async function convertWithConvertAPI(pdfBuffer, originalFileName) {
  console.log("[pdfToDocx] Trying ConvertAPI...");
  const tempPath = saveTempFile(pdfBuffer, originalFileName);

  try {
    const result = await convertApi.convert("docx", { File: tempPath }, "pdf");
    const file = result.files[0];
    const response = await fetch(file.url);

    if (!response.ok) {
      throw new Error(`ConvertAPI download failed: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    console.log("[pdfToDocx] ConvertAPI success ✅");
    return Buffer.from(arrayBuffer);
  } finally {
    deleteTempFile(tempPath);
  }
}

// FALLBACK: pdfjs native text extraction → plain DOCX
async function convertWithTextExtraction(pdfBuffer) {
  console.log("[pdfToDocx] Falling back to text extraction...");

  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

  const uint8Array = new Uint8Array(pdfBuffer);
  const loadingTask = pdfjsLib.getDocument({
    data: uint8Array,
    useSystemFonts: true,
    disableFontFace: true,
    isEvalSupported: false,
    useWorkerFetch: false,
    isOffscreenCanvasSupported: false,
    disableWorker: true,
  });

  const pdfDoc = await loadingTask.promise;
  console.log(`[pdfToDocx] Total pages: ${pdfDoc.numPages}`);

  const pages = [];

  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();

    console.log(`[pdfToDocx] Page ${pageNum} items: ${textContent.items.length}`);

    const lines = [];
    let currentLine = [];
    let lastY = null;

    for (const item of textContent.items) {
      if (!item.str) continue;
      const y = item.transform[5];
      if (lastY === null) lastY = y;
      if (Math.abs(y - lastY) > 2) {
        if (currentLine.length > 0) lines.push(currentLine.join(" ").trim());
        currentLine = [];
        lastY = y;
      }
      currentLine.push(item.str);
    }
    if (currentLine.length > 0) lines.push(currentLine.join(" ").trim());

    const pageText = lines.filter(Boolean).join("\n");
    console.log(`[pdfToDocx] Page ${pageNum} text length: ${pageText.length}`);
    pages.push(pageText);
  }

  const totalText = pages.join("").trim();
  console.log(`[pdfToDocx] Total extracted text length: ${totalText.length}`);

  if (!totalText) {
    throw new Error(
      "No text could be extracted. This PDF appears to be scanned or image-based."
    );
  }

  // Build plain DOCX from text
  const allParagraphs = [];
  for (let i = 0; i < pages.length; i++) {
    const lines = pages[i].split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        allParagraphs.push(new Paragraph({}));
      } else {
        allParagraphs.push(
          new Paragraph({
            children: [new TextRun({ text: trimmed, size: 24 })],
          })
        );
      }
    }
    if (i < pages.length - 1) {
      allParagraphs.push(new Paragraph({ pageBreakBefore: true, children: [] }));
    }
  }

  console.log(`[pdfToDocx] Total paragraphs: ${allParagraphs.length}`);

  const doc = new Document({ sections: [{ children: allParagraphs }] });
  const buffer = await Packer.toBuffer(doc);
  console.log(`[pdfToDocx] DOCX size: ${buffer.length} bytes`);
  return buffer;
}

// MAIN EXPORT
export async function convertPdfToDocx(
  pdfBuffer,
  originalFileName = "document.pdf"
) {
  // Try ConvertAPI first (full fidelity)
  try {
    return await convertWithConvertAPI(pdfBuffer, originalFileName);
  } catch (primaryError) {
    console.error("[pdfToDocx] ConvertAPI failed:", primaryError.message);
  }

  // Fall back to text extraction
  try {
    return await convertWithTextExtraction(pdfBuffer);
  } catch (fallbackError) {
    console.error("[pdfToDocx] Text extraction failed:", fallbackError.message);
    throw new Error("All conversion methods failed. Please try again later.");
  }
}