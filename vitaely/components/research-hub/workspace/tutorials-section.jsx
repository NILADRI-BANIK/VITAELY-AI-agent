"use client";

import {
  BookOpen,
  ExternalLink,
  AlertCircle,
  GraduationCap,
  FileSearch,
  Newspaper,
  Github,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const CURATED_SOURCES = [
  {
    key: "official-docs",
    label: "Official Documentation Search",
    icon: FileSearch,
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    buildUrl: (q) => `https://www.google.com/search?q=${encodeURIComponent(`${q} official documentation`)}`,
    description: "Find official docs and reference guides.",
  },
  {
    key: "survey-guides",
    label: "Survey & Research Guides",
    icon: GraduationCap,
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    buildUrl: (q) => `https://scholar.google.com/scholar?q=${encodeURIComponent(`${q} survey tutorial`)}`,
    description: "Academic survey papers and structured guides.",
  },
  {
    key: "blog-posts",
    label: "Blog Posts & Explainers",
    icon: Newspaper,
    color: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    buildUrl: (q) => `https://medium.com/search?q=${encodeURIComponent(`${q} tutorial`)}`,
    description: "Beginner-friendly explainers and walkthroughs.",
  },
  {
    key: "code-examples",
    label: "Code Examples & Guides",
    icon: Github,
    color: "bg-green-500/10 text-green-600 border-green-500/20",
    buildUrl: (q) => `https://github.com/search?q=${encodeURIComponent(`${q} tutorial`)}&type=repositories`,
    description: "Hands-on repositories and example implementations.",
  },
];

function buildQuery(topic) {
  if (!topic) return "";
  const name = topic.topicName ?? topic.topic ?? topic.title ?? "";
  return name.trim();
}

function TutorialSourceCard({ source, query }) {
  const Icon = source.icon;
  const href = source.buildUrl(query);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      <Card className="w-full border border-border hover:border-primary/40 transition-colors h-full">
        <CardContent className="pt-5 flex flex-col gap-2.5">
          <div className="flex items-start justify-between gap-2">
            <span
              className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border ${source.color}`}
            >
              <Icon className="w-4 h-4" />
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-1" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {source.label}
            </p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {source.description}
            </p>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}

function CustomTutorialRow({ tutorial }) {
  return (
    <a
      href={tutorial.url ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start justify-between gap-3 py-2.5 border-b border-border last:border-0 group"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
          {tutorial.title}
        </p>
        {tutorial.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {tutorial.description}
          </p>
        )}
        {tutorial.source && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {tutorial.source}
          </p>
        )}
      </div>
      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-1" />
    </a>
  );
}

function TutorialsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="pt-5 flex flex-col gap-2.5">
            <Skeleton className="w-9 h-9 rounded-lg" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function TutorialsSection({
  tutorials = [],
  topic = null,
  loading = false,
  error = null,
}) {
  if (loading) return <TutorialsSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-3 rounded-full bg-destructive/10 mb-3">
          <AlertCircle className="w-6 h-6 text-destructive" />
        </div>
        <p className="text-sm font-medium text-destructive">
          Failed to load tutorials
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {typeof error === "string" ? error : "An unexpected error occurred."}
        </p>
      </div>
    );
  }

  const query = buildQuery(topic);
  const hasCustomTutorials = Array.isArray(tutorials) && tutorials.length > 0;

  if (!hasCustomTutorials && !query) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-3 rounded-full bg-muted mb-3">
          <BookOpen className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          No tutorials available for this topic yet.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {hasCustomTutorials && (
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground mb-2">
            <span className="font-medium text-foreground">
              {tutorials.length}
            </span>{" "}
            resource{tutorials.length !== 1 ? "s" : ""} found
          </p>
          <Card>
            <CardContent className="pt-4">
              {tutorials.map((tutorial, i) => (
                <CustomTutorialRow
                  key={tutorial.id ?? tutorial.url ?? i}
                  tutorial={tutorial}
                />
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {query && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Explore learning resources for{" "}
            <span className="font-medium text-foreground">{query}</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CURATED_SOURCES.map((source) => (
              <TutorialSourceCard
                key={source.key}
                source={source}
                query={query}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}