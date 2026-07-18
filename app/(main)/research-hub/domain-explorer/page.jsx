"use client";

import { useState, useEffect, useCallback } from "react";
import { BookOpen, Search, Loader2, Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import DomainResults from "@/components/research-hub/domain-results";
import TopicPapers from "@/components/research-hub/topic-papers";
import {
  getResearchDomains,
  getPopularDomains,
  searchDomains,
  getSubfieldsByDomain,
  getTopicsBySubfield,
} from "@/actions/research-hub/domain-explorer";
import { getPapersForTopic } from "@/actions/research-hub/topic-papers";

export default function DomainExplorerPage() {
  const [query, setQuery] = useState("");
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [popularDomains, setPopularDomains] = useState([]);
  const [loadingPopular, setLoadingPopular] = useState(true);

  const [selectedDomain, setSelectedDomain] = useState(null);
  const [subfields, setSubfields] = useState([]);
  const [loadingSubfields, setLoadingSubfields] = useState(false);
  const [subfieldsError, setSubfieldsError] = useState(null);
  const [selectedSubfield, setSelectedSubfield] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [topicsError, setTopicsError] = useState(null);

  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topicPapers, setTopicPapers] = useState(null);
  const [loadingPapers, setLoadingPapers] = useState(false);
  const [papersError, setPapersError] = useState(null);

  const fetchPopular = useCallback(async () => {
    setLoadingPopular(true);
    try {
      const res = await getResearchDomains();
      if (res.success) {
        setPopularDomains(res.data || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoadingPopular(false);
    }
  }, []);

  useEffect(() => {
    fetchPopular();
  }, [fetchPopular]);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setSelectedDomain(null);
    setSubfields([]);
    setSelectedSubfield(null);
    setTopics([]);
    setTopicsError(null);
    setSelectedTopic(null);
    setTopicPapers(null);
    setPapersError(null);

    try {
      const res = query.trim()
        ? await searchDomains(query.trim())
        : await getResearchDomains();

      if (!res.success) {
        throw new Error(res.error || "Failed to load domains");
      }

      setDomains(res.data || []);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleExplore = async (domain) => {
    setSelectedDomain(domain);
    setLoadingSubfields(true);
    setSubfieldsError(null);
    setSubfields([]);
    setSelectedSubfield(null);
    setTopics([]);
    setTopicsError(null);
    setSelectedTopic(null);
    setTopicPapers(null);
    setPapersError(null);

    try {
      const res = await getSubfieldsByDomain(domain?.id ?? domain);
      if (!res.success) {
        throw new Error(res.error || "Failed to load subfields");
      }
      setSubfields(res.data || []);
    } catch (err) {
      setSubfieldsError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoadingSubfields(false);
    }
  };

const handleSubfieldClick = async (subfield) => {
    setSelectedSubfield(subfield);
    setLoadingTopics(true);
    setTopicsError(null);
    setTopics([]);

    try {
      const res = await getTopicsBySubfield(subfield?.id ?? subfield);
      if (!res.success) {
        throw new Error(res.error || "Failed to load topics");
      }
      setTopics(res.data || []);
    } catch (err) {
      setTopicsError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoadingTopics(false);
    }
  };

  const handleTopicClick = async (topic) => {
    setSelectedTopic(topic);
    setLoadingPapers(true);
    setPapersError(null);
    setTopicPapers(null);

    try {
      const res = await getPapersForTopic(topic?.name ?? topic);
      if (!res.success) {
        throw new Error(res.error || "Failed to load papers");
      }
      setTopicPapers(res.data);
    } catch (err) {
      setPapersError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoadingPapers(false);
    }
  };

  const handleBackToTopics = () => {
    setSelectedTopic(null);
    setTopicPapers(null);
    setPapersError(null);
    setLoadingPapers(false);
  };

  const handleBack = () => {
    setSelectedDomain(null);
    setSubfields([]);
    setSubfieldsError(null);

    setSelectedSubfield(null);
    setTopics([]);
    setTopicsError(null);
    setLoadingTopics(false);

    setSelectedTopic(null);
    setTopicPapers(null);
    setPapersError(null);
    setLoadingPapers(false);
  };

  const handleBackToSubfields = () => {
    setSelectedSubfield(null);
    setTopics([]);
    setTopicsError(null);
    setLoadingTopics(false);

    setSelectedTopic(null);
    setTopicPapers(null);
    setPapersError(null);
    setLoadingPapers(false);
  };

  const displayedDomains = domains.length > 0 ? domains : popularDomains;
  const isShowingPopular = domains.length === 0;

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-500/10 mb-4">
          <BookOpen className="w-7 h-7 text-blue-500" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Domain Explorer</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Explore academic domains and subfields with real publication and
          citation statistics.
        </p>
      </div>

      <Card className="mb-8 border-2">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search domains, e.g. Machine Learning, Neuroscience..."
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <Button onClick={handleSearch} disabled={loading} size="lg">
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedDomain ? (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to Domains
            </Button>
            <h2 className="text-lg font-semibold">
              {selectedDomain.displayName ?? selectedDomain.name}
            </h2>
          </div>

          {loadingSubfields ? (
            <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading subfields...</span>
            </div>
          ) : subfieldsError ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm font-medium text-destructive">
                Failed to load subfields
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {subfieldsError}
              </p>
            </div>
) : selectedSubfield ? (
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={handleBackToSubfields}>
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  Back to Subfields
                </Button>
                <h2 className="text-lg font-semibold">
                  {selectedSubfield.name}
                </h2>
              </div>

              {loadingTopics ? (
                <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Loading topics...</span>
                </div>
              ) : topicsError ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-sm font-medium text-destructive">
                    Failed to load topics
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {topicsError}
                  </p>
                </div>
              ) : selectedTopic ? (
                <div className="flex flex-col gap-5">
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={handleBackToTopics}>
                      <ArrowLeft className="w-4 h-4 mr-1.5" />
                      Back to Topics
                    </Button>
                  </div>
                  <TopicPapers
                    data={topicPapers}
                    loading={loadingPapers}
                    error={papersError}
                  />
                </div>
              ) : topics.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topics.map((t, i) => (
                    <Card
                      key={`${t.id ?? t.name ?? i}-${i}`}
                      className="border border-border hover:border-primary/40 transition-colors cursor-pointer"
                      onClick={() => handleTopicClick(t)}
                    >
                      <CardContent className="pt-5">
                        <p className="text-sm font-semibold">{t.name}</p>
                        <div className="flex gap-3 mt-2">
                          <span className="text-xs text-muted-foreground">
                            {(t.worksCount ?? 0).toLocaleString()} works
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {(t.citedByCount ?? 0).toLocaleString()} citations
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-12">
                  No topics found for this subfield.
                </p>
              )}
            </div>
          ) : subfields.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subfields.map((sf, i) => (
                <Card
                  key={`${sf.id ?? sf.name ?? i}-${i}`}
                  className="border border-border hover:border-primary/40 transition-colors cursor-pointer"
                  onClick={() => handleSubfieldClick(sf)}
                >
                  <CardContent className="pt-5">
                    <p className="text-sm font-semibold">{sf.name}</p>
                    <div className="flex gap-3 mt-2">
                      <span className="text-xs text-muted-foreground">
                        {(sf.worksCount ?? 0).toLocaleString()} works
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {(sf.citedByCount ?? 0).toLocaleString()} citations
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-12">
              No subfields found for this domain.
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {isShowingPopular && !loading && !error && (
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Popular Domains
              </h2>
            </div>
          )}
          <DomainResults
            domains={displayedDomains}
            loading={loading || (isShowingPopular && loadingPopular)}
            error={error}
            onExplore={handleExplore}
          />
        </div>
      )}
    </div>
  );
}