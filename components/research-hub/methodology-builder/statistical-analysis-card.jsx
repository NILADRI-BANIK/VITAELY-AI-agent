"use client";

import { useState } from "react";
import {
  BarChart2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info,
  Code2,
  Cpu,
  XCircle,
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

function TestItem({ test, ruleBasedMeta }) {
  const [expanded, setExpanded] = useState(false);
  const meta = ruleBasedMeta?.find((r) => r.name === test.name);

  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{test.name}</p>
          {test.reason && (
            <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
              {test.reason}
            </p>
          )}
        </div>
        {(meta?.assumptions?.length || meta?.codeSnippets) && (
          <button
            type="button"
            onClick={() => setExpanded((p) => !p)}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      <div className="max-w-[220px] mt-2">
        <ConfidenceBar value={test.confidence} />
      </div>

      {meta && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {meta.effectSize && (
            <Badge variant="outline" className="text-xs font-normal">
              Effect Size: {meta.effectSize}
            </Badge>
          )}
          {meta.parametricAlternative && (
            <Badge variant="outline" className="text-xs font-normal">
              Alt: {meta.parametricAlternative}
            </Badge>
          )}
        </div>
      )}

      {expanded && meta && (
        <div className="mt-3 pt-3 border-t border-border flex flex-col gap-3">
          {Array.isArray(meta.assumptions) && meta.assumptions.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Assumptions
              </p>
              <ul className="flex flex-col gap-1">
                {meta.assumptions.map((a, i) => (
                  <li key={i} className="text-xs text-foreground flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-muted-foreground shrink-0" />
                    {a.name}
                    {a.checkFn && (
                      <span className="text-muted-foreground">({a.checkFn})</span>
                    )}
                    {a.required && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        required
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {Array.isArray(meta.visualizations) && meta.visualizations.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Suggested Visualizations
              </p>
              <div className="flex flex-wrap gap-1.5">
                {meta.visualizations.map((v, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {v}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {meta.codeSnippets && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                <Code2 className="w-3 h-3" />
                Code Reference
              </p>
              <div className="flex flex-col gap-1.5">
                {Object.entries(meta.codeSnippets).map(([lang, snippet]) => (
                  <div key={lang} className="rounded-md bg-muted/60 px-2.5 py-1.5">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase mb-0.5">
                      {lang}
                    </p>
                    <pre className="text-xs text-foreground whitespace-pre-wrap break-words font-mono">
                      {snippet}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatsSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Skeleton className="w-7 h-7 rounded-md shrink-0" />
          <Skeleton className="h-4 w-52" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </CardContent>
    </Card>
  );
}

export default function StatisticalAnalysisCard({
  statisticsRecommendation = null,
  loading = false,
  emptyMessage = "No statistical analysis recommendation available yet.",
}) {
  if (loading) {
    return <StatsSkeleton />;
  }

  if (!statisticsRecommendation) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <div className="p-3 rounded-full bg-muted mb-3">
            <BarChart2 className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  const {
    recommendedTests = [],
    recommendedModels = [],
    ruleBasedTests = [],
    sampleSizeWarnings = [],
    excludedTests = [],
    software = [],
    overallReasoning,
  } = statisticsRecommendation;

  return (
    <Card className="border border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-md bg-primary/10 shrink-0">
            <BarChart2 className="w-4 h-4 text-primary" />
          </div>
          <CardTitle className="text-sm font-semibold">
            Statistical Analysis Recommendation
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {overallReasoning && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {overallReasoning}
          </p>
        )}

        {sampleSizeWarnings.length > 0 && (
          <div className="flex flex-col gap-1.5">
            {sampleSizeWarnings.map((w, i) => (
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

        {recommendedTests.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground">
              Recommended Statistical Tests
            </p>
            {recommendedTests.map((t, i) => (
              <TestItem key={`${t.name}-${i}`} test={t} ruleBasedMeta={ruleBasedTests} />
            ))}
          </div>
        )}

        {recommendedModels.length > 0 && (
          <div className="flex flex-col gap-2 pt-2 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              Recommended ML Models
            </p>
            {recommendedModels.map((m, i) => (
              <div key={`${m.name}-${i}`} className="rounded-lg border border-border p-3">
                <p className="text-sm font-semibold text-foreground">{m.name}</p>
                {m.reason && (
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                    {m.reason}
                  </p>
                )}
                <div className="max-w-[220px] mt-2">
                  <ConfidenceBar value={m.confidence} />
                </div>
              </div>
            ))}
          </div>
        )}

        {software.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border">
            <span className="text-xs font-medium text-muted-foreground mr-1">
              Recommended Software:
            </span>
            {software.map((s, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {s}
              </Badge>
            ))}
          </div>
        )}

        {excludedTests.length > 0 && (
          <div className="pt-2 border-t border-border">
            <div className="flex items-center gap-1.5 mb-1.5">
              <XCircle className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                Excluded Tests
              </span>
            </div>
            <div className="flex flex-col gap-1">
              {excludedTests.map((e, i) => (
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