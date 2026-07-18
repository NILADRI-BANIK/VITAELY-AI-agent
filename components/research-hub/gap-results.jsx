"use client";

import { useState, useRef, useEffect } from "react";
import {
  TrendingUp,
  AlertCircle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  Tag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// ─── GapSkeleton ──────────────────────────────────────────────────────────────

function GapSkeleton({ count = 4 }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="w-full">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-1">
                <Skeleton className="w-8 h-8 rounded-md shrink-0" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full shrink-0" />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-4/6" />
            <div className="flex gap-2 mt-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-5 w-16 rounded-full" />
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

// ─── GapCard ──────────────────────────────────────────────────────────────────

function GapCard({ gap, onSelect, onSave, savedIds }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(copyTimerRef.current);
  }, []);

  const id = gap.id ?? gap.title ?? gap.gap ?? null;
  const isSaved = id && savedIds instanceof Set ? savedIds.has(String(id)) : false;

  const title = gap.title ?? gap.gap ?? gap.name ?? "Untitled Gap";
  const type = gap.type ?? null; // "gap" | "open_problem" | "trending"
  const description = gap.description ?? gap.summary ?? null;
  const opportunity = gap.opportunity ?? gap.potential ?? null;
  const keywords = Array.isArray(gap.keywords) ? gap.keywords : [];
  const domain = gap.domain ?? null;
  const paperCount = gap.paperCount ?? gap.paper_count ?? null;
  const year = gap.year ?? null;

  const typeConfig = {
    gap: {
      label: "Research Gap",
      icon: AlertCircle,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      badge: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    },
    open_problem: {
      label: "Open Problem",
      icon: Lightbulb,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      badge: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    },
    trending: {
      label: "Trending Topic",
      icon: TrendingUp,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      badge: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    },
  };

  const config = typeConfig[type?.toLowerCase()] ?? {
    label: type ?? "Research Gap",
    icon: AlertCircle,
    color: "text-primary",
    bg: "bg-primary/10",
    badge: "bg-primary/10 text-primary border-primary/20",
  };

  const Icon = config.icon;
  const hasMore = opportunity || keywords.length > 0;

  async function handleCopy() {
    const text = [
      `Gap: ${title}`,
      description ? `Description: ${description}` : null,
      opportunity ? `Opportunity: ${opportunity}` : null,
      keywords.length > 0 ? `Keywords: ${keywords.join(", ")}` : null,
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
    <Card className="w-full border border-border hover:border-primary/40 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0 flex-1">
            <div className={`p-2 rounded-md ${config.bg} shrink-0 mt-0.5`}>
              <Icon className={`w-4 h-4 ${config.color}`} />
            </div>
            <CardTitle className="text-sm font-semibold leading-snug">
              {title}
            </CardTitle>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${config.badge}`}
            >
              {config.label}
            </span>
            {domain && (
              <Badge variant="outline" className="text-xs capitalize">
                {domain}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {description && (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Description
            </span>
            <p className="text-sm text-foreground leading-relaxed">
              {description}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {paperCount != null && (
            <span className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                {typeof paperCount === "number"
                  ? paperCount.toLocaleString()
                  : paperCount}
              </span>{" "}
              related papers
            </span>
          )}
          {year != null && (
            <span className="text-xs text-muted-foreground">
              Since <span className="font-medium text-foreground">{year}</span>
            </span>
          )}
        </div>

        {expanded && (
          <>
            {opportunity && (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Research Opportunity
                </span>
                <p className="text-sm text-foreground leading-relaxed">
                  {opportunity}
                </p>
              </div>
            )}

            {keywords.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Keywords
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {keywords.map((kw, i) => (
                    <span
                      key={`kw-${kw}-${i}`}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-secondary text-secondary-foreground border border-border"
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex items-center gap-2 pt-1">
          <Button size="sm" className="flex-1" onClick={() => onSelect?.(gap)}>
            Explore This Gap
          </Button>

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
              onClick={() => onSave?.(gap)}
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

// ─── GapResults ───────────────────────────────────────────────────────────────

export default function GapResults({
  gaps = [],
  loading = false,
  error = null,
  savedIds,
  onSelect,
  onSave,
  emptyMessage = "No gaps found. Try searching a different domain or topic.",
}) {
  if (loading) {
    return <GapSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-3 rounded-full bg-destructive/10 mb-3">
          <AlertCircle className="w-6 h-6 text-destructive" />
        </div>
        <p className="text-sm font-medium text-destructive">
          Failed to load gaps
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {typeof error === "string" ? error : "An unexpected error occurred."}
        </p>
      </div>
    );
  }

  if (!Array.isArray(gaps) || gaps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-3 rounded-full bg-muted mb-3">
          <AlertCircle className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  const gapCount = gaps.filter((g) => g.type?.toLowerCase() === "gap").length;
  const openProblemCount = gaps.filter(
    (g) => g.type?.toLowerCase() === "open_problem",
  ).length;
  const trendingCount = gaps.filter(
    (g) => g.type?.toLowerCase() === "trending",
  ).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{gaps.length}</span>{" "}
          result{gaps.length !== 1 ? "s" : ""} found
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {gapCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500/10 text-orange-600 border border-orange-500/20">
              <AlertCircle className="w-3 h-3" />
              {gapCount} gap{gapCount !== 1 ? "s" : ""}
            </span>
          )}
          {openProblemCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-600 border border-purple-500/20">
              <Lightbulb className="w-3 h-3" />
              {openProblemCount} open problem{openProblemCount !== 1 ? "s" : ""}
            </span>
          )}
          {trendingCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 border border-blue-500/20">
              <TrendingUp className="w-3 h-3" />
              {trendingCount} trending
            </span>
          )}
        </div>
      </div>

      {gaps.map((gap, i) => (
        <GapCard
          key={`gap-${gap.id ?? gap.title ?? gap.gap ?? i}-${i}`}
          gap={gap}
          onSelect={onSelect}
          onSave={onSave}
          savedIds={savedIds}
        />
      ))}
    </div>
  );
}
