"use client";

import { useState, useRef, useEffect } from "react";
import {
  FileText,
  Users,
  Quote,
  ExternalLink,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  Calendar,
  BookOpen,
  Tag,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// ─── PaperCardSkeleton ────────────────────────────────────────────────────────

function PaperCardSkeleton({ count = 4 }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="w-full">
          <CardHeader className="pb-2">
            <div className="flex items-start gap-2">
              <Skeleton className="w-8 h-8 rounded-md shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <div className="flex gap-3 mt-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex gap-2 mt-2">
              <Skeleton className="h-8 flex-1 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── PaperCard ────────────────────────────────────────────────────────────────

export default function PaperCard({ paper, onSave, savedIds }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  
const copyTimerRef = useRef(null);

useEffect(() => {
  return () => clearTimeout(copyTimerRef.current);
}, []);

const id = paper.id ?? paper.doi ?? paper.paperId ?? null;
  const isSaved = id && savedIds instanceof Set ? savedIds.has(String(id)) : false;

  const title = paper.title ?? "Untitled Paper";
  const authors = Array.isArray(paper.authors)
    ? paper.authors
    : typeof paper.authors === "string"
      ? [paper.authors]
      : [];
  const year =
    paper.year ??
    (typeof paper.publicationDate === "string"
      ? paper.publicationDate.slice(0, 4)
      : null);
  const venue = paper.venue ?? paper.journal ?? paper.source ?? null;
  const abstract = paper.abstract ?? paper.summary ?? null;
  const citationCount = paper.citationCount ?? paper.citations ?? null;
  const pdfUrl =
    [paper.pdfUrl, paper.openAccessPdf?.url, paper.pdf].find(
      (u) => u && typeof u === "string" && u.startsWith("http"),
    ) ?? null;
  const externalUrl =
    (paper.url && typeof paper.url === "string" && paper.url.startsWith("http")
      ? paper.url
      : null) ??
    (paper.externalIds?.DOI
      ? `https://doi.org/${paper.externalIds.DOI}`
      : null);
  const keywords = Array.isArray(paper.keywords) ? paper.keywords : [];
  const tags = Array.isArray(paper.tags) ? paper.tags : [];
  const allTags = [...new Set([...keywords, ...tags])];
  const type = paper.type ?? paper.publicationType ?? null;
  const doi = paper.doi ?? paper.externalIds?.DOI ?? null;

  const hasMore = abstract || allTags.length > 0;

  async function handleCopy() {
    const authorStr =
      authors.length > 0
        ? authors
            .map((a) => (typeof a === "string" ? a : (a?.name ?? "Unknown")))
            .join(", ")
        : null;
    const text = [
      `Title: ${title}`,
      authorStr ? `Authors: ${authorStr}` : null,
      year ? `Year: ${year}` : null,
      venue ? `Venue: ${venue}` : null,
      doi ? `DOI: ${doi}` : null,
      abstract ? `Abstract: ${abstract}` : null,
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

const authorDisplay =
    authors.length > 0
      ? authors
          .slice(0, 3)
          .map((a) => (typeof a === "string" ? a : (a?.name ?? "Unknown")))
          .join(", ") +
        (authors.length > 3 ? ` +${authors.length - 3} more` : "")
      : null;

  return (
    <Card className="w-full border border-border hover:border-primary/40 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-2">
          <div className="p-2 rounded-md bg-primary/10 shrink-0 mt-0.5">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-semibold leading-snug">
              {title}
            </CardTitle>
            {authorDisplay && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Users className="w-3 h-3 shrink-0" />
                <span className="truncate">{authorDisplay}</span>
              </p>
            )}
          </div>
          {type && (
            <Badge variant="outline" className="text-xs capitalize shrink-0">
              {type}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-3">
          {year && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {year}
            </span>
          )}
          {venue && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              <span className="truncate max-w-[160px]">{venue}</span>
            </span>
          )}
          {citationCount != null && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Quote className="w-3 h-3" />
              {typeof citationCount === "number"
                ? citationCount.toLocaleString()
                : citationCount}{" "}
  citation
{Number(citationCount) !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {expanded && (
          <>
            {abstract && (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Abstract
                </span>
                <p className="text-sm text-foreground leading-relaxed line-clamp-6">
                  {abstract}
                </p>
              </div>
            )}

            {allTags.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Keywords
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {allTags.map((tag, i) => (
                    <span
                      key={`${tag}-${i}`}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-secondary text-secondary-foreground border border-border"
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex items-center gap-2 pt-1">
          {pdfUrl && (
            <Button size="sm" className="flex-1" asChild>
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                <FileText className="w-3 h-3 mr-1" />
                View PDF
              </a>
            </Button>
          )}

          {!pdfUrl && externalUrl && (
            <Button size="sm" className="flex-1" asChild>
              <a href={externalUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3 h-3 mr-1" />
                View Paper
              </a>
            </Button>
          )}

          {!pdfUrl && !externalUrl && (
            <Button size="sm" className="flex-1" disabled>
              No Link Available
            </Button>
          )}

          {pdfUrl && externalUrl && (
            <Button size="sm" variant="outline" asChild className="px-2">
              <a href={externalUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          )}

          {hasMore && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setExpanded((p) => !p)}
              className="px-2"
            >
              {expanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            className="px-2"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>

          {onSave && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSave?.(paper)}
              className="px-2"
            >
              {isSaved ? (
                <BookmarkCheck className="w-4 h-4 text-primary" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export { PaperCardSkeleton };
