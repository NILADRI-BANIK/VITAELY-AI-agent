"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { ArrowLeft, Sparkles } from "lucide-react";
import { analyzeSkillGap } from "@/actions/skill-gap";
import SkillGapForm from "./skill-gap-form";
import AnalysisResults from "./analysis-results";
import SkillGapLoader from "@/components/loading/skill-gap-loader";

// STATUSES
const STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  RESULTS: "results",
};

// handleAnalyze
// handleReset
// SkillGapAnalyzer

export default function SkillGapAnalyzer({ user }) {
  const [status, setStatus] = useState(STATUS.IDLE);
  const [analysis, setAnalysis] = useState(null);
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = useCallback(async (data) => {
    setFormData(data);
    setStatus(STATUS.LOADING);
    setError(null);

    try {
      const result = await analyzeSkillGap(data);

      if (!result) {
        throw new Error("No response from analysis service.");
      }

      if (!result?.success || result?.error) {
  toast.error(result?.error || "AI analysis failed");
  setStatus(STATUS.IDLE);
  return;
}

setAnalysis(result);
      setStatus(STATUS.RESULTS);
    } catch (err) {
      console.error("Skill gap analysis error:", err);
      const message =
        err?.message || "Failed to analyze skill gap. Please try again.";
      setError(message);
      toast.error(message);
      setStatus(STATUS.IDLE);
    }
  }, []);

  const handleReset = useCallback(() => {
    setStatus(STATUS.IDLE);
    setAnalysis(null);
    setFormData(null);
    setError(null);
  }, []);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Header — always visible */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Analysis
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Skill Gap Analyzer
          </h1>
          <p className="mt-2 text-slate-500 text-base max-w-xl">
            Enter your target role and current skills — get a personalized
            roadmap to close the gap.
          </p>
        </div>

        {/* IDLE — show form */}
        {status === STATUS.IDLE && (
          <div className="animate-fade-in">
            {error && (
              <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                <span className="mt-0.5">⚠</span>
                <span>{error}</span>
              </div>
            )}
            <SkillGapForm onSubmit={handleAnalyze} />
          </div>
        )}

        {/* LOADING — show skeleton */}
        {status === STATUS.LOADING && (
          <div className="animate-fade-in">
            <SkillGapLoader />
          </div>
        )}

        {/* RESULTS — show analysis */}
        {status === STATUS.RESULTS && analysis && (
          <div className="animate-fade-in space-y-6">
            {/* Results header bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Analysis Results
                </h2>
                {formData?.role && (
                  <p className="text-sm text-slate-500 mt-0.5">
                    Target role:{" "}
                    <span className="font-semibold text-indigo-600">
                      {formData.role}
                    </span>
                    {formData?.experience && (
                      <span className="text-slate-400">
                        {" "}
                        · {formData.experience}
                      </span>
                    )}
                  </p>
                )}
              </div>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-indigo-600 border border-slate-200 hover:border-indigo-300 bg-white hover:bg-indigo-50 px-4 py-2 rounded-lg transition-all duration-150 self-start sm:self-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                New Analysis
              </button>
            </div>

            <AnalysisResults
              analysis={analysis}
              role={formData?.targetRole || formData?.role}
userSkills={formData?.currentSkills ?? formData?.skills ?? formData?.userSkills ?? []}
              experience={formData?.experience}
              userId={user?.id ?? null}
            />
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
      `}</style>
    </div>
  );
}
