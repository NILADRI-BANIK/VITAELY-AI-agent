"use client";

import { useState, useRef, useEffect } from "react";
import {
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Bookmark,
  BookmarkCheck,
  Copy,
  Check,
  Tag,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Gauge,
  Database,
  Swords,
  Unlock,
  Clock,
  Info,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";

// ─── TopicSkeleton ────────────────────────────────────────────────────────────

function TopicSkeleton({ count = 4 }) {
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
              <Skeleton className="h-6 w-16 rounded-full shrink-0" />
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

// ─── TopicCard ────────────────────────────────────────────────────────────────

function TopicCard({
  topic,
  onSelect,
  onSave,
  savedIds,
  onCompareToggle,
  isComparing,
  compareDisabled,
}) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef(null);
  useEffect(() => {
    return () => clearTimeout(copyTimerRef.current);
  }, []);
  const id = topic.id ?? topic.topic ?? topic.title ?? null;
  const isSaved =
    id && savedIds instanceof Set ? savedIds.has(String(id)) : false;

  const title = topic.topic ?? topic.title ?? topic.name ?? "Untitled Topic";
  const problemStatement =
    topic.problemStatement ??
    topic.problem_statement ??
    topic.description ??
    null;
  const researchGap =
    topic.researchGap ?? topic.research_gap ?? topic.gap ?? null;
  const recommendationReason =
    topic.rationale ??
    topic.recommendationReason ??
    topic.recommendation_reason ??
    null;
  const keywords = Array.isArray(topic.keywords) ? topic.keywords : [];
  const domain = topic.domain ?? null;
  const paperCount = topic.paperCount ?? topic.paper_count ?? null;
  const difficulty = topic.difficulty ?? null;
  const noveltyScore = topic.noveltyScore ?? topic.novelty_score ?? null;
  const feasibilityScore =
    topic.feasibilityScore ?? topic.feasibility_score ?? null;
  const trendScore = topic.trendScore ?? topic.trend_score ?? null;
  const hasDataset =
    topic.hasDataset ?? topic.has_dataset ?? topic.datasetAvailable ?? null;
  const competitionLevel =
    topic.competitionLevel ?? topic.competition_level ?? null;
  const openAccessRatio =
    topic.openAccessRatio ?? topic.open_access_ratio ?? null;
  const estimatedDuration =
    topic.estimatedDuration ?? topic.estimated_duration ?? null;
  const source = topic.source ?? (topic.validated ? "OpenAlex" : "AI Generated");

  const difficultyColor =
    {
      easy: "bg-green-500/10 text-green-600 border-green-500/20",
      medium: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      hard: "bg-red-500/10 text-red-600 border-red-500/20",
    }[difficulty?.toLowerCase()] ??
    "bg-muted text-muted-foreground border-border";

  const competitionColor =
    {
      low: "bg-green-500/10 text-green-600 border-green-500/20",
      medium: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      high: "bg-red-500/10 text-red-600 border-red-500/20",
    }[competitionLevel?.toLowerCase()] ??
    "bg-muted text-muted-foreground border-border";

  const scoreColor = (score) => {
    if (score == null) return "bg-muted text-muted-foreground border-border";
    if (score >= 70) return "bg-green-500/10 text-green-600 border-green-500/20";
    if (score >= 40)
      return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
    return "bg-red-500/10 text-red-600 border-red-500/20";
  };

  const TrendIcon =
    trendScore == null
      ? Minus
      : trendScore >= 60
        ? TrendingUp
        : trendScore <= 35
          ? TrendingDown
          : Minus;

  async function handleCopy() {
    const text = [
      `Topic: ${title}`,
      problemStatement ? `Problem: ${problemStatement}` : null,
      researchGap ? `Research Gap: ${researchGap}` : null,
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

  const hasMore = researchGap || keywords.length > 0;
  const hasScores =
    noveltyScore != null || feasibilityScore != null || trendScore != null;
  const hasResearchBadges =
    hasDataset != null ||
    competitionLevel != null ||
    openAccessRatio != null ||
    estimatedDuration != null;

  return (
    <Card className="w-full border border-border hover:border-primary/40 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0 flex-1">
            {onCompareToggle && (
              <Checkbox
                checked={!!isComparing}
                disabled={!isComparing && compareDisabled}
                onCheckedChange={() => onCompareToggle?.(topic)}
                className="mt-1 shrink-0"
              />
            )}
            <div className="p-2 rounded-md bg-primary/10 shrink-0 mt-0.5">
              <Lightbulb className="w-4 h-4 text-primary" />
            </div>
            <CardTitle className="text-sm font-semibold leading-snug">
              {title}
            </CardTitle>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-muted text-muted-foreground border-border">
              {source}
            </span>
            {domain && (
              <Badge variant="outline" className="text-xs capitalize">
                {domain}
              </Badge>
            )}
            {difficulty && (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${difficultyColor}`}
              >
                {difficulty}
              </span>
            )}
            {paperCount != null && (
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {typeof paperCount === "number"
                  ? paperCount.toLocaleString()
                  : paperCount}{" "}
                papers
              </span>
            )}
          </div>
        </div>

        {hasScores && (
          <div className="flex items-center gap-1.5 flex-wrap pt-2">
            {trendScore != null && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${scoreColor(trendScore)}`}
              >
                <TrendIcon className="w-3 h-3" />
                Trend {trendScore}
              </span>
            )}
            {noveltyScore != null && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${scoreColor(noveltyScore)}`}
              >
                <Sparkles className="w-3 h-3" />
                Novelty {noveltyScore}
              </span>
            )}
            {feasibilityScore != null && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${scoreColor(feasibilityScore)}`}
              >
                <Gauge className="w-3 h-3" />
                Feasibility {feasibilityScore}
              </span>
            )}
          </div>
        )}

        {hasResearchBadges && (
          <div className="flex items-center gap-1.5 flex-wrap pt-1.5">
            {hasDataset != null && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                  hasDataset
                    ? "bg-green-500/10 text-green-600 border-green-500/20"
                    : "bg-muted text-muted-foreground border-border"
                }`}
              >
                <Database className="w-3 h-3" />
                {hasDataset ? "Dataset Available" : "No Public Dataset"}
              </span>
            )}
            {competitionLevel != null && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${competitionColor}`}
              >
                <Swords className="w-3 h-3" />
                {competitionLevel} Competition
              </span>
            )}
            {openAccessRatio != null && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border bg-blue-500/10 text-blue-600 border-blue-500/20">
                <Unlock className="w-3 h-3" />
                {Math.round(openAccessRatio)}% Open Access
              </span>
            )}
            {estimatedDuration != null && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border bg-muted text-muted-foreground border-border">
                <Clock className="w-3 h-3" />
                {estimatedDuration}
              </span>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {recommendationReason && (
          <div className="flex items-start gap-2 rounded-lg bg-primary/5 border border-primary/10 px-3 py-2">
            <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-foreground leading-relaxed">
              <span className="font-medium">Why recommended: </span>
              {recommendationReason}
            </p>
          </div>
        )}

        {problemStatement && (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Problem Statement
            </span>
            <p className="text-sm text-foreground leading-relaxed">
              {problemStatement}
            </p>
          </div>
        )}

        {expanded && (
          <>
            {researchGap && (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Research Gap
                </span>
                <p className="text-sm text-foreground leading-relaxed">
                  {researchGap}
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
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onSelect?.(topic)}
          >
            Use This Topic
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
              onClick={() => onSave?.(topic)}
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

// ─── CompareActionBar ─────────────────────────────────────────────────────────

function CompareActionBar({ count, maxCompare, onCompare, onClear }) {
  if (count === 0) return null;

  return (
    <div className="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-background shadow-lg px-4 py-3">
      <p className="text-sm text-foreground">
        <span className="font-medium">{count}</span> of {maxCompare} topics
        selected for comparison
      </p>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={onClear} className="px-2">
          <X className="w-4 h-4" />
        </Button>
        <Button size="sm" onClick={onCompare} disabled={count < 2}>
          Compare Topics
        </Button>
      </div>
    </div>
  );
}

// ─── TopicList ────────────────────────────────────────────────────────────────

export default function TopicList({
  topics = [],
  loading = false,
  error = null,
  savedIds,
  onSelect,
  onSave,
  onCompareToggle,
  compareIds,
  onCompare,
  onClearCompare,
  maxCompare = 4,
  emptyMessage = "No topics generated yet. Enter a domain to get started.",
}) {
  if (loading) {
    return <TopicSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-3 rounded-full bg-destructive/10 mb-3">
          <AlertCircle className="w-6 h-6 text-destructive" />
        </div>
        <p className="text-sm font-medium text-destructive">
          Failed to load topics
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {typeof error === "string" ? error : "An unexpected error occurred."}
        </p>
      </div>
    );
  }

  if (!Array.isArray(topics) || topics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-3 rounded-full bg-muted mb-3">
          <AlertCircle className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  const compareSet = compareIds instanceof Set ? compareIds : new Set();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{topics.length}</span>{" "}
          topic{topics.length !== 1 ? "s" : ""} suggested
        </p>
      </div>
      {topics.map((topic, i) => {
        const topicKey = String(topic.id ?? topic.topic ?? topic.title ?? i);
        return (
          <TopicCard
            key={`topic-${topicKey}-${i}`}
            topic={topic}
            onSelect={onSelect}
            onSave={onSave}
            savedIds={savedIds}
            onCompareToggle={onCompareToggle}
            isComparing={compareSet.has(topicKey)}
            compareDisabled={compareSet.size >= maxCompare}
          />
        );
      })}

      {onCompareToggle && (
        <CompareActionBar
          count={compareSet.size}
          maxCompare={maxCompare}
          onCompare={onCompare}
          onClear={onClearCompare}
        />
      )}
    </div>
  );
}