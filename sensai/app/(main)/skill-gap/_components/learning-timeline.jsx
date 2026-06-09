"use client";

import { useMemo } from "react";
import { Clock, CheckCircle2, Target, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PHASE_COLORS = [
  {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-300",
    dot: "bg-blue-500",
    border: "border-blue-200 dark:border-blue-800",
  },
  {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-700 dark:text-purple-300",
    dot: "bg-purple-500",
    border: "border-purple-200 dark:border-purple-800",
  },
  {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-700 dark:text-orange-300",
    dot: "bg-orange-500",
    border: "border-orange-200 dark:border-orange-800",
  },
  {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-300",
    dot: "bg-green-500",
    border: "border-green-200 dark:border-green-800",
  },
];

function parseWeeks(duration) {
  if (!duration) return 0;
  const str = String(duration).toLowerCase();
  const monthMatch = str.match(/(\d+(?:\.\d+)?)\s*month/);
  const weekMatch = str.match(/(\d+(?:\.\d+)?)\s*week/);
  if (monthMatch) return Math.round(parseFloat(monthMatch[1]) * 4.33);
  if (weekMatch) return Math.round(parseFloat(weekMatch[1]));
  const num = parseFloat(str);
  return isNaN(num) ? 0 : Math.round(num);
}

function calcPhasesWithWeeks(phases) {
  return phases.map((phase) => {
    const weeks = parseWeeks(phase.duration);
    return { ...phase, weeks };
  });
}

function formatTotalDuration(totalWeeks) {
  if (totalWeeks === 0) return null;
  const months = totalWeeks / 4.33;
  if (months < 1) return `${totalWeeks} week${totalWeeks !== 1 ? "s" : ""}`;
  const rounded = Math.round(months * 2) / 2;
  return `${rounded} month${rounded !== 1 ? "s" : ""}`;
}

function PhaseItem({ phase, index, totalWeeks, isLast }) {
  const color = PHASE_COLORS[index % PHASE_COLORS.length];
  const widthPct =
    totalWeeks > 0 ? Math.round((phase.weeks / totalWeeks) * 100) : 100;

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${color.dot} text-white text-xs font-bold shadow-md ring-4 ring-background`}
        >
          {index + 1}
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-gradient-to-b from-border to-transparent mt-1" />}
      </div>

      <div className={`flex-1 mb-5 rounded-xl border shadow-sm overflow-hidden ${color.border}`}>
        {/* Color bar top */}
        <div className={`h-1.5 w-full ${color.dot}`} />

        <div className={`p-4 ${color.bg}`}>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className={`font-bold text-sm ${color.text}`}>
              {phase.phase || phase.name || `Phase ${index + 1}`}
            </h4>
            {phase.duration && (
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${color.border} ${color.text} bg-background/60 shrink-0`}>
                {phase.duration}
              </span>
            )}
          </div>

          {phase.description && (
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
              {phase.description}
            </p>
          )}

          {/* Visual duration bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground font-medium">Timeline share</span>
              <span className={`text-xs font-bold ${color.text}`}>{widthPct}%</span>
            </div>
            <div className="h-2.5 w-full bg-background/60 rounded-full overflow-hidden border border-border">
              <div
                className={`h-full rounded-full ${color.dot} transition-all duration-700 ease-out relative`}
                style={{ width: `${Math.max(widthPct, 4)}%` }}
              >
                <div className="absolute inset-0 bg-white/20 rounded-full" />
              </div>
            </div>
          </div>

          {/* Weeks chip */}
          {phase.weeks > 0 && (
            <div className="flex items-center gap-1.5 mb-3">
              <Clock className={`h-3 w-3 ${color.text}`} />
              <span className="text-xs text-muted-foreground">
                ~{phase.weeks} week{phase.weeks !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          {Array.isArray(phase.skills) && phase.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {phase.skills.map((skill, i) => (
                <span
                  key={`${skill}-${i}`}
                  className="text-xs bg-background/70 text-muted-foreground px-2 py-0.5 rounded-full border border-border"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          {Array.isArray(phase.milestones) && phase.milestones.length > 0 && (
            <ul className="space-y-1">
              {phase.milestones.map((milestone, i) => (
                <li key={`${milestone}-${i}`} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CheckCircle2 className={`h-3 w-3 shrink-0 ${color.text}`} />
                  {milestone}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <Clock className="h-10 w-10 text-muted-foreground mb-3 opacity-40" />
      <p className="text-sm text-muted-foreground">
        No timeline data available for this analysis.
      </p>
    </div>
  );
}

function JobReadySummary({ phases, totalDuration }) {
  return (
    <div className="mt-2 p-4 rounded-xl border border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center shadow-md shrink-0">
          <CheckCircle2 className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-green-800 dark:text-green-200">
            🎯 Job-Ready Estimate
          </p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
            {totalDuration
              ? `Complete all ${phases.length} phase${phases.length !== 1 ? "s" : ""} in approximately ${totalDuration}`
              : "Complete all phases to become job-ready"}
          </p>
        </div>
        {totalDuration && (
          <div className="shrink-0 text-right">
            <div className="text-xl font-black text-green-700 dark:text-green-300 leading-none">
              {totalDuration}
            </div>
            <div className="text-xs text-green-500 mt-0.5">total</div>
          </div>
        )}
      </div>

      {/* Mini phase bar */}
      <div className="mt-3 flex gap-1 rounded-full overflow-hidden h-2">
        {phases.map((phase, i) => {
          const color = PHASE_COLORS[i % PHASE_COLORS.length];
          const pct = phases.reduce((s, p) => s + p.weeks, 0);
          const w = pct > 0 ? Math.max((phase.weeks / pct) * 100, 2) : 100 / phases.length;
          return (
            <div
              key={i}
              className={`h-full ${color.dot} transition-all duration-500`}
              style={{ width: `${w}%` }}
              title={`${phase.phase || `Phase ${i + 1}`}: ${phase.duration || ""}`}
            />
          );
        })}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-green-500">Start</span>
        <span className="text-xs text-green-500">Job-Ready</span>
      </div>
    </div>
  );
}

export default function LearningTimeline({ timeline = [] }) {
const normalizedTimeline = useMemo(() => {
    if (!timeline) return [];
    if (typeof timeline === "string") {
      return [{ phase: "Learning Period", duration: timeline, description: `Estimated completion: ${timeline}` }];
    }
    if (typeof timeline === "object" && !Array.isArray(timeline)) {
      return [{ 
        phase: timeline.estimate || "Learning Period", 
        duration: timeline.estimate || "", 
        description: timeline.breakdown || "" 
      }];
    }
    return timeline;
  }, [timeline]);

const phases = useMemo(() => {
  if (!normalizedTimeline.length) return [];
  return calcPhasesWithWeeks(normalizedTimeline);
}, [normalizedTimeline]);

  const totalWeeks = useMemo(
    () => phases.reduce((sum, p) => sum + p.weeks, 0),
    [phases],
  );

  const totalDuration = useMemo(
    () => formatTotalDuration(totalWeeks),
    [totalWeeks],
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Learning Timeline
          </CardTitle>

          {totalDuration && (
            <div className="flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Job-ready in
              </span>
              <Badge variant="secondary" className="text-xs font-semibold">
                {totalDuration}
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {phases.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="mt-1">
            {phases.map((phase, index) => (
              <PhaseItem
                key={`${phase.phase ?? phase.name ?? index}-${index}`}
                phase={phase}
                index={index}
                totalWeeks={totalWeeks}
                isLast={index === phases.length - 1}
              />
            ))}
            <JobReadySummary phases={phases} totalDuration={totalDuration} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
