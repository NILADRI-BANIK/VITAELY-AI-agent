"use client";

import { Shuffle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function ConfidenceBar({ value = 0 }) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
  const color =
    safeValue >= 80
      ? "bg-green-500"
      : safeValue >= 60
        ? "bg-yellow-500"
        : "bg-orange-500";

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${safeValue}%` }}
        />
      </div>
      <span className="text-xs font-medium text-muted-foreground shrink-0 w-9 text-right">
        {safeValue}%
      </span>
    </div>
  );
}

function SamplingSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Skeleton className="w-7 h-7 rounded-md shrink-0" />
          <Skeleton className="h-4 w-40" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-1.5 w-40 rounded-full" />
      </CardContent>
    </Card>
  );
}

export default function SamplingCard({
  samplingTechnique = null,
  samplingLibrary = [],
  loading = false,
  emptyMessage = "No sampling technique recommendation available yet.",
}) {
  if (loading) {
    return <SamplingSkeleton />;
  }

  if (!samplingTechnique?.recommendation) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <div className="p-3 rounded-full bg-muted mb-3">
            <Shuffle className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  const otherTechniques = Array.isArray(samplingLibrary)
    ? samplingLibrary.filter((s) => s !== samplingTechnique.recommendation)
    : [];

  return (
    <Card className="border border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-md bg-primary/10 shrink-0">
            <Shuffle className="w-4 h-4 text-primary" />
          </div>
          <CardTitle className="text-sm font-semibold">Sampling Technique</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="text-sm font-semibold px-3 py-1">
            {samplingTechnique.recommendation}
          </Badge>
        </div>

        {samplingTechnique.reason && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {samplingTechnique.reason}
          </p>
        )}

        <div className="max-w-[220px]">
          <ConfidenceBar value={samplingTechnique.confidence} />
        </div>

        {otherTechniques.length > 0 && (
          <div className="pt-2 border-t border-border">
            <div className="flex items-center gap-2 mb-1.5">
              <Info className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="text-xs font-medium text-muted-foreground">
                Other Considered Techniques
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 pl-5">
              {otherTechniques.slice(0, 6).map((s) => (
                <Badge key={s} variant="outline" className="text-xs font-normal">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}