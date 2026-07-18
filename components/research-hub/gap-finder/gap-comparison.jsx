"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { DifficultyBadge } from "@/components/research-hub/gap-finder/difficulty-badge";
import {
  Scale,
  Gauge,
  FileText,
  Percent,
  Tag as TagIcon,
  Layers,
} from "lucide-react";

function getGapTitle(gap) {
  return gap.gap ?? gap.title ?? gap.gapTitle ?? "Untitled Gap";
}

function MetricRow({ icon: Icon, label, gaps, render }) {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="py-2.5 px-3 text-muted-foreground flex items-center gap-1.5 whitespace-nowrap">
        <Icon className="w-3.5 h-3.5 shrink-0" />
        {label}
      </td>
      {gaps.map((gap, i) => (
        <td key={i} className="py-2.5 px-3 align-top">
          {render(gap)}
        </td>
      ))}
    </tr>
  );
}

export function GapComparison({ gaps = [], open, onOpenChange, onRemove }) {
  const validGaps = Array.isArray(gaps) ? gaps.slice(0, 3) : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="w-4 h-4" />
            Compare Research Gaps
          </DialogTitle>
        </DialogHeader>

        {validGaps.length < 2 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            Select at least 2 gaps to compare.
          </p>
        ) : (
          <ScrollArea className="flex-1 min-h-0 pr-3">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium border-b border-border">
                      Metric
                    </th>
                    {validGaps.map((gap, i) => (
                      <th
                        key={i}
                        className="text-left py-2 px-3 font-semibold border-b border-border min-w-[180px]"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="line-clamp-2">{getGapTitle(gap)}</span>
                          {onRemove && (
                            <button
                              type="button"
                              onClick={() => onRemove(gap)}
                              className="text-xs text-muted-foreground hover:text-destructive shrink-0"
                              aria-label="Remove from comparison"
                              title="Remove from comparison"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <MetricRow
                    icon={Gauge}
                    label="Difficulty"
                    gaps={validGaps}
                    render={(gap) => (
                      <DifficultyBadge difficulty={gap.difficulty ?? "medium"} />
                    )}
                  />
                  <MetricRow
                    icon={Layers}
                    label="Impact Score"
                    gaps={validGaps}
                    render={(gap) => (
                      <span className="font-semibold">
                        {(gap.impactScore ?? 0).toFixed(1)}/10
                      </span>
                    )}
                  />
                  <MetricRow
                    icon={Percent}
                    label="Confidence"
                    gaps={validGaps}
                    render={(gap) =>
                      gap.confidence != null ? (
                        <span className="font-semibold">
                          {Math.round(gap.confidence)}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )
                    }
                  />
                  <MetricRow
                    icon={FileText}
                    label="Total Papers"
                    gaps={validGaps}
                    render={(gap) => (
                      <span className="font-semibold">
                        {(gap.totalPaperCount ?? 0).toLocaleString()}
                      </span>
                    )}
                  />
                  <MetricRow
                    icon={Scale}
                    label="Score"
                    gaps={validGaps}
                    render={(gap) => (
                      <span className="font-semibold">{gap.score ?? 0}</span>
                    )}
                  />
                  <MetricRow
                    icon={TagIcon}
                    label="Domain"
                    gaps={validGaps}
                    render={(gap) =>
                      gap.domain ?? <span className="text-muted-foreground">—</span>
                    }
                  />
                  <tr>
                    <td className="py-2.5 px-3 text-muted-foreground align-top">
                      Keywords
                    </td>
                    {validGaps.map((gap, i) => (
                      <td key={i} className="py-2.5 px-3 align-top">
                        <div className="flex flex-wrap gap-1">
                          {(gap.keywords ?? []).slice(0, 6).map((kw, j) => (
                            <span
                              key={j}
                              className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </ScrollArea>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange?.(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}