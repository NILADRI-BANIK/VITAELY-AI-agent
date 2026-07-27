"use client";

import { useState, useMemo } from "react";
import {
  FileText,
  ExternalLink,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  Circle,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SOURCE_LABELS = {
  openalex: "OpenAlex",
  semantic_scholar: "Semantic Scholar",
  crossref: "Crossref",
};

const METHODOLOGY_LABELS = {
  quantitative: "Quantitative",
  qualitative: "Qualitative",
  "mixed-methods": "Mixed Methods",
  experimental: "Experimental",
  survey: "Survey",
  "case-study": "Case Study",
  "systematic-review": "Systematic Review",
  "action-research": "Action Research",
};

function sortPapers(papers, sortKey, sortDir) {
  const sorted = [...papers];
  sorted.sort((a, b) => {
    let aVal;
    let bVal;

    switch (sortKey) {
      case "title":
        aVal = (a.title || "").toLowerCase();
        bVal = (b.title || "").toLowerCase();
        break;
      case "year":
        aVal = a.year || 0;
        bVal = b.year || 0;
        break;
      case "citationCount":
        aVal = a.citationCount || 0;
        bVal = b.citationCount || 0;
        break;
      case "methodology":
        aVal = a.detectedMethodologyType || "";
        bVal = b.detectedMethodologyType || "";
        break;
      case "sampleSize":
        aVal = a.detectedSampleSize || 0;
        bVal = b.detectedSampleSize || 0;
        break;
      default:
        aVal = 0;
        bVal = 0;
    }

    if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
    return 0;
  });
  return sorted;
}

function SortableHeader({ label, sortKey, activeSortKey, sortDir, onSort }) {
  const isActive = sortKey === activeSortKey;
  return (
    <th
      onClick={() => onSort(sortKey)}
      className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground cursor-pointer select-none whitespace-nowrap hover:text-foreground transition-colors"
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {isActive ? (
          sortDir === "asc" ? (
            <ArrowUp className="w-3 h-3" />
          ) : (
            <ArrowDown className="w-3 h-3" />
          )
        ) : (
          <ArrowUpDown className="w-3 h-3 opacity-40" />
        )}
      </span>
    </th>
  );
}

export default function LiteratureMethodologyTable({
  papers = [],
  loading = false,
  emptyMessage = "No papers analyzed yet.",
}) {
  const [sortKey, setSortKey] = useState("citationCount");
  const [sortDir, setSortDir] = useState("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [methodologyFilter, setMethodologyFilter] = useState("all");

  const availableMethodologies = useMemo(() => {
    const set = new Set();
    papers.forEach((p) => {
      if (p.detectedMethodologyType) set.add(p.detectedMethodologyType);
    });
    return Array.from(set);
  }, [papers]);

  const handleSort = (key) => {
    if (key === sortKey) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const filteredPapers = useMemo(() => {
    let result = papers;

    if (methodologyFilter !== "all") {
      if (methodologyFilter === "unclear") {
        result = result.filter((p) => !p.detectedMethodologyType);
      } else {
        result = result.filter((p) => p.detectedMethodologyType === methodologyFilter);
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((p) => (p.title || "").toLowerCase().includes(q));
    }

    return sortPapers(result, sortKey, sortDir);
  }, [papers, methodologyFilter, searchQuery, sortKey, sortDir]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Loading literature analysis...
        </CardContent>
      </Card>
    );
  }

  if (!papers.length) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <div className="p-3 rounded-full bg-muted mb-3">
            <FileText className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Analyzed Literature ({filteredPapers.length}/{papers.length})
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 w-44"
              />
            </div>
            <select
              value={methodologyFilter}
              onChange={(e) => setMethodologyFilter(e.target.value)}
              className="text-xs rounded-md border border-input bg-background px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="all">All Methodologies</option>
              {availableMethodologies.map((m) => (
                <option key={m} value={m}>
                  {METHODOLOGY_LABELS[m] || m}
                </option>
              ))}
              <option value="unclear">Unclear</option>
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <SortableHeader
                  label="Title"
                  sortKey="title"
                  activeSortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Year"
                  sortKey="year"
                  activeSortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Citations"
                  sortKey="citationCount"
                  activeSortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Methodology"
                  sortKey="methodology"
                  activeSortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                />
                <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">
                  Validation
                </th>
                <SortableHeader
                  label="Sample Size"
                  sortKey="sampleSize"
                  activeSortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                />
                <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">
                  Source
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">
                  OA
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">
                  Link
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPapers.map((paper, i) => (
                <tr
                  key={paper.id ?? paper.doi ?? `${paper.title}-${i}`}
                  className="border-b border-border/60 hover:bg-muted/40 transition-colors"
                >
                  <td className="px-3 py-2.5 text-sm max-w-xs">
                    <span className="line-clamp-2 leading-snug">{paper.title || "Untitled"}</span>
                  </td>
                  <td className="px-3 py-2.5 text-sm text-muted-foreground whitespace-nowrap">
                    {paper.year ?? "—"}
                  </td>
                  <td className="px-3 py-2.5 text-sm text-muted-foreground whitespace-nowrap">
                    {paper.citationCount ?? 0}
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    {paper.detectedMethodologyType ? (
                      <Badge variant="secondary" className="text-xs">
                        {METHODOLOGY_LABELS[paper.detectedMethodologyType] ||
                          paper.detectedMethodologyType}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">Unclear</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 max-w-[160px]">
                    {Array.isArray(paper.detectedValidationMethods) &&
                    paper.detectedValidationMethods.length > 0 ? (
                      <span className="text-xs text-muted-foreground line-clamp-2">
                        {paper.detectedValidationMethods.join(", ")}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-sm text-muted-foreground whitespace-nowrap">
                    {paper.detectedSampleSize ?? "—"}
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <Badge variant="outline" className="text-xs">
                      {SOURCE_LABELS[paper.source] || paper.source}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    {paper.openAccess ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-muted-foreground/40" />
                    )}
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    {paper.url ? (
                      <a
                        href={paper.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:opacity-70 transition-opacity"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredPapers.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No papers match the current filters.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}