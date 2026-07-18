"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  X,
  Loader2,
  Clock,
  TrendingUp,
  FolderSearch,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { searchProjectsAction } from "@/actions/project-generator";

// ─── DifficultyBadge ───────────────────────────────────────────────────────────
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

// ─── TechTag ───────────────────────────────────────────────────────────────────
const TechTag = ({ tech }) => (
  <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-md font-medium">
    {tech}
  </span>
);

// ─── SearchResultSkeleton ──────────────────────────────────────────────────────
const SearchResultSkeleton = () => (
  <div className="border rounded-xl p-4 space-y-3 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="h-4 bg-muted rounded w-20" />
      <div className="h-4 bg-muted rounded w-12" />
    </div>
    <div className="h-5 bg-muted rounded w-3/4" />
    <div className="space-y-1.5">
      <div className="h-3 bg-muted rounded w-full" />
      <div className="h-3 bg-muted rounded w-4/5" />
    </div>
    <div className="flex gap-1.5">
      <div className="h-5 bg-muted rounded w-14" />
      <div className="h-5 bg-muted rounded w-14" />
    </div>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ProjectSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const isFirstRender = useRef(true);
  const router = useRouter();

  // ─── performSearch ─────────────────────────────────────────────────────────
  const performSearch = useCallback(async (searchQuery) => {
    setSearching(true);
    setError(null);
    try {
      const result = await searchProjectsAction(searchQuery);
      if (result.success) {
        setResults(result.data || []);
      } else {
        setError(result.error || "Search failed");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSearching(false);
      setLoading(false);
    }
  }, []);

  // ─── Initial Load ──────────────────────────────────────────────────────────
  useEffect(() => {
    performSearch("");
  }, [performSearch]);

  // ─── Debounced Search ──────────────────────────────────────────────────────
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      performSearch(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query, performSearch]);

  // ─── handleClear ───────────────────────────────────────────────────────────
  const handleClear = useCallback(() => {
    setQuery("");
    performSearch("");
  }, [performSearch]);

  // ─── handleKeyDown ─────────────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === "Escape") handleClear();
  };

  // ─── Initial Loading State ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-muted rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SearchResultSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* ── Search Input ── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search by title, description or difficulty..."
          className="pl-9 pr-9 bg-background h-10"
        />
        {(query || searching) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {searching ? (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            ) : (
              <button
                type="button"
                onClick={handleClear}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Results Count ── */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {query ? (
            <>
              <span className="font-medium text-foreground">
                {results.length}
              </span>{" "}
              result{results.length !== 1 ? "s" : ""} for{" "}
              <span className="font-medium text-foreground">
                &ldquo;{query}&rdquo;
              </span>
            </>
          ) : (
            <>
              <span className="font-medium text-foreground">
                {results.length}
              </span>{" "}
              project{results.length !== 1 ? "s" : ""} found
            </>
          )}
        </p>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 flex items-center justify-between gap-2">
          <p className="text-xs text-destructive">{error}</p>
          <button
            type="button"
            onClick={() => performSearch(query)}
            className="text-xs text-destructive underline hover:no-underline shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Empty State ── */}
      {!error && results.length === 0 && (
        <div className="border rounded-xl p-8 text-center space-y-2">
          <FolderSearch className="w-8 h-8 text-muted-foreground mx-auto" />
          <p className="text-sm font-medium">
            {query ? `No results for "${query}"` : "No projects yet"}
          </p>
          <p className="text-xs text-muted-foreground">
            {query
              ? "Try a different title, keyword, or difficulty level."
              : "Generate some project ideas to search through them."}
          </p>
          {query && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="mt-2 h-8 text-xs gap-1"
            >
              <X className="w-3 h-3" />
              Clear Search
            </Button>
          )}
        </div>
      )}

      {/* ── Results Grid ── */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((project, index) => {
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
            const visibleTech = allTech.slice(0, 3);
            const extraCount = allTech.length - 3;
            const features = Array.isArray(project.features)
              ? project.features
              : [];

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

                  {/* ── Meta Row ── */}
                  <div className="flex items-center justify-between pt-0.5">
                    {project.resumeScore != null && (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-primary" />
                        <span className="text-xs text-muted-foreground">
                          Resume:{" "}
                          <span className="font-medium text-foreground">
                            {project.resumeScore}/10
                          </span>
                        </span>
                      </div>
                    )}
                    {features.length > 0 && (
                      <Badge
                        variant="secondary"
                        className="text-xs ml-auto font-normal"
                      >
                        {features.length} feature
                        {features.length !== 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>

                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}