"use client";

import { useState, useRef, useEffect } from "react";
import {
  Map,
  CheckCircle2,
  Circle,
  Clock,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  AlertCircle,
  Flag,
  Calendar,
  Tag,
  Milestone,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// ─── RoadmapSkeleton ──────────────────────────────────────────────────────────

function RoadmapSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded-md shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
        </CardContent>
      </Card>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="flex flex-col items-center">
            <Skeleton className="w-8 h-8 rounded-full shrink-0" />
            <Skeleton className="w-0.5 flex-1 mt-2" />
          </div>
          <Card className="flex-1 mb-4">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24 mt-1" />
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex items-center gap-2">
                  <Skeleton className="w-4 h-4 rounded-full shrink-0" />
                  <Skeleton className="h-3 flex-1" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}

// ─── TaskItem ─────────────────────────────────────────────────────────────────

function TaskItem({ task }) {
  const title =
    typeof task === "string"
      ? task
      : (task.title ?? task.task ?? task.name ?? "Untitled Task");
  const description =
    typeof task === "string"
      ? null
      : (task.description ?? task.details ?? null);
  const duration =
    typeof task === "string" ? null : (task.duration ?? task.time ?? null);
  const status = typeof task === "string" ? null : (task.status ?? null);
  const tags =
    typeof task === "string" ? [] : Array.isArray(task.tags) ? task.tags : [];

  const isDone = ["done", "completed", "complete", "finished"].includes(status);
  const isInProgress = [
    "in_progress",
    "active",
    "ongoing",
    "in-progress",
  ].includes(status);

  return (
    <li className="flex items-start gap-2.5">
      {isDone ? (
        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
      ) : isInProgress ? (
        <Clock className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
      ) : (
        <Circle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
      )}
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className="text-sm text-foreground leading-snug">{title}</span>
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
          {duration && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              {duration}
            </span>
          )}
          {tags.map((tag, i) => (
            <span
              key={`${tag}-${i}`}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs bg-secondary text-secondary-foreground border border-border"
            >
              <Tag className="w-2 h-2" />
              {tag}
            </span>
          ))}
        </div>
      </div>
    </li>
  );
}

// ─── PhaseCard ────────────────────────────────────────────────────────────────

function PhaseCard({ phase, index, isLast }) {
  const [expanded, setExpanded] = useState(true);
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef(null);
  useEffect(() => {
    return () => clearTimeout(copyTimerRef.current);
  }, []);
  const title =
    phase.title ?? phase.phase ?? phase.name ?? `Phase ${index + 1}`;
  const description = phase.description ?? phase.overview ?? null;
  const duration = phase.duration ?? phase.timeframe ?? null;
  const tasks = Array.isArray(phase.tasks) ? phase.tasks : [];
  const milestones = Array.isArray(phase.milestones) ? phase.milestones : [];
  const tags = Array.isArray(phase.tags) ? phase.tags : [];
  const note = phase.note ?? phase.tip ?? null;

  const phaseColors = [
    {
      dot: "bg-blue-500",
      border: "border-blue-500/30",
      badge: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    },
    {
      dot: "bg-purple-500",
      border: "border-purple-500/30",
      badge: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    },
    {
      dot: "bg-orange-500",
      border: "border-orange-500/30",
      badge: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    },
    {
      dot: "bg-green-500",
      border: "border-green-500/30",
      badge: "bg-green-500/10 text-green-600 border-green-500/20",
    },
    {
      dot: "bg-red-500",
      border: "border-red-500/30",
      badge: "bg-red-500/10 text-red-600 border-red-500/20",
    },
  ];

  const color = phaseColors[index % phaseColors.length];

  async function handleCopy() {
    const taskTexts = tasks
      .map((t, i) => {
        const title =
          typeof t === "string"
            ? t
            : (t.title ?? t.task ?? t.name ?? `Task ${i + 1}`);
        return `  ${i + 1}. ${title}`;
      })
      .join("\n");

    const milestoneTexts = milestones
      .map((m, i) => {
        const text = typeof m === "string" ? m : (m.title ?? m.milestone ?? "");
        return `  - ${text}`;
      })
      .join("\n");

    const text = [
      `Phase ${index + 1}: ${title}`,
      duration ? `Duration: ${duration}` : null,
      description ? `Overview: ${description}` : null,
      tasks.length > 0 ? `Tasks:\n${taskTexts}` : null,
      milestones.length > 0 ? `Milestones:\n${milestoneTexts}` : null,
      note ? `Note: ${note}` : null,
    ]
      .filter(Boolean)
      .join("\n\n");

    try {
      await navigator.clipboard.writeText(text);
      clearTimeout(copyTimerRef.current);
      setCopied(true);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <div className="flex gap-4">
      {/* Timeline spine */}
      <div className="flex flex-col items-center shrink-0">
        <div
          className={`w-8 h-8 rounded-full ${color.dot} flex items-center justify-center text-white text-xs font-bold shrink-0 z-10`}
        >
          {index + 1}
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-border mt-2" />}
      </div>

      {/* Phase content */}
      <Card
        className={`flex-1 mb-6 border ${color.border} hover:border-primary/40 transition-colors`}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-1 min-w-0 flex-1">
              <CardTitle className="text-sm font-semibold leading-snug">
                {title}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-1.5">
                {duration && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {duration}
                  </span>
                )}
                {tasks.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {tasks.length} task{tasks.length !== 1 ? "s" : ""}
                  </span>
                )}
                {tags.slice(0, 2).map((tag, i) => (
                  <span
                    key={`${tag}-${i}`}
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${color.badge}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopy}
                className="px-2 h-7"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setExpanded((p) => !p)}
                className="px-2 h-7"
              >
                {expanded ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        {expanded && (
          <CardContent className="flex flex-col gap-4">
            {description && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            )}

            {tasks.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Tasks
                </span>
                <ul className="flex flex-col gap-2.5">
                  {tasks.map((task, i) => (
                    <TaskItem
                      key={
                        typeof task === "string"
                          ? `${task}-${i}`
                          : (task.id ?? task.title ?? task.task ?? i)
                      }
                      task={task}
                    />
                  ))}
                </ul>
              </div>
            )}

            {milestones.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Milestones
                </span>
                <ul className="flex flex-col gap-1.5">
                  {milestones.map((milestone, i) => {
                    const text =
                      typeof milestone === "string"
                        ? milestone
                        : (milestone.title ?? milestone.milestone ?? "");
                    return (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-foreground"
                      >
                        <Milestone className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{text}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {note && (
              <div className="flex items-start gap-2 p-3 rounded-md bg-muted/50 border border-border">
                <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {note}
                </p>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}

// ─── RoadmapView ──────────────────────────────────────────────────────────────

export default function RoadmapView({
  roadmap = null,
  loading = false,
  error = null,
  emptyMessage = "No roadmap generated yet. Select a topic to build your research roadmap.",
}) {
  const [fullCopied, setFullCopied] = useState(false);
  const fullCopyTimerRef = useRef(null);
  useEffect(() => {
    return () => clearTimeout(fullCopyTimerRef.current);
  }, []);
  if (loading) {
    return <RoadmapSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-3 rounded-full bg-destructive/10 mb-3">
          <AlertCircle className="w-6 h-6 text-destructive" />
        </div>
        <p className="text-sm font-medium text-destructive">
          Failed to load roadmap
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {typeof error === "string" ? error : "An unexpected error occurred."}
        </p>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-3 rounded-full bg-muted mb-3">
          <Map className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  const title = roadmap.title ?? roadmap.topic ?? null;
  const overview =
    roadmap.overview ?? roadmap.description ?? roadmap.summary ?? null;
  const phases = Array.isArray(roadmap.phases) ? roadmap.phases : [];
  const totalDuration =
    roadmap.totalDuration ?? roadmap.total_duration ?? roadmap.duration ?? null;
  const goal = roadmap.goal ?? roadmap.objective ?? null;

  async function handleFullCopy() {
    const phaseTexts = phases
      .map((p, i) => {
        const t = p.title ?? p.phase ?? p.name ?? `Phase ${i + 1}`;
        const d = p.description ?? p.overview ?? "";
        const tasks = Array.isArray(p.tasks)
          ? p.tasks
              .map((task, j) => {
                const tt =
                  typeof task === "string"
                    ? task
                    : (task.title ?? task.task ?? task.name ?? `Task ${j + 1}`);
                return `    ${j + 1}. ${tt}`;
              })
              .join("\n")
          : "";
        return [`Phase ${i + 1}: ${t}`, d, tasks].filter(Boolean).join("\n");
      })
      .join("\n\n");

    const text = [
      title ? `Research Roadmap: ${title}` : "Research Roadmap",
      goal ? `Goal: ${goal}` : null,
      totalDuration ? `Total Duration: ${totalDuration}` : null,
      overview ? `Overview:\n${overview}` : null,
      phaseTexts ? `Phases:\n${phaseTexts}` : null,
    ]
      .filter(Boolean)
      .join("\n\n");

    try {
      await navigator.clipboard.writeText(text);
      clearTimeout(fullCopyTimerRef.current);
      setFullCopied(true);
      fullCopyTimerRef.current = setTimeout(() => setFullCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <Card className="border border-border">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 min-w-0 flex-1">
              <div className="p-2 rounded-md bg-primary/10 shrink-0 mt-0.5">
                <Map className="w-4 h-4 text-primary" />
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                {title && (
                  <CardTitle className="text-base font-semibold leading-snug">
                    {title}
                  </CardTitle>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  {totalDuration && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {totalDuration}
                    </span>
                  )}
                  {phases.length > 0 && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Flag className="w-3 h-3" />
                      {phases.length} phase{phases.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleFullCopy}
              className="shrink-0"
            >
              {fullCopied ? (
                <Check className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <Copy className="w-4 h-4 mr-1" />
              )}
              {fullCopied ? "Copied" : "Copy All"}
            </Button>
          </div>
        </CardHeader>

        {(goal || overview) && (
          <CardContent className="flex flex-col gap-2">
            {goal && (
              <p className="text-xs font-medium text-muted-foreground flex items-start gap-1.5">
                <Flag className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary" />
                <span className="text-foreground">{goal}</span>
              </p>
            )}
            {overview && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {overview}
              </p>
            )}
          </CardContent>
        )}
      </Card>

      {/* Timeline */}
      {phases.length > 0 && (
        <div className="flex flex-col pl-2">
          {phases.map((phase, i) => (
            <PhaseCard
              key={`phase-${phase.id ?? phase.title ?? phase.phase ?? phase.name ?? i}-${i}`}
              phase={phase}
              index={i}
              isLast={i === phases.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
