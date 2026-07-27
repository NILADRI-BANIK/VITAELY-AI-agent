"use client";

import { useState, useEffect, useCallback, useMemo, use } from "react";
import { AlertCircle, Loader2, Bookmark, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getSavedTopicById,
  markActivityDone,
} from "@/actions/research-hub/topic-workspace";
import {
  getResearchGaps,
  saveResearchGap,
  getSavedGaps,
  deleteSavedGap,
  updateGapNotes,
} from "@/actions/research-hub/gap-finder";
import { SearchBar } from "@/components/research-hub/gap-finder/search-bar";
import { FilterPanel } from "@/components/research-hub/gap-finder/filter-panel";
import { GapList } from "@/components/research-hub/gap-finder/gap-list";
import { SavedGaps } from "@/components/research-hub/gap-finder/saved-gaps";
import { RecommendationPanel } from "@/components/research-hub/gap-finder/recommendation-panel";
import { GapDetailModal } from "@/components/research-hub/gap-finder/gap-detail-modal";
import { GapComparison } from "@/components/research-hub/gap-finder/gap-comparison";
import { GapExportMenu } from "@/components/research-hub/gap-finder/export-menu";

export default function TopicGapsPage({ params }) {
  const { topicId } = use(params);

  const [topic, setTopic] = useState(null);
  const [topicLoading, setTopicLoading] = useState(true);
  const [topicError, setTopicError] = useState("");

  const [gaps, setGaps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedIds, setSavedIds] = useState(new Set());
  const [savedGapsList, setSavedGapsList] = useState([]);
  const [savedGapsLoading, setSavedGapsLoading] = useState(false);
  const [savingKey, setSavingKey] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [savingNotes, setSavingNotes] = useState(false);
  const [activeTab, setActiveTab] = useState("results");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulties, setSelectedDifficulties] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [minImpact, setMinImpact] = useState(0);
  const [minPapers, setMinPapers] = useState("");

  const [selectedGap, setSelectedGap] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [compareOpen, setCompareOpen] = useState(false);

  const fetchSaved = useCallback(async () => {
    setSavedGapsLoading(true);
    try {
      const res = await getSavedGaps();
      if (res.success) {
        setSavedGapsList(res.data || []);
        setSavedIds(
          new Set(
            (res.data || []).map((g) =>
              String(g.gapTitle ?? g.gap ?? g.title ?? g.id),
            ),
          ),
        );
      }
    } catch {
      // silently fail
    } finally {
      setSavedGapsLoading(false);
    }
  }, []);

  const runSearch = useCallback(async (topicName, field) => {
    setError(null);
    setLoading(true);
    setGaps([]);
    setSearchTerm("");
    setSelectedDifficulties([]);
    setSelectedTypes([]);
    setMinImpact(0);
    setMinPapers("");
    setSelectedForCompare([]);

    try {
      const res = await getResearchGaps({
        topic: topicName,
        field: field || "",
        skills: [],
      });
      if (!res.success) {
        throw new Error(res.error || "Failed to find research gaps");
      }
      setGaps(res.data || []);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  useEffect(() => {
    let active = true;

    async function loadTopic() {
      setTopicLoading(true);
      setTopicError("");
      try {
        const res = await getSavedTopicById(topicId);
        if (!active) return;

        if (!res.success) {
          setTopicError(res.error || "Failed to load topic");
          return;
        }

        setTopic(res.data);
        runSearch(res.data?.topicName ?? "", res.data?.field ?? "");
      } catch (err) {
        if (active) setTopicError(err.message || "Failed to load topic");
      } finally {
        if (active) setTopicLoading(false);
      }
    }

    loadTopic();
    return () => {
      active = false;
    };
  }, [topicId, runSearch]);

  const handleSave = async (gap) => {
    const key = String(gap.gapTitle ?? gap.gap ?? gap.title ?? gap.id);
    setSavingKey(key);
    try {
      const res = await saveResearchGap(gap);
      if (res.success) {
        setSavedIds((prev) => new Set([...prev, key]));
        fetchSaved();
        markActivityDone(topicId, "gapAnalysisDone").catch(() => {});
      }
    } catch {
      // silently fail
    } finally {
      setSavingKey(null);
    }
  };

  const handleDeleteSaved = async (savedGap) => {
    setDeletingId(savedGap.id);
    try {
      const res = await deleteSavedGap(savedGap.id);
      if (res.success) {
        setSavedGapsList((prev) => prev.filter((g) => g.id !== savedGap.id));
        setSavedIds((prev) => {
          const next = new Set(prev);
          next.delete(String(savedGap.gapTitle));
          return next;
        });
      }
    } catch {
      // silently fail
    } finally {
      setDeletingId(null);
    }
  };

  // ADD (new function)
  const handleSaveGapNotes = async (gap, notesText) => {
    if (!gap?.id) return;
    setSavingNotes(true);
    try {
      const res = await updateGapNotes(gap.id, notesText);
      if (res.success) {
        setSavedGapsList((prev) =>
          prev.map((g) => (g.id === gap.id ? { ...g, notes: notesText } : g)),
        );
        setSelectedGap((prev) =>
          prev && prev.id === gap.id ? { ...prev, notes: notesText } : prev,
        );
      }
    } catch {
      // silently fail
    } finally {
      setSavingNotes(false);
    }
  };

  const handleSelect = (gap) => {
    setSelectedGap(gap);
    setDetailOpen(true);
  };

  const handleViewSavedGap = (savedGap) => {
    setSelectedGap({ ...savedGap, gap: savedGap.gapTitle });
    setDetailOpen(true);
  };

  const handleCompareToggle = (gap) => {
    const key = String(gap.id ?? gap.gapTitle ?? gap.gap ?? gap.title ?? "");
    setSelectedForCompare((prev) => {
      const exists = prev.some(
        (g) => String(g.id ?? g.gapTitle ?? g.gap ?? g.title ?? "") === key,
      );
      if (exists) {
        return prev.filter(
          (g) => String(g.id ?? g.gapTitle ?? g.gap ?? g.title ?? "") !== key,
        );
      }
      if (prev.length >= 3) return prev;
      return [...prev, gap];
    });
  };

  const handleDifficultyToggle = (d) => {
    setSelectedDifficulties((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );
  };

  const handleTypeToggle = (t) => {
    setSelectedTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );
  };

  const handleClearFilters = () => {
    setSelectedDifficulties([]);
    setSelectedTypes([]);
    setMinImpact(0);
    setMinPapers("");
  };

  const filteredGaps = useMemo(() => {
    let result = gaps;

    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      result = result.filter((g) => {
        const title = (g.gap ?? g.title ?? "").toLowerCase();
        const desc = (g.description ?? "").toLowerCase();
        const kw = (g.keywords ?? []).join(" ").toLowerCase();
        return title.includes(q) || desc.includes(q) || kw.includes(q);
      });
    }

    if (selectedDifficulties.length > 0) {
      result = result.filter((g) =>
        selectedDifficulties.includes(g.difficulty ?? "medium"),
      );
    }

    if (selectedTypes.length > 0) {
      result = result.filter((g) => selectedTypes.includes(g.type ?? "gap"));
    }

    if (minImpact > 0) {
      result = result.filter((g) => (g.impactScore ?? 0) >= minImpact);
    }

    if (minPapers !== "" && Number(minPapers) > 0) {
      result = result.filter(
        (g) => (g.totalPaperCount ?? 0) >= Number(minPapers),
      );
    }

    return result;
  }, [
    gaps,
    searchTerm,
    selectedDifficulties,
    selectedTypes,
    minImpact,
    minPapers,
  ]);

  if (topicLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (topicError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm font-medium text-destructive">{topicError}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-500/10 mb-4">
          <AlertCircle className="w-7 h-7 text-orange-500" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Gap Finder</h1>
        <p className="text-muted-foreground">
          Research gaps for{" "}
          <span className="font-medium text-foreground">
            {topic?.topicName}
          </span>
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="saved">
            <Bookmark className="w-3.5 h-3.5 mr-1.5" />
            Saved ({savedGapsList.length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === "results" && (
        <div className="flex flex-col gap-4">
          {gaps.length > 0 && (
            <RecommendationPanel gaps={filteredGaps} onSelect={handleSelect} />
          )}

          {gaps.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap justify-between">
              <SearchBar value={searchTerm} onChange={setSearchTerm} />
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={compareMode ? "default" : "outline"}
                  onClick={() => {
                    setCompareMode((p) => !p);
                    setSelectedForCompare([]);
                  }}
                >
                  <Scale className="w-3.5 h-3.5 mr-1.5" />
                  Compare
                </Button>
                <GapExportMenu
                  gaps={filteredGaps}
                  topicName={topic?.topicName}
                />
              </div>
            </div>
          )}

          {gaps.length > 0 && (
            <FilterPanel
              selectedDifficulties={selectedDifficulties}
              onDifficultyToggle={handleDifficultyToggle}
              onResetDifficulty={() => setSelectedDifficulties([])}
              selectedTypes={selectedTypes}
              onTypeToggle={handleTypeToggle}
              onResetType={() => setSelectedTypes([])}
              minImpact={minImpact}
              onMinImpactChange={setMinImpact}
              minPapers={minPapers}
              onMinPapersChange={setMinPapers}
              onClearAll={handleClearFilters}
            />
          )}

          {compareMode && selectedForCompare.length > 0 && (
            <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-4 py-2">
              <span className="text-sm text-foreground">
                {selectedForCompare.length} gap
                {selectedForCompare.length !== 1 ? "s" : ""} selected
              </span>
              <Button
                size="sm"
                disabled={selectedForCompare.length < 2}
                onClick={() => setCompareOpen(true)}
              >
                Compare Now
              </Button>
            </div>
          )}

          <GapList
            gaps={filteredGaps}
            loading={loading}
            error={gaps.length === 0 ? error : null}
            onRetry={() =>
              runSearch(topic?.topicName ?? "", topic?.field ?? "")
            }
            savedIds={savedIds}
            savingKey={savingKey}
            onSelect={handleSelect}
            onSave={handleSave}
            compareMode={compareMode}
            selectedForCompare={selectedForCompare}
            onCompareToggle={handleCompareToggle}
          />
        </div>
      )}

      {activeTab === "saved" && (
        <SavedGaps
          gaps={savedGapsList}
          loading={savedGapsLoading}
          onView={handleViewSavedGap}
          onDelete={handleDeleteSaved}
          deletingId={deletingId}
        />
      )}

      <GapDetailModal
        gap={selectedGap}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        isSaved={
          selectedGap
            ? savedIds.has(
                String(
                  selectedGap.gapTitle ??
                    selectedGap.gap ??
                    selectedGap.title ??
                    "",
                ),
              )
            : false
        }
        saving={
          selectedGap
            ? savingKey ===
              String(
                selectedGap.gapTitle ??
                  selectedGap.gap ??
                  selectedGap.title ??
                  "",
              )
            : false
        }
        onSave={handleSave}
        notes={selectedGap?.notes ?? ""}
        onSaveNotes={selectedGap?.id ? handleSaveGapNotes : undefined}
        savingNotes={savingNotes}
      />

      <GapComparison
        gaps={selectedForCompare}
        open={compareOpen}
        onOpenChange={setCompareOpen}
        onRemove={handleCompareToggle}
      />
    </div>
  );
}
