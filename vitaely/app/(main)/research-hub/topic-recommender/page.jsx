"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import {
  Lightbulb,
  Loader2,
  Sparkles,
  TrendingUp,
  Shuffle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import TopicList from "@/components/research-hub/topic-list";
import CompareTopicsModal from "@/components/research-hub/workspace/compare-topics-modal";
import {
  getRecommendedTopics,
  getTrendingTopics,
  getSimilarTopics,
  saveTopicToProfile,
  getSavedTopics,
} from "@/actions/research-hub/topic-recommender";

export default function TopicRecommenderPage() {
  const router = useRouter();
  const [mode, setMode] = useState("recommend"); // recommend | trending | similar

  const [industry, setIndustry] = useState("");
  const [skills, setSkills] = useState("");
  const [interests, setInterests] = useState("");
  const [field, setField] = useState("");
  const [topicName, setTopicName] = useState("");

  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [savedIds, setSavedIds] = useState(new Set());
  const [savingId, setSavingId] = useState(null);

  const [compareIds, setCompareIds] = useState(new Set());
  const [compareTopics, setCompareTopics] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const fetchSaved = useCallback(async () => {
    try {
      const res = await getSavedTopics();
      if (res.success) {
        setSavedIds(
          new Set(
            (res.data || []).map((t) => String(t.topicName ?? t.topic ?? t.id)),
          ),
        );
      }
    } catch {
    } finally {
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
    setError(null);
    setLoading(true);
    setTopics([]);
    setCompareIds(new Set());

    try {
      let res;

      if (mode === "recommend") {
        if (!industry.trim()) {
          throw new Error("Please enter an industry or field.");
        }
        res = await getRecommendedTopics({
          industry: industry.trim(),
          skills: splitToArray(skills),
          interests: splitToArray(interests),
        });
      } else if (mode === "trending") {
        if (!field.trim()) {
          throw new Error("Please enter a field.");
        }
        res = await getTrendingTopics(field.trim());
      } else {
        if (!topicName.trim()) {
          throw new Error("Please enter a topic name.");
        }
        res = await getSimilarTopics(topicName.trim());
      }

      if (!res.success) {
        throw new Error(res.error || "Failed to generate topics");
      }

      setTopics(res.data || []);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (topic) => {
    const id = topic.id ?? topic.topic ?? topic.title;
    const key = String(topic.topicName ?? topic.topic ?? id);
    setSavingId(id);
    try {
      const res = await saveTopicToProfile(topic);
      if (res.success) {
        setSavedIds((prev) => new Set([...prev, key]));
      }
    } catch {
      // silently fail
    } finally {
      setSavingId(null);
    }
  };

  const handleSelect = async (topic) => {
    const res = await saveTopicToProfile(topic);

    if (res?.data?.id) {
      router.push(`/research-hub/topic-recommender/${res.data.id}`);
      return;
    }

    if (!res.success && res.error === "Topic already saved") {
      const existing = await getSavedTopics();
      const match = existing?.data?.find(
        (t) => t.topicName === (topic.topic ?? "").trim().toLowerCase(),
      );
      if (match?.id) {
        router.push(`/research-hub/topic-recommender/${match.id}`);
      }
    }
  };

  const getTopicKey = (topic, index) =>
    String(topic.id ?? topic.topic ?? topic.title ?? index);

  const handleCompareToggle = (topic) => {
    const index = topics.indexOf(topic);
    const key = getTopicKey(topic, index);

    setCompareIds((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        if (next.size >= 4) return prev;
        next.add(key);
      }
      return next;
    });
  };

  const handleCompare = () => {
    const selected = topics.filter((topic, index) =>
      compareIds.has(getTopicKey(topic, index)),
    );
    setCompareTopics(selected);
    setShowCompareModal(true);
  };

  const handleClearCompare = () => {
    setCompareIds(new Set());
  };

  const modes = [
    { key: "recommend", label: "Recommend", icon: Sparkles },
    { key: "trending", label: "Trending", icon: TrendingUp },
    { key: "similar", label: "Similar Topics", icon: Shuffle },
  ];

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-yellow-500/10 mb-4">
          <Lightbulb className="w-7 h-7 text-yellow-500" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Topic Recommender</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Get AI-recommended research topics validated against real publication
          data.
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

          {mode === "recommend" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Industry / Field <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. Healthcare AI, Renewable Energy"
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
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. Python, deep learning, statistics"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Interests{" "}
                  <span className="text-muted-foreground font-normal">
                    (comma separated)
                  </span>
                </label>
                <input
                  type="text"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="e.g. computer vision, ethics"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
          )}

          {mode === "trending" && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Field <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={field}
                onChange={(e) => setField(e.target.value)}
                placeholder="e.g. Natural Language Processing"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          )}

          {mode === "similar" && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Topic Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
                placeholder="e.g. Federated Learning"
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
            onClick={handleGenerate}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Topics...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Topics
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <TopicList
        topics={topics}
        loading={loading}
        error={topics.length === 0 ? error : null}
        savedIds={savedIds}
        onSelect={handleSelect}
        onSave={handleSave}
        onCompareToggle={handleCompareToggle}
        compareIds={compareIds}
        onCompare={handleCompare}
        onClearCompare={handleClearCompare}
        maxCompare={4}
      />

      {showCompareModal && (
        <CompareTopicsModal
          topics={compareTopics}
          open={showCompareModal}
          onClose={() => setShowCompareModal(false)}
        />
      )}
    </div>
  );
}