"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Search,
  Loader2,
  ArrowRight,
  BookmarkPlus,
  BookmarkCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DifficultyBadge } from "@/components/research-hub/gap-finder/difficulty-badge";
import {
  getResearchGaps,
  saveResearchGap,
  getSavedGaps,
} from "@/actions/research-hub/gap-finder";
import { markActivityDone } from "@/actions/research-hub/topic-workspace";

function getGapKey(gap) {
  return String(gap.gapTitle ?? gap.gap ?? gap.title ?? gap.id);
}

function GapPreviewRow({ gap, isSaved, onSave, saving }) {
  const title = gap.gapTitle ?? gap.gap ?? gap.title ?? "Untitled Gap";
  const description = gap.description ?? gap.why ?? "";

  return (
    <div className="flex items-start justify-between gap-3 py-2.5 border-b border-border last:border-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground line-clamp-1">
          {title}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {description}
          </p>
        )}
        {gap.difficulty && (
          <div className="mt-1.5">
            <DifficultyBadge difficulty={gap.difficulty} />
          </div>
        )}
      </div>
      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7 shrink-0"
        onClick={() => onSave(gap)}
        disabled={saving || isSaved}
      >
        {isSaved ? (
          <BookmarkCheck className="h-4 w-4 text-primary" />
        ) : (
          <BookmarkPlus className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

export default function GapPreviewSection({ topicId, topicName, field }) {
  const [gaps, setGaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savedIds, setSavedIds] = useState(new Set());
  const [savingKey, setSavingKey] = useState(null);

  const fetchSaved = useCallback(async () => {
    try {
      const res = await getSavedGaps();
      if (res.success) {
        setSavedIds(new Set((res.data || []).map((g) => getGapKey(g))));
      }
    } catch {
      // silently fail
    }
  }, []);

  const fetchGaps = useCallback(async () => {
    if (!topicName?.trim()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await getResearchGaps({
        topic: topicName.trim(),
        field: field?.trim() || "",
        skills: [],
      });
      if (res.success) {
        setGaps((res.data || []).slice(0, 3));
      } else {
        setError(res.error || "Failed to load research gaps");
      }
    } catch (err) {
      setError(err.message || "Failed to load research gaps");
    } finally {
      setLoading(false);
    }
  }, [topicName, field]);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  useEffect(() => {
    fetchGaps();
  }, [fetchGaps]);

  const handleSave = async (gap) => {
    const key = getGapKey(gap);
    setSavingKey(key);
    try {
      const res = await saveResearchGap(gap);
      if (res.success) {
        setSavedIds((prev) => new Set([...prev, key]));
        if (topicId) {
          markActivityDone(topicId, "gapAnalysisDone").catch(() => {});
        }
      }
    } catch {
      // silently fail
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertCircle className="h-4 w-4 text-orange-500" />
          Research Gaps
        </CardTitle>
        <Link href={`/research-hub/topic-recommender/${topicId}/gaps`}>
          <Button variant="ghost" size="sm">
            View All
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <p className="text-sm text-destructive text-center py-4">{error}</p>
        ) : gaps.length === 0 ? (
          <div className="text-center py-6 space-y-3">
            <p className="text-sm text-muted-foreground">
              No research gaps analyzed yet for this topic.
            </p>
            <Link href={`/research-hub/topic-recommender/${topicId}/gaps`}>
              <Button size="sm" variant="outline">
                <Search className="h-4 w-4 mr-1.5" />
                Analyze Research Gaps
              </Button>
            </Link>
          </div>
        ) : (
          <div>
            {gaps.map((gap, i) => (
              <GapPreviewRow
                key={getGapKey(gap) || i}
                gap={gap}
                isSaved={savedIds.has(getGapKey(gap))}
                saving={savingKey === getGapKey(gap)}
                onSave={handleSave}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
