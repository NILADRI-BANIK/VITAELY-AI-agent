"use client";

import { Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function TimelineSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Skeleton className="w-7 h-7 rounded-md shrink-0" />
          <Skeleton className="h-4 w-32" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="w-6 h-6 rounded-full shrink-0" />
            <div className="flex-1 flex flex-col gap-1.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function TimelineCard({
  timeline = [],
  loading = false,
  emptyMessage = "No timeline available yet.",
}) {
  if (loading) {
    return <TimelineSkeleton />;
  }

  if (!Array.isArray(timeline) || timeline.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <div className="p-3 rounded-full bg-muted mb-3">
            <Calendar className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-md bg-primary/10 shrink-0">
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <CardTitle className="text-sm font-semibold">Research Timeline</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <ol className="relative flex flex-col gap-6 pl-2">
          <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" aria-hidden="true" />
          {timeline.map((phase, i) => (
            <li key={`${phase.phase}-${i}`} className="relative flex items-start gap-3">
              <span className="relative z-10 flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 border-2 border-background">
                {i + 1}
              </span>
              <div className="flex flex-col gap-1 flex-1 min-w-0 pt-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-foreground">
                    {phase.phase}
                  </span>
                  {phase.duration && (
                    <Badge variant="outline" className="text-xs font-normal gap-1">
                      <Clock className="w-3 h-3" />
                      {phase.duration}
                    </Badge>
                  )}
                </div>
                {Array.isArray(phase.activities) && phase.activities.length > 0 && (
                  <ul className="flex flex-col gap-0.5 mt-0.5">
                    {phase.activities.map((a, j) => (
                      <li
                        key={j}
                        className="text-xs text-muted-foreground flex items-start gap-1.5"
                      >
                        <span className="w-1 h-1 rounded-full bg-muted-foreground shrink-0 mt-1.5" />
                        {a}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}