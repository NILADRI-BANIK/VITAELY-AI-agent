"use client";

import {
  Database,
  ExternalLink,
  AlertCircle,
  HardDrive,
  FileBadge,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const SOURCE_COLORS = {
  Kaggle: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  "Hugging Face": "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  Zenodo: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
};

function SourceBadge({ source }) {
  const colorClass =
    SOURCE_COLORS[source] ?? "bg-muted text-muted-foreground border-border";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}
    >
      {source ?? "Unknown"}
    </span>
  );
}

function DatasetCard({ dataset }) {
  return (
    <a
      href={dataset.url ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      <Card className="w-full border border-border hover:border-primary/40 transition-colors h-full">
        <CardContent className="pt-5 flex flex-col gap-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="p-2 rounded-md bg-primary/10 shrink-0">
              <Database className="w-4 h-4 text-primary" />
            </div>
            <SourceBadge source={dataset.source} />
          </div>

          <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
            {dataset.name}
          </p>

          <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
            {dataset.size && (
              <span className="flex items-center gap-1">
                <HardDrive className="w-3 h-3" />
                {dataset.size}
              </span>
            )}
            {dataset.license && (
              <span className="flex items-center gap-1">
                <FileBadge className="w-3 h-3" />
                {dataset.license}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-xs text-primary pt-1">
            <ExternalLink className="w-3 h-3" />
            View Dataset
          </div>
        </CardContent>
      </Card>
    </a>
  );
}

function DatasetsSkeleton({ count = 6 }) {
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
            <div className="flex gap-2">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="h-3 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function DatasetsSection({
  datasets = [],
  loading = false,
  error = null,
}) {
  if (loading) return <DatasetsSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-3 rounded-full bg-destructive/10 mb-3">
          <AlertCircle className="w-6 h-6 text-destructive" />
        </div>
        <p className="text-sm font-medium text-destructive">
          Failed to load datasets
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {typeof error === "string" ? error : "An unexpected error occurred."}
        </p>
      </div>
    );
  }

  if (!Array.isArray(datasets) || datasets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-3 rounded-full bg-muted mb-3">
          <Database className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          No public datasets found for this topic yet.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{datasets.length}</span>{" "}
        dataset{datasets.length !== 1 ? "s" : ""} found
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {datasets.map((dataset, i) => (
          <DatasetCard key={dataset.id ?? i} dataset={dataset} />
        ))}
      </div>
    </div>
  );
}