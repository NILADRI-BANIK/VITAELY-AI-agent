"use client";

import {
  ArrowDownAZ,
  Flame,
  Quote,
  Clock,
  Unlock,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const SORT_OPTIONS = [
  { key: "relevance", label: "Relevance", icon: SlidersHorizontal },
  { key: "latest", label: "Latest", icon: Clock },
  { key: "most-cited", label: "Most Cited", icon: Quote },
  { key: "trending", label: "Trending", icon: Flame },
  { key: "az", label: "A–Z", icon: ArrowDownAZ },
];

const LEVEL_OPTIONS = [
  { key: "all", label: "All Levels" },
  { key: "beginner", label: "Beginner" },
  { key: "intermediate", label: "Intermediate" },
  { key: "advanced", label: "Advanced" },
];

function SortDropdown({ sortBy, onSortChange, availableSorts }) {
  const options = availableSorts
    ? SORT_OPTIONS.filter((o) => availableSorts.includes(o.key))
    : SORT_OPTIONS;

  return (
    <select
      value={sortBy}
      onChange={(e) => onSortChange?.(e.target.value)}
      className="text-sm rounded-lg border border-input bg-background px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30"
    >
      {options.map((o) => (
        <option key={o.key} value={o.key}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function ToggleChip({ active, onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background border-input text-muted-foreground hover:border-primary/50"
      }`}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {label}
    </button>
  );
}

export default function FiltersBar({
  sortBy = "relevance",
  onSortChange,
  availableSorts,
  openAccessOnly = false,
  onOpenAccessChange,
  showOpenAccess = false,
  level = "all",
  onLevelChange,
  showLevel = false,
  searchTerm = "",
  onSearchChange,
  showSearch = false,
  resultCount,
  onClearAll,
}) {
  const hasActiveFilters =
    sortBy !== "relevance" ||
    openAccessOnly ||
    level !== "all" ||
    (searchTerm && searchTerm.trim().length > 0);

  return (
    <div className="flex flex-col gap-3 pb-4 border-b border-border">
      <div className="flex items-center gap-2 flex-wrap justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {showSearch && (
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search within results..."
              className="text-sm rounded-lg border border-input bg-background px-3 py-1.5 w-48 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          )}

          <SortDropdown
            sortBy={sortBy}
            onSortChange={onSortChange}
            availableSorts={availableSorts}
          />

          {showLevel && (
            <select
              value={level}
              onChange={(e) => onLevelChange?.(e.target.value)}
              className="text-sm rounded-lg border border-input bg-background px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {LEVEL_OPTIONS.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
          )}

          {showOpenAccess && (
            <ToggleChip
              active={openAccessOnly}
              onClick={() => onOpenAccessChange?.(!openAccessOnly)}
              icon={Unlock}
              label="Open Access Only"
            />
          )}

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

        {resultCount != null && (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {resultCount.toLocaleString()} result{resultCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
}