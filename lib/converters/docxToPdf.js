import ConvertAPI from "convertapi";
import os from "os";
import path from "path";
import fs from "fs";
import crypto from "crypto";

// Initialize APIs
const convertApi = new ConvertAPI(process.env.CONVERTAPI_SECRET, {
  conversionTimeout: 60,
});
const PDFCO_API_KEY = process.env.PDFCO_API_KEY;

// ─────────────────────────────────────────
// Helper: Save buffer to temp file
// ─────────────────────────────────────────
function saveTempFile(buffer, fileName) {
  const tempDir = os.tmpdir();
  const tempPath = path.join(tempDir, `sensai_${Date.now()}_${crypto.randomUUID()}_${fileName}`);
  fs.writeFileSync(tempPath, buffer);
  return tempPath;
}

// ─────────────────────────────────────────
// Helper: Delete temp file safely
// ─────────────────────────────────────────
function deleteTempFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (e) {
    console.warn("Could not delete temp file:", filePath);
  }
}

// ─────────────────────────────────────────
// PRIMARY: ConvertAPI
// ─────────────────────────────────────────
async function convertWithConvertAPI(inputBuffer, originalFileName) {
  console.log("Trying ConvertAPI...");

  const tempFilePath = saveTempFile(inputBuffer, originalFileName);

  try {
    // ConvertAPI SDK requires a real file path on disk
    const result = await convertApi.convert("pdf", {
      File: tempFilePath,
    }, "docx");

    const file = result.files[0];
    const response = await fetch(file.url);

    if (!response.ok) {
      throw new Error(`ConvertAPI download failed: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    console.log("ConvertAPI success ✅");
    return Buffer.from(arrayBuffer);

  } finally {
    // Always clean up temp file
    deleteTempFile(tempFilePath);
  }
}

// ─────────────────────────────────────────
// FALLBACK: PDF.co
// ─────────────────────────────────────────
async function convertWithPdfCo(inputBuffer, originalFileName) {
  console.log("ConvertAPI failed. Trying PDF.co fallback...");

  const base64Content = inputBuffer.toString("base64");

  // Step 1: Upload file to PDF.co
  const uploadResponse = await fetch(
    "https://api.pdf.co/v1/file/upload/base64",
    {
      method: "POST",
      headers: {
        "x-api-key": PDFCO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: originalFileName,
        file: base64Content,
      }),
    }
  );

  const uploadData = await uploadResponse.json();

  if (!uploadResponse.ok || uploadData.error) {
    throw new Error(
      `PDF.co upload failed: ${uploadData.message || JSON.stringify(uploadData)}`
    );
  }

  const uploadedFileUrl = uploadData.url;

  // Step 2: Convert DOCX to PDF using correct PDF.co endpoint
  const convertResponse = await fetch(
    "https://api.pdf.co/v1/pdf/convert/from/doc",
    {
      method: "POST",
      headers: {
        "x-api-key": PDFCO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: uploadedFileUrl,
        name: originalFileName.replace(/\.docx$/i, ".pdf"),
        async: false,
      }),
    }
  );

  const convertData = await convertResponse.json();

  if (!convertResponse.ok || convertData.error) {
    throw new Error(
      `PDF.co conversion failed: ${convertData.message || JSON.stringify(convertData)}`
    );
  }

  // Step 3: Download the converted PDF
  const pdfResponse = await fetch(convertData.url);

  if (!pdfResponse.ok) {
    throw new Error(`PDF.co download failed: ${pdfResponse.statusText}`);
  }

  const arrayBuffer = await pdfResponse.arrayBuffer();
  console.log("PDF.co fallback success ✅");
  return Buffer.from(arrayBuffer);
}

// ─────────────────────────────────────────
// MAIN EXPORT: Try Primary → Fallback
// ─────────────────────────────────────────
export async function convertDocxToPdf(
  inputBuffer,
  originalFileName = "document.docx"
) {
  // Try ConvertAPI first (primary)
  try {
    return await convertWithConvertAPI(inputBuffer, originalFileName);
  } catch (primaryError) {
    console.error("ConvertAPI failed:", primaryError.message);
  }

  // Try PDF.co second (fallback)
  try {
    return await convertWithPdfCo(inputBuffer, originalFileName);
  } catch (fallbackError) {
    console.error("PDF.co fallback also failed:", fallbackError.message);
    throw new Error(
      "All conversion services failed. Please try again later."
    );
  }
}

