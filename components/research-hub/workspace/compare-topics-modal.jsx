"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Scale,
  Loader2,
  TrendingUp,
  Sparkles,
  Gauge,
  FileText,
  Database,
  Percent,
  Swords,
} from "lucide-react";
import {
  getAllSavedTopicsList,
  getTopicsByIds,
} from "@/actions/research-hub/compare-topics";

const MAX_COMPARE = 3;

function ScoreCell({ value, suffix = "" }) {
  if (value == null) return <span className="text-muted-foreground">—</span>;
  return (
    <span className="font-semibold">
      {value}
      {suffix}
    </span>
  );
}

function ComparisonTable({ topics }) {
  const rows = [
    { key: "trendScore", label: "Trend Score", icon: TrendingUp },
    { key: "noveltyScore", label: "Novelty Score", icon: Sparkles },
    { key: "feasibilityScore", label: "Feasibility Score", icon: Gauge },
    { key: "paperCount", label: "Paper Count", icon: FileText },
    { key: "competitionLevel", label: "Competition", icon: Swords },
    { key: "hasDataset", label: "Has Dataset", icon: Database },
    { key: "openAccessRatio", label: "Open Access %", icon: Percent },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className="text-left py-2 px-3 text-muted-foreground font-medium border-b border-border">
              Metric
            </th>
            {topics.map((topic) => (
              <th
                key={topic.id}
                className="text-left py-2 px-3 font-semibold border-b border-border min-w-[160px]"
              >
                <span className="line-clamp-2">{topic.topicName}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const Icon = row.icon;
            return (
              <tr key={row.key} className="border-b border-border last:border-0">
                <td className="py-2.5 px-3 text-muted-foreground flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  {row.label}
                </td>
                {topics.map((topic) => {
                  const value = topic[row.key];
                  let display;
                  if (row.key === "hasDataset") {
                    display = value ? "Yes" : "No";
                  } else if (row.key === "openAccessRatio") {
                    display =
                      value != null ? (
                        <ScoreCell value={Math.round(value * 100)} suffix="%" />
                      ) : (
                        <ScoreCell value={null} />
                      );
                  } else if (row.key === "competitionLevel") {
                    display = value ?? <span className="text-muted-foreground">—</span>;
                  } else {
                    display = <ScoreCell value={value} />;
                  }
                  return (
                    <td key={topic.id} className="py-2.5 px-3">
                      {display}
                    </td>
                  );
                })}
              </tr>
            );
          })}
          <tr>
            <td className="py-2.5 px-3 text-muted-foreground align-top">Keywords</td>
            {topics.map((topic) => (
              <td key={topic.id} className="py-2.5 px-3 align-top">
                <div className="flex flex-wrap gap-1">
                  {(topic.keywords ?? []).slice(0, 6).map((kw, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default function CompareTopicsModal({ currentTopicId, currentTopicName }) {
  const [open, setOpen] = useState(false);
  const [allTopics, setAllTopics] = useState([]);
  const [selectedIds, setSelectedIds] = useState([currentTopicId]);
  const [comparisonData, setComparisonData] = useState(null);
  const [loadingList, setLoadingList] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState("");

  const fetchList = useCallback(async () => {
    setLoadingList(true);
    setError("");
    try {
      const res = await getAllSavedTopicsList();
      if (res.success) {
        setAllTopics(res.data.filter((t) => t.id !== currentTopicId));
      } else {
        setError(res.error || "Failed to load topics");
      }
    } catch (err) {
      setError(err.message || "Failed to load topics");
    } finally {
      setLoadingList(false);
    }
  }, [currentTopicId]);

  useEffect(() => {
    if (open) {
      setSelectedIds([currentTopicId]);
      setComparisonData(null);
      fetchList();
    }
  }, [open, currentTopicId, fetchList]);

  const toggleSelect = (topicId) => {
    setSelectedIds((prev) => {
      if (prev.includes(topicId)) {
        return prev.filter((id) => id !== topicId);
      }
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, topicId];
    });
  };

  const handleCompare = async () => {
    if (selectedIds.length < 2) return;
    setComparing(true);
    setError("");
    try {
      const res = await getTopicsByIds(selectedIds);
      if (res.success) {
        const ordered = selectedIds
          .map((id) => res.data.find((t) => t.id === id))
          .filter(Boolean);
        setComparisonData(ordered);
      } else {
        setError(res.error || "Failed to compare topics");
      }
    } catch (err) {
      setError(err.message || "Failed to compare topics");
    } finally {
      setComparing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Scale className="h-4 w-4 mr-1.5" />
          Compare Topics
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Compare Research Topics</DialogTitle>
        </DialogHeader>

        {!comparisonData ? (
          <div className="flex flex-col gap-3 flex-1 min-h-0">
            <p className="text-sm text-muted-foreground">
              Select up to {MAX_COMPARE} topics ({selectedIds.length}/{MAX_COMPARE} selected)
            </p>

            <div className="rounded-lg border p-3 flex items-center gap-2 bg-muted/30">
              <Checkbox checked disabled />
              <span className="text-sm font-medium truncate">
                {currentTopicName} (current)
              </span>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            {loadingList ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : allTopics.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No other saved topics to compare.
              </p>
            ) : (
              <ScrollArea className="flex-1 min-h-0 max-h-[320px]">
                <div className="space-y-2 pr-3">
                  {allTopics.map((topic) => (
                    <label
                      key={topic.id}
                      className="flex items-center gap-2 rounded-lg border p-3 cursor-pointer hover:bg-muted/30"
                    >
                      <Checkbox
                        checked={selectedIds.includes(topic.id)}
                        onCheckedChange={() => toggleSelect(topic.id)}
                        disabled={
                          !selectedIds.includes(topic.id) &&
                          selectedIds.length >= MAX_COMPARE
                        }
                      />
                      <span className="text-sm truncate">{topic.topicName}</span>
                    </label>
                  ))}
                </div>
              </ScrollArea>
            )}

            <DialogFooter>
              <Button
                onClick={handleCompare}
                disabled={selectedIds.length < 2 || comparing}
              >
                {comparing ? (
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                ) : (
                  <Scale className="h-4 w-4 mr-1.5" />
                )}
                Compare
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="flex flex-col gap-3 flex-1 min-h-0">
            <ScrollArea className="flex-1 min-h-0 max-h-[420px]">
              <ComparisonTable topics={comparisonData} />
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={() => setComparisonData(null)}>
                Back to Selection
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}