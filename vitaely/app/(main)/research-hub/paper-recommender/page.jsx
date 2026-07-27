"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Loader2,
  Sparkles,
  Clock,
  Quote,
  BookOpen,
  Users,
  Globe,
  Bookmark,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PaperCard, { PaperCardSkeleton } from "@/components/research-hub/paper-card";
import SavedPapers from "@/components/research-hub/saved-papers";
import CitationPreview from "@/components/research-hub/citation-preview";
import {
  getLatestPapers,
  getMostCitedPapers,
  getSurveyPapers,
  getPapersByAuthor,
  getOpenAccessPapers,
  savePaper,
  getSavedPapers,
  deleteSavedPaper,
} from "@/actions/research-hub/paper-recommender";
import { generateCitation } from "@/actions/research-hub/citation-generator";

export default function PaperRecommenderPage() {
  const [mode, setMode] = useState("latest"); // latest | cited | survey | author | open-access
  const [query, setQuery] = useState("");

  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState("search"); // search | saved

  const [savedPapers, setSavedPapers] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [savedError, setSavedError] = useState(null);

  const [citationPaper, setCitationPaper] = useState(null);
  const [citations, setCitations] = useState({});
  const [citationLoading, setCitationLoading] = useState(false);
  const [citationError, setCitationError] = useState(null);

  const fetchSaved = useCallback(async () => {
    setLoadingSaved(true);
    setSavedError(null);
    try {
      const res = await getSavedPapers();
      if (res.success) {
        setSavedPapers(res.data || []);
      } else {
        setSavedError(res.error || "Failed to load saved papers");
      }
    } catch (err) {
      setSavedError(err.message || "Failed to load saved papers");
    } finally {
      setLoadingSaved(false);
    }
  }, []);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  const savedIds = new Set(
    savedPapers.map((p) => String(p.paperId ?? p.id)),
  );

  const handleSearch = async () => {
    if (!query.trim()) {
      setError("Please enter a search query.");
      return;
    }

    setError(null);
    setLoading(true);
    setPapers([]);

    try {
      let res;
      const params = { query: query.trim(), limit: 20 };

      if (mode === "latest") {
        res = await getLatestPapers(params);
      } else if (mode === "cited") {
        res = await getMostCitedPapers(params);
      } else if (mode === "survey") {
        res = await getSurveyPapers(params);
      } else if (mode === "author") {
        res = await getPapersByAuthor({
          authorName: query.trim(),
          limit: 20,
        });
      } else {
        res = await getOpenAccessPapers(params);
      }

      if (!res.success) {
        throw new Error(res.error || "Failed to fetch papers");
      }

      setPapers(res.data || []);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (paper) => {
    try {
      const res = await savePaper(paper);
      if (res.success) {
        await fetchSaved();
      }
    } catch {
      // silently fail
    }
  };

  const handleRemoveSaved = async (paper) => {
    if (!paper?.id) return;
    try {
      const res = await deleteSavedPaper(paper.id);
      if (res.success) {
        setSavedPapers((prev) => prev.filter((p) => p.id !== paper.id));
      }
    } catch {
      // silently fail
    }
  };

  const handleCite = async (paper) => {
    setCitationPaper(paper);
    setCitations({});
    setCitationError(null);
    setCitationLoading(true);

    try {
      const res = await generateCitation({
        doi: paper.doi ?? null,
        title: paper.title ?? null,
        style: "all",
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to generate citation");
      }

      setCitations(res.data?.citations || {});
    } catch (err) {
      setCitationError(err.message || "Failed to generate citation");
    } finally {
      setCitationLoading(false);
    }
  };

  const closeCitation = () => {
    setCitationPaper(null);
    setCitations({});
    setCitationError(null);
  };

  const modes = [
    { key: "latest", label: "Latest", icon: Clock },
    { key: "cited", label: "Most Cited", icon: Quote },
    { key: "survey", label: "Surveys", icon: BookOpen },
    { key: "author", label: "By Author", icon: Users },
    { key: "open-access", label: "Open Access", icon: Globe },
  ];

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
          <FileText className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Paper Recommendation Engine</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Find the latest, most-cited, and open-access papers across
          Semantic Scholar, arXiv, and CORE.
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
          Search Papers
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
          Saved Papers
          {savedPapers.length > 0 && (
            <span className="ml-1 text-xs opacity-80">
              ({savedPapers.length})
            </span>
          )}
        </button>
      </div>

      {activeTab === "search" ? (
        <>
          <Card className="mb-6 border-2">
            <CardContent className="pt-6 space-y-5">
              <div className="flex gap-2 flex-wrap">
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
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all duration-150 ${
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

              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  {mode === "author" ? "Author Name" : "Search Query"}{" "}
                  <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder={
                    mode === "author"
                      ? "e.g. Geoffrey Hinton"
                      : "e.g. transformer architectures"
                  }
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

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
                    Search Papers
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {loading ? (
            <PaperCardSkeleton />
          ) : papers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-3 rounded-full bg-muted mb-3">
                <FileText className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No papers yet. Search above to get started.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {papers.map((paper, i) => (
                <div key={`${paper.id ?? paper.doi ?? i}-${i}`} className="flex flex-col gap-2">
                  <PaperCard paper={paper} onSave={handleSave} savedIds={savedIds} />
                  <Button
                    size="sm"
                    variant="outline"
                    className="self-end"
                    onClick={() => handleCite(paper)}
                  >
                    <Quote className="w-3.5 h-3.5 mr-1.5" />
                    Cite
                  </Button>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <SavedPapers
          papers={savedPapers}
          loading={loadingSaved}
          error={savedError}
          onRemove={handleRemoveSaved}
        />
      )}

      {citationPaper && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeCitation}
        >
          <div
            className="bg-background rounded-xl border-2 max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Citation</h3>
              <button
                type="button"
                onClick={closeCitation}
                className="p-1.5 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <CitationPreview
              citations={citations}
              loading={citationLoading}
              error={citationError}
              paper={citationPaper}
            />
          </div>
        </div>
      )}
    </div>
  );
}