"use client";

import {
  Target,
  Users,
  Shuffle,
  Database,
  Wrench,
  Info,
  Sparkles,
} from "lucide-react";
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

function RecommendationRow({ icon: Icon, label, field }) {
  if (!field?.recommendation) return null;

  return (
    <div className="flex flex-col gap-1.5 py-3 border-b border-border last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-md bg-primary/10 shrink-0">
            <Icon className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="text-sm font-semibold text-foreground leading-snug">
              {field.recommendation}
            </p>
          </div>
        </div>
      </div>
      {field.reason && (
        <p className="text-xs text-muted-foreground leading-relaxed pl-8">
          {field.reason}
        </p>
      )}
      <div className="pl-8 pt-0.5 max-w-[220px]">
        <ConfidenceBar value={field.confidence} />
      </div>
    </div>
  );
}

function InstrumentsList({ instruments = [] }) {
  if (!Array.isArray(instruments) || instruments.length === 0) return null;

  return (
    <div className="py-3 border-t border-border">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-md bg-primary/10 shrink-0">
          <Wrench className="w-3.5 h-3.5 text-primary" />
        </div>
        <p className="text-xs font-medium text-muted-foreground">Recommended Instruments</p>
      </div>
      <div className="flex flex-col gap-2 pl-8">
        {instruments.map((inst, i) => (
          <div key={`${inst.name}-${i}`} className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground">{inst.name}</span>
            {inst.reason && (
              <span className="text-xs text-muted-foreground leading-relaxed">
                {inst.reason}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function RecommendationSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Skeleton className="w-7 h-7 rounded-md shrink-0" />
          <Skeleton className="h-4 w-56" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-1.5 w-40 rounded-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function MethodologyRecommendation({
  recommendation = null,
  overallConfidence = null,
  literatureBacked = false,
  loading = false,
  emptyMessage = "No recommendation available yet.",
}) {
  if (loading) {
    return <RecommendationSkeleton />;
  }

  if (!recommendation) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <div className="p-3 rounded-full bg-muted mb-3">
            <Target className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  const hasAnyRecommendation =
    recommendation.researchDesign?.recommendation ||
    recommendation.population?.recommendation ||
    recommendation.samplingTechnique?.recommendation ||
    recommendation.dataCollection?.recommendation;

  return (
    <Card className="border border-border">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-primary/10 shrink-0">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <CardTitle className="text-sm font-semibold">
              AI Methodology Recommendation
            </CardTitle>
          </div>
          <div className="flex items-center gap-1.5">
            {literatureBacked && (
              <Badge variant="secondary" className="text-xs">
                Literature-backed
              </Badge>
            )}
            {typeof overallConfidence === "number" && (
              <Badge variant="outline" className="text-xs">
                Overall Confidence: {overallConfidence}%
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {!hasAnyRecommendation ? (
          <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
            <Info className="w-4 h-4 shrink-0" />
            No specific recommendations were generated for this topic.
          </div>
        ) : (
          <div className="flex flex-col">
            <RecommendationRow
              icon={Target}
              label="Research Design"
              field={recommendation.researchDesign}
            />
            <RecommendationRow
              icon={Users}
              label="Target Population"
              field={recommendation.population}
            />
            <RecommendationRow
              icon={Shuffle}
              label="Sampling Technique"
              field={recommendation.samplingTechnique}
            />
            <RecommendationRow
              icon={Database}
              label="Data Collection"
              field={recommendation.dataCollection}
            />
            <InstrumentsList instruments={recommendation.instruments} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}