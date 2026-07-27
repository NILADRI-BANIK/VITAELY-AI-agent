"use client";

import { useState } from "react";
import {
  Download,
  FileJson,
  FileText,
  FileSpreadsheet,
  ChevronDown,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

function sanitizeFileName(name) {
  return (name || "research-gaps")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

function downloadBlob(content, fileName, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function getGapTitle(gap) {
  return gap.gap ?? gap.title ?? gap.gapTitle ?? "Untitled Gap";
}

function csvEscape(value) {
  const str = String(value ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildCsv(gaps) {
  const header =
    "Title,Type,Difficulty,Impact Score,Confidence,Total Papers,Domain,Keywords\n";
  const rows = gaps
    .map((gap) =>
      [
        csvEscape(getGapTitle(gap)),
        csvEscape(gap.type ?? "gap"),
        csvEscape(gap.difficulty ?? "medium"),
        csvEscape(gap.impactScore ?? 0),
        csvEscape(gap.confidence ?? ""),
        csvEscape(gap.totalPaperCount ?? 0),
        csvEscape(gap.domain ?? ""),
        csvEscape((gap.keywords ?? []).join("; ")),
      ].join(",")
    )
    .join("\n");
  return header + rows;
}

function buildJson(gaps) {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      count: gaps.length,
      gaps,
    },
    null,
    2
  );
}

function buildMarkdown(gaps, title) {
  const header = `# ${title || "Research Gaps"}\n\nExported: ${new Date().toLocaleString()}\n\n---\n\n`;
  const body = gaps
    .map((gap, i) => {
      const lines = [
        `## ${i + 1}. ${getGapTitle(gap)}`,
        "",
        `- **Type:** ${gap.type ?? "gap"}`,
        `- **Difficulty:** ${gap.difficulty ?? "medium"}`,
        `- **Impact Score:** ${gap.impactScore ?? 0}/10`,
        gap.confidence != null ? `- **Confidence:** ${gap.confidence}%` : null,
        `- **Total Papers:** ${gap.totalPaperCount ?? 0}`,
        gap.domain ? `- **Domain:** ${gap.domain}` : null,
        "",
        gap.description ? `${gap.description}` : null,
        "",
        gap.opportunity ? `**Opportunity:** ${gap.opportunity}` : null,
        "",
        (gap.keywords ?? []).length > 0
          ? `**Keywords:** ${gap.keywords.join(", ")}`
          : null,
        "",
        "---",
        "",
      ].filter((l) => l !== null);
      return lines.join("\n");
    })
    .join("\n");
  return header + body;
}

function buildPrintHtml(gaps, title) {
  const rows = gaps
    .map(
      (gap, i) => `
      <div style="margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid #ddd;">
        <h3>${i + 1}. ${getGapTitle(gap)}</h3>
        <p><strong>Type:</strong> ${gap.type ?? "gap"} &nbsp; <strong>Difficulty:</strong> ${gap.difficulty ?? "medium"} &nbsp; <strong>Impact:</strong> ${gap.impactScore ?? 0}/10</p>
        ${gap.description ? `<p>${gap.description}</p>` : ""}
        ${gap.opportunity ? `<p><strong>Opportunity:</strong> ${gap.opportunity}</p>` : ""}
        ${(gap.keywords ?? []).length > 0 ? `<p><strong>Keywords:</strong> ${gap.keywords.join(", ")}</p>` : ""}
      </div>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>${title || "Research Gaps"}</title>
<style>
  body { font-family: Arial, sans-serif; padding: 32px; color: #111; }
  h1 { font-size: 20px; margin-bottom: 4px; }
  h3 { font-size: 15px; margin-bottom: 6px; }
  p { font-size: 13px; line-height: 1.5; margin: 4px 0; }
</style>
</head>
<body>
  <h1>${title || "Research Gaps"}</h1>
  <p style="color:#666;">Exported: ${new Date().toLocaleString()}</p>
  <hr />
  ${rows}
</body>
</html>`;
}

export function GapExportMenu({ gaps = [], topicName = "" }) {
  const [exporting, setExporting] = useState(null);

  const baseName = sanitizeFileName(topicName);
  const hasGaps = Array.isArray(gaps) && gaps.length > 0;

  function handleExport(type) {
    if (!hasGaps) return;
    setExporting(type);
    try {
      if (type === "csv") {
        downloadBlob(buildCsv(gaps), `${baseName}-gaps.csv`, "text/csv");
      } else if (type === "json") {
        downloadBlob(
          buildJson(gaps),
          `${baseName}-gaps.json`,
          "application/json"
        );
      } else if (type === "markdown") {
        downloadBlob(
          buildMarkdown(gaps, topicName),
          `${baseName}-gaps.md`,
          "text/markdown"
        );
      } else if (type === "pdf") {
        const html = buildPrintHtml(gaps, topicName);
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.open();
          printWindow.document.write(html);
          printWindow.document.close();
          printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
          };
        }
      }
    } finally {
      setExporting(null);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={!hasGaps}>
          <Download className="h-4 w-4 mr-1.5" />
          Export
          <ChevronDown className="h-3.5 w-3.5 ml-1.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onClick={() => handleExport("pdf")} disabled={!!exporting}>
          <Printer className="h-4 w-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("markdown")} disabled={!!exporting}>
          <FileText className="h-4 w-4 mr-2" />
          Export as Markdown
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport("csv")} disabled={!!exporting}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("json")} disabled={!!exporting}>
          <FileJson className="h-4 w-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}