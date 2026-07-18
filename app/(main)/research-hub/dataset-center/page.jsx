"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Database,
  Loader2,
  Sparkles,
  Search,
  TrendingUp,
  Layers,
  Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import DatasetCard, {
  DatasetCardSkeleton,
} from "@/components/research-hub/dataset-card";
import {
  getDatasets,
  getDatasetsByCategory,
  getTrendingDatasets,
  searchDatasets,
  saveDataset,
  getSavedDatasets,
  deleteSavedDataset,
} from "@/actions/research-hub/dataset-center";

export default function DatasetCenterPage() {
  const [mode, setMode] = useState("search"); // search | category | trending
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");

  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [activeTab, setActiveTab] = useState("search"); // search | saved

  const [savedDatasets, setSavedDatasets] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [savedError, setSavedError] = useState(null);

  const fetchSaved = useCallback(async () => {
    setLoadingSaved(true);
    setSavedError(null);
    try {
      const res = await getSavedDatasets();
      if (res.success) {
        setSavedDatasets(res.data || []);
      } else {
        setSavedError(res.error || "Failed to load saved datasets");
      }
    } catch (err) {
      setSavedError(err.message || "Failed to load saved datasets");
    } finally {
      setLoadingSaved(false);
    }
  }, []);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  const savedIds = new Set(
    savedDatasets.map((d) => String(d.datasetId ?? d.id)),
  );

  const handleSearch = async () => {
    setError(null);
    setLoading(true);
    setDatasets([]);
    setHasSearched(true);

    try {
      let res;

      if (mode === "search") {
        if (!query.trim()) {
          throw new Error("Please enter a search query.");
        }
        res = await searchDatasets({ query: query.trim(), limit: 20 });
      } else if (mode === "category") {
        if (!category.trim()) {
          throw new Error("Please enter a category.");
        }
        res = await getDatasetsByCategory({
          category: category.trim(),
          limit: 20,
        });
      } else {
        res = await getTrendingDatasets({ limit: 20 });
      }

      if (!res.success) {
        throw new Error(res.error || "Failed to fetch datasets");
      }

      setDatasets(res.data || []);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (dataset) => {
    try {
      const res = await saveDataset(dataset);
      if (res.success) {
        await fetchSaved();
      }
    } catch {
      // silently fail
    }
  };

  const handleRemoveSaved = async (savedDatasetId) => {
    try {
      const res = await deleteSavedDataset(savedDatasetId);
      if (res.success) {
        setSavedDatasets((prev) =>
          prev.filter((d) => d.id !== savedDatasetId),
        );
      }
    } catch {
      // silently fail
    }
  };

  const modes = [
    { key: "search", label: "Search", icon: Search },
    { key: "category", label: "By Category", icon: Layers },
    { key: "trending", label: "Trending", icon: TrendingUp },
  ];

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-500/10 mb-4">
          <Database className="w-7 h-7 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Dataset Discovery Center</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Search datasets across Kaggle, Hugging Face, and Zenodo in one
          place.
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("search")}
          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-150 ${
            activeTab === "search"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background border-input text-muted-foreground hover:border-primary/50"
          }`}
        >
          Search Datasets
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
          Saved Datasets
          {savedDatasets.length > 0 && (
            <span className="ml-1 text-xs opacity-80">
              ({savedDatasets.length})
            </span>
          )}
        </button>
      </div>

      {activeTab === "search" ? (
        <>
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

              {mode === "search" && (
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Search Query <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="e.g. sentiment analysis, medical imaging"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              )}

              {mode === "category" && (
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Category <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="e.g. computer vision, NLP, healthcare"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              )}

              {mode === "trending" && (
                <p className="text-sm text-muted-foreground">
                  Fetches the most downloaded and liked datasets right now.
                </p>
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
                    Searching...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Find Datasets
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {loading ? (
            <DatasetCardSkeleton />
          ) : !hasSearched ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-3 rounded-full bg-muted mb-3">
                <Database className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Search above to discover datasets.
              </p>
            </div>
          ) : datasets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-3 rounded-full bg-muted mb-3">
                <Database className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No datasets found. Try a different search.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {datasets.map((dataset, i) => (
                <DatasetCard
                  key={`${dataset.id ?? dataset.name ?? i}-${i}`}
                  dataset={dataset}
                  onSave={handleSave}
                  savedIds={savedIds}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {loadingSaved ? (
            <DatasetCardSkeleton />
          ) : savedError ? (
            <p className="text-sm text-destructive text-center py-10">
              {savedError}
            </p>
          ) : savedDatasets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-3 rounded-full bg-muted mb-3">
                <Database className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No saved datasets yet. Search and save one above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedDatasets.map((dataset) => (
                <DatasetCard
                  key={dataset.id}
                  dataset={{
                    id: dataset.datasetId,
                    name: dataset.title,
                    title: dataset.title,
                    description: dataset.description,
                    url: dataset.url,
                    source: dataset.source,
                    tags: dataset.tags,
                    license: dataset.license,
                    downloadCount: dataset.downloadCount,
                  }}
                  onSave={() => handleRemoveSaved(dataset.id)}
                  savedIds={new Set([String(dataset.datasetId)])}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}