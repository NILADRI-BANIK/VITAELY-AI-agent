"use client";

import { useState, useRef, useEffect } from "react";
import {
  PenLine,
  Sparkles,
  Copy,
  Check,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ArrowLeftRight,
  BookOpen,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// ─── WritingSkeleton ──────────────────────────────────────────────────────────

function WritingSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Skeleton className="w-8 h-8 rounded-md shrink-0" />
              <Skeleton className="h-5 w-40" />
            </div>
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
        </CardHeader>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[0, 1].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Skeleton className="w-6 h-6 rounded-md shrink-0" />
                <Skeleton className="h-4 w-32" />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/6" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-36" />
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, j) => (
            <div key={j} className="flex items-start gap-2">
              <Skeleton className="w-5 h-5 rounded-full shrink-0" />
              <Skeleton className="h-3 flex-1" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── DiffLine ─────────────────────────────────────────────────────────────────

function DiffLine({ change }) {
  const text =
    typeof change === "string"
      ? change
      : (change.text ?? change.change ?? change.description ?? "");
  const type =
    typeof change === "string" ? "neutral" : (change.type ?? "neutral");

  const styles = {
    added: "bg-green-500/10 text-green-700 border-l-2 border-green-500 pl-2",
    removed:
      "bg-red-500/10 text-red-700 border-l-2 border-red-500 pl-2 line-through",
    improved: "bg-blue-500/10 text-blue-700 border-l-2 border-blue-500 pl-2",
    neutral: "text-foreground",
  };

  return (
    <p
      className={`text-xs leading-relaxed py-0.5 rounded-sm ${
        styles[type] ?? styles.neutral
      }`}
    >
      {text}
    </p>
  );
}

// ─── WritingPanel ─────────────────────────────────────────────────────────────

export default function WritingPanel({
  result = null,
  loading = false,
  error = null,
  emptyMessage = "No writing improvement yet. Paste your text and select a writing style to get started.",
}) {
  const [viewMode, setViewMode] = useState("split");
  const [originalCopied, setOriginalCopied] = useState(false);
  const [improvedCopied, setImprovedCopied] = useState(false);
  const [changesExpanded, setChangesExpanded] = useState(true);
  const [feedbackExpanded, setFeedbackExpanded] = useState(true);
  const originalCopyTimerRef = useRef(null);
  const improvedCopyTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      clearTimeout(originalCopyTimerRef.current);
      clearTimeout(improvedCopyTimerRef.current);
    };
  }, []);

  if (loading) {
    return <WritingSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-3 rounded-full bg-destructive/10 mb-3">
          <AlertCircle className="w-6 h-6 text-destructive" />
        </div>
        <p className="text-sm font-medium text-destructive">
          Failed to improve writing
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {typeof error === "string" ? error : "An unexpected error occurred."}
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-3 rounded-full bg-muted mb-3">
          <PenLine className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  const original = result.original ?? result.input ?? result.originalText ?? "";
  const improved =
    result.improved ??
    result.output ??
    result.improvedText ??
    result.result ??
    "";
  const changes = Array.isArray(result.changes) ? result.changes : [];
  const feedback = Array.isArray(result.feedback)
    ? result.feedback
    : typeof result.feedback === "string"
      ? [result.feedback]
      : [];
  const style =
    result.style ?? result.writingStyle ?? result.writing_style ?? null;
  const tone = result.tone ?? null;
  const readabilityScore =
    result.readabilityScore ??
    result.readability_score ??
    result.readability ??
    null;
  const wordCountOriginal =
    result.wordCountOriginal ??
    result.word_count_original ??
    (original
      ? original.trim().split(/\s+/).filter(Boolean).length || 0
      : null);
  const wordCountImproved =
    result.wordCountImproved ??
    result.word_count_improved ??
    (improved
      ? improved.trim().split(/\s+/).filter(Boolean).length || 0
      : null);
  const note = result.note ?? result.tip ?? null;

  async function handleCopy(text, setter, timerRef) {
    try {
      await navigator.clipboard.writeText(text);
      clearTimeout(timerRef.current);
      setter(true);
      timerRef.current = setTimeout(() => setter(false), 2000);
    } catch {
      // clipboard unavailable
    }
  }

  const viewModes = [
    { key: "split", label: "Split" },
    { key: "original", label: "Original" },
    { key: "improved", label: "Improved" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <Card className="border border-border">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-md bg-primary/10 shrink-0">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="flex flex-col gap-1">
                <CardTitle className="text-sm font-semibold">
                  Writing Improvement
                </CardTitle>
                <div className="flex flex-wrap items-center gap-1.5">
                  {style && (
                    <Badge variant="outline" className="text-xs capitalize">
                      {style}
                    </Badge>
                  )}
                  {tone && (
                    <Badge variant="secondary" className="text-xs capitalize">
                      {tone}
                    </Badge>
                  )}
                  {readabilityScore != null && (
                    <span className="text-xs text-muted-foreground">
                      Readability:{" "}
                      <span className="font-medium text-foreground">
                        {readabilityScore}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* View mode toggle */}
            <div className="flex items-center rounded-md border border-border overflow-hidden shrink-0">
              {viewModes.map((mode) => (
                <button
                  key={mode.key}
                  type="button"
                  onClick={() => setViewMode(mode.key)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    viewMode === mode.key
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* Word count diff */}
          {(wordCountOriginal != null || wordCountImproved != null) && (
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {wordCountOriginal != null && (
                <span className="text-xs text-muted-foreground">
                  Original:{" "}
                  <span className="font-medium text-foreground">
                    {wordCountOriginal} words
                  </span>
                </span>
              )}
              {wordCountImproved != null && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <ArrowLeftRight className="w-3 h-3" />
                  Improved:{" "}
                  <span className="font-medium text-foreground">
                    {wordCountImproved} words
                  </span>
                </span>
              )}
              {wordCountOriginal != null && wordCountImproved != null && (
                <span
                  className={`text-xs font-medium ${
                    wordCountImproved < wordCountOriginal
                      ? "text-green-600"
                      : wordCountImproved > wordCountOriginal
                        ? "text-orange-500"
                        : "text-muted-foreground"
                  }`}
                >
                  {wordCountImproved < wordCountOriginal
                    ? `−${wordCountOriginal - wordCountImproved}`
                    : wordCountImproved > wordCountOriginal
                      ? `+${wordCountImproved - wordCountOriginal}`
                      : "No change"}
                </span>
              )}
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Text panels */}
      <div
        className={`grid gap-4 ${
          viewMode === "split" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
        }`}
      >
        {/* Original */}
        {(viewMode === "split" || viewMode === "original") && (
          <Card className="border border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-muted shrink-0">
                    <PenLine className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-sm font-semibold text-muted-foreground">
                    Original
                  </CardTitle>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    handleCopy(
                      original,
                      setOriginalCopied,
                      originalCopyTimerRef,
                    )
                  }
                  className="px-2 h-7"
                  disabled={!original}
                >
                  {originalCopied ? (
                    <Check className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {original ? (
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {original}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  No original text provided.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Improved */}
        {(viewMode === "split" || viewMode === "improved") && (
          <Card className="border border-primary/30 bg-primary/5">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-primary/10 shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <CardTitle className="text-sm font-semibold text-primary">
                    Improved
                  </CardTitle>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    handleCopy(
                      improved,
                      setImprovedCopied,
                      improvedCopyTimerRef,
                    )
                  }
                  className="px-2 h-7"
                  disabled={!improved}
                >
                  {improvedCopied ? (
                    <Check className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {improved ? (
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {improved}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  No improved text available.
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Changes */}
      {changes.length > 0 && (
        <Card className="border border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-primary/10 shrink-0">
                  <BookOpen className="w-3.5 h-3.5 text-primary" />
                </div>
                <CardTitle className="text-sm font-semibold">
                  Changes Made
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    ({changes.length})
                  </span>
                </CardTitle>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setChangesExpanded((p) => !p)}
                className="px-2 h-7"
              >
                {changesExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </Button>
            </div>
          </CardHeader>
          {changesExpanded && (
            <CardContent className="flex flex-col gap-1">
              {changes.map((change, i) => (
                <DiffLine key={`change-${i}`} change={change} />
              ))}
            </CardContent>
          )}
        </Card>
      )}

      {/* Feedback */}
      {feedback.length > 0 && (
        <Card className="border border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-primary/10 shrink-0">
                  <Info className="w-3.5 h-3.5 text-primary" />
                </div>
                <CardTitle className="text-sm font-semibold">
                  Feedback
                </CardTitle>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setFeedbackExpanded((p) => !p)}
                className="px-2 h-7"
              >
                {feedbackExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </Button>
            </div>
          </CardHeader>
          {feedbackExpanded && (
            <CardContent>
              <ul className="flex flex-col gap-2">
                {feedback.map((item, i) => {
                  const text =
                    typeof item === "string"
                      ? item
                      : (item.text ?? item.feedback ?? item.message ?? "");
                  return (
                    <li
                      key={`fb-${i}`}
                      className="flex items-start gap-2 text-sm text-foreground leading-relaxed"
                    >
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-semibold shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{text}</span>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          )}
        </Card>
      )}

      {/* Note */}
      {note && (
        <div className="flex items-start gap-2 p-4 rounded-md bg-muted/50 border border-border">
          <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            {note}
          </p>
        </div>
      )}
    </div>
  );
}
