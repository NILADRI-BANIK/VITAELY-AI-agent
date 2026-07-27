"use client";

import {
  Network,
  AlertCircle,
  Flame,
  Sprout,
  Landmark,
  FileText,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function categorizeTopics(topics) {
  const counts = topics
    .map((t) => t.worksCount ?? 0)
    .filter((c) => c > 0)
    .sort((a, b) => a - b);

  if (counts.length === 0) {
    return topics.map((t) => ({ ...t, category: "Related" }));
  }

  const mid = counts[Math.floor(counts.length / 2)];
  const high = counts[Math.floor(counts.length * 0.8)];

  return topics.map((t) => {
    const count = t.worksCount ?? 0;
    let category = "Related";
    if (count === 0) category = "Emerging";
    else if (count >= high) category = "Trending";
    else if (count <= mid * 0.4) category = "Emerging";
    return { ...t, category };
  });
}

const CATEGORY_META = {
  Trending: {
    icon: Flame,
    color: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  },
  Emerging: {
    icon: Sprout,
    color: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  Related: {
    icon: Landmark,
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
};

function CategoryBadge({ category }) {
  const meta = CATEGORY_META[category] ?? CATEGORY_META.Related;
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${meta.color}`}
    >
      <Icon className="w-3 h-3" />
      {category}
    </span>
  );
}

function SimilarTopicCard({ topic, onExplore }) {
  return (
    <Card className="w-full border border-border hover:border-primary/40 transition-colors h-full">
      <CardContent className="pt-5 flex flex-col gap-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="p-2 rounded-md bg-primary/10 shrink-0">
            <Network className="w-4 h-4 text-primary" />
          </div>
          <CategoryBadge category={topic.category} />
        </div>

        <p className="text-sm font-semibold text-foreground leading-snug">
          {topic.name}
        </p>

        {topic.description && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
            {topic.description}
          </p>
        )}

        {topic.worksCount != null && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <FileText className="w-3 h-3" />
            {topic.worksCount.toLocaleString()} papers
          </span>
        )}

        <Button
          size="sm"
          variant="outline"
          className="w-full mt-1"
          onClick={() => onExplore?.(topic)}
        >
          Explore Topic
          <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
        </Button>
      </CardContent>
    </Card>
  );
}

function SimilarTopicsSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardContent className="pt-5 flex flex-col gap-2.5">
            <div className="flex items-start justify-between">
              <Skeleton className="w-8 h-8 rounded-md" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-8 w-full rounded-md mt-1" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function SimilarTopicsSection({
  topics = [],
  loading = false,
  error = null,
  onExplore,
}) {
  if (loading) return <SimilarTopicsSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-3 rounded-full bg-destructive/10 mb-3">
          <AlertCircle className="w-6 h-6 text-destructive" />
        </div>
        <p className="text-sm font-medium text-destructive">
          Failed to load similar topics
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {typeof error === "string" ? error : "An unexpected error occurred."}
        </p>
      </div>
    );
  }

  if (!Array.isArray(topics) || topics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-3 rounded-full bg-muted mb-3">
          <Network className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          No similar topics found yet.
        </p>
      </div>
    );
  }

  const categorized = categorizeTopics(topics);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{topics.length}</span>{" "}
        related topic{topics.length !== 1 ? "s" : ""} found
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categorized.map((topic, i) => (
          <SimilarTopicCard
            key={topic.id ?? i}
            topic={topic}
            onExplore={onExplore}
          />
        ))}
      </div>
    </div>
  );
}