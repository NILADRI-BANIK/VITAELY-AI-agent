"use client";

import { useState } from "react";
import { Download, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// generatePDF
// addSectionHeader
// addBodyText
// addDivider
// addPageFooters
// handleMissingSkills
// handlePrioritySkills
// handleRoadmap
// handleCourses
// handleProjects
// handleTimeline

export default function DownloadReport({
  analysis,
  role,
  userSkills,
  experience,
}) {
  const [isGenerating, setIsGenerating] = useState(false);

  const addSectionHeader = (doc, text, y, pageWidth) => {
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(text, 20, y);
    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(0.5);
    doc.line(20, y + 2, pageWidth - 20, y + 2);
    return y + 12;
  };

  const addBodyText = (doc, text, y, pageWidth) => {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);

    const lines = doc.splitTextToSize(String(text), pageWidth - 40);

    lines.forEach((line) => {
      y = checkPageBreak(doc, y);
      doc.text(line, 20, y);
      y += 6;
    });

    return y + 4;
  };

  const addDivider = (doc, y, pageWidth) => {
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(20, y, pageWidth - 20, y);
    return y + 8;
  };

  const checkPageBreak = (doc, y) => {
    const pageHeight = doc.internal.pageSize.getHeight();
    if (y > pageHeight - 40) {
      doc.addPage();
      return 20;
    }
    return y;
  };

  const addPageFooters = (doc, pageWidth, pageHeight) => {
    const total = doc.internal.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Skill Gap Analysis Report  •  Page ${i} of ${total}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" },
      );
    }
  };

  const handleMissingSkills = (doc, autoTable, skills, y, pageWidth) => {
    if (!skills?.length) return y;
    y = checkPageBreak(doc, y);
    y = addSectionHeader(doc, "Missing Skills", y, pageWidth);
    const rows = skills.map((s) => [
      typeof s === "string" ? s : s?.name || String(s),
    ]);
    autoTable(doc, {
      startY: y,
      head: [["Skill"]],
      body: rows,
      margin: { left: 20, right: 20 },
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: {
        fillColor: [99, 102, 241],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });
    return doc.lastAutoTable.finalY + 12;
  };

  const handlePrioritySkills = (
    doc,
    autoTable,
    prioritySkills,
    y,
    pageWidth,
  ) => {
    if (!prioritySkills) return y;
    const rows = [];
    const colorMap = {
      High: [239, 68, 68],
      Medium: [245, 158, 11],
      Low: [34, 197, 94],
    };
    const normalized = Array.isArray(prioritySkills)
      ? prioritySkills.reduce((acc, s) => {
          const level = (s.priority || "low").toLowerCase();
          acc[level] = acc[level] || [];
          acc[level].push(s);
          return acc;
        }, {})
      : prioritySkills;

    ["high", "medium", "low"].forEach((level) => {
      (normalized[level] || []).forEach((s) =>
        rows.push([
          typeof s === "string" ? s : s?.name || String(s),
          level.charAt(0).toUpperCase() + level.slice(1),
        ]),
      );
    });
    if (!rows.length) return y;
    y = checkPageBreak(doc, y);
    y = addSectionHeader(doc, "Priority Skills", y, pageWidth);
    autoTable(doc, {
      startY: y,
      head: [["Skill", "Priority"]],
      body: rows,
      margin: { left: 20, right: 20 },
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: {
        fillColor: [99, 102, 241],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 1) {
          const color = colorMap[data.cell.raw] || [51, 65, 85];
          data.cell.styles.textColor = color;
          data.cell.styles.fontStyle = "bold";
        }
      },
    });
    return doc.lastAutoTable.finalY + 12;
  };

  const handleRoadmap = (doc, autoTable, roadmap, y, pageWidth) => {
    if (!roadmap?.length) return y;
    y = checkPageBreak(doc, y);
    y = addSectionHeader(doc, "Learning Roadmap", y, pageWidth);
    autoTable(doc, {
      startY: y,
      head: [["#", "Title", "Description", "Duration"]],
      body: roadmap.map((step, i) => [
        i + 1,
        step.title || step.step || step.phase || "",
        step.description || step.details || "",
        step.duration || "",
      ]),
      margin: { left: 20, right: 20 },
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: {
        fillColor: [99, 102, 241],
        textColor: 255,
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 10 },
        2: { cellWidth: 80 },
        3: { cellWidth: 25 },
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });
    return doc.lastAutoTable.finalY + 12;
  };

  const handleCourses = (doc, autoTable, courses, y, pageWidth) => {
    if (!courses?.length) return y;
    y = checkPageBreak(doc, y);
    y = addSectionHeader(doc, "Recommended Courses", y, pageWidth);
    autoTable(doc, {
      startY: y,
      head: [["Course", "Platform", "Duration", "Level"]],
      body: courses.map((c) => [
        c.title || "",
        c.platform || c.provider || "",
        c.duration || "",
        c.level || c.difficulty || "",
      ]),
      margin: { left: 20, right: 20 },
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: {
        fillColor: [99, 102, 241],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });
    return doc.lastAutoTable.finalY + 12;
  };

  const handleProjects = (doc, autoTable, projects, y, pageWidth) => {
    if (!projects?.length) return y;
    y = checkPageBreak(doc, y);
    y = addSectionHeader(doc, "Project Recommendations", y, pageWidth);
    autoTable(doc, {
      startY: y,
      head: [["Project", "Description", "Skills", "Difficulty"]],
      body: projects.map((p) => [
        p.title || p.name || "",
        p.description || p.details || "",
        Array.isArray(p.skills) ? p.skills.join(", ") : p.skills || "",
        p.difficulty || p.level || "",
      ]),
      margin: { left: 20, right: 20 },
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: {
        fillColor: [99, 102, 241],
        textColor: 255,
        fontStyle: "bold",
      },
      columnStyles: { 1: { cellWidth: 60 } },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });
    return doc.lastAutoTable.finalY + 12;
  };

  const handleTimeline = (doc, timeline, y, pageWidth) => {
    if (!timeline) return y;
    y = checkPageBreak(doc, y);
    y = addSectionHeader(doc, "Learning Timeline", y, pageWidth);
    const text =
      typeof timeline === "string"
        ? timeline
        : timeline?.estimate
          ? `Estimated time to job-ready: ${timeline.estimate}\n${timeline.breakdown || ""}`
          : JSON.stringify(timeline, null, 2);
    return addBodyText(doc, text, y, pageWidth);
  };

const generatePDF = async () => {
    if (!analysis) return;
    setIsGenerating(true);
    try {
      const { generateSkillGapReport } = await import("@/lib/pdf-generator");

      generateSkillGapReport({
        ...analysis,
        targetRole: role,
        currentSkills: Array.isArray(userSkills) ? userSkills : [],
        experience,
      });
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error("Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={generatePDF}
      disabled={isGenerating || !analysis}
      variant="outline"
      className="flex items-center gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400 transition-colors"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Generating PDF…</span>
        </>
      ) : (
        <>
          <FileText className="w-4 h-4" />
          <Download className="w-4 h-4" />
          <span>Download Report</span>
        </>
      )}
    </Button>
  );
}
