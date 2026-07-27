"use client";

import { useState } from "react";
import {
  Download,
  FileDown,
  FileText,
  Quote,
  ListChecks,
  FileJson,
  ChevronDown,
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
  return (name || "workspace")
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

function bibtexKey(paper, index) {
  const firstAuthor = Array.isArray(paper.authors) && paper.authors.length > 0
    ? paper.authors[0].split(" ").pop()
    : "unknown";
  const year = paper.year ?? "n.d";
  return `${firstAuthor}${year}_${index}`.replace(/[^a-zA-Z0-9_]/g, "");
}

function escapeBibtex(str) {
  return String(str ?? "").replace(/[{}]/g, "");
}

function buildBibtex(papers) {
  if (!papers || papers.length === 0) return "";
  return papers
    .map((paper, i) => {
      const key = bibtexKey(paper, i);
      const authors = Array.isArray(paper.authors) ? paper.authors.join(" and ") : "";
      const lines = [
        `@article{${key},`,
        `  title = {${escapeBibtex(paper.title)}},`,
        authors ? `  author = {${escapeBibtex(authors)}},` : null,
        paper.journal ? `  journal = {${escapeBibtex(paper.journal)}},` : null,
        paper.year ? `  year = {${paper.year}},` : null,
        paper.doi ? `  doi = {${paper.doi}},` : null,
        paper.url ? `  url = {${paper.url}},` : null,
        `}`,
      ].filter(Boolean);
      return lines.join("\n");
    })
    .join("\n\n");
}

function buildRis(papers) {
  if (!papers || papers.length === 0) return "";
  return papers
    .map((paper) => {
      const authors = Array.isArray(paper.authors)
        ? paper.authors.map((a) => `AU  - ${a}`).join("\n")
        : "";
      const lines = [
        "TY  - JOUR",
        `TI  - ${paper.title ?? ""}`,
        authors,
        paper.journal ? `JO  - ${paper.journal}` : null,
        paper.year ? `PY  - ${paper.year}` : null,
        paper.doi ? `DO  - ${paper.doi}` : null,
        paper.url ? `UR  - ${paper.url}` : null,
        "ER  - ",
      ].filter(Boolean);
      return lines.join("\n");
    })
    .join("\n\n");
}

function buildNotesText(notes, topicName) {
  const header = `Research Notes: ${topicName ?? "Untitled Topic"}\nExported: ${new Date().toLocaleString()}\n${"=".repeat(50)}\n\n`;
  if (!notes || notes.length === 0) return header + "No notes recorded.";
  return (
    header +
    notes
      .map((note, i) => {
        const date = note.updatedAt ? new Date(note.updatedAt).toLocaleString() : "";
        return `[${i + 1}] ${date}\n${note.content}\n`;
      })
      .join("\n" + "-".repeat(30) + "\n\n")
  );
}

function csvEscape(value) {
  const str = String(value ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildReadingListCsv(readingList) {
  const header = "Title,Collection,Paper ID,Added At\n";
  if (!readingList || readingList.length === 0) return header;
  const rows = readingList
    .map((item) =>
      [
        csvEscape(item.title),
        csvEscape(item.collection),
        csvEscape(item.paperId),
        csvEscape(item.createdAt ? new Date(item.createdAt).toISOString() : ""),
      ].join(","),
    )
    .join("\n");
  return header + rows;
}

function buildGapsCsv(gaps) {
  const header = "Title,Difficulty,Score,Total Papers,Domain,Keywords\n";
  if (!gaps || gaps.length === 0) return header;
  const rows = gaps
    .map((gap) =>
      [
        csvEscape(gap.gapTitle),
        csvEscape(gap.difficulty),
        csvEscape(gap.score ?? 0),
        csvEscape(gap.totalPaperCount ?? 0),
        csvEscape(gap.domain ?? ""),
        csvEscape((gap.keywords ?? []).join("; ")),
      ].join(","),
    )
    .join("\n");
  return header + rows;
}

function buildWorkspaceJson({ topicName, papers, notes, readingList, session, gaps }) {
  return JSON.stringify(
    {
      topicName: topicName ?? null,
      exportedAt: new Date().toISOString(),
      papers: papers ?? [],
      notes: notes ?? [],
      readingList: readingList ?? [],
      researchGaps: gaps ?? [],
      progress: {
        openedPapers: session?.openedPapers ?? [],
        viewedVideos: session?.viewedVideos ?? [],
        methodologyDone: !!session?.methodologyDone,
        gapAnalysisDone: !!session?.gapAnalysisDone,
        roadmapDone: !!session?.roadmapDone,
      },
    },
    null,
    2,
  );
}

export default function ExportMenu({
  topicName,
  papers = [],
  notes = [],
  readingList = [],
  gaps = [],
  session = null,
}) {
  const [exporting, setExporting] = useState(null);

  const baseName = sanitizeFileName(topicName);

  const handleExport = (type) => {
    setExporting(type);
    try {
      if (type === "bibtex") {
        const content = buildBibtex(papers);
        downloadBlob(
          content || "% No papers available to export",
          `${baseName}-citations.bib`,
          "application/x-bibtex",
        );
      } else if (type === "ris") {
        const content = buildRis(papers);
        downloadBlob(
          content || "No papers available to export",
          `${baseName}-citations.ris`,
          "application/x-research-info-systems",
        );
      } else if (type === "notes") {
        const content = buildNotesText(notes, topicName);
        downloadBlob(content, `${baseName}-notes.txt`, "text/plain");
      } else if (type === "reading-list") {
        const content = buildReadingListCsv(readingList);
        downloadBlob(content, `${baseName}-reading-list.csv`, "text/csv");
      } else if (type === "gaps") {
        const content = buildGapsCsv(gaps);
        downloadBlob(content, `${baseName}-research-gaps.csv`, "text/csv");
      } else if (type === "json") {
        const content = buildWorkspaceJson({
          topicName,
          papers,
          notes,
          readingList,
          session,
          gaps,
        });
        downloadBlob(content, `${baseName}-workspace.json`, "application/json");
      }
    } finally {
      setExporting(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-1.5" />
          Export
          <ChevronDown className="h-3.5 w-3.5 ml-1.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => handleExport("bibtex")} disabled={!!exporting}>
          <Quote className="h-4 w-4 mr-2" />
          Citations (BibTeX)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("ris")} disabled={!!exporting}>
          <Quote className="h-4 w-4 mr-2" />
          Citations (RIS)
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport("notes")} disabled={!!exporting}>
          <FileText className="h-4 w-4 mr-2" />
          Notes (TXT)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("reading-list")} disabled={!!exporting}>
          <ListChecks className="h-4 w-4 mr-2" />
          Reading List (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("gaps")} disabled={!!exporting}>
          <FileDown className="h-4 w-4 mr-2" />
          Research Gaps (CSV)
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport("json")} disabled={!!exporting}>
          <FileJson className="h-4 w-4 mr-2" />
          Full Workspace (JSON)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}