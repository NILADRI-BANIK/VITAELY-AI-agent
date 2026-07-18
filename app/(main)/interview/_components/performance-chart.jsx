"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";

export default function PerformanceChart({ assessments }) {
  // ✅ Prepare clean, sorted, safe data
  const chartData =
    assessments
      ?.filter((a) => a.createdAt)
      .map((assessment) => ({
        date: new Date(assessment.createdAt).toISOString(),
        score: Number(assessment.quizScore) || 0,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date)) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="gradient-title text-3xl md:text-4xl">
          Performance Trend
        </CardTitle>
        <CardDescription>Your quiz scores over time</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="h-[300px]">
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="date"
                  tickFormatter={(value) =>
                    format(new Date(value), "MMM dd HH:mm")
                  }
                />

                <YAxis domain={[0, 100]} />

                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload?.length) {
                      return (
                        <div className="bg-background border rounded-lg p-2 shadow-md">
                          <p className="text-sm font-medium">
                            Score: {payload[0].value}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(
                              new Date(payload[0].payload.date),
                              "MMM dd HH:mm"
                            )}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                {/* ✅ FIXED LINE VISIBILITY */}
                <Line
                  type="natural"               // 🔥 smoother curve
                  dataKey="score"
                  stroke="#ffffff"             // 🔥 bright line (visible on dark UI)
                  strokeWidth={3}              // 🔥 thicker line
                  dot={{ r: 5, fill: "#ffffff" }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}