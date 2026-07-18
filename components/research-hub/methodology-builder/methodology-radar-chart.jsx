"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Radar as RadarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const DEFAULT_METRICS = {
  quantitative: { accuracy: 85, cost: 55, complexity: 60, time: 50, popularity: 90, novelty: 40 },
  qualitative: { accuracy: 65, cost: 45, complexity: 55, time: 65, popularity: 75, novelty: 55 },
  "mixed-methods": { accuracy: 80, cost: 70, complexity: 80, time: 80, popularity: 70, novelty: 65 },
  experimental: { accuracy: 90, cost: 75, complexity: 75, time: 70, popularity: 65, novelty: 50 },
  survey: { accuracy: 70, cost: 40, complexity: 45, time: 45, popularity: 85, novelty: 35 },
  "case-study": { accuracy: 60, cost: 35, complexity: 50, time: 55, popularity: 60, novelty: 60 },
  "systematic-review": { accuracy: 75, cost: 50, complexity: 65, time: 75, popularity: 70, novelty: 45 },
  "action-research": { accuracy: 60, cost: 45, complexity: 60, time: 70, popularity: 50, novelty: 70 },
};

const METRIC_LABELS = {
  accuracy: "Accuracy",
  cost: "Cost Efficiency",
  complexity: "Simplicity",
  time: "Speed",
  popularity: "Popularity",
  novelty: "Novelty",
};

function buildChartData(metrics) {
  return Object.entries(METRIC_LABELS).map(([key, label]) => ({
    metric: label,
    value: typeof metrics?.[key] === "number" ? metrics[key] : 50,
  }));
}

function RadarSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Skeleton className="w-7 h-7 rounded-md shrink-0" />
          <Skeleton className="h-4 w-48" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-72 w-full rounded-lg" />
      </CardContent>
    </Card>
  );
}

export default function MethodologyRadarChart({
  methodologyType = null,
  metrics = null,
  loading = false,
  emptyMessage = "No methodology selected for comparison.",
}) {
  if (loading) {
    return <RadarSkeleton />;
  }

  const resolvedMetrics = metrics || DEFAULT_METRICS[methodologyType] || null;

  if (!resolvedMetrics) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <div className="p-3 rounded-full bg-muted mb-3">
            <RadarIcon className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = buildChartData(resolvedMetrics);

  return (
    <Card className="border border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-md bg-primary/10 shrink-0">
            <RadarIcon className="w-4 h-4 text-primary" />
          </div>
          <CardTitle className="text-sm font-semibold">
            Methodology Profile{methodologyType ? `: ${methodologyType}` : ""}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData} outerRadius="75%">
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: "var(--muted-foreground)", fontSize: 9 }}
                axisLine={false}
              />
              <Radar
                name="Score"
                dataKey="value"
                stroke="var(--primary)"
                fill="var(--primary)"
                fillOpacity={0.35}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}