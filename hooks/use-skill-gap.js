"use client";

import { useState, useCallback } from "react";
import { analyzeSkillGap, updateProgress, deleteAnalysis, getAllAnalyses } from "@/actions/skill-gap";
import { toast } from "sonner";

export const useSkillGap = () => {
  const [state, setState] = useState({
    status: "idle",
    analysis: null,
    analyses: [],
    error: null,
    isLoading: false,
    isDeleting: false,
    isFetchingAll: false,
  });

  const setPartialState = useCallback((partial) => {
    setState((prev) =>
      typeof partial === "function"
        ? partial(prev)
        : { ...prev, ...partial }
    );
  }, []);

  const analyze = useCallback(async (formData) => {
    try {
      setPartialState({ isLoading: true, status: "loading", error: null });

      const result = await analyzeSkillGap(formData);

      if (!result.success) {
        setPartialState({
          isLoading: false,
          status: "error",
          error: result.error,
        });
        toast.error(result.error || "Analysis failed");
        return null;
      }

      setPartialState({
        isLoading: false,
        status: "done",
        analysis: result.data,
        error: null,
      });

      toast.success("Skill gap analysis complete!");
      return result.data;
    } catch (error) {
      const message = error.message || "Unexpected error";
      setPartialState({
        isLoading: false,
        status: "error",
        error: message,
      });
      toast.error(message);
      return null;
    }
  }, [setPartialState]);

  const toggleSkillProgress = useCallback(async (analysisId, skillName, completed) => {
    try {
      const result = await updateProgress({ analysisId, skillName, completed });

      if (!result.success) {
        toast.error(result.error || "Failed to update progress");
        return false;
      }

      setPartialState((prev) => {
        if (!prev.analysis) return prev;
        const existingProgress = prev.analysis.progress || [];
        const index = existingProgress.findIndex(
          (p) => p.skillName === skillName && p.analysisId === analysisId
        );

        const updatedProgress =
          index >= 0
            ? existingProgress.map((p, i) =>
                i === index
                  ? { ...p, completed, completedAt: completed ? new Date() : null }
                  : p
              )
            : [
                ...existingProgress,
                {
                  skillName,
                  analysisId,
                  completed,
                  completedAt: completed ? new Date() : null,
                },
              ];

        return {
          ...prev,
          analysis: { ...prev.analysis, progress: updatedProgress },
        };
      });

      toast.success(completed ? "Skill marked as complete!" : "Skill marked as incomplete");
      return true;
    } catch (error) {
      toast.error(error.message || "Failed to update progress");
      return false;
    }
  }, [setPartialState]);

  const fetchAllAnalyses = useCallback(async () => {
    try {
      setPartialState({ isFetchingAll: true });

      const result = await getAllAnalyses();

      if (!result.success) {
        toast.error(result.error || "Failed to fetch analyses");
        setPartialState({ isFetchingAll: false });
        return [];
      }

      setPartialState({ analyses: result.data, isFetchingAll: false });
      return result.data;
    } catch (error) {
      toast.error(error.message || "Failed to fetch analyses");
      setPartialState({ isFetchingAll: false });
      return [];
    }
  }, [setPartialState]);

  const removeAnalysis = useCallback(async (id) => {
    try {
      setPartialState({ isDeleting: true });

      const result = await deleteAnalysis(id);

      if (!result.success) {
        toast.error(result.error || "Failed to delete analysis");
        setPartialState({ isDeleting: false });
        return false;
      }

      setPartialState((prev) => ({
        ...prev,
        isDeleting: false,
        analyses: prev.analyses.filter((a) => a.id !== id),
        analysis: prev.analysis?.id === id ? null : prev.analysis,
        status: prev.analysis?.id === id ? "idle" : prev.status,
      }));

      toast.success("Analysis deleted");
      return true;
    } catch (error) {
      toast.error(error.message || "Failed to delete analysis");
      setPartialState({ isDeleting: false });
      return false;
    }
  }, [setPartialState]);

  const resetAnalysis = useCallback(() => {
    setState({
      status: "idle",
      analysis: null,
      analyses: [],
      error: null,
      isLoading: false,
      isDeleting: false,
      isFetchingAll: false,
    });
  }, []);

  const setAnalysis = useCallback((analysis) => {
    setPartialState({
      analysis,
      status: analysis ? "done" : "idle",
      error: null,
    });
  }, [setPartialState]);

  return {
    ...state,
    analyze,
    toggleSkillProgress,
    fetchAllAnalyses,
    removeAnalysis,
    resetAnalysis,
    setAnalysis,
  };
};