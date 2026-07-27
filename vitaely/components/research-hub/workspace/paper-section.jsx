"use client";

import { useState } from "react";
import {
  FileText,
  ExternalLink,
  Quote,
  Unlock,
  Lock,
  Calendar,
  Users,
  Bookmark,
  BookmarkCheck,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  markOpenedPaper,
  addPaperToCollection,
  removePaperFromCollection,
} from "@/actions/research-hub/topic-workspace";

const SOURCE_COLORS = {
  OpenAlex: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  "Semantic Scholar": "bg-teal-500/10 text-teal-600 border-teal-500/20",
  arXiv: "bg-red-500/10 text-red-600 border-red-500/20",
  Crossref: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  DBLP: "bg-orange-500/10 text-orange-600 border-orange-500/20",
};

function SourceBadge({ source }) {
  const colorClass =
    SOURCE_COLORS[source] ?? "bg-muted text-muted-foreground border-border";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}
    >
      {source ?? "Unknown"}
    </span>
  );
}

function PaperCard({ paper, topicId, isSaved, onToggleSave }) {
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);

  const authors = Array.isArray(paper.authors) ? paper.authors : [];
  const authorsText =
    authors.length > 0
      ? `${authors.slice(0, 3).join(", ")}${authors.length > 3 ? " et al." : ""}`
      : "Unknown authors";

  const hasAbstract = !!paper.abstract;
  const abstractPreview =
    hasAbstract && paper.abstract.length > 240
      ? `${paper.abstract.slice(0, 240)}...`
      : paper.abstract;

  async function handleOpenPaper() {
    if (!paper.url) return;
    if (topicId) {
      markOpenedPaper(topicId, paper).catch(() => {});
    }
    window.open(paper.url, "_blank", "noopener,noreferrer");
  }

  async function handleToggleSave() {
    if (!topicId) return;
    setSaving(true);
    try {
      if (isSaved) {
        await removePaperFromCollection(
          topicId,
          String(paper.id ?? paper.doi ?? paper.title),
        );
      } else {
        await addPaperToCollection(topicId, paper);
      }
      onToggleSave?.(paper);
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="w-full border border-border hover:border-primary/40 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0 flex-1">
            <div className="p-2 rounded-md bg-primary/10 shrink-0 mt-0.5">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <CardTitle className="text-sm font-semibold leading-snug">
              {paper.title}
            </CardTitle>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <SourceBadge source={paper.source} />
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap pt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {authorsText}
          </span>
          {paper.venue && (
            <span className="truncate max-w-[220px]">{paper.venue}</span>
          )}
          {paper.year && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {paper.year}
            </span>
          )}
          {paper.citationCount != null && (
            <span className="flex items-center gap-1">
              <Quote className="w-3 h-3" />
              {paper.citationCount.toLocaleString()} citations
            </span>
          )}
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${
              paper.openAccess
                ? "bg-green-500/10 text-green-600 border-green-500/20"
                : "bg-muted text-muted-foreground border-border"
            }`}
          >
            {paper.openAccess ? (
              <Unlock className="w-3 h-3" />
            ) : (
              <Lock className="w-3 h-3" />
            )}
            {paper.openAccess ? "Open Access" : "Restricted"}
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {hasAbstract && (
          <div className="flex flex-col gap-1">
            <p className="text-sm text-foreground leading-relaxed">
              {expanded ? paper.abstract : abstractPreview}
            </p>
            {paper.abstract.length > 240 && (
              <button
                type="button"
                onClick={() => setExpanded((p) => !p)}
                className="inline-flex items-center gap-1 text-xs text-primary self-start hover:underline"
              >
                {expanded ? (
                  <>
                    Show less <ChevronUp className="w-3 h-3" />
                  </>
                ) : (
                  <>
                    Show more <ChevronDown className="w-3 h-3" />
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {paper.doi && (
          <p className="text-xs text-muted-foreground">
            DOI:{" "}
            <a
              href={`https://doi.org/${paper.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {paper.doi}
            </a>
          </p>
        )}

        <div className="flex items-center gap-2 pt-1">
          <Button
            size="sm"
            className="flex-1"
            onClick={handleOpenPaper}
            disabled={!paper.url}
          >
            <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
            Open Paper
          </Button>

          {topicId && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleToggleSave}
              disabled={saving}
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

function PaperSkeleton({ count = 4 }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="w-full">
          <CardHeader className="pb-2">
            <div className="flex items-start gap-2">
              <Skeleton className="w-8 h-8 rounded-md shrink-0" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="flex gap-2 mt-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-8 w-full rounded-md mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function PaperSection({
  papers = [],
  loading = false,
  error = null,
  topicId = null,
  savedPaperIds,
}) {
  const [localSavedIds, setLocalSavedIds] = useState(
    savedPaperIds instanceof Set ? savedPaperIds : new Set(),
  );

  if (loading) return <PaperSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-3 rounded-full bg-destructive/10 mb-3">
          <AlertCircle className="w-6 h-6 text-destructive" />
        </div>
        <p className="text-sm font-medium text-destructive">
          Failed to load research papers
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
          <FileText className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          No papers found for this topic yet.
        </p>
      </div>
    );
  }

  function handleToggleSave(paper) {
    const key = String(paper.id ?? paper.doi ?? paper.title);
    setLocalSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{papers.length}</span>{" "}
        paper{papers.length !== 1 ? "s" : ""} found
      </p>
      {papers.map((paper, i) => {
        const key = String(paper.id ?? paper.doi ?? paper.title ?? i);
        return (
          <PaperCard
            key={`paper-${key}-${i}`}
            paper={paper}
            topicId={topicId}
            isSaved={localSavedIds.has(key)}
            onToggleSave={handleToggleSave}
          />
        );
      })}
    </div>
  );
}