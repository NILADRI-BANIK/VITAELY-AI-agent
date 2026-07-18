"use client";

import { useState, useRef, useEffect } from "react";
import {
  BookOpen,
  Lightbulb,
  FileText,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  ExternalLink,
  Quote,
  List,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

// ─── ReviewSkeleton ───────────────────────────────────────────────────────────

function ReviewSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded-md shrink-0" />
            <Skeleton className="h-5 w-48" />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-4/6" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </CardContent>
      </Card>
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Skeleton className="w-6 h-6 rounded-md shrink-0" />
              <Skeleton className="h-4 w-40" />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-2/3" />
            <div className="flex gap-2 mt-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-5 w-20 rounded-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── FindingItem ──────────────────────────────────────────────────────────────

function FindingItem({ finding, index }) {
  const text =
    typeof finding === "string"
      ? finding
      : (finding.text ?? finding.finding ?? finding.summary ?? "");

  return (
    <li className="flex items-start gap-2 text-sm text-foreground leading-relaxed">
      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-semibold shrink-0 mt-0.5">
        {index + 1}
      </span>
      <span>{text}</span>
    </li>
  );
}

// ─── PaperReference ──────────────────────────────────────────────────────────

function PaperReference({ paper }) {
  const title = paper.title ?? "Untitled Paper";
  const year = paper.year ?? null;
  const authors = Array.isArray(paper.authors)
    ? paper.authors
        .slice(0, 2)
        .map((a) => (typeof a === "string" ? a : (a?.name ?? "Unknown")))
        .join(", ") + (paper.authors.length > 2 ? " et al." : "")
    : typeof paper.authors === "string"
      ? paper.authors
      : null;
  const url =
    (typeof paper.url === "string" && paper.url.startsWith("http")
      ? paper.url
      : null) ?? (paper.doi ? `https://doi.org/${paper.doi}` : null);
  const citationCount = paper.citationCount ?? paper.citations ?? null;

  return (
    <div className="flex items-start justify-between gap-2 py-2 border-b border-border last:border-0">
      <div className="flex items-start gap-2 min-w-0 flex-1">
        <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-medium text-foreground leading-snug line-clamp-2">
            {title}
          </span>
          {(authors || year) && (
            <span className="text-xs text-muted-foreground mt-0.5">
              {[authors, year].filter(Boolean).join(" · ")}
            </span>
          )}
          {citationCount != null && (
            <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Quote className="w-2.5 h-2.5" />
              {typeof citationCount === "number"
                ? citationCount.toLocaleString()
                : citationCount}{" "}
              citations
            </span>
          )}
        </div>
      </div>
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 p-1 rounded hover:bg-muted transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
        </a>
      )}
    </div>
  );
}

// ─── ReviewSection ────────────────────────────────────────────────────────────

function ReviewSection({ section, index }) {
  const [expanded, setExpanded] = useState(true);
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef(null);
  useEffect(() => {
    return () => clearTimeout(copyTimerRef.current);
  }, []);
  const title =
    section.title ?? section.topic ?? section.heading ?? `Section ${index + 1}`;
  const summary = section.summary ?? section.content ?? section.text ?? null;
  const findings = Array.isArray(section.findings) ? section.findings : [];
  const papers = Array.isArray(section.papers) ? section.papers : [];
  const tags = Array.isArray(section.tags) ? section.tags : [];

  async function handleCopy() {
    const findingTexts = findings
      .map((f, i) => {
        const text =
          typeof f === "string" ? f : (f.text ?? f.finding ?? f.summary ?? "");
        return `${i + 1}. ${text}`;
      })
      .join("\n");

    const text = [
      `Section: ${title}`,
      summary ? `Summary: ${summary}` : null,
      findings.length > 0 ? `Key Findings:\n${findingTexts}` : null,
    ]
      .filter(Boolean)
      .join("\n\n");

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
    <Card className="border border-border hover:border-primary/40 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="p-1.5 rounded-md bg-primary/10 shrink-0">
              <List className="w-4 h-4 text-primary" />
            </div>
            <CardTitle className="text-sm font-semibold leading-snug">
              {title}
            </CardTitle>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopy}
              className="px-2 h-7"
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
            >
              {expanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </Button>
          </div>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tags.map((tag, i) => (
              <Badge
                key={`${tag}-${i}`}
                variant="secondary"
                className="text-xs"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>

      {expanded && (
        <CardContent className="flex flex-col gap-4">
          {summary && (
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Summary
              </span>
              <p className="text-sm text-foreground leading-relaxed">
                {summary}
              </p>
            </div>
          )}

          {findings.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Key Findings
              </span>
              <ul className="flex flex-col gap-2">
                {findings.map((finding, i) => (
                  <FindingItem key={`kf-${i}`} finding={finding} index={i} />
                ))}
              </ul>
            </div>
          )}

          {papers.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Referenced Papers
              </span>
              <div className="flex flex-col">
                {papers.map((paper, i) => (
                  <PaperReference
                    key={paper.id ?? paper.doi ?? paper.title ?? i}
                    paper={paper}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// ─── ReviewPanel ──────────────────────────────────────────────────────────────

export default function ReviewPanel({
  review = null,
  loading = false,
  error = null,
  emptyMessage = "No literature review available. Select papers to generate a review.",
}) {
  const [fullCopied, setFullCopied] = useState(false);
  const fullCopyTimerRef = useRef(null);
  useEffect(() => {
    return () => clearTimeout(fullCopyTimerRef.current);
  }, []);
  if (loading) {
    return <ReviewSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-3 rounded-full bg-destructive/10 mb-3">
          <AlertCircle className="w-6 h-6 text-destructive" />
        </div>
        <p className="text-sm font-medium text-destructive">
          Failed to load review
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {typeof error === "string" ? error : "An unexpected error occurred."}
        </p>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-3 rounded-full bg-muted mb-3">
          <BookOpen className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  const overview =
    review.overview ?? review.introduction ?? review.summary ?? null;
  const sections = Array.isArray(review.sections) ? review.sections : [];
  const keyFindings = Array.isArray(review.keyFindings)
    ? review.keyFindings
    : Array.isArray(review.key_findings)
      ? review.key_findings
      : [];
  const conclusion = review.conclusion ?? review.conclusions ?? null;
  const topic = review.topic ?? review.title ?? null;
  const paperCount = review.paperCount ?? review.paper_count ?? null;

  async function handleFullCopy() {
    const sectionTexts = sections
      .map((s) => {
        const t = s.title ?? s.topic ?? s.heading ?? "";
        const sum = s.summary ?? s.content ?? s.text ?? "";
        const finds = Array.isArray(s.findings)
          ? s.findings
              .map((f, i) => {
                const text =
                  typeof f === "string"
                    ? f
                    : (f.text ?? f.finding ?? f.summary ?? "");
                return `  ${i + 1}. ${text}`;
              })
              .join("\n")
          : "";
        return [t, sum, finds].filter(Boolean).join("\n");
      })
      .join("\n\n");

    const findingTexts = keyFindings
      .map((f, i) => {
        const text =
          typeof f === "string" ? f : (f.text ?? f.finding ?? f.summary ?? "");
        return `${i + 1}. ${text}`;
      })
      .join("\n");

    const text = [
      topic ? `Literature Review: ${topic}` : "Literature Review",
      overview ? `Overview:\n${overview}` : null,
      sectionTexts ? `Sections:\n${sectionTexts}` : null,
      keyFindings.length > 0 ? `Key Findings:\n${findingTexts}` : null,
      conclusion ? `Conclusion:\n${conclusion}` : null,
    ]
      .filter(Boolean)
      .join("\n\n");

    try {
      await navigator.clipboard.writeText(text);
      clearTimeout(fullCopyTimerRef.current);
      setFullCopied(true);
      fullCopyTimerRef.current = setTimeout(() => setFullCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          {topic && (
            <h3 className="text-base font-semibold text-foreground">{topic}</h3>
          )}
          <div className="flex items-center gap-3 flex-wrap">
            {paperCount != null && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {typeof paperCount === "number"
                  ? paperCount.toLocaleString()
                  : paperCount}{" "}
                paper{Number(paperCount) !== 1 ? "s" : ""} reviewed
              </span>
            )}
            {sections.length > 0 && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <List className="w-3 h-3" />
                {sections.length} section{sections.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleFullCopy}
          className="shrink-0"
        >
          {fullCopied ? (
            <Check className="w-4 h-4 text-green-500 mr-1" />
          ) : (
            <Copy className="w-4 h-4 mr-1" />
          )}
          {fullCopied ? "Copied" : "Copy All"}
        </Button>
      </div>

      {/* Overview */}
      {overview && (
        <Card className="border border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-primary/10 shrink-0">
                <BookOpen className="w-4 h-4 text-primary" />
              </div>
              <CardTitle className="text-sm font-semibold">Overview</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground leading-relaxed">
              {overview}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Sections */}
      {sections.length > 0 && (
        <div className="flex flex-col gap-4">
          {sections.map((section, i) => (
            <ReviewSection
              key={`section-${section.id ?? section.title ?? section.topic ?? i}-${i}`}
              section={section}
              index={i}
            />
          ))}
        </div>
      )}

      {/* Key Findings */}
      {keyFindings.length > 0 && (
        <Card className="border border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-primary/10 shrink-0">
                <Lightbulb className="w-4 h-4 text-primary" />
              </div>
              <CardTitle className="text-sm font-semibold">
                Key Findings
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2">
              {keyFindings.map((finding, i) => (
                <FindingItem key={`f-${i}`} finding={finding} index={i} />
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Conclusion */}
      {conclusion && (
        <Card className="border border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-primary/10 shrink-0">
                <Quote className="w-4 h-4 text-primary" />
              </div>
              <CardTitle className="text-sm font-semibold">
                Conclusion
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground leading-relaxed">
              {conclusion}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
