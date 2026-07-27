"use client";

import { useState, useRef, useEffect } from "react";
import {
  BookMarked,
  ExternalLink,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  ChevronUp,
  Hash,
  Globe,
  Calendar,
  Tag,
  AlertCircle,
  Award,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const EMPTY_SET = new Set();

function JournalCardSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={`skel-${i}`} className="flex flex-col h-full">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-1">
                <Skeleton className="w-8 h-8 rounded-md shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-6 w-16 rounded-full shrink-0" />
            </div>
            <Skeleton className="h-3 w-full mt-2" />
            <Skeleton className="h-3 w-5/6" />
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="flex gap-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex gap-2 mt-1">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton
                  key={`skel-tag-${i}-${j}`}
                  className="h-5 w-16 rounded-full"
                />
              ))}
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

function JournalCard({ journal, onSave, savedIds = EMPTY_SET }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(copyTimerRef.current);
  }, []);

  const id = journal.id ?? journal.issn ?? journal.name ?? null;
  const isSaved =
    id && savedIds instanceof Set ? savedIds.has(String(id)) : false;

  const name = journal.name ?? journal.title ?? "Untitled Publication";
  const publisher = journal.publisher ?? null;
  const description = journal.description ?? journal.scope ?? null;
  const issn = journal.issn ?? journal.ISSN ?? null;
  const eissn = journal.eissn ?? journal.eISSN ?? null;
  const type = journal.type ?? journal.venueType ?? null; // "journal" | "conference" | "workshop"
  const impactFactor = journal.impactFactor ?? journal.impact_factor ?? null;
  const hIndex = journal.hIndex ?? journal.h_index ?? null;
  const acceptanceRate =
    journal.acceptanceRate ?? journal.acceptance_rate ?? null;
  const submissionUrl =
    [journal.submissionUrl, journal.submission_url, journal.submitUrl].find(
      (u) => u && typeof u === "string" && u.startsWith("http"),
    ) ?? null;
  const homepageUrl =
    [journal.url, journal.homepage, journal.website].find(
      (u) => u && typeof u === "string" && u.startsWith("http"),
    ) ?? null;
  const deadline =
    journal.deadline ??
    journal.submissionDeadline ??
    journal.submission_deadline ??
    null;
  const openAccess =
    journal.openAccess === true || journal.open_access === true;
  const subjects = Array.isArray(journal.subjects)
    ? journal.subjects
    : Array.isArray(journal.tags)
      ? journal.tags
      : [];
  const country = journal.country ?? null;

  const typeConfig = {
    journal: {
      label: "Journal",
      badge: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    },
    conference: {
      label: "Conference",
      badge: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    },
    workshop: {
      label: "Workshop",
      badge: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    },
  };

  const typeLower = typeof type === "string" ? type.toLowerCase() : "";
  const typeBadge =
    typeConfig[typeLower]?.badge ??
    "bg-primary/10 text-primary border-primary/20";
  const typeLabel = typeConfig[typeLower]?.label ?? (type || "Publication");

  const hasMore =
    description != null ||
    subjects.length > 0 ||
    impactFactor != null ||
    hIndex != null ||
    acceptanceRate != null;

  async function handleCopy() {
    const text = [
      `Publication: ${name}`,
      publisher ? `Publisher: ${publisher}` : null,
      issn ? `ISSN: ${issn}` : null,
      eissn ? `eISSN: ${eissn}` : null,
      description ? `Scope: ${description}` : null,
      impactFactor != null ? `Impact Factor: ${impactFactor}` : null,
      acceptanceRate != null ? `Acceptance Rate: ${acceptanceRate}` : null,
      deadline ? `Deadline: ${deadline}` : null,
      subjects.length > 0 ? `Subjects: ${subjects.join(", ")}` : null,
      submissionUrl ? `Submission: ${submissionUrl}` : null,
    ]
      .filter(Boolean)
      .join("\n");

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
    <Card className="flex flex-col h-full border border-border hover:border-primary/40 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0 flex-1">
            <div className="p-2 rounded-md bg-primary/10 shrink-0 mt-0.5">
              <BookMarked className="w-4 h-4 text-primary" />
            </div>
            <div className="flex flex-col min-w-0">
              <CardTitle className="text-sm font-semibold leading-snug line-clamp-2">
                {name}
              </CardTitle>
              {publisher && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {publisher}
                </p>
              )}
            </div>
          </div>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border shrink-0 ${typeBadge}`}
          >
            {typeLabel}
          </span>
        </div>

        <div className="flex flex-wrap gap-3 mt-2">
          {issn && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Hash className="w-3 h-3" />
              ISSN {issn}
            </span>
          )}
          {country && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Globe className="w-3 h-3" />
              {country}
            </span>
          )}
          {deadline && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {deadline}
            </span>
          )}
          {openAccess && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 border border-green-500/20">
              Open Access
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 flex-1">
        {expanded && (
          <>
            {description && (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Scope
                </span>
                <p className="text-sm text-foreground leading-relaxed">
                  {description}
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {impactFactor != null && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                    Impact Factor
                  </span>
                  <span className="text-sm font-semibold text-foreground flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-primary" />
                    {typeof impactFactor === "number"
                      ? impactFactor.toFixed(2)
                      : impactFactor}
                  </span>
                </div>
              )}
              {hIndex != null && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                    H-Index
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {typeof hIndex === "number"
                      ? hIndex.toLocaleString()
                      : hIndex}
                  </span>
                </div>
              )}
              {acceptanceRate != null && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                    Acceptance Rate
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {typeof acceptanceRate === "number"
                      ? `${acceptanceRate}%`
                      : acceptanceRate}
                  </span>
                </div>
              )}
            </div>

            {subjects.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Subjects
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {subjects.map((subject, i) => {
                    const text =
                      typeof subject === "string"
                        ? subject
                        : (subject?.name ?? "");
                    if (!text) return null;
                    return (
                      <span
                        key={`subject-${text}-${i}`}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-secondary text-secondary-foreground border border-border"
                      >
                        <Tag className="w-2.5 h-2.5" />
                        {text}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex items-center gap-2 mt-auto pt-2">
          {submissionUrl ? (
            <Button size="sm" className="flex-1" asChild>
              <a href={submissionUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3 h-3 mr-1" />
                Submit Paper
              </a>
            </Button>
          ) : homepageUrl ? (
            <Button size="sm" className="flex-1" asChild>
              <a href={homepageUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3 h-3 mr-1" />
                Visit Site
              </a>
            </Button>
          ) : (
            <Button size="sm" className="flex-1" disabled>
              No Link Available
            </Button>
          )}

          {submissionUrl && homepageUrl && (
            <Button size="sm" variant="outline" asChild className="px-2">
              <a href={homepageUrl} target="_blank" rel="noopener noreferrer">
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
              onClick={() => onSave?.(journal)}
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

export default function JournalResults({
  journals = [],
  loading = false,
  error = null,
  savedIds,
  onSave,
  emptyMessage = "No journals or venues found. Try a different search query.",
}) {
  if (loading) {
    return <JournalCardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-3 rounded-full bg-destructive/10 mb-3">
          <AlertCircle className="w-6 h-6 text-destructive" />
        </div>
        <p className="text-sm font-medium text-destructive">
          Failed to load publications
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {typeof error === "string" ? error : "An unexpected error occurred."}
        </p>
      </div>
    );
  }

  if (!Array.isArray(journals) || journals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-3 rounded-full bg-muted mb-3">
          <BookMarked className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {journals.map((journal, i) => (
        <JournalCard
          key={`journal-${journal.id ?? journal.issn ?? journal.name ?? i}-${i}`}
          journal={journal}
          onSave={onSave}
          savedIds={savedIds}
        />
      ))}
    </div>
  );
}

export { JournalCardSkeleton, JournalCard };
