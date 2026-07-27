import { PDFDocument } from "pdf-lib";
import sharp from "sharp";

// ── Quality steps for iterative compression ───────────────────────────
// Each pass tries a lower quality until target size is reached
const QUALITY_STEPS = [75, 60, 45, 30, 20, 10];
const SCALE_STEPS   = [1.0, 0.9, 0.8, 0.7, 0.6, 0.5];

/**
 * Compress a single image buffer using sharp
 * @param {Buffer} imgBuffer  - Raw image bytes
 * @param {number} quality    - JPEG quality 1-100
 * @param {number} scale      - Resize scale 0-1
 * @returns {Promise<Buffer>} - Smaller buffer (or original if compression failed)
 */
async function compressImage(imgBuffer, quality, scale) {
  try {
    let pipeline = sharp(imgBuffer);

    if (scale < 1.0) {
      const meta = await pipeline.metadata();
      if (meta.width && meta.height) {
        const newWidth = Math.max(80, Math.round(meta.width * scale));
        pipeline = pipeline.resize(newWidth, null, {
          fit: "inside",
          withoutEnlargement: true,
        });
      }
    }

    const compressed = await pipeline
      .jpeg({ quality, progressive: true, mozjpeg: true })
      .toBuffer();

    return compressed.length < imgBuffer.length ? compressed : imgBuffer;
  } catch {
    return imgBuffer;
  }
}

/**
 * Run one full compression pass on a PDF buffer
 * @param {Buffer} inputBuffer - PDF bytes
 * @param {number} quality     - JPEG quality for images
 * @param {number} scale       - Image resize scale
 * @returns {Promise<Buffer>}  - Compressed PDF bytes
 */
async function runCompressionPass(inputBuffer, quality, scale) {
  try {
    const pdfDoc = await PDFDocument.load(inputBuffer, {
      ignoreEncryption: true,
    });

    // ── Walk every indirect object and compress raw image streams ──
    const { context } = pdfDoc;

    for (const [, obj] of context.enumerateIndirectObjects()) {
      try {
        if (
          obj &&
          obj.constructor &&
          obj.constructor.name === "PDFRawStream" &&
          obj.contents &&
          obj.contents.length > 8 * 1024   // only bother with images >8 KB
        ) {
          const imgBuf    = Buffer.from(obj.contents);
          const compressed = await compressImage(imgBuf, quality, scale);

          if (compressed.length < imgBuf.length) {
            // Replace stream contents in-place
            obj.contents = new Uint8Array(compressed);
          }
        }
      } catch {
        continue;
      }
    }

    // ── Rebuild PDF with object streams (removes unused objects) ──
    const saved = await pdfDoc.save({ useObjectStreams: true });
    return Buffer.from(saved);
  } catch (err) {
    console.warn("Compression pass failed:", err.message);
    return inputBuffer;
  }
}

/**
 * Copy all pages into a fresh PDFDocument to strip dead objects
 * @param {Buffer} inputBuffer
 * @returns {Promise<Buffer>}
 */
async function stripDeadObjects(inputBuffer) {
  try {
    const src    = await PDFDocument.load(inputBuffer, { ignoreEncryption: true });
    const fresh  = await PDFDocument.create();
    const count  = src.getPageCount();
    const pages  = await fresh.copyPages(src, Array.from({ length: count }, (_, i) => i));
    pages.forEach((p) => fresh.addPage(p));
    const saved  = await fresh.save({ useObjectStreams: true });
    const result = Buffer.from(saved);
    return result.length < inputBuffer.length ? result : inputBuffer;
  } catch {
    return inputBuffer;
  }
}

/**
 * Main export — compress a PDF to a target size using iterative passes
 *
 * @param {Buffer}      inputBuffer  - Original PDF bytes
 * @param {number|null} targetSize   - Desired output size in bytes (null = max compression)
 * @returns {Promise<{ compressedBuffer: Buffer, achievedTarget: boolean }>}
 */
export async function compressPdf(inputBuffer, targetSize = null) {
  try {
    console.log(
      `compressPdf: input=${inputBuffer.length} bytes, target=${targetSize ?? "max"}`
    );

    // ── Pass 0: strip dead objects first (cheap win) ───────────────
    let current = await stripDeadObjects(inputBuffer);
    console.log(`After strip: ${current.length} bytes`);

    // Already at or below target after stripping?
    if (targetSize !== null && current.length <= targetSize) {
      return { compressedBuffer: current, achievedTarget: true };
    }

    // ── Iterative passes ───────────────────────────────────────────
    const maxPasses = QUALITY_STEPS.length;

    for (let i = 0; i < maxPasses; i++) {
      const quality = QUALITY_STEPS[i];
      const scale   = SCALE_STEPS[i];

      console.log(`Pass ${i + 1}/${maxPasses}: quality=${quality}, scale=${scale}`);

      const attempt = await runCompressionPass(current, quality, scale);

      // Accept result only if it's actually smaller
      if (attempt.length < current.length) {
        current = attempt;
        console.log(`  → ${current.length} bytes`);
      } else {
        console.log(`  → No improvement at this quality`);
      }

      // Stop early if target reached
      if (targetSize !== null && current.length <= targetSize) {
        console.log(`Target reached at pass ${i + 1}`);
        return { compressedBuffer: current, achievedTarget: true };
      }

      // If no targetSize, run all passes for maximum compression
    }

    // ── Final strip after all passes ───────────────────────────────
    const final = await stripDeadObjects(current);
    if (final.length < current.length) {
      current = final;
      console.log(`Final strip: ${current.length} bytes`);
    }

    // ── If still larger than original, return original ─────────────
    if (current.length >= inputBuffer.length) {
      console.log("PDF already optimized — returning original");
      return {
        compressedBuffer: inputBuffer,
        achievedTarget: targetSize === null,
      };
    }

    const achieved =
      targetSize === null ? true : current.length <= targetSize;

    console.log(
      `Done: ${inputBuffer.length} → ${current.length} bytes | achieved=${achieved}`
    );

    return { compressedBuffer: current, achievedTarget: achieved };
  } catch (error) {
    console.error("compressPdf error:", error);
    throw new Error(
      error.message ||
        "Failed to compress PDF. The file may be corrupted or encrypted."
    );
  }
}