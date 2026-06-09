"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ChevronDown, ChevronUp, Flag, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// parseMonthsFromDuration
// buildGanttRows
// getMonthLabels
// GanttBar
// LegendDot
// RoadmapTimeline

const COLORS = [
  { bar: "bg-violet-500",  light: "bg-violet-50",  border: "border-violet-200", text: "text-violet-700",  dot: "bg-violet-400"  },
  { bar: "bg-sky-500",     light: "bg-sky-50",     border: "border-sky-200",    text: "text-sky-700",     dot: "bg-sky-400"     },
  { bar: "bg-emerald-500", light: "bg-emerald-50", border: "border-emerald-200",text: "text-emerald-700", dot: "bg-emerald-400" },
  { bar: "bg-amber-500",   light: "bg-amber-50",   border: "border-amber-200",  text: "text-amber-700",   dot: "bg-amber-400"   },
  { bar: "bg-rose-500",    light: "bg-rose-50",    border: "border-rose-200",   text: "text-rose-700",    dot: "bg-rose-400"    },
  { bar: "bg-cyan-500",    light: "bg-cyan-50",    border: "border-cyan-200",   text: "text-cyan-700",    dot: "bg-cyan-400"    },
  { bar: "bg-fuchsia-500", light: "bg-fuchsia-50", border: "border-fuchsia-200",text: "text-fuchsia-700", dot: "bg-fuchsia-400" },
  { bar: "bg-orange-500",  light: "bg-orange-50",  border: "border-orange-200", text: "text-orange-700",  dot: "bg-orange-400"  },
];

const parseMonthsFromDuration = (duration) => {
  if (!duration) return 1;
  const str = String(duration).toLowerCase();
  const yearMatch  = str.match(/(\d+(?:\.\d+)?)\s*year/);
  const monthMatch = str.match(/(\d+(?:\.\d+)?)\s*month/);
  const weekMatch  = str.match(/(\d+(?:\.\d+)?)\s*week/);
  if (yearMatch)  return Math.max(1, Math.round(parseFloat(yearMatch[1])  * 12));
  if (monthMatch) return Math.max(1, Math.round(parseFloat(monthMatch[1])));
  if (weekMatch)  return Math.max(1, Math.round(parseFloat(weekMatch[1]) / 4.33));
  const num = parseFloat(str);
  return isNaN(num) ? 1 : Math.max(1, Math.round(num));
};

const buildGanttRows = (roadmap) => {
  let cursor = 0;
  return roadmap.map((step, i) => {
    const months = parseMonthsFromDuration(step.duration);
    const row = {
      index:       i,
      title:       step.title || step.step || `Step ${i + 1}`,
      description: step.description || step.details || "",
      duration:    step.duration || `${months} month${months !== 1 ? "s" : ""}`,
      resources:   Array.isArray(step.resources) ? step.resources : [],
      startMonth:  cursor,
      endMonth:    cursor + months,
      months,
      color:       COLORS[i % COLORS.length],
    };
    cursor += months;
    return row;
  });
};

const getMonthLabels = (totalMonths) => {
  const labels = [];
  const now = new Date();
  for (let i = 0; i < totalMonths; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    labels.push({
      short: d.toLocaleString("default", { month: "short" }),
      year:  d.getFullYear(),
      index: i,
    });
  }
  return labels;
};

function GanttBar({ row, totalMonths, isExpanded, onToggle }) {
  const leftPct  = (row.startMonth / totalMonths) * 100;
  const widthPct = (row.months     / totalMonths) * 100;
  const { color } = row;

  return (
    <div className="group">
      {/* Row label + bar */}
      <div className="flex items-center gap-3 py-2">
        {/* Step number */}
        <div className={`flex-shrink-0 w-7 h-7 rounded-full ${color.bar} text-white text-xs font-bold flex items-center justify-center shadow-sm`}>
          {row.index + 1}
        </div>

        {/* Title */}
        <div className="w-36 sm:w-48 flex-shrink-0">
          <button
            onClick={onToggle}
            className="flex items-center gap-1 text-left w-full"
          >
            <span className="text-xs font-semibold text-slate-700 leading-tight line-clamp-2 group-hover:text-slate-900 transition-colors">
              {row.title}
            </span>
            {isExpanded
              ? <ChevronUp   className="w-3 h-3 text-slate-400 flex-shrink-0" />
              : <ChevronDown className="w-3 h-3 text-slate-400 flex-shrink-0" />}
          </button>
          <span className="text-[10px] text-slate-400 mt-0.5 block">{row.duration}</span>
        </div>

        {/* Gantt bar track */}
        <div className="flex-1 relative h-8 bg-slate-50 rounded-lg border border-slate-100 overflow-hidden">
          {/* Grid lines */}
          {Array.from({ length: totalMonths - 1 }).map((_, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 w-px bg-slate-200/60"
              style={{ left: `${((i + 1) / totalMonths) * 100}%` }}
            />
          ))}

          {/* Colored bar */}
          <div
            className={`absolute top-1 bottom-1 rounded-md ${color.bar} shadow-sm flex items-center transition-all duration-700 ease-out`}
            style={{
              left:  `calc(${leftPct}% + 2px)`,
              width: `calc(${widthPct}% - 4px)`,
            }}
          >
            {/* Start flag */}
            <Play className="w-2.5 h-2.5 text-white/80 ml-1.5 flex-shrink-0" />

            {/* Label inside bar if wide enough */}
            {widthPct > 18 && (
              <span className="text-[10px] text-white font-semibold ml-1 truncate pr-1">
                {row.title}
              </span>
            )}

            {/* End flag */}
            <Flag className="w-2.5 h-2.5 text-white/80 mr-1.5 ml-auto flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* Expanded detail */}
      {isExpanded && (
        <div className={`ml-10 mr-0 mb-2 p-3 rounded-xl border ${color.border} ${color.light} text-xs space-y-2`}>
          {row.description && (
            <p className={`${color.text} leading-relaxed font-medium`}>{row.description}</p>
          )}
          {row.resources.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {row.resources.map((r, i) => (
                <span
                  key={i}
                  className="bg-white/70 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-[10px]"
                >
                  {r}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-3 pt-1">
            <span className={`font-semibold ${color.text}`}>
              Month {row.startMonth + 1} → Month {row.endMonth}
            </span>
            <Badge variant="outline" className={`text-[10px] border ${color.border} ${color.text}`}>
              {row.duration}
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2.5 h-2.5 rounded-full ${color.dot} flex-shrink-0`} />
      <span className="text-xs text-slate-500 truncate max-w-[100px]">{label}</span>
    </div>
  );
}

export default function RoadmapTimeline({ roadmap = [], role = "" }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const rows = useMemo(() => buildGanttRows(roadmap), [roadmap]);

  const totalMonths = useMemo(
    () => rows.reduce((sum, r) => Math.max(sum, r.endMonth), 0),
    [rows]
  );

  const monthLabels = useMemo(() => getMonthLabels(totalMonths), [totalMonths]);

  const totalDurationLabel = useMemo(() => {
    if (totalMonths >= 12) {
      const yrs = (totalMonths / 12).toFixed(1).replace(/\.0$/, "");
      return `${yrs} year${yrs !== "1" ? "s" : ""}`;
    }
    return `${totalMonths} month${totalMonths !== 1 ? "s" : ""}`;
  }, [totalMonths]);

  if (!rows.length) return null;

  const toggleExpand = (i) => setExpandedIndex(expandedIndex === i ? null : i);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
            <CalendarDays className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Visual Learning Timeline
            </h2>
            {role && (
              <p className="text-xs text-slate-400 mt-0.5">
                Roadmap for <span className="font-medium text-indigo-500">{role}</span>
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs border-indigo-200 text-indigo-600 bg-indigo-50">
            {rows.length} milestone{rows.length !== 1 ? "s" : ""}
          </Badge>
          <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-600 bg-emerald-50">
            {totalDurationLabel} total
          </Badge>
        </div>
      </div>

      {/* Month header axis */}
      <div className="flex items-center gap-3">
        <div className="w-7 flex-shrink-0" />
        <div className="w-36 sm:w-48 flex-shrink-0" />
        <div className="flex-1 relative h-6">
          <div className="absolute inset-0 flex">
            {monthLabels.map((m, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col items-center"
              >
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide leading-none">
                  {m.short}
                </span>
                {m.short === "Jan" && (
                  <span className="text-[8px] text-slate-300 leading-none mt-0.5">
                    {m.year}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gantt rows */}
      <div className="divide-y divide-slate-50">
        {rows.map((row) => (
          <GanttBar
            key={row.index}
            row={row}
            totalMonths={totalMonths}
            isExpanded={expandedIndex === row.index}
            onToggle={() => toggleExpand(row.index)}
          />
        ))}
      </div>

      {/* Summary footer */}
      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Milestones
          </span>
          <span className="text-xs text-slate-400">
            Click any row to expand details
          </span>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {rows.map((row) => (
            <LegendDot
              key={row.index}
              color={row.color}
              label={row.title}
            />
          ))}
        </div>
      </div>

      {/* Full timeline bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>Start</span>
          <span>Job-Ready in {totalDurationLabel}</span>
        </div>
        <div className="h-3 w-full rounded-full overflow-hidden flex shadow-inner bg-slate-100">
          {rows.map((row) => (
            <div
              key={row.index}
              className={`h-full ${row.color.bar} transition-all duration-500`}
              style={{ width: `${(row.months / totalMonths) * 100}%` }}
              title={`${row.title}: ${row.duration}`}
            />
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>Month 1</span>
          <span>Month {totalMonths}</span>
        </div>
      </div>
    </div>
  );
}