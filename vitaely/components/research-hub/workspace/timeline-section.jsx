"use client";

import { useState } from "react";
import {
  TrendingUp,
  AlertCircle,
  BarChart3,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function TimelineSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6 flex flex-col gap-4">
        <Skeleton className="h-5 w-40" />
        <div className="flex items-end gap-2 h-48">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton
              key={i}
              className="flex-1 rounded-t-md"
              style={{ height: `${30 + ((i * 13) % 70)}%` }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TimelineBar({ point, maxCount, isHovered, onHover }) {
  const heightPct = maxCount > 0 ? Math.max(4, (point.count / maxCount) * 100) : 4;

  return (
    <div
      className="flex-1 flex flex-col items-center justify-end gap-2 h-full min-w-0"
      onMouseEnter={() => onHover(point.year)}
      onMouseLeave={() => onHover(null)}
    >
      {isHovered && (
        <span className="text-xs font-semibold text-foreground whitespace-nowrap">
          {point.count.toLocaleString()}
        </span>
      )}
      <div
        className={`w-full rounded-t-md transition-colors ${
          isHovered ? "bg-primary" : "bg-primary/60"
        }`}
        style={{ height: `${heightPct}%`, minHeight: "4px" }}
      />
      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
        {point.year}
      </span>
    </div>
  );
}

export default function TimelineSection({
  timeline = [],
  loading = false,
  error = null,
}) {
  const [hoveredYear, setHoveredYear] = useState(null);

  if (loading) return <TimelineSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-3 rounded-full bg-destructive/10 mb-3">
          <AlertCircle className="w-6 h-6 text-destructive" />
        </div>
        <p className="text-sm font-medium text-destructive">
          Failed to load publication timeline
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {typeof error === "string" ? error : "An unexpected error occurred."}
        </p>
      </div>
    );
  }

  const points = Array.isArray(timeline) ? timeline : [];

  if (points.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-3 rounded-full bg-muted mb-3">
          <BarChart3 className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          No timeline data available for this topic yet.
        </p>
      </div>
    );
  }

  const maxCount = Math.max(...points.map((p) => p.count ?? 0), 1);
  const totalPapers = points.reduce((sum, p) => sum + (p.count ?? 0), 0);

  const firstHalf = points.slice(0, Math.floor(points.length / 2));
  const secondHalf = points.slice(Math.floor(points.length / 2));
  const firstHalfSum = firstHalf.reduce((sum, p) => sum + (p.count ?? 0), 0);
  const secondHalfSum = secondHalf.reduce((sum, p) => sum + (p.count ?? 0), 0);

  let growthLabel = "Stable";
  let growthColor = "text-muted-foreground";
  if (firstHalfSum === 0 && secondHalfSum > 0) {
    growthLabel = "Emerging";
    growthColor = "text-green-600";
  } else if (secondHalfSum > firstHalfSum * 1.15) {
    growthLabel = "Growing";
    growthColor = "text-green-600";
  } else if (secondHalfSum < firstHalfSum * 0.85) {
    growthLabel = "Declining";
    growthColor = "text-red-600";
  }

  return (
    <Card>
      <CardContent className="pt-6 flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              Publications per Year
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>
              {totalPapers.toLocaleString()} papers across {points.length} years
            </span>
            <span className={`font-medium ${growthColor}`}>{growthLabel}</span>
          </div>
        </div>

        <div className="flex items-end gap-1.5 sm:gap-2 h-48 w-full">
          {points.map((point) => (
            <TimelineBar
              key={point.year}
              point={point}
              maxCount={maxCount}
              isHovered={hoveredYear === point.year}
              onHover={setHoveredYear}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}