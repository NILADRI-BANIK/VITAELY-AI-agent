"use client";

import { useState, useEffect, useCallback } from "react";
import { GitCompare, Loader2, CheckCircle2, XCircle, Sparkles, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { compareMethodologies, getMethodologyTypes } from "@/actions/research-hub/methodology-builder";

export default function MethodologyComparison({ topic = "", initialTypes = [] }) {
  const [availableTypes, setAvailableTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [selectedTypes, setSelectedTypes] = useState(initialTypes);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTypes = useCallback(async () => {
    setLoadingTypes(true);
    try {
      const res = await getMethodologyTypes();
      if (res.success) {
        setAvailableTypes(res.data || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoadingTypes(false);
    }
  }, []);

  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  const toggleType = (id) => {
    setSelectedTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  const handleCompare = async () => {
    if (!topic?.trim()) {
      setError("A research topic is required to compare methodologies.");
      return;
    }
    if (selectedTypes.length < 2) {
      setError("Select at least 2 methodology types to compare.");
      return;
    }

    setError(null);
    setLoading(true);
    setResult(null);

    try {
      const res = await compareMethodologies({ topic: topic.trim(), types: selectedTypes });
      if (!res.success) {
        throw new Error(res.error || "Failed to compare methodologies");
      }
      setResult(res.data);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-md bg-primary/10 shrink-0">
            <GitCompare className="w-4 h-4 text-primary" />
          </div>
          <CardTitle className="text-sm font-semibold">
            Compare Methodology Types
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Select methodologies to compare (min 2)
          </p>
          <div className="flex flex-wrap gap-1.5">
            {loadingTypes ? (
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Loading types...
              </span>
            ) : (
              availableTypes.map((t) => {
                const isSelected = selectedTypes.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleType(t.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-input text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {error && (
          <div className="text-destructive text-sm bg-destructive/10 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <Button
          onClick={handleCompare}
          disabled={loading || loadingTypes}
          size="sm"
          className="self-start"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              Comparing...
            </>
          ) : (
            <>
              <GitCompare className="w-3.5 h-3.5 mr-1.5" />
              Compare
            </>
          )}
        </Button>

        {result && (
          <div className="flex flex-col gap-4 pt-2 border-t border-border">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">
                      Methodology
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">
                      Strengths
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">
                      Weaknesses
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">
                      Best For
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.comparison?.map((c, i) => (
                    <tr key={`${c.type}-${i}`} className="border-b border-border/60 align-top">
                      <td className="px-3 py-3">
                        <Badge variant="secondary" className="text-xs whitespace-nowrap">
                          {c.type}
                        </Badge>
                      </td>
                      <td className="px-3 py-3">
                        <ul className="flex flex-col gap-1">
                          {(c.strengths || []).map((s, j) => (
                            <li key={j} className="text-xs text-foreground flex items-start gap-1.5">
                              <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0 mt-0.5" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-3 py-3">
                        <ul className="flex flex-col gap-1">
                          {(c.weaknesses || []).map((w, j) => (
                            <li key={j} className="text-xs text-foreground flex items-start gap-1.5">
                              <XCircle className="w-3 h-3 text-destructive shrink-0 mt-0.5" />
                              {w}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-xs text-muted-foreground leading-relaxed">
                          {c.bestFor}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {result.recommendation && (
              <div className="flex items-start gap-2 p-3 rounded-md bg-primary/5 border border-primary/20">
                <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-medium text-foreground">
                    Recommendation
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {result.recommendation}
                  </p>
                </div>
              </div>
            )}

            {result.hybrid && (
              <div className="flex items-start gap-2 p-3 rounded-md bg-muted/50 border border-border">
                <Lightbulb className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-medium text-foreground">
                    Hybrid Approach
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {result.hybrid}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}