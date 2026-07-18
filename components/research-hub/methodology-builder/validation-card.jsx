"use client";

import { ShieldCheck, AlertTriangle, Info, Link2, XCircle } from "lucide-react";
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

function ValidationItem({ item }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-sm font-semibold text-foreground">{item.name}</p>
      {item.reason && (
        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
          {item.reason}
        </p>
      )}
      <div className="max-w-[220px] mt-2">
        <ConfidenceBar value={item.confidence} />
      </div>
    </div>
  );
}

function ValidationSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Skeleton className="w-7 h-7 rounded-md shrink-0" />
          <Skeleton className="h-4 w-44" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </CardContent>
    </Card>
  );
}

export default function ValidationCard({
  validationRecommendation = null,
  loading = false,
  emptyMessage = "No validation strategy available yet.",
}) {
  if (loading) {
    return <ValidationSkeleton />;
  }

  if (!validationRecommendation) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <div className="p-3 rounded-full bg-muted mb-3">
            <ShieldCheck className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  const {
    recommendedValidation = [],
    recommendedModelValidation = [],
    sampleAdequacyWarnings = [],
    excludedValidationMethods = [],
    linkedStatisticalTests = [],
    reliabilityConsiderations = [],
    validityConsiderations = [],
    overallReasoning,
  } = validationRecommendation;

  return (
    <Card className="border border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-md bg-primary/10 shrink-0">
            <ShieldCheck className="w-4 h-4 text-primary" />
          </div>
          <CardTitle className="text-sm font-semibold">
            Validation Strategy
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {overallReasoning && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {overallReasoning}
          </p>
        )}

        {sampleAdequacyWarnings.length > 0 && (
          <div className="flex flex-col gap-1.5">
            {sampleAdequacyWarnings.map((w, i) => (
              <div
                key={i}
                className="flex items-start gap-2 p-2.5 rounded-md bg-yellow-500/10 border border-yellow-500/20"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-yellow-600 shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-700 dark:text-yellow-500 leading-relaxed">
                  {w.message}
                </p>
              </div>
            ))}
          </div>
        )}

        {recommendedValidation.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground">
              Recommended Validation Methods
            </p>
            {recommendedValidation.map((v, i) => (
              <ValidationItem key={`${v.name}-${i}`} item={v} />
            ))}
          </div>
        )}

        {recommendedModelValidation.length > 0 && (
          <div className="flex flex-col gap-2 pt-2 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground">
              Model Validation Methods
            </p>
            {recommendedModelValidation.map((v, i) => (
              <ValidationItem key={`${v.name}-${i}`} item={v} />
            ))}
          </div>
        )}

        {linkedStatisticalTests.length > 0 && (
          <div className="pt-2 border-t border-border">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Link2 className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                Linked Statistical Tests
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              {linkedStatisticalTests.map((l, i) => (
                <div key={i} className="text-xs text-foreground">
                  <span className="font-medium">{l.test}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    → {l.linkedValidationMethods.join(", ")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {(reliabilityConsiderations.length > 0 || validityConsiderations.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border">
            {reliabilityConsiderations.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">
                  Reliability Considerations
                </p>
                <ul className="flex flex-col gap-1">
                  {reliabilityConsiderations.map((r, i) => (
                    <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-muted-foreground shrink-0 mt-1.5" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {validityConsiderations.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">
                  Validity Considerations
                </p>
                <ul className="flex flex-col gap-1">
                  {validityConsiderations.map((v, i) => (
                    <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-muted-foreground shrink-0 mt-1.5" />
                      {v}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {excludedValidationMethods.length > 0 && (
          <div className="pt-2 border-t border-border">
            <div className="flex items-center gap-1.5 mb-1.5">
              <XCircle className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                Excluded Methods
              </span>
            </div>
            <div className="flex flex-col gap-1">
              {excludedValidationMethods.map((e, i) => (
                <div key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <Info className="w-3 h-3 shrink-0 mt-0.5" />
                  <span>
                    <span className="font-medium text-foreground">{e.name}</span>: {e.reason}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}