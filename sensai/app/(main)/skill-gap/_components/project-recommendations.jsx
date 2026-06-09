"use client";

import { useState } from "react";
import { Github, ExternalLink, Code2, Star, GitFork, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// getDifficultyColor
// ProjectCard
// ProjectRecommendations

const getDifficultyColor = (difficulty) => {
  const d = (difficulty || "").toLowerCase();
  if (d === "beginner" || d === "easy" || d === "low")
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (d === "intermediate" || d === "medium")
    return "bg-amber-50 text-amber-700 border-amber-200";
  if (d === "advanced" || d === "hard" || d === "high")
    return "bg-red-50 text-red-700 border-red-200";
  return "bg-slate-50 text-slate-600 border-slate-200";
};

function ProjectCard({ project, index }) {
  const [expanded, setExpanded] = useState(false);

  const title = project.title || project.name || `Project ${index + 1}`;
  const description = project.description || project.details || "";
  const skills = Array.isArray(project.skills)
    ? project.skills
    : typeof project.skills === "string"
    ? project.skills.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
  const difficulty = project.difficulty || project.level || "";
  const githubUrl = project.githubUrl || project.url || project.repoUrl || null;
  const stars = project.stars ?? project.stargazers_count ?? null;
  const forks = project.forks ?? project.forks_count ?? null;
  const language = project.language || null;
  const isLong = description.length > 120;
  const displayDesc = isLong && !expanded ? description.slice(0, 120) + "…" : description;

  return (
    <div className="group flex flex-col gap-3 p-5 rounded-xl border border-slate-100 bg-white hover:border-indigo-200 hover:shadow-md transition-all duration-200">

      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
            <Code2 className="w-4.5 h-4.5 text-indigo-600" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-800 text-sm leading-snug truncate">
              {title}
            </h3>
            {language && (
              <span className="text-xs text-slate-400 font-medium">{language}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {difficulty && (
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getDifficultyColor(difficulty)}`}
            >
              {difficulty}
            </span>
          )}
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
              aria-label="View on GitHub"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* Description */}
      {description && (
        <div>
          <p className="text-sm text-slate-600 leading-relaxed">{displayDesc}</p>
          {isLong && (
            <button
              onClick={() => setExpanded((prev) => !prev)}
              className="mt-1 inline-flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors"
            >
              {expanded ? (
                <>Show less <ChevronUp className="w-3 h-3" /></>
              ) : (
                <>Read more <ChevronDown className="w-3 h-3" /></>
              )}
            </button>
          )}
        </div>
      )}

      {/* GitHub stats */}
      {(stars !== null || forks !== null) && (
        <div className="flex items-center gap-3 text-xs text-slate-400">
          {stars !== null && (
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5" />
              {Number(stars).toLocaleString()}
            </span>
          )}
          {forks !== null && (
            <span className="flex items-center gap-1">
              <GitFork className="w-3.5 h-3.5" />
              {Number(forks).toLocaleString()}
            </span>
          )}
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {skills.map((skill, i) => (
            <Badge
              key={i}
              variant="secondary"
              className="text-xs px-2 py-0.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-md font-normal"
            >
              {typeof skill === "string" ? skill : skill?.name || String(skill)}
            </Badge>
          ))}
        </div>
      )}

      {/* GitHub link button */}
      {githubUrl && (
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <Github className="w-3.5 h-3.5" />
          View Repository
        </a>
      )}
    </div>
  );
}

export default function ProjectRecommendations({ projects = [] }) {
  const [showAll, setShowAll] = useState(false);

  if (!projects?.length) return null;

  const INITIAL_COUNT = 4;
  const visible = showAll ? projects : projects.slice(0, INITIAL_COUNT);
  const hasMore = projects.length > INITIAL_COUNT;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Github className="w-5 h-5 text-slate-700" />
          <h2 className="text-base font-semibold text-slate-800">
            Project Recommendations
          </h2>
          <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {projects.length}
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {visible.map((project, i) => (
          <ProjectCard key={project.id || project.title || i} project={project} index={i} />
        ))}
      </div>

      {/* Show more / less */}
      {hasMore && (
        <div className="flex justify-center pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAll((prev) => !prev)}
            className="text-sm text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
          >
            {showAll ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1.5" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1.5" />
                Show {projects.length - INITIAL_COUNT} More
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}