"use client";

import { useState, useMemo } from "react";
import { Calculator, RefreshCw, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  calculateCochranSampleSize,
  getRecommendedConfidenceLevels,
} from "@/lib/sample-size";

export default function SampleSizeCard({
  initialResult = null,
  estimatedPopulationSize = null,
}) {
  const confidenceLevels = useMemo(() => getRecommendedConfidenceLevels(), []);

  const [confidenceLevel, setConfidenceLevel] = useState(
    initialResult?.confidenceLevel ?? 95,
  );
  const [marginOfError, setMarginOfError] = useState(
    initialResult?.marginOfError ?? 5,
  );
  const [population, setPopulation] = useState(
    initialResult?.population ?? estimatedPopulationSize ?? "",
  );
  const [responseDistribution, setResponseDistribution] = useState(
    initialResult?.responseDistribution ?? 50,
  );

  const [result, setResult] = useState(initialResult);
  const [error, setError] = useState(null);

  const handleCalculate = () => {
    setError(null);
    try {
      const computed = calculateCochranSampleSize({
        confidenceLevel: Number(confidenceLevel),
        marginOfError: Number(marginOfError),
        population: population ? Number(population) : null,
        responseDistribution: Number(responseDistribution),
      });
      setResult(computed);
    } catch (err) {
      setError(err.message || "Failed to calculate sample size.");
      setResult(null);
    }
  };

  return (
    <Card className="border border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-md bg-primary/10 shrink-0">
            <Calculator className="w-4 h-4 text-primary" />
          </div>
          <CardTitle className="text-sm font-semibold">
            Sample Size Calculator
          </CardTitle>
          <Badge variant="outline" className="text-xs ml-auto">
            Cochran&apos;s Formula
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Confidence Level
            </label>
            <select
              value={confidenceLevel}
              onChange={(e) => setConfidenceLevel(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {confidenceLevels.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Margin of Error (%)
            </label>
            <input
              type="number"
              min="0.1"
              max="99.9"
              step="0.1"
              value={marginOfError}
              onChange={(e) => setMarginOfError(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Population Size{" "}
              <span className="opacity-70">(optional)</span>
            </label>
            <input
              type="number"
              min="0"
              value={population}
              onChange={(e) => setPopulation(e.target.value)}
              placeholder="Unknown / infinite"
              className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Response Distribution (%)
            </label>
            <input
              type="number"
              min="0.1"
              max="99.9"
              step="0.1"
              value={responseDistribution}
              onChange={(e) => setResponseDistribution(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {error && (
          <div className="text-destructive text-xs bg-destructive/10 px-3 py-2 rounded-md">
            {error}
          </div>
        )}

        <Button size="sm" variant="outline" onClick={handleCalculate} className="self-start">
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Recalculate
        </Button>

        {result && (
          <div className="flex flex-col gap-3 pt-1 border-t border-border">
            <div className="flex items-center gap-4 flex-wrap pt-3">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">
                  Recommended Sample Size
                </span>
                <span className="text-2xl font-bold text-foreground">
                  {result.recommendedSampleSize}
                </span>
              </div>
              {result.adjustedForPopulation && (
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">
                    Raw (Unadjusted)
                  </span>
                  <span className="text-lg font-semibold text-muted-foreground">
                    {result.rawSampleSize}
                  </span>
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Z-Score</span>
                <span className="text-lg font-semibold text-muted-foreground">
                  {result.zScore}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 p-2.5 rounded-md bg-muted/50 border border-border">
              <Info className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Based on {result.confidenceLevel}% confidence, ±{result.marginOfError}%
                margin of error, {result.responseDistribution}% response distribution
                {result.adjustedForPopulation
                  ? `, adjusted for a population of ${result.population.toLocaleString()}.`
                  : ", assuming an unknown or infinite population."}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}