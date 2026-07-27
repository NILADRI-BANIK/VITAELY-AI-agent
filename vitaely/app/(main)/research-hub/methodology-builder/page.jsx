"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FlaskConical,
  Loader2,
  Bookmark,
  Trash2,
  Eye,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MethodologyOutput from "@/components/research-hub/methodology-output";
import MethodologyForm from "@/components/research-hub/methodology-builder/methodology-form";
import {
  generateMethodology,
  saveMethodology,
  getSavedMethodologies,
  getSavedMethodologyById,
  deleteSavedMethodology,
} from "@/actions/research-hub/methodology-builder";
import { analyzeLiteratureForTopic } from "@/actions/research-hub/literature-analysis";

export default function MethodologyBuilderPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [literatureAnalysis, setLiteratureAnalysis] = useState(null);

  const [activeTab, setActiveTab] = useState("generate"); // generate | saved

  const [savedList, setSavedList] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [savedError, setSavedError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [viewingMethodology, setViewingMethodology] = useState(null);
  const [loadingView, setLoadingView] = useState(false);

  const fetchSaved = useCallback(async () => {
    setLoadingSaved(true);
    setSavedError(null);
    try {
      const res = await getSavedMethodologies();
      if (res.success) {
        setSavedList(res.data || []);
      } else {
        setSavedError(res.error || "Failed to load saved methodologies");
      }
    } catch (err) {
      setSavedError(err.message || "Failed to load saved methodologies");
    } finally {
      setLoadingSaved(false);
    }
  }, []);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  const handleGenerate = async (formValues) => {
    setError(null);
    setLoading(true);
    setResult(null);
    setLiteratureAnalysis(null);
    setSaved(false);

    try {
      const [methodologyRes, literatureRes] = await Promise.all([
        generateMethodology(formValues),
        analyzeLiteratureForTopic({
          topic: formValues.topic,
          methodologyType: formValues.methodologyType,
          paperLimit: 20,
        }),
      ]);

      if (!methodologyRes.success) {
        throw new Error(methodologyRes.error || "Failed to generate methodology");
      }

      setResult(methodologyRes.data);
      if (literatureRes.success) {
        setLiteratureAnalysis(literatureRes.data);
      }
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
      const res = await saveMethodology(result);
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
    setViewingMethodology(null);
    try {
      const res = await getSavedMethodologyById(item.id);
      if (res.success) {
        const data = res.data?.methodologyData;
        let parsed = data;
        if (typeof data === "string") {
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = null;
          }
        }
        setViewingMethodology(parsed);
      }
    } catch {
      // silently fail
    } finally {
      setLoadingView(false);
    }
  };

  const handleDeleteSaved = async (id) => {
    try {
      const res = await deleteSavedMethodology(id);
      if (res.success) {
        setSavedList((prev) => prev.filter((m) => m.id !== id));
        setViewingMethodology(null);
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

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-500/10 mb-4">
          <FlaskConical className="w-7 h-7 text-purple-500" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Methodology Builder</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Build a rigorous, academically sound research methodology tailored
          to your study.
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
          Build Methodology
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
          Saved Methodologies
          {savedList.length > 0 && (
            <span className="ml-1 text-xs opacity-80">
              ({savedList.length})
            </span>
          )}
        </button>
      </div>

      {activeTab === "generate" ? (
        <>
          <MethodologyForm onSubmit={handleGenerate} submitting={loading} />

          {error && (
            <div className="text-destructive text-sm bg-destructive/10 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

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
                    {saved ? "Saved" : saving ? "Saving..." : "Save Methodology"}
                  </Button>
                </div>
              )}
              <MethodologyOutput
                data={result}
                methodologyId={result?.id ?? null}
                literatureAnalysis={literatureAnalysis}
                loading={loading}
                error={null}
              />
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col gap-4">
          {viewingMethodology && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {viewingMethodology.topic}
                </h2>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setViewingMethodology(null)}
                >
                  Close
                </Button>
              </div>
              <MethodologyOutput
                data={viewingMethodology}
                methodologyId={viewingMethodology?.id ?? null}
                literatureAnalysis={null}
                loading={false}
                error={null}
              />
            </div>
          )}

          {!viewingMethodology && (
            <>
              {loadingSaved ? (
                <div className="flex items-center justify-center py-10 text-muted-foreground gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">
                    Loading saved methodologies...
                  </span>
                </div>
              ) : savedError ? (
                <p className="text-sm text-destructive text-center py-10">
                  {savedError}
                </p>
              ) : savedList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="p-3 rounded-full bg-muted mb-3">
                    <FlaskConical className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No saved methodologies yet. Build one and save it.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {savedList.map((m) => (
                    <Card
                      key={m.id}
                      className="border-2 hover:border-primary/40 transition-colors"
                    >
                      <CardContent className="py-4 px-5 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {m.topic}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize mt-0.5">
                            {m.methodologyType}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3" />
                            {formatDate(m.updatedAt ?? m.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewSaved(m)}
                            disabled={loadingView}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteSaved(m.id)}
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