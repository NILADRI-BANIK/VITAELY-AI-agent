"use client";

import { useState } from "react";
import {
  Wrench,
  ExternalLink,
  Search,
  ChevronDown,
  ChevronUp,
  Star,
  StarOff,
  Tag,
  AlertCircle,
  Layers,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const EMPTY_SET = new Set();
// ─── ToolsSkeleton ────────────────────────────────────────────────────────────

function ToolsSkeleton({ count = 6 }) {
  return (
    <div className="flex flex-col gap-8">
      {Array.from({ length: 2 }).map((_, g) => (
        <div key={g} className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5 rounded-md shrink-0" />
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-5 w-8 rounded-full ml-1" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: Math.ceil(count / 2) }).map((_, i) => (
              <Card key={i} className="flex flex-col h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <Skeleton className="w-8 h-8 rounded-md shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                    <Skeleton className="w-6 h-6 rounded-md shrink-0" />
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                  <div className="flex gap-2 mt-1">
                    {Array.from({ length: 2 }).map((_, j) => (
                      <Skeleton key={j} className="h-5 w-16 rounded-full" />
                    ))}
                  </div>
                  <Skeleton className="h-8 w-full mt-2 rounded-md" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── ToolCard ─────────────────────────────────────────────────────────────────

function ToolCard({ tool, onFavorite, favoriteIds = EMPTY_SET }) {
  const [expanded, setExpanded] = useState(false);

  const id = tool.id ?? tool.name ?? tool.url ?? null;
  const isFavorite = id && favoriteIds instanceof Set ? favoriteIds.has(String(id)) : false;

  const name = tool.name ?? tool.title ?? "Unnamed Tool";
  const description = tool.description ?? tool.summary ?? null;
  const url = tool.url ?? tool.link ?? tool.homepage ?? null;
  const tags = Array.isArray(tool.tags) ? tool.tags : [];
  const features = Array.isArray(tool.features) ? tool.features : [];
  const pricing =
    tool.pricing ?? tool.price ?? tool.plan ?? null;
  const pricingFree =
    tool.free === true ||
    (typeof pricing === "string" &&
      pricing.toLowerCase().includes("free"));
  const category = tool.category ?? tool.type ?? null;
  const badge = tool.badge ?? tool.label ?? null;

  const hasMore = features.length > 0 || tags.length > 0;

  return (
    <Card className="flex flex-col h-full border border-border hover:border-primary/40 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0 flex-1">
            <div className="p-2 rounded-md bg-primary/10 shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div className="flex flex-col min-w-0">
              <CardTitle className="text-sm font-semibold leading-snug line-clamp-1">
                {name}
              </CardTitle>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                {badge && (
                  <Badge variant="secondary" className="text-xs">
                    {badge}
                  </Badge>
                )}
                {pricingFree && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 border border-green-500/20">
                    Free
                  </span>
                )}
                {pricing && !pricingFree && (
                  <span className="text-xs text-muted-foreground capitalize">
                    {pricing}
                  </span>
                )}
              </div>
            </div>
          </div>
          {onFavorite && (
            <button
              type="button"
              onClick={() => onFavorite?.(tool)}
              className="p-1.5 rounded-md hover:bg-muted transition-colors shrink-0"
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              {isFavorite ? (
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              ) : (
                <StarOff className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 flex-1">
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
            {description}
          </p>
        )}

        {expanded && (
          <>
            {features.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Features
                </span>
                <ul className="flex flex-col gap-1">
                  {features.map((feature, i) => {
                    const text =
                      typeof feature === "string"
                        ? feature
                        : feature.text ?? feature.name ?? feature.value ?? JSON.stringify(feature);
                    return (
                      <li
                        key={`feat-${i}`}
                        className="flex items-start gap-1.5 text-xs text-foreground"
                      >
                        <span className="w-1 h-1 rounded-full bg-primary shrink-0 mt-1.5" />
                        {text}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag, i) => (
                  <span
                    key={`tag-${i}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-secondary text-secondary-foreground border border-border"
                  >
                    <Tag className="w-2.5 h-2.5" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </>
        )}

        <div className="flex items-center gap-2 mt-auto pt-2">
          {url ? (
            <Button size="sm" className="flex-1" asChild>
              <a href={url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3 h-3 mr-1" />
                Open Tool
              </a>
            </Button>
          ) : (
            <Button size="sm" className="flex-1" disabled>
              No Link Available
            </Button>
          )}

          {hasMore && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setExpanded((p) => !p)}
              className="px-2"
            >
              {expanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── CategoryGroup ────────────────────────────────────────────────────────────

function CategoryGroup({ category, tools, onFavorite, favoriteIds }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="p-1 rounded-md bg-primary/10 shrink-0">
          <Layers className="w-4 h-4 text-primary" />
        </div>
        <h3 className="text-sm font-semibold text-foreground capitalize">
          {category}
        </h3>
        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
          {tools.length}
        </span>
        <button
          type="button"
          onClick={() => setCollapsed((p) => !p)}
          className="ml-auto p-1 rounded hover:bg-muted transition-colors"
          aria-label={collapsed ? "Expand category" : "Collapse category"}
        >
          {collapsed ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>

      {!collapsed && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool, i) => (
            <ToolCard
              key={`tool-${tool.id ?? tool.name ?? tool.url ?? i}-${i}`}
              tool={tool}
              onFavorite={onFavorite}
              favoriteIds={favoriteIds}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── ToolsGrid ────────────────────────────────────────────────────────────────

export default function ToolsGrid({
  tools = [],
  loading = false,
  error = null,
  favoriteIds = EMPTY_SET,
  onFavorite,
  emptyMessage = "No tools available. Check back later.",
}) {
  const [search, setSearch] = useState("");

  if (loading) {
    return <ToolsSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-3 rounded-full bg-destructive/10 mb-3">
          <AlertCircle className="w-6 h-6 text-destructive" />
        </div>
        <p className="text-sm font-medium text-destructive">
          Failed to load tools
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {typeof error === "string" ? error : "An unexpected error occurred."}
        </p>
      </div>
    );
  }

  if (!Array.isArray(tools) || tools.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-3 rounded-full bg-muted mb-3">
          <Wrench className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  const query = search.trim().toLowerCase();

  const filtered = query
    ? tools.filter((tool) => {
        const name = (tool.name ?? tool.title ?? "").toLowerCase();
        const description = (tool.description ?? tool.summary ?? "").toLowerCase();
        const category = (tool.category ?? tool.type ?? "").trim().toLowerCase();
        const tags = Array.isArray(tool.tags)
  ? tool.tags
      .map((tag) => (typeof tag === "string" ? tag : tag.name ?? ""))
      .join(" ")
      .toLowerCase()
  : "";
        return (
          name.includes(query) ||
          description.includes(query) ||
          category.includes(query) ||
          tags.includes(query)
        );
      })
    : tools;

  // Group by category
  const grouped = filtered.reduce((acc, tool) => {
    const cat = (tool.category ?? tool.type ?? "General").trim().toLowerCase();
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(tool);
    return acc;
  }, {});

  const categories = Object.keys(grouped).sort();

  return (
    <div className="flex flex-col gap-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tools by name, category, or tag..."
          className="w-full pl-9 pr-4 py-2 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
        />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 flex-wrap">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{filtered.length}</span>{" "}
          tool{filtered.length !== 1 ? "s" : ""}
          {query && (
            <span>
              {" "}
              matching{" "}
              <span className="font-medium text-foreground">&quot;{query}&quot;</span>
            </span>
          )}
        </p>
        <span className="text-xs text-muted-foreground">
          {categories.length} categor{categories.length !== 1 ? "ies" : "y"}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-3 rounded-full bg-muted mb-3">
            <Search className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            No tools match your search. Try a different keyword.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {categories.map((category) => (
            <CategoryGroup
              key={category}
              category={category}
              tools={grouped[category]}
              onFavorite={onFavorite}
              favoriteIds={favoriteIds}
            />
          ))}
        </div>
      )}
    </div>
  );
}