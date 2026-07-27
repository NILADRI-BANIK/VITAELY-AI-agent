"use client";

import { Sparkles, ArrowRight, TrendingUp, Database, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DifficultyBadge } from "@/components/research-hub/gap-finder/difficulty-badge";
import { ImpactScore } from "@/components/research-hub/gap-finder/impact-score";

function getGapTitle(gap) {
  return gap.gap ?? gap.title ?? gap.gapTitle ?? "Untitled Gap";
}

function buildReasons(gap) {
  const reasons = [];

  if (gap.difficulty === "low") {
    reasons.push({ icon: TrendingUp, text: "Low difficulty, high feasibility" });
  }
  if ((gap.confidence ?? 0) >= 80) {
    reasons.push({ icon: Sparkles, text: "High AI confidence" });
  }
  if ((gap.totalPaperCount ?? 0) > 0) {
    reasons.push({
      icon: Database,
      text: `${gap.totalPaperCount.toLocaleString()} supporting papers available`,
    });
  }
  if ((gap.impactScore ?? 0) >= 7) {
    reasons.push({ icon: Users, text: "High research impact potential" });
  }

  return reasons.slice(0, 4);
}

export function RecommendationPanel({ gaps = [], onSelect }) {
  if (!Array.isArray(gaps) || gaps.length === 0) return null;

  const best = [...gaps].sort(
    (a, b) => (b.impactScore ?? b.score ?? 0) - (a.impactScore ?? a.score ?? 0)
  )[0];

  if (!best) return null;

  const title = getGapTitle(best);
  const description = best.description ?? best.why ?? "";
  const reasons = buildReasons(best);

  return (
    <Card className="w-full border-2 border-primary/40 bg-primary/5">
      <CardContent className="pt-5 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/15">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <span className="text-xs font-semibold text-primary uppercase tracking-wide">
            Recommended Gap
          </span>
        </div>

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground leading-snug">
              {title}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {description}
              </p>
            )}
          </div>
          <DifficultyBadge difficulty={best.difficulty ?? "medium"} />
        </div>

        <ImpactScore score={best.impactScore ?? 0} confidence={best.confidence} />

        {reasons.length > 0 && (
          <div className="flex flex-col gap-1.5 pt-1">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Best choice because
            </span>
            <ul className="flex flex-col gap-1">
              {reasons.map((r, i) => {
                const Icon = r.icon;
                return (
                  <li
                    key={i}
                    className="flex items-center gap-1.5 text-xs text-foreground"
                  >
                    <Icon className="w-3 h-3 text-primary shrink-0" />
                    {r.text}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <Button size="sm" className="self-start mt-1" onClick={() => onSelect?.(best)}>
          Explore This Gap
          <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
        </Button>
      </CardContent>
    </Card>
  );
}