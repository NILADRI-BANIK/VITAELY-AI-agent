"use client";

import { Loader2, Brain, Zap, Target, BookOpen, Lightbulb, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function JobAnalysisPanel({ analysis, isAnalyzing }) {
  if (isAnalyzing) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="relative">
            <div className="p-4 rounded-2xl bg-primary/10">
              <Brain className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-1">
              <Loader2 className="h-4 w-4 text-primary animate-spin" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <p className="font-semibold text-sm">Analyzing job description...</p>
            <p className="text-xs text-muted-foreground">
              Extracting skills, keywords, and requirements
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <div className="p-4 rounded-2xl bg-muted/60">
            <Brain className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-sm">No analysis yet</p>
            <p className="text-xs text-muted-foreground">
              Paste a job description and click{" "}
              <span className="font-medium text-foreground">Analyze</span> to
              extract key insights
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const {
    requiredSkills = [],
    preferredSkills = [],
    keyResponsibilities = [],
    companyCulture = "",
    experienceLevel = "",
    keywords = [],
    summary = "",
    recommendations = [],
  } = analysis;

  return (
    <div className="space-y-4">
      {/* Summary */}
      {summary && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Job Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {summary}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Experience Level */}
      {experienceLevel && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Experience Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="capitalize text-sm">
              {experienceLevel}
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Required Skills */}
      {requiredSkills.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Required Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {requiredSkills.map((skill, i) => (
                <Badge key={i} variant="default" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preferred Skills */}
      {preferredSkills.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              Preferred Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {preferredSkills.map((skill, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ATS Keywords */}
      {keywords.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              ATS Keywords
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {keywords.map((kw, i) => (
                <Badge
                  key={i}
                  className="text-xs bg-blue-500/10 text-blue-600 border border-blue-500/20 hover:bg-blue-500/20"
                  variant="outline"
                >
                  {kw}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Responsibilities */}
      {keyResponsibilities.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Key Responsibilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {keyResponsibilities.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Company Culture */}
      {companyCulture && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              Company Culture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {companyCulture}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Lightbulb className="h-3.5 w-3.5 mt-0.5 text-yellow-500 shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}