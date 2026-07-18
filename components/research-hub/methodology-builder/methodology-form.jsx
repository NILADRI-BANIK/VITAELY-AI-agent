"use client";

import { useState, useEffect, useCallback } from "react";
import { Sparkles, Loader2, ChevronDown, ChevronUp, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getMethodologyTypes } from "@/actions/research-hub/methodology-builder";
import { getSupportedDataTypes, getSupportedAnalysisGoals } from "@/actions/research-hub/statistics-recommender";
import { getSupportedModelTypes } from "@/actions/research-hub/validation-engine";

const splitToArray = (str) =>
  str
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export default function MethodologyForm({ onSubmit, submitting = false }) {
  const [topic, setTopic] = useState("");
  const [methodologyType, setMethodologyType] = useState("");
  const [researchObjectives, setResearchObjectives] = useState("");
  const [targetPopulation, setTargetPopulation] = useState("");
  const [constraints, setConstraints] = useState("");
  const [useLiteratureEvidence, setUseLiteratureEvidence] = useState(true);
  const [estimatedPopulationSize, setEstimatedPopulationSize] = useState("");

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dataType, setDataType] = useState("");
  const [analysisGoal, setAnalysisGoal] = useState("");
  const [modelType, setModelType] = useState("none");

  const [types, setTypes] = useState([]);
  const [dataTypes, setDataTypes] = useState([]);
  const [analysisGoals, setAnalysisGoals] = useState([]);
  const [modelTypes, setModelTypes] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [error, setError] = useState(null);

  const fetchOptions = useCallback(async () => {
    setLoadingOptions(true);
    try {
      const [typesRes, dataTypesRes, goalsRes, modelTypesRes] = await Promise.all([
        getMethodologyTypes(),
        getSupportedDataTypes(),
        getSupportedAnalysisGoals(),
        getSupportedModelTypes(),
      ]);

      if (typesRes.success) {
        setTypes(typesRes.data || []);
        if (typesRes.data?.length) setMethodologyType(typesRes.data[0].id);
      }
      if (dataTypesRes.success) setDataTypes(dataTypesRes.data || []);
      if (goalsRes.success) setAnalysisGoals(goalsRes.data || []);
      if (modelTypesRes.success) setModelTypes(modelTypesRes.data || []);
    } catch {
      // silently fail
    } finally {
      setLoadingOptions(false);
    }
  }, []);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  const handleSubmit = () => {
    if (!topic.trim()) {
      setError("Please enter a topic.");
      return;
    }
    if (!methodologyType) {
      setError("Please select a methodology type.");
      return;
    }
    if (estimatedPopulationSize && Number.isNaN(Number(estimatedPopulationSize))) {
      setError("Estimated population size must be a number.");
      return;
    }
    if ((dataType && !analysisGoal) || (!dataType && analysisGoal)) {
      setError("Please select both data type and analysis goal, or leave both empty.");
      return;
    }

    setError(null);

    onSubmit?.({
      topic: topic.trim(),
      methodologyType,
      researchObjectives: splitToArray(researchObjectives),
      targetPopulation: targetPopulation.trim(),
      constraints: splitToArray(constraints),
      useLiteratureEvidence,
      estimatedPopulationSize: estimatedPopulationSize
        ? Number(estimatedPopulationSize)
        : null,
      dataType: dataType || null,
      analysisGoal: analysisGoal || null,
      modelType: modelType || "none",
    });
  };

  return (
    <Card className="mb-6 border-2">
      <CardContent className="pt-6 space-y-5">
        <div>
          <label className="text-sm font-medium mb-1.5 block">
            Research Topic <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Impact of remote work on employee productivity"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">
            Methodology Type <span className="text-destructive">*</span>
          </label>
          <select
            value={methodologyType}
            onChange={(e) => setMethodologyType(e.target.value)}
            disabled={loadingOptions}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
          {types.find((t) => t.id === methodologyType) && (
            <p className="text-xs text-muted-foreground mt-1.5">
              {types.find((t) => t.id === methodologyType).description}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">
            Research Objectives{" "}
            <span className="text-muted-foreground font-normal">(comma separated)</span>
          </label>
          <input
            type="text"
            value={researchObjectives}
            onChange={(e) => setResearchObjectives(e.target.value)}
            placeholder="e.g. measure productivity, identify barriers"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">Target Population</label>
          <input
            type="text"
            value={targetPopulation}
            onChange={(e) => setTargetPopulation(e.target.value)}
            placeholder="e.g. remote software employees, 25-45 years"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">
            Constraints{" "}
            <span className="text-muted-foreground font-normal">(comma separated)</span>
          </label>
          <input
            type="text"
            value={constraints}
            onChange={(e) => setConstraints(e.target.value)}
            placeholder="e.g. limited budget, 3 month timeline"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-input px-3 py-2.5">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-sm">Use literature evidence to ground recommendations</span>
          </div>
          <input
            type="checkbox"
            checked={useLiteratureEvidence}
            onChange={(e) => setUseLiteratureEvidence(e.target.checked)}
            className="w-4 h-4 accent-primary shrink-0"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced((p) => !p)}
          className="flex items-center gap-1.5 text-sm font-medium text-primary"
        >
          {showAdvanced ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
          Advanced Options
        </button>

        {showAdvanced && (
          <div className="flex flex-col gap-5 pt-1 border-t border-border pt-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Estimated Population Size{" "}
                <span className="text-muted-foreground font-normal">(for sample size calculation)</span>
              </label>
              <input
                type="number"
                min="0"
                value={estimatedPopulationSize}
                onChange={(e) => setEstimatedPopulationSize(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Data Type</label>
              <select
                value={dataType}
                onChange={(e) => setDataType(e.target.value)}
                disabled={loadingOptions}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">None</option>
                {dataTypes.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Analysis Goal</label>
              <select
                value={analysisGoal}
                onChange={(e) => setAnalysisGoal(e.target.value)}
                disabled={loadingOptions}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">None</option>
                {analysisGoals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Model Type</label>
              <select
                value={modelType}
                onChange={(e) => setModelType(e.target.value)}
                disabled={loadingOptions}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {modelTypes.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {error && (
          <div className="text-destructive text-sm bg-destructive/10 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={submitting || loadingOptions}
          className="w-full"
          size="lg"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Building Methodology...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Build Methodology
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}