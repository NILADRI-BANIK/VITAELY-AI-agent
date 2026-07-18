"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Quote,
  Loader2,
  Sparkles,
  Search,
  Globe,
  Layers,
  Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import JournalResults from "@/components/research-hub/journal-card";
import {
  searchPublications,
  getOpenAccessJournals,
  getCSConferences,
  getJournalsBySubject,
  savePublication,
  getSavedPublications,
  deleteSavedPublication,
} from "@/actions/research-hub/publication-finder";

export default function JournalFinderPage() {
  const [mode, setMode] = useState("all"); // all | open-access | conferences | subject
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("");

  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [activeTab, setActiveTab] = useState("search"); // search | saved

  const [savedPublications, setSavedPublications] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [savedError, setSavedError] = useState(null);

  const fetchSaved = useCallback(async () => {
    setLoadingSaved(true);
    setSavedError(null);
    try {
      const res = await getSavedPublications();
      if (res.success) {
        setSavedPublications(res.data || []);
      } else {
        setSavedError(res.error || "Failed to load saved publications");
      }
    } catch (err) {
      setSavedError(err.message || "Failed to load saved publications");
    } finally {
      setLoadingSaved(false);
    }
  }, []);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  const savedIds = useMemo(
    () =>
      new Set(savedPublications.map((p) => String(p.publicationId ?? p.id))),
    [savedPublications],
  );

  const handleSearch = async () => {
    setError(null);
    setLoading(true);
    setJournals([]);
    setHasSearched(true);

    try {
      let res;

      if (mode === "all") {
        if (!query.trim()) {
          throw new Error("Please enter a search query.");
        }
        res = await searchPublications({
          query: query.trim(),
          type: "all",
          limit: 20,
        });
      } else if (mode === "open-access") {
        if (!query.trim()) {
          throw new Error("Please enter a search query.");
        }
        res = await getOpenAccessJournals({ query: query.trim(), limit: 20 });
      } else if (mode === "conferences") {
        if (!query.trim()) {
          throw new Error("Please enter a search query.");
        }
        res = await getCSConferences({ query: query.trim(), limit: 20 });
      } else {
        if (!subject.trim()) {
          throw new Error("Please enter a subject.");
        }
        res = await getJournalsBySubject({
          subject: subject.trim(),
          limit: 20,
        });
      }

      if (!res.success) {
        throw new Error(res.error || "Failed to fetch publications");
      }

      setJournals(res.data || []);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (journal) => {
    try {
      const res = await savePublication(journal);
      if (res.success) {
        await fetchSaved();
      }
    } catch {
      // silently fail
    }
  };

  const handleRemoveSaved = async (savedPublicationId) => {
    try {
      const res = await deleteSavedPublication(savedPublicationId);
      if (res.success) {
        setSavedPublications((prev) =>
          prev.filter((p) => p.id !== savedPublicationId),
        );
      }
    } catch {
      // silently fail
    }
  };

  const modes = [
    { key: "all", label: "All Venues", icon: Search },
    { key: "open-access", label: "Open Access", icon: Globe },
    { key: "conferences", label: "CS Conferences", icon: Layers },
    { key: "subject", label: "By Subject", icon: Quote },
  ];

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-500/10 mb-4">
          <Quote className="w-7 h-7 text-teal-500" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Journal & Conference Finder</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Find journals and conferences to submit and publish your research
          work.
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
          Search Venues
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
          Saved Venues
          {savedPublications.length > 0 && (
            <span className="ml-1 text-xs opacity-80">
              ({savedPublications.length})
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

              {mode === "subject" ? (
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Subject <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="e.g. Artificial Intelligence, Biology"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Search Query <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="e.g. machine learning, IEEE transactions"
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
                    Searching...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Find Venues
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <JournalResults
            journals={hasSearched ? journals : []}
            loading={loading}
            error={error}
            savedIds={savedIds}
            onSave={handleSave}
            emptyMessage={
              hasSearched
                ? "No journals or venues found. Try a different search query."
                : "Search above to find journals and conferences."
            }
          />
        </>
      ) : (
        <JournalResults
          journals={savedPublications.map((p) => ({
            id: p.publicationId ?? p.id,
            name: p.title,
            title: p.title,
            publisher: p.publisher,
            issn: p.issn,
            url: p.url,
            openAccess: p.openAccess,
            type: p.type,
            subjects: p.subjects,
          }))}
          loading={loadingSaved}
          error={savedError}
          savedIds={savedIds}
          onSave={(journal) => {
            const record = savedPublications.find(
              (p) => (p.publicationId ?? p.id) === journal.id,
            );
            if (record) handleRemoveSaved(record.id);
          }}
          emptyMessage="No saved venues yet. Search and save one above."
        />
      )}
    </div>
  );
}
