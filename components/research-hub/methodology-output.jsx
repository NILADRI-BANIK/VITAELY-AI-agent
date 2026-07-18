"use client";

import { useState, useRef, useEffect } from "react";
import { FlaskConical, Copy, Check, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import LiteratureMethodologyTable from "./methodology-builder/literature-methodology-table";
import MethodologyRecommendation from "./methodology-builder/methodology-recommendation";
import SampleSizeCard from "./methodology-builder/sample-size-card";
import ResearchDesignCard from "./methodology-builder/research-design-card";
import SamplingCard from "./methodology-builder/sampling-card";
import VariablesCard from "./methodology-builder/variables-card";
import StatisticalAnalysisCard from "./methodology-builder/statistical-analysis-card";
import ValidationCard from "./methodology-builder/validation-card";
import TimelineCard from "./methodology-builder/timeline-card";
import EthicsCard from "./methodology-builder/ethics-card";
import RiskCard from "./methodology-builder/risk-card";
import MethodologyComparison from "./methodology-builder/methodology-comparison";
import MethodologyRadarChart from "./methodology-builder/methodology-radar-chart";
import MethodologyBarChart from "./methodology-builder/methodology-bar-chart";
import PublicationTrendChart from "./methodology-builder/publication-trend-chart";
import WorkflowDiagram from "./methodology-builder/workflow-diagram";
import ExportMenu from "./methodology-builder/export-menu";

// ─── MethodologySkeleton ──────────────────────────────────────────────────────

function MethodologySkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded-md shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-4/6" />
        </CardContent>
      </Card>
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Skeleton className="w-7 h-7 rounded-full shrink-0" />
              <Skeleton className="h-4 w-40" />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-3/4" />
            <div className="flex gap-2 mt-1">
              {Array.from({ length: 2 }).map((_, j) => (
                <Skeleton key={j} className="h-5 w-20 rounded-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── MethodologyOutput ────────────────────────────────────────────────────────

export default function MethodologyOutput({
  data = null,
  methodologyId = null,
  literatureAnalysis = null,
  loading = false,
  error = null,
  emptyMessage = "No methodology generated yet. Select a topic and research type to get started.",
}) {
  const [fullCopied, setFullCopied] = useState(false);
  const fullCopyTimerRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(fullCopyTimerRef.current);
  }, []);

  if (loading) {
    return <MethodologySkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-3 rounded-full bg-destructive/10 mb-3">
          <AlertCircle className="w-6 h-6 text-destructive" />
        </div>
        <p className="text-sm font-medium text-destructive">
          Failed to load methodology
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {typeof error === "string" ? error : "An unexpected error occurred."}
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-3 rounded-full bg-muted mb-3">
          <FlaskConical className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  const {
    topic,
    methodologyType,
    objectives = [],
    targetPopulation,
    constraints = [],
    methodology: narrative = null,
    recommendationBundle = null,
  } = data;

  const recommendation = recommendationBundle?.recommendation ?? null;
  const overallConfidence = recommendation?.overallConfidence ?? null;
  const literatureBacked = Boolean(recommendationBundle?.literatureBacked);
  const statisticsRecommendation =
    recommendationBundle?.statisticsRecommendation ?? null;
  const validationRecommendation =
    recommendationBundle?.validationRecommendation ?? null;
  const sampleSizeSuggestion =
    recommendationBundle?.sampleSizeSuggestion ?? null;
  const literatureSummary = recommendationBundle?.literatureSummary ?? null;

async function handleFullCopy() {
    const variablesText = recommendation?.variables
      ? Object.entries(recommendation.variables)
          .filter(([, v]) => Array.isArray(v) && v.length > 0)
          .map(([k, v]) => `${k}: ${v.join(", ")}`)
          .join("\n")
      : "";

    const statsText = Array.isArray(statisticsRecommendation?.recommendedTests)
      ? statisticsRecommendation.recommendedTests.map((t) => `${t.name} (${t.confidence}%)`).join(", ")
      : "";

    const validationText = Array.isArray(validationRecommendation?.recommendedValidation)
      ? validationRecommendation.recommendedValidation.map((v) => `${v.name} (${v.confidence}%)`).join(", ")
      : "";

    const text = [
      topic ? `Methodology: ${topic}` : "Research Methodology",
      methodologyType ? `Type: ${methodologyType}` : null,
      narrative?.overview ? `Overview:\n${narrative.overview}` : null,
      narrative?.researchDesign ? `Research Design:\n${narrative.researchDesign}` : null,
      recommendation?.researchDesign?.recommendation
        ? `AI-Recommended Design: ${recommendation.researchDesign.recommendation}`
        : null,
      recommendation?.samplingTechnique?.recommendation
        ? `Sampling Technique: ${recommendation.samplingTechnique.recommendation}`
        : null,
      variablesText ? `Variables:\n${variablesText}` : null,
      sampleSizeSuggestion?.recommendedSampleSize
        ? `Recommended Sample Size: ${sampleSizeSuggestion.recommendedSampleSize}`
        : null,
      statsText ? `Statistical Tests: ${statsText}` : null,
      validationText ? `Validation Methods: ${validationText}` : null,
      Array.isArray(narrative?.limitations) && narrative.limitations.length
        ? `Limitations:\n${narrative.limitations.map((l, i) => `${i + 1}. ${l}`).join("\n")}`
        : null,
      Array.isArray(narrative?.ethicalConsiderations) && narrative.ethicalConsiderations.length
        ? `Ethics:\n${narrative.ethicalConsiderations.join(" ")}`
        : null,
    ]
      .filter(Boolean)
      .join("\n\n");

    try {
      await navigator.clipboard.writeText(text);
      clearTimeout(fullCopyTimerRef.current);
      setFullCopied(true);
      fullCopyTimerRef.current = setTimeout(() => setFullCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="border border-border">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="flex items-start gap-2 min-w-0 flex-1">
              <div className="p-2 rounded-md bg-primary/10 shrink-0 mt-0.5">
                <FlaskConical className="w-4 h-4 text-primary" />
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                {topic && (
                  <CardTitle className="text-base font-semibold leading-snug">
                    {topic}
                  </CardTitle>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {methodologyType && (
                    <Badge variant="outline" className="text-xs capitalize">
                      {methodologyType}
                    </Badge>
                  )}
                  {targetPopulation && (
                    <Badge variant="secondary" className="text-xs">
                      {targetPopulation}
                    </Badge>
                  )}
                  {objectives.length > 0 && (
                    <Badge variant="outline" className="text-xs font-normal">
                      {objectives.length} objective
                      {objectives.length > 1 ? "s" : ""}
                    </Badge>
                  )}
                  {constraints.length > 0 && (
                    <Badge variant="outline" className="text-xs font-normal">
                      {constraints.length} constraint
                      {constraints.length > 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button size="sm" variant="outline" onClick={handleFullCopy}>
                {fullCopied ? (
                  <Check className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <Copy className="w-4 h-4 mr-1" />
                )}
                {fullCopied ? "Copied" : "Copy Summary"}
              </Button>
              <ExportMenu
                methodologyId={methodologyId}
                methodologyData={data}
              />
            </div>
          </div>
        </CardHeader>
        {(narrative?.overview ||
          objectives.length > 0 ||
          constraints.length > 0) && (
          <CardContent className="flex flex-col gap-2">
            {narrative?.overview && (
              <p className="text-sm text-foreground leading-relaxed">
                {narrative.overview}
              </p>
            )}
            {objectives.length > 0 && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">
                  Objectives:{" "}
                </span>
                {objectives.join("; ")}
              </p>
            )}
            {constraints.length > 0 && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">
                  Constraints:{" "}
                </span>
                {constraints.join(", ")}
              </p>
            )}
          </CardContent>
        )}
      </Card>

      <WorkflowDiagram activeStep="methodology" />

      {recommendation && (
        <MethodologyRecommendation
          recommendation={recommendation}
          overallConfidence={overallConfidence}
          literatureBacked={literatureBacked}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ResearchDesignCard researchDesign={recommendation?.researchDesign} />
        <SamplingCard samplingTechnique={recommendation?.samplingTechnique} />
      </div>

      {recommendation?.variables && (
        <VariablesCard variables={recommendation.variables} />
      )}

      {sampleSizeSuggestion && (
        <SampleSizeCard
          initialResult={sampleSizeSuggestion}
          estimatedPopulationSize={sampleSizeSuggestion?.population}
        />
      )}

      {statisticsRecommendation && (
        <StatisticalAnalysisCard
          statisticsRecommendation={statisticsRecommendation}
        />
      )}

      {validationRecommendation && (
        <ValidationCard validationRecommendation={validationRecommendation} />
      )}

      {Array.isArray(narrative?.timeline) && narrative.timeline.length > 0 && (
        <TimelineCard timeline={narrative.timeline} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(narrative?.ethicalConsiderations || []).length > 0 && (
          <EthicsCard ethicalConsiderations={narrative.ethicalConsiderations} />
        )}
        {(narrative?.limitations || []).length > 0 && (
          <RiskCard limitations={narrative.limitations} />
        )}
      </div>

      {(literatureSummary?.methodologyDistribution?.distribution ||
        literatureAnalysis?.methodologyDistribution?.distribution) && (
        <MethodologyBarChart
          distribution={
            literatureSummary?.methodologyDistribution?.distribution ??
            literatureAnalysis?.methodologyDistribution?.distribution
          }
          totalAnalyzed={
            literatureSummary?.totalPapers ??
            literatureAnalysis?.totalUniquePapers
          }
        />
      )}

      {literatureAnalysis?.publicationTrend?.length > 0 && (
        <PublicationTrendChart trend={literatureAnalysis.publicationTrend} />
      )}

      {methodologyType && (
        <MethodologyRadarChart methodologyType={methodologyType} />
      )}

      {literatureAnalysis?.papers && (
        <LiteratureMethodologyTable papers={literatureAnalysis.papers} />
      )}

      {topic && (
        <MethodologyComparison
          topic={topic}
          initialTypes={[methodologyType].filter(Boolean)}
        />
      )}
    </div>
  );
}
