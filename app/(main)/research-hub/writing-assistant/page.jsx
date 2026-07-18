"use client";

import { useState, useEffect, useCallback } from "react";
import {
  PenLine,
  Loader2,
  Sparkles,
  SpellCheck,
  Wand2,
  LayoutList,
  Clock,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import WritingPanel from "@/components/research-hub/writing-panel";
import {
  improveAcademicWriting,
  checkGrammar,
  improveTone,
  restructureText,
  getWritingHistory,
  deleteWritingEntry,
} from "@/actions/research-hub/writing-assistant";

const MAX_INPUT_LENGTH = 8000;

const MODES = [
  { key: "improve", label: "Improve Writing", icon: Sparkles },
  { key: "grammar", label: "Grammar Check", icon: SpellCheck },
  { key: "tone", label: "Tone Editor", icon: Wand2 },
  { key: "restructure", label: "Restructure", icon: LayoutList },
];

export default function WritingAssistantPage() {
  const [mode, setMode] = useState("improve");
  const [text, setText] = useState("");

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState("write"); // write | history

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState(null);

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    setHistoryError(null);
    try {
      const res = await getWritingHistory({ limit: 20 });
      if (res.success) {
        setHistory(res.data?.history || []);
      } else {
        setHistoryError(res.error || "Failed to load history");
      }
    } catch (err) {
      setHistoryError(err.message || "Failed to load history");
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleRun = async () => {
    if (!text.trim()) {
      setError("Please enter some text.");
      return;
    }
    if (text.trim().length > MAX_INPUT_LENGTH) {
      setError(`Text exceeds maximum length of ${MAX_INPUT_LENGTH} characters.`);
      return;
    }

    setError(null);
    setLoading(true);
    setResult(null);

    try {
      let res;
      if (mode === "improve") {
        res = await improveAcademicWriting({ text: text.trim() });
      } else if (mode === "grammar") {
        res = await checkGrammar({ text: text.trim() });
      } else if (mode === "tone") {
        res = await improveTone({ text: text.trim() });
      } else {
        res = await restructureText({ text: text.trim() });
      }

      if (!res.success) {
        throw new Error(res.error || "Failed to process text");
      }

      setResult(res.data);
      await fetchHistory();
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    try {
      const res = await deleteWritingEntry(entryId);
      if (res.success) {
        setHistory((prev) => prev.filter((h) => h.id !== entryId));
      }
    } catch {
      // silently fail
    }
  };

  const handleLoadFromHistory = (entry) => {
    setMode(entry.mode);
    setText(entry.originalText);
    setResult(normalizeHistoryEntry(entry));
    setActiveTab("write");
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const modeLabels = {
    improve: "Improve",
    grammar: "Grammar",
    tone: "Tone",
    restructure: "Restructure",
  };

  const writingResult = result ? normalizeResult(mode, result) : null;

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-pink-500/10 mb-4">
          <PenLine className="w-7 h-7 text-pink-500" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Academic Writing Assistant</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Improve grammar, tone, and structure of your academic writing with
          AI-powered editing.
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("write")}
          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-150 ${
            activeTab === "write"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background border-input text-muted-foreground hover:border-primary/50"
          }`}
        >
          Write
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-150 ${
            activeTab === "history"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background border-input text-muted-foreground hover:border-primary/50"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          History
          {history.length > 0 && (
            <span className="ml-1 text-xs opacity-80">
              ({history.length})
            </span>
          )}
        </button>
      </div>

      {activeTab === "write" ? (
        <>
          <Card className="mb-6 border-2">
            <CardContent className="pt-6 space-y-5">
              <div className="flex gap-2 flex-wrap">
                {MODES.map((m) => {
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
                  Your Text <span className="text-destructive">*</span>{" "}
                  <span className="text-muted-foreground font-normal">
                    ({text.trim().length}/{MAX_INPUT_LENGTH})
                  </span>
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste your academic text here..."
                  rows={8}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {error && (
                <div className="text-destructive text-sm bg-destructive/10 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <Button
                onClick={handleRun}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    {MODES.find((m) => m.key === mode)?.label}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {(writingResult || loading) && (
            <WritingPanel result={writingResult} loading={loading} error={null} />
          )}
        </>
      ) : (
        <>
          {loadingHistory ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading history...</span>
            </div>
          ) : historyError ? (
            <p className="text-sm text-destructive text-center py-10">
              {historyError}
            </p>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-3 rounded-full bg-muted mb-3">
                <PenLine className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No writing history yet. Improve some text to get started.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {history.map((entry) => (
                <Card
                  key={entry.id}
                  className="border-2 hover:border-primary/40 transition-colors cursor-pointer"
                  onClick={() => handleLoadFromHistory(entry)}
                >
                  <CardContent className="py-4 px-5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                          {modeLabels[entry.mode] ?? entry.mode}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(entry.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 truncate max-w-md">
                        {entry.originalText}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEntry(entry.id);
                      }}
                      className="shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function normalizeResult(mode, data) {
  if (!data) return null;

  if (mode === "improve") {
    return {
      original: data.originalText,
      improved: data.improvedText,
      changes: data.changes,
      style: "improve",
    };
  }

  if (mode === "grammar") {
    return {
      original: data.originalText,
      improved: data.correctedText,
      changes: Array.isArray(data.errors)
        ? data.errors.map(
            (e) => `${e.type}: "${e.original}" → "${e.corrected}"`,
          )
        : [],
      style: "grammar",
    };
  }

  if (mode === "tone") {
    return {
      original: data.originalText,
      improved: data.rewrittenText,
      note: data.toneShift,
      style: "tone",
    };
  }

  return {
    original: data.originalText,
    improved: data.restructuredText,
    changes: data.structureNotes,
    style: "restructure",
  };
}

function normalizeHistoryEntry(entry) {
  const metadata =
    typeof entry.metadata === "object" && entry.metadata !== null
      ? entry.metadata
      : {};

  if (entry.mode === "improve") {
    return {
      originalText: entry.originalText,
      improvedText: entry.resultText,
      changes: metadata.changes,
    };
  }

  if (entry.mode === "grammar") {
    return {
      originalText: entry.originalText,
      correctedText: entry.resultText,
      errors: metadata.errors,
    };
  }

  if (entry.mode === "tone") {
    return {
      originalText: entry.originalText,
      rewrittenText: entry.resultText,
      toneShift: metadata.toneShift,
    };
  }

  return {
    originalText: entry.originalText,
    restructuredText: entry.resultText,
    structureNotes: metadata.structureNotes,
  };
}