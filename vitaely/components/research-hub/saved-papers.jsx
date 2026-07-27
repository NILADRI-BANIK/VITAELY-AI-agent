"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  Bookmark,
  BookmarkX,
  ExternalLink,
  Copy,
  Check,
  Search,
  Calendar,
  Quote,
  Users,
  FileText,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function SavedPapersSkeleton({ count = 4 }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={`skel-${i}`} className="w-full">
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

function SavedPaperCard({ paper, onRemove }) {
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(copyTimerRef.current);
  }, []);

  const id = paper.id ?? paper.doi ?? paper.paperId ?? null;
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
  const doi = paper.doi ?? paper.externalIds?.DOI ?? null;
  const citationCount = paper.citationCount ?? paper.citations ?? null;
  const savedAt = paper.savedAt ?? paper.saved_at ?? null;
  const notes = paper.notes ?? paper.note ?? null;
  const pdfUrl =
    [paper.pdfUrl, paper.openAccessPdf?.url, paper.pdf].find(
      (u) => u && typeof u === "string" && u.startsWith("http"),
    ) ?? null;
  const externalUrl =
    (typeof paper.url === "string" && paper.url.startsWith("http")
      ? paper.url
      : null) ?? (doi ? `https://doi.org/${doi}` : null);

  const authorDisplay =
    authors.length > 0
      ? authors
          .slice(0, 3)
          .map((a) => (typeof a === "string" ? a : (a?.name ?? "Unknown")))
          .join(", ") +
        (authors.length > 3 ? ` +${authors.length - 3} more` : "")
      : null;

  function buildCitation() {
    const authorStr =
      authors.length > 0
        ? authors
            .map((a) => (typeof a === "string" ? a : (a?.name ?? "Unknown")))
            .join(", ")
        : "Unknown Author";
    const yearStr = year ? `(${year}).` : "";
    const venueStr = venue ? ` ${venue}.` : "";
    const doiStr = doi ? ` https://doi.org/${doi}` : "";
    return `${authorStr} ${yearStr} ${title}.${venueStr}${doiStr}`
      .replace(/\s+/g, " ")
      .trim();
  }

  async function handleCopy() {
    const text = buildCitation();
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
              <span className="truncate max-w-[160px]">{venue}</span>
            </span>
          )}
          {citationCount != null && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Quote className="w-3 h-3" />
              {typeof citationCount === "number"
                ? citationCount.toLocaleString()
                : citationCount}{" "}
              citation{Number(citationCount) !== 1 ? "s" : ""}
            </span>
          )}
          {doi && (
            <span className="text-xs text-muted-foreground truncate max-w-[200px]">
              DOI: {doi}
            </span>
          )}
        </div>

        {savedAt && (
          <p className="text-xs text-muted-foreground italic">
            Saved{" "}
            {typeof savedAt === "string"
              ? savedAt.slice(0, 10)
              : savedAt instanceof Date
                ? savedAt.toLocaleDateString()
                : String(savedAt)}
          </p>
        )}

        {notes && (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Notes
            </span>
            <p className="text-sm text-foreground leading-relaxed">{notes}</p>
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          {pdfUrl ? (
            <Button size="sm" className="flex-1" asChild>
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                <FileText className="w-3 h-3 mr-1" />
                View PDF
              </a>
            </Button>
          ) : externalUrl ? (
            <Button size="sm" className="flex-1" asChild>
              <a href={externalUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3 h-3 mr-1" />
                View Paper
              </a>
            </Button>
          ) : (
            <Button size="sm" className="flex-1" disabled>
              No Link Available
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

          {onRemove && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onRemove?.(paper)}
              className="px-2"
              aria-label="Remove saved paper"
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function SavedPapers({
  papers = [],
  loading = false,
  error = null,
  onRemove,
  emptyMessage = "No saved papers yet. Bookmark papers to revisit them later.",
}) {
  const [search, setSearch] = useState("");

  const query = search.trim().toLowerCase();

  const filtered = useMemo(() => {
    const list = Array.isArray(papers) ? papers : [];
    if (!query) return list;
    return list.filter((paper) => {
      const title = (paper.title ?? "").toLowerCase();
      const doi = (paper.doi ?? paper.externalIds?.DOI ?? "").toLowerCase();
      const authors = Array.isArray(paper.authors)
        ? paper.authors
            .map((a) => (typeof a === "string" ? a : (a?.name ?? "")))
            .join(" ")
            .toLowerCase()
        : "";
      const venue = (
        paper.venue ??
        paper.journal ??
        paper.source ??
        ""
      ).toLowerCase();
      return (
        title.includes(query) ||
        doi.includes(query) ||
        authors.includes(query) ||
        venue.includes(query)
      );
    });
  }, [papers, query]);

  if (loading) {
    return <SavedPapersSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-3 rounded-full bg-destructive/10 mb-3">
          <AlertCircle className="w-6 h-6 text-destructive" />
        </div>
        <p className="text-sm font-medium text-destructive">
          Failed to load saved papers
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {typeof error === "string" ? error : "An unexpected error occurred."}
        </p>
      </div>
    );
  }

  if (!Array.isArray(papers) || papers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-3 rounded-full bg-muted mb-3">
          <Bookmark className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search saved papers by title, author, or DOI..."
          className="w-full pl-9 pr-4 py-2 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
        />
      </div>

      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{filtered.length}</span>{" "}
        paper{filtered.length !== 1 ? "s" : ""} saved
        {query && (
          <span>
            {" "}
            matching &quot;
            <span className="font-medium text-foreground">{query}</span>&quot;
          </span>
        )}
      </p>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-3 rounded-full bg-muted mb-3">
            <BookmarkX className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            No saved papers match your search.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((paper, i) => (
            <SavedPaperCard
              key={`saved-${paper.id ?? paper.doi ?? paper.paperId ?? i}-${i}`}
              paper={paper}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export { SavedPapersSkeleton, SavedPaperCard };
