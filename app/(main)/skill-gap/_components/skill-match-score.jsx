"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getScoreLabel, getScoreProgressColor } from "@/lib/skill-gap-utils";

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const SkillMatchScore = ({ score = 0, targetRole = "", timeline = "" }) => {
  const clampedScore = Math.min(100, Math.max(0, score));
  const { label, color } = getScoreLabel(clampedScore);

  const strokeDashoffset = useMemo(() => {
    const progress = clampedScore / 100;
    return CIRCUMFERENCE - progress * CIRCUMFERENCE;
  }, [clampedScore]);

  const strokeColor = useMemo(() => {
    if (clampedScore >= 80) return "#22c55e";
    if (clampedScore >= 60) return "#3b82f6";
    if (clampedScore >= 40) return "#eab308";
    if (clampedScore >= 20) return "#f97316";
    return "#ef4444";
  }, [clampedScore]);

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">
            Skill Match Score
          </CardTitle>
          {timeline && (
            <Badge variant="outline" className="text-xs">
              Est. {timeline}
            </Badge>
          )}
        </div>
        {targetRole && (
          <p className="text-sm text-muted-foreground">
            For:{" "}
            <span className="font-medium text-foreground">{targetRole}</span>
          </p>
        )}
      </CardHeader>

      <CardContent>
        <div className="flex flex-col items-center justify-center py-4 space-y-4">
          <div className="relative inline-flex items-center justify-center">
            <svg
              width="140"
              height="140"
              viewBox="0 0 140 140"
              className="-rotate-90"
              aria-hidden="true"
            >
              <circle
                cx="70"
                cy="70"
                r={RADIUS}
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                className="text-muted/30"
              />
              <circle
                cx="70"
                cy="70"
                r={RADIUS}
                fill="none"
                stroke={strokeColor}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: "stroke-dashoffset 0.8s ease-in-out" }}
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold tabular-nums">
                {clampedScore}%
              </span>
              <span className="text-xs text-muted-foreground">match</span>
            </div>
          </div>

          <div className="text-center space-y-1">
            <p className="text-sm font-semibold" style={{ color }}>
              {label}
            </p>
            <p className="text-xs text-muted-foreground">
              {clampedScore >= 80
                ? "You're well-qualified for this role."
                : clampedScore >= 60
                  ? "A few more skills and you'll be ready."
                  : clampedScore >= 40
                    ? "Some key skills are missing. Keep learning!"
                    : "Significant skill gaps detected. Start with priority skills."}
            </p>
          </div>

          <div className="w-full space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
            <div className="relative h-2 w-full rounded-full bg-muted/30 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-in-out ${getScoreProgressColor(clampedScore)}`}
                style={{ width: `${clampedScore}%` }}
                role="progressbar"
                aria-valuenow={clampedScore}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Skill match score: ${clampedScore}%`}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SkillMatchScore;
