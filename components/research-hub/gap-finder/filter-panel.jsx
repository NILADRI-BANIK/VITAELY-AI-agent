"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DifficultyBadge } from "@/components/research-hub/gap-finder/difficulty-badge";

const DIFFICULTY_OPTIONS = ["low", "medium", "high"];

const TYPE_OPTIONS = [
  { key: "gap", label: "Research Gap" },
  { key: "open_problem", label: "Open Problem" },
  { key: "trending", label: "Trending" },
];

const IMPACT_OPTIONS = [
  { key: 0, label: "Any Impact" },
  { key: 4, label: "4+" },
  { key: 7, label: "7+" },
];

export function FilterPanel({
  selectedDifficulties = [],
  onDifficultyToggle,
  onResetDifficulty,
  selectedTypes = [],
  onTypeToggle,
  onResetType,
  minImpact = 0,
  onMinImpactChange,
  minPapers = "",
  onMinPapersChange,
  onClearAll,
}) {
  const activeFilterCount =
    selectedDifficulties.length +
    selectedTypes.length +
    (minImpact > 0 ? 1 : 0) +
    (minPapers !== "" && Number(minPapers) > 0 ? 1 : 0);

  const hasActiveFilters = activeFilterCount > 0;

  return (
    <div className="flex flex-col gap-3 pb-4 border-b border-border">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
        </span>
        {hasActiveFilters && onClearAll && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onClearAll}
            className="text-xs h-7 px-2"
          >
            <X className="w-3.5 h-3.5 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Difficulty
          </span>
          {selectedDifficulties.length > 0 && onResetDifficulty && (
            <button
              type="button"
              onClick={onResetDifficulty}
              className="text-[10px] text-muted-foreground hover:text-foreground underline"
            >
              Reset
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {DIFFICULTY_OPTIONS.map((d) => {
            const active = selectedDifficulties.includes(d);
            return (
              <button
                key={d}
                type="button"
                onClick={() => onDifficultyToggle?.(d)}
                aria-pressed={active}
                className={`transition-opacity ${
                  active ? "opacity-100" : "opacity-40 hover:opacity-70"
                }`}
              >
                <DifficultyBadge difficulty={d} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Type
          </span>
          {selectedTypes.length > 0 && onResetType && (
            <button
              type="button"
              onClick={onResetType}
              className="text-[10px] text-muted-foreground hover:text-foreground underline"
            >
              Reset
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TYPE_OPTIONS.map((t) => {
            const active = selectedTypes.includes(t.key);
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => onTypeToggle?.(t.key)}
                aria-pressed={active}
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-input text-muted-foreground hover:border-primary/50"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Impact Score
          </span>
          <select
            value={minImpact}
            onChange={(e) => onMinImpactChange?.(Number(e.target.value))}
            className="text-sm rounded-lg border border-input bg-background px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {IMPACT_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Min. Papers
          </span>
          <input
            type="number"
            min={0}
            value={minPapers}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "") {
                onMinPapersChange?.("");
                return;
              }
              const num = Math.max(0, parseInt(val, 10) || 0);
              onMinPapersChange?.(String(num));
            }}
            placeholder="0"
            className="text-sm rounded-lg border border-input bg-background px-3 py-1.5 w-24 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>
    </div>
  );
}