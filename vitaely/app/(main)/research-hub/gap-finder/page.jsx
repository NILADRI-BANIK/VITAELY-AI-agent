"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  AlertCircle,
  Loader2,
  Sparkles,
  Lightbulb,
  Layers,
  Scale,
  Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getResearchGaps,
  getOpenProblems,
  getGapsBySkillSet,
  saveResearchGap,
  getSavedGaps,
  deleteSavedGap,
} from "@/actions/research-hub/gap-finder";
import { SearchBar } from "@/components/research-hub/gap-finder/search-bar";
import { FilterPanel } from "@/components/research-hub/gap-finder/filter-panel";
import { GapList } from "@/components/research-hub/gap-finder/gap-list";
import { SavedGaps } from "@/components/research-hub/gap-finder/saved-gaps";
import { RecommendationPanel } from "@/components/research-hub/gap-finder/recommendation-panel";
import { GapDetailModal } from "@/components/research-hub/gap-finder/gap-detail-modal";
import { GapComparison } from "@/components/research-hub/gap-finder/gap-comparison";
import { GapExportMenu } from "@/components/research-hub/gap-finder/export-menu";

export default function GapFinderPage() {
  const [mode, setMode] = useState("topic"); // topic | open-problems | skills

  const [topic, setTopic] = useState("");
  const [field, setField] = useState("");
  const [skillsTopic, setSkillsTopic] = useState("");
  const [domainId, setDomainId] = useState("");
  const [skills, setSkills] = useState("");

  const [gaps, setGaps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [savedIds, setSavedIds] = useState(new Set());
  const [savedGapsList, setSavedGapsList] = useState([]);
  const [savedGapsLoading, setSavedGapsLoading] = useState(false);
  const [savingKey, setSavingKey] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

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

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  const splitToArray = (str) =>
    str
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  const handleSearch = async () => {
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
      let res;

      if (mode === "topic") {
        if (!topic.trim() && !field.trim()) {
          throw new Error("Please enter a topic or field.");
        }
        res = await getResearchGaps({
          topic: topic.trim(),
          field: field.trim(),
          skills: splitToArray(skillsTopic),
        });
      } else if (mode === "open-problems") {
        if (!domainId.trim()) {
          throw new Error("Please enter a domain.");
        }
        res = await getOpenProblems(domainId.trim());
      } else {
        const skillsArr = splitToArray(skills);
        if (!skillsArr.length) {
          throw new Error("Please enter at least one skill.");
        }
        res = await getGapsBySkillSet(skillsArr);
      }

      if (!res.success) {
        throw new Error(res.error || "Failed to find research gaps");
      }

      setGaps(res.data || []);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (gap) => {
    const key = String(gap.gapTitle ?? gap.gap ?? gap.title ?? gap.id);
    setSavingKey(key);
    try {
      const res = await saveResearchGap(gap);
      if (res.success) {
        setSavedIds((prev) => new Set([...prev, key]));
        fetchSaved();
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
        (g) => String(g.id ?? g.gapTitle ?? g.gap ?? g.title ?? "") === key
      );
      if (exists) {
        return prev.filter(
          (g) => String(g.id ?? g.gapTitle ?? g.gap ?? g.title ?? "") !== key
        );
      }
      if (prev.length >= 3) return prev;
      return [...prev, gap];
    });
  };

  const handleDifficultyToggle = (d) => {
    setSelectedDifficulties((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  const handleTypeToggle = (t) => {
    setSelectedTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
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
        selectedDifficulties.includes(g.difficulty ?? "medium")
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
        (g) => (g.totalPaperCount ?? 0) >= Number(minPapers)
      );
    }

    return result;
  }, [gaps, searchTerm, selectedDifficulties, selectedTypes, minImpact, minPapers]);

  const modes = [
    { key: "topic", label: "By Topic", icon: Sparkles },
    { key: "open-problems", label: "Open Problems", icon: Lightbulb },
    { key: "skills", label: "By Skills", icon: Layers },
  ];

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-500/10 mb-4">
          <AlertCircle className="w-7 h-7 text-orange-500" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Gap Finder</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Discover research gaps, open problems, and skill-based opportunities
          validated against real publication data.
        </p>
      </div>

      <Card className="mb-6 border-2">
        <CardContent className="pt-6 space-y-5">
          <div className="flex gap-2">
            {modes.map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => {
                    setMode(m.key);
                    setError(null);
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium border transition-all duration-150 ${
                    mode === m.key
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-input text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {m.label}
                </button>
              );
            })}
          </div>

          {mode === "topic" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Topic
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Federated Learning"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Field{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional if topic provided)
                  </span>
                </label>
                <input
                  type="text"
                  value={field}
                  onChange={(e) => setField(e.target.value)}
                  placeholder="e.g. Machine Learning"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Skills{" "}
                  <span className="text-muted-foreground font-normal">
                    (comma separated)
                  </span>
                </label>
                <input
                  type="text"
                  value={skillsTopic}
                  onChange={(e) => setSkillsTopic(e.target.value)}
                  placeholder="e.g. Python, NLP"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
          )}

          {mode === "open-problems" && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Domain <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={domainId}
                onChange={(e) => setDomainId(e.target.value)}
                placeholder="e.g. Computer Science"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          )}

          {mode === "skills" && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Skills <span className="text-destructive">*</span>{" "}
                <span className="text-muted-foreground font-normal">
                  (comma separated)
                </span>
              </label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. React, statistics, biology"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          )}

          {error && (
            <div className="text-destructive text-sm bg-destructive/10 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <Button
            onClick={handleSearch}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Finding Gaps...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Find Research Gaps
              </>
            )}
          </Button>
        </CardContent>
      </Card>

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
                <GapExportMenu gaps={filteredGaps} topicName={topic || field} />
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
            onRetry={handleSearch}
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
                String(selectedGap.gapTitle ?? selectedGap.gap ?? selectedGap.title ?? "")
              )
            : false
        }
        saving={
          selectedGap
            ? savingKey ===
              String(selectedGap.gapTitle ?? selectedGap.gap ?? selectedGap.title ?? "")
            : false
        }
        onSave={handleSave}
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