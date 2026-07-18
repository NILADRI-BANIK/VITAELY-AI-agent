"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import PptxGenJS from "pptxgenjs";
import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";
import { buildCacheSlug } from "./methodology-cache";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const FORMAT_CONFIG = {
  pdf: { ext: "pdf", mime: "application/pdf", label: "PDF" },
  docx: {
    ext: "docx",
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    label: "Word (DOCX)",
  },
  pptx: {
    ext: "pptx",
    mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    label: "PowerPoint (PPTX)",
  },
  json: { ext: "json", mime: "application/json", label: "JSON" },
  md: { ext: "md", mime: "text/markdown", label: "Markdown" },
  bibtex: { ext: "bib", mime: "application/x-bibtex", label: "BibTeX" },
  ris: {
    ext: "ris",
    mime: "application/x-research-info-systems",
    label: "RIS",
  },
};

const ALLOWED_FORMATS = Object.keys(FORMAT_CONFIG);

// ─── Normalization ────────────────────────────────────────────────────────────

function normalizeMethodologyInput(input) {
  if (!input || typeof input !== "object") return null;

  if (
    input.narrative !== undefined ||
    (input.recommendationBundle !== undefined &&
      input.methodology === undefined)
  ) {
    return {
      topic: input.topic ?? "",
      methodologyType: input.methodologyType ?? "",
      objectives: Array.isArray(input.objectives) ? input.objectives : [],
      targetPopulation: input.targetPopulation ?? "",
      constraints: Array.isArray(input.constraints) ? input.constraints : [],
      narrative: input.narrative ?? null,
      recommendationBundle: input.recommendationBundle ?? null,
    };
  }

  if (input.methodology && typeof input.methodology === "object") {
    return {
      topic: input.topic ?? "",
      methodologyType: input.methodologyType ?? "",
      objectives: Array.isArray(input.objectives) ? input.objectives : [],
      targetPopulation: input.targetPopulation ?? "",
      constraints: Array.isArray(input.constraints) ? input.constraints : [],
      narrative: input.methodology,
      recommendationBundle: input.recommendationBundle ?? null,
    };
  }

  if (
    input.recommendation ||
    input.statisticsRecommendation ||
    input.validationRecommendation ||
    input.sampleSizeSuggestion
  ) {
    return {
      topic: input.topic ?? "",
      methodologyType: input.methodologyType ?? "",
      objectives: Array.isArray(input.researchObjectives)
        ? input.researchObjectives
        : Array.isArray(input.objectives)
          ? input.objectives
          : [],
      targetPopulation: input.targetPopulation ?? "",
      constraints: Array.isArray(input.constraints) ? input.constraints : [],
      narrative: null,
      recommendationBundle: input,
    };
  }

  return {
    topic: input.topic ?? "",
    methodologyType: input.methodologyType ?? "",
    objectives: [],
    targetPopulation: input.targetPopulation ?? "",
    constraints: [],
    narrative: null,
    recommendationBundle: input,
  };
}

// ─── Section Collection ───────────────────────────────────────────────────────

function collectSections(normalized) {
  const sections = [];
  const { narrative, recommendationBundle } = normalized;

  if (narrative?.overview)
    sections.push({ title: "Overview", body: narrative.overview });
  if (narrative?.researchDesign)
    sections.push({ title: "Research Design", body: narrative.researchDesign });

  if (
    Array.isArray(narrative?.dataCollection) &&
    narrative.dataCollection.length
  ) {
    sections.push({
      title: "Data Collection",
      list: narrative.dataCollection.map(
        (d) =>
          `${d.method}: ${d.description}${d.tools?.length ? ` (Tools: ${d.tools.join(", ")})` : ""}`,
      ),
    });
  }

  if (Array.isArray(narrative?.dataAnalysis) && narrative.dataAnalysis.length) {
    sections.push({
      title: "Data Analysis",
      list: narrative.dataAnalysis.map(
        (a) => `${a.technique}: ${a.description}`,
      ),
    });
  }

  if (narrative?.sampling?.strategy) {
    sections.push({
      title: "Sampling",
      body: `${narrative.sampling.strategy} — ${narrative.sampling.description ?? ""} (Sample size: ${narrative.sampling.sampleSize ?? "N/A"})`,
    });
  }

  if (Array.isArray(narrative?.validity) && narrative.validity.length) {
    sections.push({
      title: "Validity & Reliability",
      list: narrative.validity.map(
        (v) => `${v.type}: ${(v.measures ?? []).join(", ")}`,
      ),
    });
  }

  if (Array.isArray(narrative?.limitations) && narrative.limitations.length) {
    sections.push({ title: "Limitations", list: narrative.limitations });
  }

  if (
    Array.isArray(narrative?.ethicalConsiderations) &&
    narrative.ethicalConsiderations.length
  ) {
    sections.push({
      title: "Ethical Considerations",
      list: narrative.ethicalConsiderations,
    });
  }

  if (Array.isArray(narrative?.timeline) && narrative.timeline.length) {
    sections.push({
      title: "Timeline",
      list: narrative.timeline.map(
        (t) => `${t.phase} (${t.duration}): ${(t.activities ?? []).join(", ")}`,
      ),
    });
  }

  if (Array.isArray(narrative?.tools) && narrative.tools.length) {
    sections.push({ title: "Recommended Tools", list: narrative.tools });
  }

  const rec = recommendationBundle?.recommendation;
  if (rec) {
    const recLines = [];
    if (rec.researchDesign?.recommendation)
      recLines.push(
        `Research Design: ${rec.researchDesign.recommendation} (Confidence: ${rec.researchDesign.confidence}%) — ${rec.researchDesign.reason}`,
      );
    if (rec.population?.recommendation)
      recLines.push(
        `Population: ${rec.population.recommendation} (Confidence: ${rec.population.confidence}%) — ${rec.population.reason}`,
      );
    if (rec.samplingTechnique?.recommendation)
      recLines.push(
        `Sampling Technique: ${rec.samplingTechnique.recommendation} (Confidence: ${rec.samplingTechnique.confidence}%) — ${rec.samplingTechnique.reason}`,
      );
    if (rec.dataCollection?.recommendation)
      recLines.push(
        `Data Collection: ${rec.dataCollection.recommendation} (Confidence: ${rec.dataCollection.confidence}%) — ${rec.dataCollection.reason}`,
      );
    if (Array.isArray(rec.instruments) && rec.instruments.length)
      recLines.push(
        `Instruments: ${rec.instruments.map((i) => `${i.name} (${i.reason})`).join("; ")}`,
      );
    if (recLines.length)
      sections.push({ title: "AI Methodology Recommendation", list: recLines });

    if (rec.variables) {
      const varLines = [];
      if (rec.variables.independent?.length)
        varLines.push(`Independent: ${rec.variables.independent.join(", ")}`);
      if (rec.variables.dependent?.length)
        varLines.push(`Dependent: ${rec.variables.dependent.join(", ")}`);
      if (rec.variables.moderator?.length)
        varLines.push(`Moderator: ${rec.variables.moderator.join(", ")}`);
      if (rec.variables.mediator?.length)
        varLines.push(`Mediator: ${rec.variables.mediator.join(", ")}`);
      if (rec.variables.control?.length)
        varLines.push(`Control: ${rec.variables.control.join(", ")}`);
      if (varLines.length)
        sections.push({ title: "Variable Mapping", list: varLines });
    }
  }

  const stats = recommendationBundle?.statisticsRecommendation;
  if (stats) {
    const statLines = [];
    if (Array.isArray(stats.recommendedTests))
      statLines.push(
        ...stats.recommendedTests.map(
          (t) => `${t.name} (Confidence: ${t.confidence}%) — ${t.reason}`,
        ),
      );
    if (
      Array.isArray(stats.recommendedModels) &&
      stats.recommendedModels.length
    )
      statLines.push(
        ...stats.recommendedModels.map(
          (m) =>
            `Model: ${m.name} (Confidence: ${m.confidence}%) — ${m.reason}`,
        ),
      );
    if (statLines.length)
      sections.push({
        title: "Statistical Analysis Recommendation",
        list: statLines,
      });
  }

  const validation = recommendationBundle?.validationRecommendation;
  if (validation) {
    const valLines = [];
    if (Array.isArray(validation.recommendedValidation))
      valLines.push(
        ...validation.recommendedValidation.map(
          (v) => `${v.name} (Confidence: ${v.confidence}%) — ${v.reason}`,
        ),
      );
    if (
      Array.isArray(validation.recommendedModelValidation) &&
      validation.recommendedModelValidation.length
    )
      valLines.push(
        ...validation.recommendedModelValidation.map(
          (v) =>
            `Model Validation: ${v.name} (Confidence: ${v.confidence}%) — ${v.reason}`,
        ),
      );
    if (valLines.length)
      sections.push({ title: "Validation Strategy", list: valLines });
  }

  const sampleSize = recommendationBundle?.sampleSizeSuggestion;
  if (sampleSize) {
    sections.push({
      title: "Sample Size Suggestion",
      body: `Recommended sample size: ${sampleSize.recommendedSampleSize ?? sampleSize.sampleSize ?? "N/A"} (Confidence Level: ${sampleSize.confidenceLevel ?? "N/A"}%, Margin of Error: ${sampleSize.marginOfError ?? "N/A"}%)`,
    });
  }

  return sections;
}

function buildPlainTextExport(normalized) {
  return { sections: collectSections(normalized) };
}

// ─── PDF Generator ─────────────────────────────────────────────────────────────

async function generatePdfBuffer(normalized) {
  const { sections } = buildPlainTextExport(normalized);
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 50;
  const maxWidth = pageWidth - margin * 2;
  const fontSize = 11;
  const titleFontSize = 18;
  const headingFontSize = 13;
  const lineHeight = 16;

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  function ensureSpace(needed) {
    if (y - needed < margin) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }
  }

  function wrapText(text, size, useFont) {
    const words = String(text).split(/\s+/);
    const wrapped = [];
    let current = "";
    words.forEach((word) => {
      const test = current ? `${current} ${word}` : word;
      const width = useFont.widthOfTextAtSize(test, size);
      if (width > maxWidth && current) {
        wrapped.push(current);
        current = word;
      } else {
        current = test;
      }
    });
    if (current) wrapped.push(current);
    return wrapped;
  }

  function drawText(text, size, useFont, indent = 0) {
    const wrapped = wrapText(text, size, useFont);
    wrapped.forEach((line) => {
      ensureSpace(lineHeight);
      page.drawText(line, {
        x: margin + indent,
        y,
        size,
        font: useFont,
        color: rgb(0, 0, 0),
      });
      y -= lineHeight;
    });
  }

  ensureSpace(titleFontSize + 10);
  drawText(normalized.topic || "Untitled Methodology", titleFontSize, boldFont);
  y -= 6;
  drawText(
    `Methodology Type: ${normalized.methodologyType || "N/A"}`,
    fontSize,
    font,
  );
  if (normalized.targetPopulation)
    drawText(
      `Target Population: ${normalized.targetPopulation}`,
      fontSize,
      font,
    );
  if (normalized.objectives.length)
    drawText(`Objectives: ${normalized.objectives.join("; ")}`, fontSize, font);
  if (normalized.constraints.length)
    drawText(
      `Constraints: ${normalized.constraints.join(", ")}`,
      fontSize,
      font,
    );
  y -= 10;

  sections.forEach((s) => {
    ensureSpace(headingFontSize + 10);
    drawText(s.title, headingFontSize, boldFont);
    y -= 2;
    if (s.body) drawText(s.body, fontSize, font);
    if (Array.isArray(s.list))
      s.list.forEach((item) => drawText(`• ${item}`, fontSize, font, 10));
    y -= 8;
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

// ─── DOCX Generator ────────────────────────────────────────────────────────────

async function generateDocxBuffer(normalized) {
  const { sections } = buildPlainTextExport(normalized);
  const children = [];

  children.push(
    new Paragraph({
      text: normalized.topic || "Untitled Methodology",
      heading: HeadingLevel.TITLE,
    }),
  );
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: "Methodology Type: ", bold: true }),
        new TextRun(normalized.methodologyType || "N/A"),
      ],
    }),
  );
  if (normalized.targetPopulation) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: "Target Population: ", bold: true }),
          new TextRun(normalized.targetPopulation),
        ],
      }),
    );
  }
  if (normalized.objectives.length) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: "Objectives: ", bold: true }),
          new TextRun(normalized.objectives.join("; ")),
        ],
      }),
    );
  }
  if (normalized.constraints.length) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: "Constraints: ", bold: true }),
          new TextRun(normalized.constraints.join(", ")),
        ],
      }),
    );
  }

  sections.forEach((s) => {
    children.push(
      new Paragraph({ text: s.title, heading: HeadingLevel.HEADING_2 }),
    );
    if (s.body) children.push(new Paragraph({ text: s.body }));
    if (Array.isArray(s.list))
      s.list.forEach((item) =>
        children.push(new Paragraph({ text: item, bullet: { level: 0 } })),
      );
  });

  const doc = new Document({ sections: [{ properties: {}, children }] });
  return await Packer.toBuffer(doc);
}

// ─── PPTX Generator ────────────────────────────────────────────────────────────

async function generatePptxBuffer(normalized) {
  const { sections } = buildPlainTextExport(normalized);
  const pptx = new PptxGenJS();

  const titleSlide = pptx.addSlide();
  titleSlide.addText(normalized.topic || "Untitled Methodology", {
    x: 0.5,
    y: 1.5,
    w: 9,
    h: 1.5,
    fontSize: 28,
    bold: true,
    align: "center",
  });
  titleSlide.addText(normalized.methodologyType || "", {
    x: 0.5,
    y: 3,
    w: 9,
    h: 0.6,
    fontSize: 16,
    align: "center",
    color: "666666",
  });

  const metaLines = [];
  if (normalized.targetPopulation)
    metaLines.push(`Target Population: ${normalized.targetPopulation}`);
  if (normalized.objectives.length)
    metaLines.push(`Objectives: ${normalized.objectives.join("; ")}`);
  if (normalized.constraints.length)
    metaLines.push(`Constraints: ${normalized.constraints.join(", ")}`);

  if (metaLines.length) {
    const metaSlide = pptx.addSlide();
    metaSlide.addText("Study Overview", {
      x: 0.4,
      y: 0.3,
      w: 9.2,
      h: 0.6,
      fontSize: 22,
      bold: true,
    });
    metaSlide.addText(
      metaLines.map((line) => ({
        text: line,
        options: { bullet: true, breakLine: true },
      })),
      { x: 0.4, y: 1.1, w: 9.2, h: 4.5, fontSize: 14, valign: "top" },
    );
  }

  sections.forEach((s) => {
    const slide = pptx.addSlide();
    slide.addText(s.title, {
      x: 0.4,
      y: 0.3,
      w: 9.2,
      h: 0.6,
      fontSize: 22,
      bold: true,
    });
    if (s.body) {
      slide.addText(s.body, {
        x: 0.4,
        y: 1.1,
        w: 9.2,
        h: 4,
        fontSize: 14,
        valign: "top",
      });
    } else if (Array.isArray(s.list)) {
      const bulletText = s.list.map((item) => ({
        text: item,
        options: { bullet: true, breakLine: true },
      }));
      slide.addText(bulletText, {
        x: 0.4,
        y: 1.1,
        w: 9.2,
        h: 4.5,
        fontSize: 13,
        valign: "top",
      });
    }
  });

  const base64 = await pptx.write("base64");
  return Buffer.from(base64, "base64");
}

// ─── JSON / Markdown / BibTeX / RIS Generators ────────────────────────────────

function generateJsonBuffer(normalized) {
  const { sections } = buildPlainTextExport(normalized);
  const payload = {
    topic: normalized.topic,
    methodologyType: normalized.methodologyType,
    objectives: normalized.objectives,
    targetPopulation: normalized.targetPopulation,
    constraints: normalized.constraints,
    narrative: normalized.narrative,
    recommendationBundle: normalized.recommendationBundle,
    sections,
    exportedAt: new Date().toISOString(),
  };
  return Buffer.from(JSON.stringify(payload, null, 2), "utf-8");
}

function generateMarkdownBuffer(normalized) {
  const { sections } = buildPlainTextExport(normalized);
  const md = [];

  md.push(`# ${normalized.topic || "Untitled Methodology"}`);
  md.push("");
  md.push(`**Methodology Type:** ${normalized.methodologyType || "N/A"}`);
  if (normalized.targetPopulation)
    md.push(`**Target Population:** ${normalized.targetPopulation}`);
  if (normalized.objectives.length)
    md.push(`**Objectives:** ${normalized.objectives.join("; ")}`);
  if (normalized.constraints.length)
    md.push(`**Constraints:** ${normalized.constraints.join(", ")}`);
  md.push("");

  sections.forEach((s) => {
    md.push(`## ${s.title}`);
    md.push("");
    if (s.body) {
      md.push(s.body);
      md.push("");
    }
    if (Array.isArray(s.list)) {
      s.list.forEach((item) => md.push(`- ${item}`));
      md.push("");
    }
  });

  return Buffer.from(md.join("\n"), "utf-8");
}

function generateBibtexBuffer(normalized) {
  const year = new Date().getFullYear();
  const slug = buildCacheSlug(normalized.topic || "methodology");
  const bib = [
    `@misc{${slug}_${year},`,
    `  title = {${normalized.topic || "Untitled Methodology"}},`,
    `  author = {SensAI Research Hub},`,
    `  year = {${year}},`,
    `  howpublished = {SensAI Methodology Builder},`,
    `  note = {Research methodology type: ${normalized.methodologyType || "N/A"}${normalized.targetPopulation ? `; Target population: ${normalized.targetPopulation}` : ""}},`,
    `}`,
  ].join("\n");
  return Buffer.from(bib, "utf-8");
}

function generateRisBuffer(normalized) {
  const year = new Date().getFullYear();
  const lines = [
    "TY  - GEN",
    `TI  - ${normalized.topic || "Untitled Methodology"}`,
    `PY  - ${year}`,
    "AU  - SensAI Research Hub",
    `KW  - ${normalized.methodologyType || "N/A"}`,
  ];
  if (normalized.targetPopulation)
    lines.push(`N1  - Target Population: ${normalized.targetPopulation}`);
  if (normalized.objectives.length)
    lines.push(`N1  - Objectives: ${normalized.objectives.join("; ")}`);
  if (normalized.constraints.length)
    lines.push(`N1  - Constraints: ${normalized.constraints.join(", ")}`);
  lines.push("ER  - ");
  return Buffer.from(lines.join("\n"), "utf-8");
}

// ─── Buffer Dispatcher ─────────────────────────────────────────────────────────

async function generateBuffer(normalized, format) {
  switch (format) {
    case "pdf":
      return generatePdfBuffer(normalized);
    case "docx":
      return generateDocxBuffer(normalized);
    case "pptx":
      return generatePptxBuffer(normalized);
    case "json":
      return generateJsonBuffer(normalized);
    case "md":
      return generateMarkdownBuffer(normalized);
    case "bibtex":
      return generateBibtexBuffer(normalized);
    case "ris":
      return generateRisBuffer(normalized);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

// ─── Cloudinary Upload ──────────────────────────────────────────────────────────

function uploadBufferToCloudinary(
  buffer,
  { fileName, folder = "sensai/methodology-exports" },
) {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    return Promise.reject(new Error("Cloudinary is not configured"));
  }

  const MAX_BUFFER_BYTES = 20 * 1024 * 1024; // 20MB
  if (buffer.length > MAX_BUFFER_BYTES) {
    return Promise.reject(
      new Error("Generated file exceeds maximum allowed size (20MB)"),
    );
  }

  const publicId = `${fileName}_${crypto.randomUUID()}`;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("Cloudinary upload timed out")),
      30000,
    );
const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder,
        public_id: publicId,
        overwrite: false,
        type: "upload",
        access_mode: "public",
      },
      (error, result) => {
        clearTimeout(timer);
        if (error) return reject(error);
        if (!result?.secure_url || !result?.public_id) {
          return reject(new Error("Cloudinary upload returned incomplete result"));
        }
        resolve(result);
      },
    );
    stream.end(buffer);
  });
}

function buildFileName(normalized, format) {
  const slug = buildCacheSlug(normalized.topic || "methodology");
  const typeSlug = buildCacheSlug(normalized.methodologyType || "methodology");
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const ext = FORMAT_CONFIG[format].ext;
  return `${slug}_${typeSlug}_${dateStr}.${ext}`;
}

// ─── Resolve Source Record ──────────────────────────────────────────────────────

async function resolveMethodologySource({
  methodologyId,
  methodologyData,
  userId,
}) {
  if (methodologyId) {
    const record = await db.savedMethodology.findUnique({
      where: { id: methodologyId },
    });
    if (!record) return { error: "Methodology not found" };
    if (record.userId !== userId) return { error: "Forbidden" };

    const source = methodologyData ?? record.methodologyData;
    const normalized = normalizeMethodologyInput(source);
    if (!normalized || !normalized.topic?.trim())
      return { error: "Invalid methodology data" };

    return { resolvedId: record.id, normalized };
  }

  if (!methodologyData) {
    return { error: "Either methodologyId or methodologyData is required" };
  }

  const normalized = normalizeMethodologyInput(methodologyData);
  if (!normalized || !normalized.topic?.trim()) {
    return { error: "Invalid methodology data" };
  }

  try {
    const created = await db.savedMethodology.create({
      data: {
        userId,
        topic: normalized.topic.trim(),
        methodologyType: normalized.methodologyType || "unspecified",
        status: "draft",
        version: 1,
        methodologyData,
      },
    });
    return { resolvedId: created.id, normalized };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to auto-save methodology",
    };
  }
}

async function generateAndUploadFormat({
  normalized,
  format,
  resolvedId,
  userId,
  reuseCache = true,
}) {
  if (!ALLOWED_FORMATS.includes(format)) {
    return { success: false, format, error: `Invalid format: ${format}` };
  }
  if (!normalized || !normalized.topic?.trim()) {
    return {
      success: false,
      format,
      error: "Malformed methodology data: missing topic",
    };
  }
  if (!normalized.narrative && !normalized.recommendationBundle) {
    return {
      success: false,
      format,
      error: "Malformed methodology data: no content to export",
    };
  }

  if (reuseCache && resolvedId) {
    try {
      const existing = await db.methodologyExport.findFirst({
        where: { methodologyId: resolvedId, format, userId },
        orderBy: { exportedAt: "desc" },
      });
      if (existing?.url && existing?.publicId) {
        return {
          success: true,
          format,
          url: existing.url,
          publicId: existing.publicId,
          mime: FORMAT_CONFIG[format].mime,
          fileName: null,
          bytes: null,
          exportedAt: existing.exportedAt.toISOString(),
          fromCache: true,
        };
      }
    } catch {
      // fall through to regenerate
    }
  }

let uploadResult = null;
  try {
    const buffer = await generateBuffer(normalized, format);
    if (!buffer || buffer.length === 0) {
      throw new Error("Generated export file is empty");
    }
    const fileName = buildFileName(normalized, format);
    uploadResult = await uploadBufferToCloudinary(buffer, { fileName });

    const downloadUrl = cloudinary.url(uploadResult.public_id, {
      resource_type: "raw",
      type: "upload",
      flags: "attachment",
      secure: true,
    });

    try {
      await db.methodologyExport.create({
        data: {
          userId,
          methodologyId: resolvedId,
          format,
          publicId: uploadResult.public_id,
          url: downloadUrl,
        },
      });
    } catch (dbError) {
      await cloudinary.uploader
        .destroy(uploadResult.public_id, { resource_type: "raw" })
        .catch(() => {});
      throw dbError;
    }

    return {
      success: true,
      format,
      url: downloadUrl,
      publicId: uploadResult.public_id,
      mime: FORMAT_CONFIG[format].mime,
      fileName,
      bytes: uploadResult.bytes,
      exportedAt: new Date().toISOString(),
      fromCache: false,
    };
  } catch (error) {
    if (uploadResult?.public_id) {
      await cloudinary.uploader
        .destroy(uploadResult.public_id, { resource_type: "raw" })
        .catch(() => {});
    }
    return {
      success: false,
      format,
      error:
        error instanceof Error ? error.message : `Failed to export ${format}`,
    };
  }
}

// ─── Public Exports ─────────────────────────────────────────────────────────────

export async function exportMethodology({
  methodologyId = null,
  methodologyData = null,
  format,
  reuseCache = true,
}) {
  if (!format) return { success: false, error: "format is required" };
  if (!ALLOWED_FORMATS.includes(format))
    return { success: false, error: `Invalid format: ${format}` };

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await db.user.findUnique({ where: { clerkUserId } });
  if (!dbUser) return { success: false, error: "User not found" };
  const userId = dbUser.id;

  const resolved = await resolveMethodologySource({
    methodologyId,
    methodologyData,
    userId,
  });
  if (resolved.error) return { success: false, error: resolved.error };

  const result = await generateAndUploadFormat({
    normalized: resolved.normalized,
    format,
    resolvedId: resolved.resolvedId,
    userId,
    reuseCache,
  });

  if (!result.success) return { success: false, error: result.error };

  return {
    success: true,
    data: {
      methodologyId: resolved.resolvedId,
      format: result.format,
      url: result.url,
      publicId: result.publicId,
      mime: result.mime,
      fileName: result.fileName,
      bytes: result.bytes,
      exportedAt: result.exportedAt,
      fromCache: result.fromCache,
    },
  };
}

export async function exportMethodologyMultiple({
  methodologyId = null,
  methodologyData = null,
  formats = [],
  reuseCache = true,
}) {
  if (!Array.isArray(formats) || formats.length === 0)
    return { success: false, error: "formats must be a non-empty array" };

  const uniqueFormats = [...new Set(formats)];
  const invalidFormats = uniqueFormats.filter(
    (f) => !ALLOWED_FORMATS.includes(f),
  );
  if (invalidFormats.length > 0)
    return {
      success: false,
      error: `Invalid formats: ${invalidFormats.join(", ")}`,
    };

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await db.user.findUnique({ where: { clerkUserId } });
  if (!dbUser) return { success: false, error: "User not found" };
  const userId = dbUser.id;

  const resolved = await resolveMethodologySource({
    methodologyId,
    methodologyData,
    userId,
  });
  if (resolved.error) return { success: false, error: resolved.error };

  const results = await Promise.all(
    uniqueFormats.map((format) =>
      generateAndUploadFormat({
        normalized: resolved.normalized,
        format,
        resolvedId: resolved.resolvedId,
        userId,
        reuseCache,
      }),
    ),
  );

  return {
    success: true,
    data: {
      methodologyId: resolved.resolvedId,
      results,
    },
  };
}

export async function getSupportedExportFormats() {
  return {
    success: true,
    data: ALLOWED_FORMATS.map((id) => ({
      id,
      label: FORMAT_CONFIG[id].label,
      mime: FORMAT_CONFIG[id].mime,
      ext: FORMAT_CONFIG[id].ext,
    })),
  };
}

export async function getMethodologyExportHistory(
  methodologyId,
  { take = 20, skip = 0 } = {},
) {
  if (!methodologyId)
    return { success: false, error: "methodologyId is required" };

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await db.user.findUnique({ where: { clerkUserId } });
  if (!dbUser) return { success: false, error: "User not found" };
  const userId = dbUser.id;

  const safeTake = Math.min(Math.max(Number(take) || 20, 1), 100);
  const safeSkip = Math.max(Number(skip) || 0, 0);

  try {
    const record = await db.savedMethodology.findUnique({
      where: { id: methodologyId },
    });
    if (!record) return { success: false, error: "Methodology not found" };
    if (record.userId !== userId) return { success: false, error: "Forbidden" };

    const [exports, total] = await Promise.all([
      db.methodologyExport.findMany({
        where: { methodologyId },
        orderBy: { exportedAt: "desc" },
        take: safeTake,
        skip: safeSkip,
      }),
      db.methodologyExport.count({ where: { methodologyId } }),
    ]);

    return {
      success: true,
      data: exports,
      pagination: { take: safeTake, skip: safeSkip, total },
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch export history",
    };
  }
}

export async function deleteMethodologyExport(exportId) {
  if (!exportId) return { success: false, error: "exportId is required" };

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await db.user.findUnique({ where: { clerkUserId } });
  if (!dbUser) return { success: false, error: "User not found" };
  const userId = dbUser.id;

  try {
    const record = await db.methodologyExport.findUnique({ where: { id: exportId } });
    if (!record) return { success: false, error: "Export not found" };
    if (record.userId !== userId) return { success: false, error: "Forbidden" };

    if (record.publicId) {
      await cloudinary.uploader
        .destroy(record.publicId, { resource_type: "raw" })
        .catch(() => {});
    }

    await db.methodologyExport.delete({ where: { id: exportId } });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete export",
    };
  }
}

export async function downloadMethodologyExport(exportId) {
  if (!exportId) return { success: false, error: "exportId is required" };

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await db.user.findUnique({ where: { clerkUserId } });
  if (!dbUser) return { success: false, error: "User not found" };
  const userId = dbUser.id;

  try {
    const record = await db.methodologyExport.findUnique({ where: { id: exportId } });
    if (!record) return { success: false, error: "Export not found" };
    if (record.userId !== userId) return { success: false, error: "Forbidden" };
    if (!record.url) return { success: false, error: "No download URL available for this export" };

    return {
      success: true,
      data: { url: record.url, format: record.format, exportedAt: record.exportedAt },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch download URL",
    };
  }
}

export async function getExportStatistics() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized" };
  const dbUser = await db.user.findUnique({ where: { clerkUserId } });
  if (!dbUser) return { success: false, error: "User not found" };
  const userId = dbUser.id;

  try {
    const grouped = await db.methodologyExport.groupBy({
      by: ["format"],
      where: { userId },
      _count: { format: true },
    });

    const stats = {};
    ALLOWED_FORMATS.forEach((f) => {
      stats[f] = 0;
    });
    grouped.forEach((g) => {
      stats[g.format] = g._count.format;
    });

    const total = Object.values(stats).reduce((sum, n) => sum + n, 0);

    return { success: true, data: { byFormat: stats, total } };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch export statistics",
    };
  }
}