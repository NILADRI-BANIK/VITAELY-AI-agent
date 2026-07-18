"use client";

import { useState, useCallback, useRef } from "react";

export function useResearchSession() {
  const [sessionId, setSessionId] = useState(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [savedPapers, setSavedPapers] = useState([]);
  const [activeFilters, setActiveFilters] = useState({
    sources: [],
    yearRange: { from: null, to: null },
    openAccessOnly: false,
    hasApi: false,
  });
  const [sortBy, setSortBy] = useState("relevance");
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("search");
  const abortControllerRef = useRef(null);

  const initSession = useCallback(() => {
    const id = `session_${Date.now()}`;
    setSessionId(id);
    setQuery("");
    setResults([]);
    setSavedPapers([]);
    setActiveFilters({
      sources: [],
      yearRange: { from: null, to: null },
      openAccessOnly: false,
      hasApi: false,
    });
    setSortBy("relevance");
    setError(null);
    setSearchHistory([]);
    setActiveTab("search");
    return id;
  }, []);

  const updateQuery = useCallback((value) => {
    setQuery(value);
  }, []);

  const startSearch = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    setIsSearching(true);
    setError(null);
    setResults([]);
  }, []);

  const setSearchResults = useCallback((data) => {
    setResults(data);
    setIsSearching(false);
  }, []);

  const failSearch = useCallback((err) => {
    if (err?.name === "AbortError") return;
    setError(err?.message ?? "Search failed");
    setIsSearching(false);
  }, []);

  const abortSearch = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsSearching(false);
  }, []);

  const pushHistory = useCallback((queryValue) => {
    if (!queryValue?.trim()) return;
    setSearchHistory((prev) => {
      const filtered = prev.filter((h) => h.query !== queryValue.trim());
      return [
        { query: queryValue.trim(), timestamp: Date.now() },
        ...filtered,
      ].slice(0, 20);
    });
  }, []);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
  }, []);

  const savePaper = useCallback((paper) => {
    setSavedPapers((prev) => {
      const paperId = paper.id ?? paper.paperId ?? paper.doi ?? paper.url;
      const alreadySaved = prev.some((p) => {
        const savedId = p.id ?? p.paperId ?? p.doi ?? p.url;
        return savedId && savedId === paperId;
      });
      if (alreadySaved) return prev;
      return [...prev, { ...paper, savedAt: Date.now() }];
    });
  }, []);

  const removeSavedPaper = useCallback((paperId) => {
    setSavedPapers((prev) => prev.filter((p) => p.id !== paperId));
  }, []);

  const isSaved = useCallback(
    (paperId) => savedPapers.some((p) => p.id === paperId),
    [savedPapers],
  );

  const updateFilter = useCallback((key, value) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setActiveFilters({
      sources: [],
      yearRange: { from: null, to: null },
      openAccessOnly: false,
      hasApi: false,
    });
  }, []);

  const toggleSourceFilter = useCallback((source) => {
    setActiveFilters((prev) => {
      const sources = prev.sources.includes(source)
        ? prev.sources.filter((s) => s !== source)
        : [...prev.sources, source];
      return { ...prev, sources };
    });
  }, []);

  const updateSortBy = useCallback((value) => {
    setSortBy(value);
  }, []);

  const switchTab = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetSession = useCallback(() => {
    abortSearch();
    initSession();
  }, [abortSearch, initSession]);

  const getAbortSignal = useCallback(() => {
    return abortControllerRef.current?.signal ?? null;
  }, []);

  return {
    // state
    sessionId,
    query,
    results,
    savedPapers,
    activeFilters,
    sortBy,
    isSearching,
    error,
    searchHistory,
    activeTab,

    // actions
    initSession,
    updateQuery,
    startSearch,
    setSearchResults,
    failSearch,
    abortSearch,
    pushHistory,
    clearHistory,
    savePaper,
    removeSavedPaper,
    isSaved,
    updateFilter,
    resetFilters,
    toggleSourceFilter,
    updateSortBy,
    switchTab,
    clearError,
    resetSession,
    getAbortSignal,
  };
}
