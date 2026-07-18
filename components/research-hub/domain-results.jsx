"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  BookOpen,
  Layers,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// ─── SubfieldChip ─────────────────────────────────────────────────────────────

function SubfieldChip({ subfield, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(subfield)}
      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer border border-primary/20"
    >
      <Layers className="w-3 h-3" />
      {subfield.displayName ?? subfield.name ?? "Unknown"}
      {subfield.worksCount != null && (
        <span className="ml-1 text-muted-foreground">
          (
          {typeof subfield.worksCount === "number"
            ? subfield.worksCount.toLocaleString()
            : subfield.worksCount}
          )
        </span>
      )}
    </button>
  );
}

// ─── DomainCard ───────────────────────────────────────────────────────────────

function DomainCard({ domain, onExplore }) {
  const [expanded, setExpanded] = useState(false);

  const subfields = Array.isArray(domain.subfields) ? domain.subfields : [];
  const visibleSubfields = expanded ? subfields : subfields.slice(0, 8);

  const worksCount = domain.worksCount ?? domain.works_count ?? null;
  const citedCount = domain.citedByCount ?? domain.cited_by_count ?? null;
  const description = domain.description ?? null;
  const displayName = domain.displayName ?? domain.name ?? "Unknown Domain";
  const source = domain.source ?? "openalex";
  const url = domain.url ?? domain.homepage ?? null;

  return (
    <Card className="flex flex-col h-full border border-border hover:border-primary/40 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-2 rounded-md bg-primary/10 shrink-0">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <CardTitle className="text-base font-semibold leading-tight line-clamp-2">
              {displayName}
            </CardTitle>
          </div>
          <Badge variant="outline" className="shrink-0 text-xs capitalize">
            {source}
          </Badge>
        </div>

        {description && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
            {description}
          </p>
        )}

        <div className="flex flex-wrap gap-3 mt-2">
          {worksCount != null && (
            <span className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                {typeof worksCount === "number"
                  ? worksCount.toLocaleString()
                  : worksCount}
              </span>{" "}
              works
            </span>
          )}
          {citedCount != null && (
            <span className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                {typeof citedCount === "number"
                  ? citedCount.toLocaleString()
                  : citedCount}
              </span>{" "}
              citations
            </span>
          )}
          {subfields.length > 0 && (
            <span className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                {subfields.length}
              </span>{" "}
              subfields
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 flex-1">
            {subfields.length > 0 && (
               <div className="flex flex-wrap gap-2">
              {visibleSubfields.map((sf, i) => (
              <span
                key={`sf-${sf.id ?? sf.name ?? i}-${i}`}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
              >
                <Layers className="w-3 h-3" />
                {sf.displayName ?? sf.name ?? "Unknown"}
              </span>
            ))}
            {subfields.length > 8 && (
              <button
                type="button"
                onClick={() => setExpanded((p) => !p)}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="w-3 h-3" /> Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3" /> +{subfields.length - 8}{" "}
                    more
                  </>
                )}
              </button>
            )}
          </div>
        )}

        <div className="flex gap-2 mt-auto pt-2">
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onExplore?.(domain)}
          >
            Explore Domain
          </Button>
          {url && (
            <Button size="sm" variant="outline" asChild>
              <a href={url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3 h-3" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── DomainResultsSkeleton ────────────────────────────────────────────────────

function DomainResultsSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="flex flex-col h-full">
          <CardHeader className="pb-2">
            <div className="flex items-start gap-2">
              <Skeleton className="w-8 h-8 rounded-md shrink-0" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-3 w-full mt-2" />
            <Skeleton className="h-3 w-2/3" />
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="h-6 w-20 rounded-full" />
              ))}
            </div>
            <Skeleton className="h-8 w-full mt-2 rounded-md" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── DomainResults ────────────────────────────────────────────────────────────

export default function DomainResults({
  domains = [],
  loading = false,
  error = null,
  onExplore,
  emptyMessage = "No domains found. Try a different search query.",
}) {
  if (loading) {
    return <DomainResultsSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-3 rounded-full bg-destructive/10 mb-3">
          <AlertCircle className="w-6 h-6 text-destructive" />
        </div>
        <p className="text-sm font-medium text-destructive">
          Failed to load domains
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {typeof error === "string" ? error : "An unexpected error occurred."}
        </p>
      </div>
    );
  }

  if (!Array.isArray(domains) || domains.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-3 rounded-full bg-muted mb-3">
          <BookOpen className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {domains.map((domain, i) => (
<DomainCard
          key={`domain-${domain.id ?? domain.name ?? i}-${i}`}
          domain={domain}
          onExplore={onExplore}
        />
      ))}
    </div>
  );
}
