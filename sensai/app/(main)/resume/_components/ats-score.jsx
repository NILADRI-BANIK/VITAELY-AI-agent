"use client";

import { useState } from "react";
import {
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Tag,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";

// ── Score Ring ────────────────────────────────────────────────────────
function ScoreRing({ score }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";

  const label =
    score >= 75 ? "Excellent" : score >= 50 ? "Average" : "Needs Work";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted/20"
          />
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-2xl font-black"
            style={{ color }}
          >
            {score}
          </span>
          <span className="text-xs text-muted-foreground">/ 100</span>
        </div>
      </div>
      <span
        className="text-xs font-semibold px-2 py-0.5 rounded-full"
        style={{
          backgroundColor: `${color}18`,
          color,
          border: `1px solid ${color}40`,
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ── Keyword Badge ─────────────────────────────────────────────────────
function KeywordBadge({ word, type }) {
  const styles =
    type === "found"
      ? "bg-green-500/10 text-green-600 border-green-500/20"
      : "bg-red-500/10 text-red-500 border-red-500/20";
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-md border font-medium ${styles}`}
    >
      {type === "found" ? "+ " : "− "}
      {word}
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────────────
// Props:
//   atsScore     {number}   — score 0-100 (from DB or fresh analysis)
//   feedback     {string}   — overall feedback text
//   suggestions  {string[]} — list of improvement suggestions
//   keywords     {string[]} — keywords found in resume
//   missingKeywords {string[]} — keywords missing from resume
//   resumeId     {string}   — optional resume ID for context
//   compact      {boolean}  — show compact version inside resume card

export default function ATSScoreComponent({
  atsScore = null,
  feedback = "",
  suggestions = [],
  keywords = [],
  missingKeywords = [],
  resumeId = null,
  compact = false,
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  // ── No score yet ──────────────────────────────────────────────────
  if (atsScore === null) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">No ATS Score Yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Check your resume&apos;s ATS compatibility
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => router.push("/ats-score")}
          className="gap-1.5"
        >
          <BarChart3 className="w-3.5 h-3.5" />
          Check ATS Score
          <ExternalLink className="w-3 h-3" />
        </Button>
      </div>
    );
  }

  // ── Compact mode (inside resume card) ────────────────────────────
  if (compact) {
    const color =
      atsScore >= 75 ? "#22c55e" : atsScore >= 50 ? "#f59e0b" : "#ef4444";

    return (
      <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-muted/40">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">
            ATS Score
          </span>
        </div>
        <span
          className="text-sm font-black"
          style={{ color }}
        >
          {atsScore}/100
        </span>
      </div>
    );
  }

  // ── Full view ─────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Score + Feedback */}
      <div className="flex flex-col sm:flex-row items-start gap-5">
        {/* Score Ring */}
        <div className="flex-shrink-0 flex justify-center w-full sm:w-auto">
          <ScoreRing score={atsScore} />
        </div>

        {/* Feedback */}
        {feedback && (
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-sm font-semibold">Overall Feedback</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {feedback}
            </p>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-primary mt-2 hover:underline"
            >
              {expanded ? "Hide details ↑" : "Show details ↓"}
            </button>
          </div>
        )}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="space-y-4 pt-2 border-t border-border">
          {/* Keywords Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Found */}
            {keywords.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Tag className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-xs font-semibold">Keywords Found</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {keywords.map((kw, i) => (
                    <KeywordBadge key={i} word={kw} type="found" />
                  ))}
                </div>
              </div>
            )}

            {/* Missing */}
            {missingKeywords.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                  <span className="text-xs font-semibold">
                    Missing Keywords
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {missingKeywords.map((kw, i) => (
                    <KeywordBadge key={i} word={kw} type="missing" />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs font-semibold">
                  Improvement Suggestions
                </span>
              </div>
              <div className="space-y-2">
                {suggestions.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/40"
                  >
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ChevronRight className="w-3 h-3 text-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {s}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Re-check Button */}
      <Button
        size="sm"
        variant="outline"
        onClick={() => router.push("/ats-score")}
        className="w-full gap-1.5"
      >
        <BarChart3 className="w-3.5 h-3.5" />
        Re-check ATS Score
      </Button>
    </div>
  );
}