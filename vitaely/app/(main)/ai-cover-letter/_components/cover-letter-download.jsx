"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CoverLetterDownload({ coverLetter }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: html2canvas } = await import("html2canvas");

      // Targets the dynamic id set in CoverLetterPreview
      const previewId = coverLetter.id
        ? `cover-letter-preview-${coverLetter.id}`
        : "cover-letter-preview-root";

      const element = document.getElementById(previewId);

      if (!element) {
        // Text-based fallback when preview element is not mounted
        const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        const margin = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const maxWidth = pageWidth - margin * 2;

        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(coverLetter.title, margin, margin + 5);

        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");

        const lines = doc.splitTextToSize(coverLetter.content, maxWidth);
        let y = margin + 18;

        for (const line of lines) {
          if (y > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            y = margin;
          }
          doc.text(line, margin, y);
          y += 6;
        }

        doc.save(`${coverLetter.title.replace(/[^a-z0-9]/gi, "_")}.pdf`);
        toast.success("Cover letter downloaded");
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // The template (modern-professional.jsx etc.) is responsible for
      // self-compressing its body content to always fit within one A4
      // page's worth of height at its native 794px width, with no floor
      // on how far it shrinks. So we always stretch the captured canvas
      // to fill the full page width and place it as a single image —
      // never multiple pages.
      const renderWidth = pageWidth;
      const renderHeight = (canvas.height * renderWidth) / canvas.width;

      const imgData = canvas.toDataURL("image/png");
      doc.addImage(imgData, "PNG", 0, 0, renderWidth, renderHeight);

      doc.save(`${coverLetter.title.replace(/[^a-z0-9]/gi, "_")}.pdf`);
      toast.success("Cover letter downloaded");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download cover letter");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={downloading}
    >
      <Download className="h-4 w-4 mr-1" />
      {downloading ? "Downloading..." : "Download PDF"}
    </Button>
  );
}
