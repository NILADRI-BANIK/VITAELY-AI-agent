"use client";

import { AlertOctagon, ShieldCheck, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const SEVERITY_CONFIG = {
  high: { label: "High", color: "text-red-600", bg: "bg-red-500/10", icon: TrendingUp },
  medium: { label: "Medium", color: "text-yellow-600", bg: "bg-yellow-500/10", icon: Minus },
  low: { label: "Low", color: "text-green-600", bg: "bg-green-500/10", icon: TrendingDown },
};

function normalizeRisk(item) {
  if (typeof item === "string") {
    return { risk: item, mitigation: null, severity: null };
  }
  return {
    risk: item.risk ?? item.limitation ?? item.text ?? item.description ?? "",
    mitigation: item.mitigation ?? item.solution ?? null,
    severity: (item.severity ?? item.level ?? "").toLowerCase() || null,
  };
}

function RiskSkeleton() {
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

export default function RiskCard({
  risks = [],
  limitations = [],
  loading = false,
  emptyMessage = "No risks or limitations identified yet.",
}) {
  if (loading) {
    return <RiskSkeleton />;
  }

  const sourceItems = Array.isArray(risks) && risks.length > 0 ? risks : limitations;
  const items = Array.isArray(sourceItems) ? sourceItems.map(normalizeRisk).filter((r) => r.risk) : [];

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <div className="p-3 rounded-full bg-muted mb-3">
            <AlertOctagon className="w-6 h-6 text-muted-foreground" />
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
            <AlertOctagon className="w-4 h-4 text-primary" />
          </div>
          <CardTitle className="text-sm font-semibold">
            Risks &amp; Mitigation
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {items.map((item, i) => {
          const severityConfig = item.severity ? SEVERITY_CONFIG[item.severity] : null;
          const SeverityIcon = severityConfig?.icon;

          return (
            <div key={i} className="rounded-lg border border-border p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 min-w-0 flex-1">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-destructive/10 text-destructive text-xs font-semibold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-foreground leading-relaxed">{item.risk}</p>
                </div>
                {severityConfig && (
                  <Badge
                    variant="outline"
                    className={`text-xs shrink-0 gap-1 border-0 ${severityConfig.bg} ${severityConfig.color}`}
                  >
                    {SeverityIcon && <SeverityIcon className="w-3 h-3" />}
                    {severityConfig.label}
                  </Badge>
                )}
              </div>

              {item.mitigation && (
                <div className="flex items-start gap-2 mt-2.5 pl-7">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="font-medium text-foreground">Mitigation: </span>
                    {item.mitigation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}