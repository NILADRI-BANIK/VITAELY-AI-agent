"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flame, Clock, RefreshCw, Loader2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTrendingProjectsAction } from "@/actions/project-generator";

// ─── Difficulty Badge ──────────────────────────────────────────────────────────
const DifficultyBadge = ({ difficulty }) => {
  const styleMap = {
    Easy: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
    Medium:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    Hard: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  };
  return (
    <span
      className={cn(
        "text-xs font-medium px-2 py-0.5 rounded-full border",
        styleMap[difficulty] || styleMap["Medium"],
      )}
    >
      {difficulty}
    </span>
  );
};

// ─── Tech Tag ──────────────────────────────────────────────────────────────────
const TechTag = ({ tech }) => (
  <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-md font-medium">
    {tech}
  </span>
);

// ─── Card Skeleton ─────────────────────────────────────────────────────────────
const TrendingCardSkeleton = () => (
  <div className="border rounded-xl p-4 space-y-3 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="h-4 bg-muted rounded w-16" />
      <div className="h-4 bg-muted rounded w-12" />
    </div>
    <div className="h-5 bg-muted rounded w-3/4" />
    <div className="space-y-1.5">
      <div className="h-3 bg-muted rounded w-full" />
      <div className="h-3 bg-muted rounded w-5/6" />
    </div>
    <div className="flex gap-1.5">
      <div className="h-5 bg-muted rounded w-14" />
      <div className="h-5 bg-muted rounded w-14" />
      <div className="h-5 bg-muted rounded w-14" />
    </div>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────
export default function TrendingProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const loadTrending = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getTrendingProjectsAction();
        if (!mounted) return;
        if (result.success) {
          setProjects(result.data || []);
        } else {
          setError(result.error || "Failed to load trending projects");
        }
      } catch {
        if (!mounted) return;
        setError("Something went wrong. Please try again.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadTrending();
    return () => {
      mounted = false;
    };
  }, []);

  // ─── handleRefresh ────────────────────────────────────────────────────────────
  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const result = await getTrendingProjectsAction();
      if (result.success) {
        setProjects(result.data || []);
      } else {
        setError(result.error || "Failed to refresh");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setRefreshing(false);
    }
  };

  // ─── Loading State ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-primary" />
          <h2 className="text-base font-semibold">Trending Projects</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <TrendingCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-primary" />
          <h2 className="text-base font-semibold">Trending Projects</h2>
          {projects.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {projects.length} ideas
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="h-8 px-2 text-muted-foreground hover:text-foreground gap-1 text-xs"
        >
          {refreshing ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <RefreshCw className="w-3 h-3" />
          )}
          Refresh
        </Button>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}

      {/* ── Empty State ── */}
      {!error && projects.length === 0 && (
        <div className="border rounded-xl p-8 text-center space-y-2">
          <TrendingUp className="w-8 h-8 text-muted-foreground mx-auto" />
          <p className="text-sm font-medium">No trending projects yet</p>
          <p className="text-xs text-muted-foreground">
            Generate some project ideas to see them here.
          </p>
        </div>
      )}

      {/* ── Project Grid ── */}
      {projects.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project, index) => {
            const techStack =
              typeof project.techStack === "string"
                ? (() => {
                    try {
                      return JSON.parse(project.techStack);
                    } catch {
                      return {};
                    }
                  })()
                : project.techStack || {};

            const allTech = [
              ...(techStack?.frontend || []),
              ...(techStack?.backend || []),
              ...(techStack?.database || []),
            ];
            const visibleTech = allTech.slice(0, 4);
            const extraCount = allTech.length - 4;

            return (
              <Card
  key={project.id}
  onClick={() => router.push(`/project-ideas/${project.id}`)}
  className="border rounded-xl bg-card hover:border-primary/40 transition-colors duration-200 cursor-pointer"
>
                <CardHeader className="pb-2 space-y-2">
                  {/* ── Title Row ── */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground font-mono">
                        #{String(index + 1).padStart(2, "0")}
                      </span>
                      <DifficultyBadge difficulty={project.difficulty} />
                    </div>
                    {project.duration && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {project.duration}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold leading-tight line-clamp-2">
                    {project.title}
                  </h3>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* ── Description ── */}
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {project.description}
                  </p>

                  {/* ── Tech Tags ── */}
                  {visibleTech.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {visibleTech.map((tech, i) => (
                        <TechTag key={`${tech}-${i}`} tech={tech} />
                      ))}
                      {extraCount > 0 && (
                        <span className="text-xs text-muted-foreground self-center px-1">
                          +{extraCount} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* ── Resume Score ── */}
                  {project.resumeScore != null && (
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-3 h-3 text-primary shrink-0" />
                      <span className="text-xs text-muted-foreground">
                        Resume Score:{" "}
                        <span className="font-medium text-foreground">
                          {project.resumeScore}/10
                        </span>
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}