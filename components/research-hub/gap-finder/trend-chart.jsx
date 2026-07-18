"use client";

import { BarChart3 } from "lucide-react";

export function TrendChart({ timeline = [], loading = false }) {
  if (loading) {
    return (
      <div className="flex items-end gap-1.5 h-24 animate-pulse">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-muted rounded-t"
            style={{ height: `${20 + (i % 5) * 10}px` }}
          />
        ))}
      </div>
    );
  }

  if (!Array.isArray(timeline) || timeline.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <BarChart3 className="w-5 h-5 text-muted-foreground mb-1.5" />
        <p className="text-sm text-muted-foreground">
          No publication trend data available.
        </p>
      </div>
    );
  }

  const maxCount = Math.max(...timeline.map((t) => t.count ?? 0), 1);
  const totalCount = timeline.reduce((sum, t) => sum + (t.count ?? 0), 0);
  const peakYear = timeline.reduce(
    (peak, t) => ((t.count ?? 0) > (peak?.count ?? -1) ? t : peak),
    null
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-end gap-1.5 h-24">
        {timeline.map((t) => (
          <div
            key={t.year}
            className="flex flex-col items-center gap-1 flex-1 min-w-0 group"
          >
            <div
              className={`w-full rounded-t transition-colors ${
                peakYear && t.year === peakYear.year
                  ? "bg-primary"
                  : "bg-primary/20 group-hover:bg-primary/40"
              }`}
              style={{
                height: `${Math.max(4, (t.count / maxCount) * 64)}px`,
              }}
              title={`${t.year}: ${t.count} papers`}
            />
            <span className="text-[9px] text-muted-foreground">{t.year}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>{totalCount.toLocaleString()} papers total</span>
        {peakYear && (
          <span>
            Peak: {peakYear.year} ({peakYear.count})
          </span>
        )}
      </div>
    </div>
  );
}