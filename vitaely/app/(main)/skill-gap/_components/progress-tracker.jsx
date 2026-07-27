"use client";

import { useState, useCallback, useTransition, useMemo } from "react";
import {
  CheckCircle2,
  Circle,
  Trophy,
  Target,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { updateProgress } from "@/actions/skill-gap";
import { toast } from "sonner";

const PRIORITY_STYLES = {
  high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  medium:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
};

function normalizeSkills(skills) {
  if (!Array.isArray(skills)) return [];
  return skills.map((s) =>
    typeof s === "string"
      ? { name: s, priority: null, category: null }
      : {
          name: s.name ?? s.skill ?? "",
          priority: s.priority ?? null,
          category: s.category ?? null,
        },
  );
}

function buildInitialCompleted(normalizedSkills, savedProgress) {
  if (!Array.isArray(savedProgress) || savedProgress.length === 0)
    return new Set();
  const saved = new Set(
    savedProgress.map((p) =>
      typeof p === "string" ? p : (p.skill ?? p.name ?? ""),
    ),
  );
  return new Set(
    normalizedSkills.filter((s) => saved.has(s.name)).map((s) => s.name),
  );
}

function ProgressBar({ value }) {
  return (
    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
      <div
        className="h-full rounded-full bg-primary transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

function CompletionBadge({ count, total }) {
  if (count === total && total > 0) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-medium">
        <Trophy className="h-3.5 w-3.5" />
        All skills completed!
      </div>
    );
  }
  return (
    <Badge variant="secondary" className="text-xs">
      {count}/{total} done
    </Badge>
  );
}

function SkillRow({ skill, index, isCompleted, isPending, onToggle }) {
  const priorityStyle = skill.priority
    ? (PRIORITY_STYLES[String(skill.priority).toLowerCase()] ??
      "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300")
    : null;

  function handleKeyDown(e) {
    if ((e.key === "Enter" || e.key === " ") && !isPending) {
      e.preventDefault();
      onToggle(skill.name);
    }
  }

  return (
    <div
      role="checkbox"
      aria-checked={isCompleted}
      tabIndex={0}
      onClick={() => !isPending && onToggle(skill.name)}
      onKeyDown={handleKeyDown}
      className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors cursor-pointer select-none ${
        isCompleted
          ? "bg-muted/60 border-border"
          : "bg-background border-border hover:bg-muted/30"
      }`}
    >
      <div className="shrink-0">
        {isPending ? (
          <Loader2 className="h-4 w-4 text-primary animate-spin" />
        ) : isCompleted ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : (
          <Circle className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      <span
        className={`flex-1 text-sm ${
          isCompleted ? "line-through text-muted-foreground" : "text-foreground"
        }`}
      >
        {skill.name}
      </span>

      {priorityStyle && (
        <Badge
          className={`text-xs border-0 px-2 py-0.5 shrink-0 ${priorityStyle}`}
        >
          {skill.priority}
        </Badge>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <Target className="h-10 w-10 text-muted-foreground mb-3 opacity-40" />
      <p className="text-sm text-muted-foreground">
        No skills to track for this analysis.
      </p>
    </div>
  );
}

export default function ProgressTracker({
  skills = [],
  analysisId = null,
  savedProgress = [],
}) {
  const normalized = useMemo(() => normalizeSkills(skills), [skills]);

  const [completed, setCompleted] = useState(() =>
    buildInitialCompleted(normalized, savedProgress),
  );
  const [pendingSkills, setPendingSkills] = useState(new Set());
  const [, startTransition] = useTransition();

  const pct = useMemo(
    () =>
      normalized.length > 0
        ? Math.round((completed.size / normalized.length) * 100)
        : 0,
    [completed.size, normalized.length],
  );

  const handleToggle = useCallback(
    (skillName) => {
      if (pendingSkills.has(skillName)) return;

      const snapshot = new Set(completed);
      const next = new Set(completed);
      if (next.has(skillName)) {
        next.delete(skillName);
      } else {
        next.add(skillName);
      }

      setCompleted(next);
      setPendingSkills((prev) => new Set([...prev, skillName]));

      startTransition(async () => {
        try {
          if (analysisId) {
            const isCompleted = next.has(skillName);
            await updateProgress({
              analysisId,
              skillName,
              completed: isCompleted,
            });
          }
        } catch {
          setCompleted(snapshot);
          toast.error("Failed to save progress. Please try again.");
        } finally {
          setPendingSkills((prev) => {
            const updated = new Set(prev);
            updated.delete(skillName);
            return updated;
          });
        }
      });
    },
    [completed, pendingSkills, analysisId],
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Progress Tracker
          </CardTitle>
          {normalized.length > 0 && (
            <CompletionBadge count={completed.size} total={normalized.length} />
          )}
        </div>

        {normalized.length > 0 && (
          <div className="mt-2 space-y-1">
            <ProgressBar value={pct} />
            <p className="text-xs text-muted-foreground text-right">
              {pct}% complete
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {normalized.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-1.5">
            {!analysisId && (
              <div className="flex items-center gap-2 p-2.5 mb-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <AlertCircle className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400 shrink-0" />
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  Save your analysis to persist progress across sessions.
                </p>
              </div>
            )}
            {normalized.map((skill, index) => (
              <SkillRow
                key={`${skill.name}-${index}`}
                skill={skill}
                index={index}
                isCompleted={completed.has(skill.name)}
                isPending={pendingSkills.has(skill.name)}
                onToggle={handleToggle}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
