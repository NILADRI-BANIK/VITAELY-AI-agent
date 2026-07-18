"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { BarChart2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const METHODOLOGY_LABELS = {
  quantitative: "Quantitative",
  qualitative: "Qualitative",
  "mixed-methods": "Mixed Methods",
  experimental: "Experimental",
  survey: "Survey",
  "case-study": "Case Study",
  "systematic-review": "Systematic Review",
  "action-research": "Action Research",
};

const BAR_COLORS = [
  "var(--primary)",
  "#8b5cf6",
  "#06b6d4",
  "#f59e0b",
  "#10b981",
  "#ec4899",
  "#6366f1",
  "#f97316",
];

function buildChartData(distribution) {
  if (!Array.isArray(distribution)) return [];
  return distribution.map((d) => ({
    name: METHODOLOGY_LABELS[d.type] || d.type,
    percentage: d.percentage ?? 0,
    count: d.count ?? 0,
  }));
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-foreground mb-0.5">{data.name}</p>
      <p className="text-muted-foreground">
        {data.percentage}% ({data.count} papers)
      </p>
    </div>
  );
}

function BarChartSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Skeleton className="w-7 h-7 rounded-md shrink-0" />
          <Skeleton className="h-4 w-52" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-72 w-full rounded-lg" />
      </CardContent>
    </Card>
  );
}

export default function MethodologyBarChart({
  distribution = [],
  totalAnalyzed = null,
  loading = false,
  emptyMessage = "No methodology distribution data available yet.",
}) {
  if (loading) {
    return <BarChartSkeleton />;
  }

  const chartData = buildChartData(distribution);

  if (chartData.length === 0) {
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

  return (
    <Card className="border border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-md bg-primary/10 shrink-0">
            <BarChart2 className="w-4 h-4 text-primary" />
          </div>
          <CardTitle className="text-sm font-semibold">
            Methodology Usage Across Literature
            {typeof totalAnalyzed === "number" ? ` (${totalAnalyzed} papers)` : ""}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                angle={-30}
                textAnchor="end"
                interval={0}
                height={60}
              />
              <YAxis
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                unit="%"
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.4 }} />
              <Bar dataKey="percentage" radius={[6, 6, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}