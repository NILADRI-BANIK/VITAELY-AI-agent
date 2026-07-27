"use client";

import { useState, useRef, useEffect, useMemo } from "react";
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
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DifficultyBadge } from "@/components/research-hub/gap-finder/difficulty-badge";
import { ImpactScore } from "@/components/research-hub/gap-finder/impact-score";

const TYPE_CONFIG = {
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

function getTypeConfig(type) {
  return (
    TYPE_CONFIG[type?.toLowerCase()] ?? {
      label: type ?? "Research Gap",
      icon: AlertCircle,
      color: "text-primary",
      bg: "bg-primary/10",
      badge: "bg-primary/10 text-primary border-primary/20",
    }
  );
}

export function GapCard({
  gap,
  onSelect,
  onSave,
  isSaved = false,
  saving = false,
  compareMode = false,
  isCompareSelected = false,
  onCompareToggle,
  compareDisabled = false,
}) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(copyTimerRef.current);
  }, []);

  const title = gap.gap ?? gap.title ?? gap.gapTitle ?? "Untitled Gap";
  const type = gap.type ?? null;
  const description = gap.description ?? gap.summary ?? null;
  const opportunity = gap.opportunity ?? gap.why ?? null;
  const keywords = Array.isArray(gap.keywords) ? gap.keywords : [];
  const domain = gap.domain ?? null;
  const paperCount = gap.totalPaperCount ?? gap.paperCount ?? null;
  const difficulty = gap.difficulty ?? "medium";
  const impactScore = gap.impactScore ?? 0;
  const confidence = gap.confidence;
  const supportingPapers = Array.isArray(gap.supportingPapers)
    ? gap.supportingPapers
    : [];

  const config = useMemo(() => getTypeConfig(type), [type]);
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
            {compareMode && (
              <Checkbox
                checked={isCompareSelected}
                onCheckedChange={() => onCompareToggle?.(gap)}
                disabled={compareDisabled && !isCompareSelected}
                className="mt-1.5 shrink-0"
              />
            )}
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
            <DifficultyBadge difficulty={difficulty} />
            {domain && (
              <Badge variant="outline" className="text-xs capitalize">
                {domain}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <ImpactScore score={impactScore} confidence={confidence} />

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
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <FileText className="w-3 h-3" />
              <span className="font-medium text-foreground">
                {typeof paperCount === "number"
                  ? paperCount.toLocaleString()
                  : paperCount}
              </span>{" "}
              related papers
            </span>
          )}
          {supportingPapers.length > 0 && (
            <span
              className="text-xs text-muted-foreground truncate max-w-[220px]"
              title={supportingPapers[0]?.title}
            >
              <span className="font-medium text-foreground">
                {supportingPapers.length}
              </span>{" "}
              supporting &mdash; &ldquo;{supportingPapers[0]?.title}&rdquo;
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
              aria-label={expanded ? "Collapse details" : "Expand details"}
              title={expanded ? "Collapse details" : "Expand details"}
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
            aria-label={copied ? "Copied" : "Copy gap details"}
            title={copied ? "Copied" : "Copy gap details"}
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
              disabled={saving || isSaved}
              className="px-2"
              aria-label={isSaved ? "Already saved" : "Save gap"}
              title={isSaved ? "Already saved" : "Save gap"}
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
