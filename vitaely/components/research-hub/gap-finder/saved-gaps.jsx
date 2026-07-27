"use client";

import { useState } from "react";
import { Bookmark, Trash2, Loader2, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DifficultyBadge } from "@/components/research-hub/gap-finder/difficulty-badge";

function SavedGapRow({ gap, onView, onDelete, deleting }) {
  return (
    <Card className="w-full border border-border hover:border-primary/40 transition-colors">
      <CardContent className="pt-4 flex items-start justify-between gap-3">
        <div
          className="min-w-0 flex-1 cursor-pointer"
          onClick={() => onView?.(gap)}
        >
          <p className="text-sm font-semibold text-foreground leading-snug line-clamp-1">
            {gap.gapTitle}
          </p>
          {gap.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {gap.description}
            </p>
          )}
          <div className="flex items-center gap-2 flex-wrap mt-2">
            <DifficultyBadge difficulty={gap.difficulty ?? "medium"} />
            {gap.domain && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
                {gap.domain}
              </span>
            )}
            {typeof gap.totalPaperCount === "number" && (
              <span className="text-[10px] text-muted-foreground">
                {gap.totalPaperCount.toLocaleString()} papers
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => onView?.(gap)}
            aria-label="View gap"
            title="View gap"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => onDelete?.(gap)}
            disabled={deleting}
            aria-label="Remove saved gap"
            title="Remove saved gap"
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 text-destructive" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function SavedGaps({
  gaps = [],
  loading = false,
  onView,
  onDelete,
  deletingId,
}) {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!Array.isArray(gaps) || gaps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-3 rounded-full bg-muted mb-3">
          <Bookmark className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          No saved gaps yet. Bookmark a gap to see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{gaps.length}</span>{" "}
        saved gap{gaps.length !== 1 ? "s" : ""}
      </p>
      {gaps.map((gap) => (
        <SavedGapRow
          key={gap.id}
          gap={gap}
          onView={onView}
          onDelete={onDelete}
          deleting={deletingId === gap.id}
        />
      ))}
    </div>
  );
}