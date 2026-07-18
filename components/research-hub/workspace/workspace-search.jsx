"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  X,
  FileText,
  Youtube,
  Database,
  Network,
  ExternalLink,
} from "lucide-react";

const TYPE_META = {
  paper: { label: "Paper", icon: FileText, color: "text-blue-600" },
  video: { label: "Video", icon: Youtube, color: "text-red-600" },
  dataset: { label: "Dataset", icon: Database, color: "text-yellow-600" },
  topic: { label: "Similar Topic", icon: Network, color: "text-purple-600" },
};

function buildSearchIndex(data) {
  const index = [];

  const papers = data?.papers?.papers ?? [];
  papers.forEach((p) => {
    index.push({
      type: "paper",
      id: p.id ?? p.doi ?? p.title,
      title: p.title,
      subtitle: Array.isArray(p.authors)
        ? p.authors.slice(0, 2).join(", ")
        : "",
      url: p.url ?? null,
    });
  });

  const videos = data?.videos ?? [];
  videos.forEach((v) => {
    index.push({
      type: "video",
      id: v.videoId,
      title: v.title,
      subtitle: v.channelName ?? "",
      url: v.url ?? null,
    });
  });

  const datasets = data?.datasets ?? [];
  datasets.forEach((d) => {
    index.push({
      type: "dataset",
      id: d.id,
      title: d.name,
      subtitle: d.source ?? "",
      url: d.url ?? null,
    });
  });

  const similarTopics = Array.isArray(data?.similarTopics)
    ? data.similarTopics
    : (data?.similarTopics?.topics ?? []);
  similarTopics.forEach((t) => {
    index.push({
      type: "topic",
      id: t.id,
      title: t.name,
      subtitle: t.description ?? "",
      url: null,
    });
  });

  return index;
}

function ResultRow({ result, onSelect }) {
  const meta = TYPE_META[result.type] ?? TYPE_META.paper;
  const Icon = meta.icon;

  return (
    <button
      type="button"
      onClick={() => onSelect?.(result)}
      className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted transition-colors border-b border-border last:border-0"
    >
      <Icon className={`w-4 h-4 shrink-0 ${meta.color}`} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground truncate">
          {result.title}
        </p>
        {result.subtitle && (
          <p className="text-xs text-muted-foreground truncate">
            {result.subtitle}
          </p>
        )}
      </div>
      <span className="text-xs text-muted-foreground shrink-0">
        {meta.label}
      </span>
      {result.url && (
        <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0" />
      )}
    </button>
  );
}

export default function WorkspaceSearch({
  data,
  onSelectResult,
  placeholder = "Search papers, videos, datasets, topics...",
}) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const containerRef = useRef(null);

  const searchIndex = useMemo(() => buildSearchIndex(data), [data]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return searchIndex
      .filter(
        (item) =>
          item.title?.toLowerCase().includes(q) ||
          item.subtitle?.toLowerCase().includes(q),
      )
      .slice(0, 12);
  }, [query, searchIndex]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(result) {
    onSelectResult?.(result);

    if (result.url) {
      window.open(result.url, "_blank", "noopener,noreferrer");
    }

    setQuery("");
    setFocused(false);
  }

  function handleClear() {
    setQuery("");
    setFocused(false);
  }

  const showDropdown = focused && query.trim().length > 0;

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          autoComplete="off"
          spellCheck={false}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-input bg-background pl-9 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute z-20 mt-1.5 w-full rounded-lg border border-border bg-background shadow-lg max-h-80 overflow-y-auto">
          {results.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No results found for query
            </p>
          ) : (
            results.map((result, i) => (
              <ResultRow
                key={`${result.type}-${result.id ?? i}`}
                result={result}
                onSelect={handleSelect}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
