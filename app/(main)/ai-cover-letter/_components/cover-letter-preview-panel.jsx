"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Loader2, Sparkles, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import CoverLetterPreview from "./cover-letter-preview";

/**
 * CoverLetterPreviewPanel
 *
 * Right-side live preview panel used inside CoverLetterGenerator.
 * Renders a scaled-down A4 preview of the generated cover letter.
 *
 * Props:
 *   formData      – current form state from useCoverLetter()
 *   coverLetter   – generated letter object { content, template } or null
 *   isGenerating  – boolean
 */
export default function CoverLetterPreviewPanel({
  formData,
  coverLetter,
  isGenerating,
}) {
  const previewRef = useRef(null);
  const containerRef = useRef(null);
  const [scale, setScale] = useState(0.58);

  const A4_WIDTH = 794;
  const A4_HEIGHT = 1123;

  // Recalculate scale whenever the container resizes so the full A4 page
  // always fits without scrolling.
  const recalcScale = useCallback(() => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    const padding = 32; // 16px each side
    const availW = clientWidth - padding;
    const availH = clientHeight - padding;
    const scaleByW = availW / A4_WIDTH;
    const scaleByH = availH / A4_HEIGHT;
    // Use the smaller axis so the full page fits in both dimensions
    const computed = Math.min(scaleByW, scaleByH, 1); // never upscale beyond 1
    setScale(Math.max(computed, 0.25)); // floor at 0.25 to stay readable
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    recalcScale();
    const ro = new ResizeObserver(recalcScale);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [recalcScale]);

  // Build a letter object the preview component can consume.
  // formData is the source of truth for sender/company/position fields
  // since it's always current, even before the DB round-trip completes.
  const letterForPreview = coverLetter
    ? {
        ...coverLetter,
        template: formData.template ?? coverLetter.template ?? "modern-professional",
        primaryColor: formData.primaryColor ?? undefined,
        companyName: formData.companyName ?? coverLetter.companyName ?? "",
        position: formData.jobTitle ?? coverLetter.position ?? "",
        senderName: formData.yourName ?? coverLetter.senderName ?? "",
        senderEmail: formData.yourEmail ?? coverLetter.senderEmail ?? "",
        senderPhone: formData.yourPhone ?? coverLetter.senderPhone ?? "",
      }
    : null;

  return (
    <Card className="flex flex-col h-full min-h-[600px]">
      <CardHeader className="pb-3 shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Live Preview
          </CardTitle>
          {formData.template && (
            <Badge variant="secondary" className="text-xs capitalize">
              {formData.template.replace(/-/g, " ")}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        {/* Generating state */}
        {isGenerating && (
          <div className="flex flex-col items-center justify-center h-full min-h-[520px] gap-4 text-center px-6">
            <div className="relative">
              <div className="p-4 rounded-2xl bg-primary/10">
                <Sparkles className="h-8 w-8 text-primary animate-pulse" />
              </div>
              <div className="absolute -top-1 -right-1">
                <Loader2 className="h-4 w-4 text-primary animate-spin" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-sm">Generating your cover letter...</p>
              <p className="text-xs text-muted-foreground">
                Gemini AI is crafting a personalized letter for{" "}
                {formData.companyName || "your target company"}
              </p>
            </div>
            {/* Skeleton lines */}
            <div className="w-full max-w-xs space-y-2 mt-2">
              {[80, 95, 70, 90, 60, 85].map((w, i) => (
                <div
                  key={i}
                  className="h-2 rounded bg-muted animate-pulse"
                  style={{ width: `${w}%`, animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty state — nothing generated yet */}
        {!isGenerating && !letterForPreview && (
          <div className="flex flex-col items-center justify-center h-full min-h-[520px] gap-4 text-center px-6">
            <div className="p-4 rounded-2xl bg-muted/60">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-sm">No preview yet</p>
              <p className="text-xs text-muted-foreground">
                Fill in the job details and click{" "}
                <span className="font-medium text-foreground">Generate</span> to
                see your cover letter here
              </p>
            </div>
          </div>
        )}

        {/* Preview — letter generated.
            Container fills all available CardContent space.
            Scale is computed dynamically so the full A4 page fits without
            any internal scrolling. No ScrollArea wrapper here — the page
            must be fully visible in one shot, not scrollable. */}
        {!isGenerating && letterForPreview && (
          <div
            ref={containerRef}
            className="w-full h-full flex items-center justify-center"
            style={{ minHeight: 0 }}
          >
            <CoverLetterPreview
              ref={previewRef}
              letter={letterForPreview}
              scale={scale}
              className="shadow-lg rounded-sm ring-1 ring-border"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}