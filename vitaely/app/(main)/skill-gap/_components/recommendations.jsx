"use client";

import { useState, useMemo } from "react";
import {
  Github,
  Star,
  GitFork,
  ExternalLink,
  Code2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const INITIAL_VISIBLE = 6;

const LANGUAGE_COLORS = {
  JavaScript: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  TypeScript: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  Python: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Java: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  Go: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
  Rust: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  "C++": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  Ruby: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200",
  PHP: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  Swift: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
};

const DIFFICULTY_STYLES = {
  Beginner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Intermediate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  Advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

function formatCount(num) {
  if (!num || isNaN(num)) return "0";
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return String(num);
}

function ProjectCard({ project }) {
  const languageStyle =
    LANGUAGE_COLORS[project.language] ||
    "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";

  const difficultyStyle =
    DIFFICULTY_STYLES[project.difficulty] ||
    "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";

  function handleOpenRepo() {
    if (project.url) window.open(project.url, "_blank", "noopener,noreferrer");
  }

  return (
    <Card className="group flex flex-col hover:shadow-md transition-shadow duration-200 border border-border">
      <CardContent className="flex flex-col flex-1 gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {project.name || project.title}
            </h4>
            {project.owner && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {project.owner}
              </p>
            )}
          </div>
          <Github className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
        </div>

        {project.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {project.language && (
            <Badge className={`text-xs px-2 py-0.5 border-0 ${languageStyle}`}>
              {project.language}
            </Badge>
          )}

          {project.difficulty && (
            <Badge className={`text-xs px-2 py-0.5 border-0 ${difficultyStyle}`}>
              {project.difficulty}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3">
          {project.stars !== undefined && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {formatCount(project.stars)}
            </span>
          )}

          {project.forks !== undefined && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <GitFork className="h-3 w-3" />
              {formatCount(project.forks)}
            </span>
          )}
        </div>

        {Array.isArray(project.topics) && project.topics.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.topics.slice(0, 3).map((topic) => (
              <span
                key={topic}
                className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full"
              >
                {topic}
              </span>
            ))}
            {project.topics.length > 3 && (
              <span className="text-xs text-muted-foreground self-center">
                +{project.topics.length - 3} more
              </span>
            )}
          </div>
        )}

        {Array.isArray(project.skills) && project.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full"
              >
                {skill}
              </span>
            ))}
            {project.skills.length > 3 && (
              <span className="text-xs text-muted-foreground self-center">
                +{project.skills.length - 3} more
              </span>
            )}
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          className="mt-auto w-full text-xs h-8"
          onClick={handleOpenRepo}
          disabled={!project.url}
          aria-label={`Open ${project.name || project.title} on GitHub`}
        >
          <ExternalLink className="h-3 w-3 mr-1.5" />
          View on GitHub
        </Button>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-10 text-center">
      <Code2 className="h-10 w-10 text-muted-foreground mb-3 opacity-40" />
      <p className="text-sm text-muted-foreground">
        No project recommendations available for this analysis.
      </p>
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-10 text-center gap-2">
      <AlertCircle className="h-10 w-10 text-destructive opacity-60" />
      <p className="text-sm text-muted-foreground">
        {message || "Failed to load project recommendations."}
      </p>
    </div>
  );
}

export default function ProjectRecommendations({ projects = [], error = null }) {
  const [showAll, setShowAll] = useState(false);

  const displayedProjects = useMemo(
    () => (showAll ? projects : projects.slice(0, INITIAL_VISIBLE)),
    [showAll, projects]
  );

  const hiddenCount = useMemo(
    () => Math.max(0, projects.length - INITIAL_VISIBLE),
    [projects]
  );

  function toggleShowAll() {
    setShowAll((prev) => !prev);
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Github className="h-4 w-4 text-primary" />
            Project Recommendations
          </CardTitle>
          {projects.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {projects.length}{" "}
              {projects.length === 1 ? "project" : "projects"}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {error ? (
            <ErrorState message={error} />
          ) : projects.length === 0 ? (
            <EmptyState />
          ) : (
            displayedProjects.map((project, index) => (
              <ProjectCard
                key={project.id ?? `${project.name ?? project.title}-${index}`}
                project={project}
              />
            ))
          )}
        </div>

        {hiddenCount > 0 && (
          <div className="flex justify-center pt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleShowAll}
              className="text-xs text-muted-foreground hover:text-foreground gap-1"
              aria-label={showAll ? "Show fewer projects" : `Show ${hiddenCount} more projects`}
            >
              {showAll ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" />
                  Show {hiddenCount} More
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}