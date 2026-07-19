"use client";

import { forwardRef } from "react";
import { getTemplate } from "./templates";

const CoverLetterPreview = forwardRef(function CoverLetterPreview(
  { letter = {}, scale = 1, className = "" },
  ref
) {
  const templateData = {
    senderName: letter.senderName ?? letter.userName ?? letter.fullName ?? "",
    senderTitle: letter.senderTitle ?? letter.currentRole ?? "",
    senderEmail: letter.senderEmail ?? letter.email ?? "",
    senderPhone: letter.senderPhone ?? letter.phone ?? "",
    senderLocation: letter.senderLocation ?? letter.location ?? "",
    senderWebsite:
      letter.senderWebsite ?? letter.website ?? letter.portfolio ?? "",
    recipientName:
      letter.recipientName ?? letter.hiringManager ?? "Hiring Manager",
    recipientTitle: letter.recipientTitle ?? "",
    companyName: letter.companyName ?? letter.company ?? "",
    companyAddress: letter.companyAddress ?? "",
    date:
      letter.date ??
      (letter.createdAt
        ? new Date(letter.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })),
    position: letter.position ?? letter.jobTitle ?? letter.role ?? "",
    content: letter.content ?? "",
    primaryColor: letter.primaryColor ?? undefined,
  };

  const templateId =
    letter.template ?? letter.selectedTemplate ?? "modern-professional";
  const { component: TemplateComponent } = getTemplate(templateId);

  const A4_WIDTH = 794;
  const A4_HEIGHT = 1123;

  const previewId = letter.id
    ? `cover-letter-preview-${letter.id}`
    : "cover-letter-preview-root";

  return (
    // Outer wrapper reserves exactly the scaled A4 footprint in the layout.
    // overflow:visible so the scaled inner div isn't clipped — the card's
    // own overflow:hidden handles containment.
    <div
      className={className}
      style={{
        width: `${A4_WIDTH * scale}px`,
        height: `${A4_HEIGHT * scale}px`,
        overflow: "visible",
        position: "relative",
        flexShrink: 0,
      }}
    >
      {/* Inner div is the html2canvas capture target — always 794px wide,
          never hard-clamped in height, scaled visually via transform. */}
      <div
        ref={ref}
        id={previewId}
        style={{
          width: `${A4_WIDTH}px`,
          minHeight: `${A4_HEIGHT}px`,
          height: "auto",
          transformOrigin: "top left",
          transform: scale !== 1 ? `scale(${scale})` : undefined,
        }}
      >
        <TemplateComponent data={templateData} />
      </div>
    </div>
  );
});

CoverLetterPreview.displayName = "CoverLetterPreview";

export default CoverLetterPreview;
