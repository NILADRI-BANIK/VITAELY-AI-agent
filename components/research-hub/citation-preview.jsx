"use client";

import { useState, useRef, useEffect } from "react";
import {
  Quote,
  Copy,
  Check,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  BookMarked,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const EMPTY_CITATIONS = {};

const formatConfig = {
  APA: {
    label: "APA",
    badge: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    description: "7th Edition",
  },
  IEEE: {
    label: "IEEE",
    badge: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    description: "Reference Style",
  },
  MLA: {
    label: "MLA",
    badge: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    description: "9th Edition",
  },
  Chicago: {
    label: "Chicago",
    badge: "bg-green-500/10 text-green-600 border-green-500/20",
    description: "17th Edition",
  },
};

// ─── CitationSkeleton ─────────────────────────────────────────────────────────

function CitationSkeleton({ count = 4 }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={`skel-${i}`} className="w-full">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Skeleton className="w-6 h-6 rounded-md shrink-0" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-7 w-16 rounded-md" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6 mt-1.5" />
            <Skeleton className="h-3 w-4/6 mt-1.5" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── CitationBlock ────────────────────────────────────────────────────────────

function CitationBlock({ format, text }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const copyTimerRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(copyTimerRef.current);
  }, []);

  const config = formatConfig[format?.toUpperCase()] ?? {
    label: format,
    badge: "bg-primary/10 text-primary border-primary/20",
    description: "Citation Style",
  };

  async function handleCopy() {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      clearTimeout(copyTimerRef.current);
      setCopied(true);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <Card className="w-full border border-border hover:border-primary/40 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10 shrink-0">
              <BookMarked className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${config.badge}`}
              >
                {config.label}
              </span>
              <span className="text-xs text-muted-foreground">
                {config.description}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              className="px-2 h-7"
              disabled={!text}
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setExpanded((p) => !p)}
              className="px-2 h-7"
              aria-label={expanded ? "Collapse" : "Expand"}
              aria-expanded={expanded}
            >
              {expanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent>
          {text ? (
            <p className="text-sm text-foreground leading-relaxed font-mono whitespace-pre-wrap break-words">
              {text}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              No {config.label} citation available.
            </p>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// ─── CitationPreview ──────────────────────────────────────────────────────────

export default function CitationPreview({
  citations = EMPTY_CITATIONS,
  loading = false,
  error = null,
  paper = null,
  emptyMessage = "No citations generated yet. Select a paper to generate citations.",
}) {
  const [allCopied, setAllCopied] = useState(false);
  const allCopyTimerRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(allCopyTimerRef.current);
  }, []);

  if (loading) {
    return <CitationSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-3 rounded-full bg-destructive/10 mb-3">
          <AlertCircle className="w-6 h-6 text-destructive" />
        </div>
        <p className="text-sm font-medium text-destructive">
          Failed to generate citations
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {typeof error === "string" ? error : "An unexpected error occurred."}
        </p>
      </div>
    );
  }

  const citationEntries = Object.entries(
    citations && typeof citations === "object" ? citations : {}
  ).filter(([, value]) => value && typeof value === "string");

  if (citationEntries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-3 rounded-full bg-muted mb-3">
          <Quote className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  const preferredOrder = ["APA", "IEEE", "MLA", "CHICAGO"];
  const sortedEntries = [...citationEntries].sort(([a], [b]) => {
    const ai = preferredOrder.indexOf(a.toUpperCase());
    const bi = preferredOrder.indexOf(b.toUpperCase());
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  async function handleCopyAll() {
    const text = sortedEntries
      .map(([format, value]) => `[${formatConfig[format.toUpperCase()]?.label ?? format}]\n${value}`)
      .join("\n\n");

    try {
      await navigator.clipboard.writeText(text);
      clearTimeout(allCopyTimerRef.current);
      setAllCopied(true);
      allCopyTimerRef.current = setTimeout(() => setAllCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  }

  const title =
    paper?.title ??
    paper?.name ??
    null;
  const authors = Array.isArray(paper?.authors)
    ? paper.authors
        .slice(0, 3)
        .map((a) => (typeof a === "string" ? a : a?.name ?? "Unknown"))
        .join(", ") + (paper.authors.length > 3 ? " et al." : "")
    : typeof paper?.authors === "string"
    ? paper.authors
    : null;
  const year =
    paper?.year ??
    (typeof paper?.publicationDate === "string"
      ? paper.publicationDate.slice(0, 4)
      : null);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          {title && (
            <div className="flex items-start gap-2 min-w-0">
              <FileText className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex flex-col min-w-0">
                <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">
                  {title}
                </p>
                {(authors || year) && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {[authors, year].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                {sortedEntries.length}
              </span>{" "}
              format{sortedEntries.length !== 1 ? "s" : ""} available
            </span>
            {sortedEntries.map(([format]) => (
              <Badge key={format} variant="secondary" className="text-xs">
                {formatConfig[format.toUpperCase()]?.label ?? format}
              </Badge>
            ))}
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCopyAll}
          className="shrink-0"
        >
          {allCopied ? (
            <Check className="w-4 h-4 text-green-500 mr-1" />
          ) : (
            <Copy className="w-4 h-4 mr-1" />
          )}
          {allCopied ? "Copied" : "Copy All"}
        </Button>
      </div>

      {/* Citation blocks */}
      <div className="flex flex-col gap-3">
        {sortedEntries.map(([format, text]) => (
          <CitationBlock key={format} format={format} text={text} />
        ))}
      </div>
    </div>
  );
}

export { CitationSkeleton, CitationBlock };