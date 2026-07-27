"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BookMarked,
  Loader2,
  Sparkles,
  Bookmark,
  Trash2,
  Eye,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ReviewPanel from "@/components/research-hub/review-panel";
import {
  generateLiteratureReview,
  saveReview,
  getSavedReviews,
  getSavedReviewById,
  deleteSavedReview,
} from "@/actions/research-hub/literature-review";

export default function LiteratureReviewPage() {
  const [topic, setTopic] = useState("");
  const [limit, setLimit] = useState(15);

  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState("generate"); // generate | saved

  const [savedReviews, setSavedReviews] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [savedError, setSavedError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [viewingReview, setViewingReview] = useState(null);
  const [loadingView, setLoadingView] = useState(false);

  const fetchSaved = useCallback(async () => {
    setLoadingSaved(true);
    setSavedError(null);
    try {
      const res = await getSavedReviews();
      if (res.success) {
        setSavedReviews(res.data || []);
      } else {
        setSavedError(res.error || "Failed to load saved reviews");
      }
    } catch (err) {
      setSavedError(err.message || "Failed to load saved reviews");
    } finally {
      setLoadingSaved(false);
    }
  }, []);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic.");
      return;
    }

    setError(null);
    setLoading(true);
    setReview(null);
    setSaved(false);

    try {
      const res = await generateLiteratureReview({
        topic: topic.trim(),
        limit,
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to generate literature review");
      }

      setReview(res.data);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!review) return;
    setSaving(true);
    try {
      const res = await saveReview(review);
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

  const handleViewSaved = async (reviewMeta) => {
    setLoadingView(true);
    setViewingReview(null);
    try {
      const res = await getSavedReviewById(reviewMeta.id);
      if (res.success) {
        const data = res.data?.reviewData;
        let parsed = data;
        if (typeof data === "string") {
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = null;
          }
        }
        setViewingReview(parsed);
      }
    } catch {
      // silently fail
    } finally {
      setLoadingView(false);
    }
  };

  const handleDeleteSaved = async (reviewId) => {
    try {
      const res = await deleteSavedReview(reviewId);
      if (res.success) {
        setSavedReviews((prev) => prev.filter((r) => r.id !== reviewId));
        if (viewingReview && viewingReview.topic) {
          setViewingReview(null);
        }
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
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-500/10 mb-4">
          <BookMarked className="w-7 h-7 text-indigo-500" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Literature Review Assistant</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Generate a structured literature review backed by real papers from
          Semantic Scholar.
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
          Generate Review
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
          Saved Reviews
          {savedReviews.length > 0 && (
            <span className="ml-1 text-xs opacity-80">
              ({savedReviews.length})
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
                  Topic <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Transfer learning in medical imaging"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Number of Papers
                </label>
                <input
                  type="number"
                  value={limit}
                  onChange={(e) =>
                    setLimit(
                      Math.min(20, Math.max(5, Number(e.target.value) || 15)),
                    )
                  }
                  min={5}
                  max={20}
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
                    Generating Review...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Literature Review
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {(review || loading) && (
            <div className="flex flex-col gap-4">
              {review && !loading && (
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSave}
                    disabled={saving || saved}
                  >
                    <Bookmark className="w-3.5 h-3.5 mr-1.5" />
                    {saved ? "Saved" : saving ? "Saving..." : "Save Review"}
                  </Button>
                </div>
              )}
              <ReviewPanel
                review={
                  review?.review
                    ? {
                        ...review.review,
                        topic: review.topic,
                        paperCount: review.paperCount,
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
          {viewingReview && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{viewingReview.topic}</h2>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setViewingReview(null)}
                >
                  Close
                </Button>
              </div>
              <ReviewPanel
                review={
                  viewingReview.review
                    ? {
                        ...viewingReview.review,
                        topic: viewingReview.topic,
                        paperCount: viewingReview.paperCount,
                      }
                    : null
                }
                loading={false}
                error={null}
              />
            </div>
          )}

          {!viewingReview && (
            <>
              {loadingSaved ? (
                <div className="flex items-center justify-center py-10 text-muted-foreground gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Loading saved reviews...</span>
                </div>
              ) : savedError ? (
                <p className="text-sm text-destructive text-center py-10">
                  {savedError}
                </p>
              ) : savedReviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="p-3 rounded-full bg-muted mb-3">
                    <BookMarked className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No saved reviews yet. Generate one and save it.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {savedReviews.map((r) => (
                    <Card
                      key={r.id}
                      className="border-2 hover:border-primary/40 transition-colors"
                    >
                      <CardContent className="py-4 px-5 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {r.topic}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
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
