"use client";

import { AlertCircle, Lightbulb, TrendingUp } from "lucide-react";
import { GapCard } from "@/components/research-hub/gap-finder/gap-card";
import { LoadingSkeleton } from "@/components/research-hub/gap-finder/loading-skeleton";
import { ErrorState } from "@/components/research-hub/gap-finder/error-state";

function getGapKey(gap) {
  return String(gap.id ?? gap.gapTitle ?? gap.gap ?? gap.title ?? "");
}

export function GapList({
  gaps = [],
  loading = false,
  error = null,
  onRetry,
  savedIds,
  savingKey,
  onSelect,
  onSave,
  compareMode = false,
  selectedForCompare = [],
  onCompareToggle,
  maxCompare = 3,
  emptyMessage = "No gaps found. Try searching a different domain or topic.",
}) {
  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={onRetry} />;
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

  const gapCount = gaps.filter((g) => (g.type ?? "gap").toLowerCase() === "gap").length;
  const openProblemCount = gaps.filter(
    (g) => g.type?.toLowerCase() === "open_problem"
  ).length;
  const trendingCount = gaps.filter(
    (g) => g.type?.toLowerCase() === "trending"
  ).length;

  const selectedKeys = new Set(selectedForCompare.map((g) => getGapKey(g)));

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

      {gaps.map((gap, i) => {
        const key = getGapKey(gap) || String(i);
        return (
          <GapCard
            key={`gap-${key}-${i}`}
            gap={gap}
            onSelect={onSelect}
            onSave={onSave}
            isSaved={savedIds instanceof Set ? savedIds.has(key) : false}
            saving={savingKey === key}
            compareMode={compareMode}
            isCompareSelected={selectedKeys.has(key)}
            onCompareToggle={onCompareToggle}
            compareDisabled={selectedForCompare.length >= maxCompare}
          />
        );
      })}
    </div>
  );
}