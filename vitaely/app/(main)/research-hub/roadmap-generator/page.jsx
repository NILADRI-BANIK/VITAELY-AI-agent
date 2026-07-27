"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Map,
  Loader2,
  Sparkles,
  Bookmark,
  Trash2,
  Eye,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import RoadmapView from "@/components/research-hub/roadmap-view";
import {
  generateResearchRoadmap,
  adjustRoadmapTimeline,
  saveRoadmap,
  getSavedRoadmaps,
  getSavedRoadmapById,
  updateRoadmapStatus,
  deleteSavedRoadmap,
} from "@/actions/research-hub/roadmap-generator";

const DURATIONS = [
  { id: "3-months", label: "3 Months" },
  { id: "6-months", label: "6 Months" },
  { id: "1-year", label: "1 Year" },
  { id: "2-years", label: "2 Years" },
  { id: "3-years", label: "3 Years" },
];

const LEVELS = [
  { id: "undergraduate", label: "Undergraduate" },
  { id: "masters", label: "Masters" },
  { id: "phd", label: "PhD" },
  { id: "postdoc", label: "Postdoc" },
  { id: "independent", label: "Independent" },
];

export default function RoadmapGeneratorPage() {
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState("1-year");
  const [researchLevel, setResearchLevel] = useState("masters");
  const [objectives, setObjectives] = useState("");
  const [skills, setSkills] = useState("");
  const [domain, setDomain] = useState("");

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState("generate"); // generate | saved

  const [savedList, setSavedList] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [savedError, setSavedError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [viewingRoadmap, setViewingRoadmap] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [loadingView, setLoadingView] = useState(false);
  const [adjusting, setAdjusting] = useState(false);

  const fetchSaved = useCallback(async () => {
    setLoadingSaved(true);
    setSavedError(null);
    try {
      const res = await getSavedRoadmaps();
      if (res.success) {
        setSavedList(res.data || []);
      } else {
        setSavedError(res.error || "Failed to load saved roadmaps");
      }
    } catch (err) {
      setSavedError(err.message || "Failed to load saved roadmaps");
    } finally {
      setLoadingSaved(false);
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

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic.");
      return;
    }

    setError(null);
    setLoading(true);
    setResult(null);
    setSaved(false);

    try {
      const res = await generateResearchRoadmap({
        topic: topic.trim(),
        duration,
        researchLevel,
        objectives: splitToArray(objectives),
        skills: splitToArray(skills),
        domain: domain.trim(),
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to generate roadmap");
      }

      setResult(res.data);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    try {
      const res = await saveRoadmap(result);
      if (res.success) {
        setSaved(true);
        await fetchSaved();
      }
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  const handleViewSaved = async (item) => {
    setLoadingView(true);
    setViewingRoadmap(null);
    setViewingId(item.id);
    try {
      const res = await getSavedRoadmapById(item.id);
      if (res.success) {
        setViewingRoadmap(res.data?.roadmap ?? null);
      }
    } catch {
      // silently fail
    } finally {
      setLoadingView(false);
    }
  };

  const handleDeleteSaved = async (id) => {
    try {
      const res = await deleteSavedRoadmap(id);
      if (res.success) {
        setSavedList((prev) => prev.filter((r) => r.id !== id));
        if (viewingId === id) {
          setViewingRoadmap(null);
          setViewingId(null);
        }
      }
    } catch {
      // silently fail
    }
  };

  const handleAdjustTimeline = async (newDuration) => {
    if (!viewingId) return;
    setAdjusting(true);
    try {
      const res = await adjustRoadmapTimeline({
        roadmapId: viewingId,
        newDuration,
      });
      if (res.success) {
        setViewingRoadmap(res.data?.roadmap ?? null);
      }
    } catch {
      // silently fail
    } finally {
      setAdjusting(false);
    }
  };

const handleStatusChange = async (id, status) => {
    try {
      const res = await updateRoadmapStatus(id, status);
      if (res.success) {
        setSavedList((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status } : item)),
        );
      }
    } catch {
      // silently fail
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const innerRoadmap = result?.roadmap ?? null;
  const viewingInnerRoadmap = viewingRoadmap?.roadmap ?? viewingRoadmap ?? null;

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-500/10 mb-4">
          <Map className="w-7 h-7 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Roadmap Generator</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Generate a phased research roadmap with milestones, resources, and
          publication targets.
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("generate")}
          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-150 ${
            activeTab === "generate"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background border-input text-muted-foreground hover:border-primary/50"
          }`}
        >
          Generate Roadmap
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("saved")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-150 ${
            activeTab === "saved"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background border-input text-muted-foreground hover:border-primary/50"
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          Saved Roadmaps
          {savedList.length > 0 && (
            <span className="ml-1 text-xs opacity-80">
              ({savedList.length})
            </span>
          )}
        </button>
      </div>

      {activeTab === "generate" ? (
        <>
          <Card className="mb-6 border-2">
            <CardContent className="pt-6 space-y-5">
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Research Topic <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Explainable AI for healthcare diagnostics"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Duration
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {DURATIONS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Research Level
                  </label>
                  <select
                    value={researchLevel}
                    onChange={(e) => setResearchLevel(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {LEVELS.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Domain
                </label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="e.g. Computer Science, Medicine"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Research Objectives{" "}
                  <span className="text-muted-foreground font-normal">
                    (comma separated)
                  </span>
                </label>
                <input
                  type="text"
                  value={objectives}
                  onChange={(e) => setObjectives(e.target.value)}
                  placeholder="e.g. develop a model, validate on real data"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Current Skills{" "}
                  <span className="text-muted-foreground font-normal">
                    (comma separated)
                  </span>
                </label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. Python, statistics, machine learning"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {error && (
                <div className="text-destructive text-sm bg-destructive/10 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <Button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Roadmap...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Roadmap
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {(result || loading) && (
            <div className="flex flex-col gap-4">
              {result && !loading && (
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSave}
                    disabled={saving || saved}
                  >
                    <Bookmark className="w-3.5 h-3.5 mr-1.5" />
                    {saved ? "Saved" : saving ? "Saving..." : "Save Roadmap"}
                  </Button>
                </div>
              )}
              <RoadmapView
                roadmap={
                  innerRoadmap
                    ? {
                        ...innerRoadmap,
                        topic: result.topic,
                        totalDuration: result.duration,
                      }
                    : null
                }
                loading={loading}
                error={null}
              />
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col gap-4">
          {viewingRoadmap && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h2 className="text-lg font-semibold">
                  {viewingRoadmap.topic}
                </h2>
                <div className="flex items-center gap-2">
                  <select
                    value=""
                    onChange={(e) =>
                      e.target.value && handleAdjustTimeline(e.target.value)
                    }
                    disabled={adjusting}
                    className="text-sm rounded-lg border border-input bg-background px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="" disabled>
                      {adjusting ? "Adjusting..." : "Adjust timeline"}
                    </option>
                    {DURATIONS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setViewingRoadmap(null);
                      setViewingId(null);
                    }}
                  >
                    Close
                  </Button>
                </div>
              </div>
              <RoadmapView
                roadmap={
                  viewingInnerRoadmap
                    ? {
                        ...viewingInnerRoadmap,
                        topic: viewingRoadmap.topic,
                        totalDuration: viewingRoadmap.duration,
                      }
                    : null
                }
                loading={loadingView}
                error={null}
              />
            </div>
          )}

          {!viewingRoadmap && (
            <>
              {loadingSaved ? (
                <div className="flex items-center justify-center py-10 text-muted-foreground gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Loading saved roadmaps...</span>
                </div>
              ) : savedError ? (
                <p className="text-sm text-destructive text-center py-10">
                  {savedError}
                </p>
              ) : savedList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="p-3 rounded-full bg-muted mb-3">
                    <Map className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No saved roadmaps yet. Generate one and save it.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {savedList.map((r) => (
                    <Card
                      key={r.id}
                      className="border-2 hover:border-primary/40 transition-colors"
                    >
                      <CardContent className="py-4 px-5 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {r.topic}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            {r.domain && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                {r.domain}
                              </span>
                            )}
                            <select
                              value={r.status}
                              onChange={(e) =>
                                handleStatusChange(r.id, e.target.value)
                              }
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs rounded-full border border-input bg-background px-2 py-0.5 focus:outline-none"
                            >
                              <option value="active">Active</option>
                              <option value="completed">Completed</option>
                              <option value="paused">Paused</option>
                              <option value="archived">Archived</option>
                            </select>
                          </div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(r.updatedAt ?? r.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewSaved(r)}
                            disabled={loadingView}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteSaved(r.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-destructive" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
