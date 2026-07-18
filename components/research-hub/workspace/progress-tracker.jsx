"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Youtube,
  Wrench,
  Search,
  Map,
  CheckCircle2,
  Circle,
  RefreshCw,
  Loader2,
  ListChecks,
} from "lucide-react";
import { getWorkspaceSession } from "@/actions/research-hub/topic-workspace";

const CHECKLIST_CONFIG = [
  {
    key: "papers",
    label: "Papers Explored",
    icon: FileText,
    type: "count",
  },
  {
    key: "videos",
    label: "Videos Watched",
    icon: Youtube,
    type: "count",
  },
  {
    key: "methodologyDone",
    label: "Methodology Built",
    icon: Wrench,
    type: "bool",
  },
  {
    key: "gapAnalysisDone",
    label: "Research Gaps Analyzed",
    icon: Search,
    type: "bool",
  },
  {
    key: "roadmapDone",
    label: "Roadmap Generated",
    icon: Map,
    type: "bool",
  },
];

function ChecklistRow({ config, session, totalPapers, totalVideos }) {
  const Icon = config.icon;

  let done = false;
  let subtitle = "";

  if (config.key === "papers") {
    const count = Array.isArray(session?.openedPapers)
      ? session.openedPapers.length
      : 0;
    done = count > 0;
    subtitle =
      totalPapers != null ? `${count} of ${totalPapers} opened` : `${count} opened`;
  } else if (config.key === "videos") {
    const count = Array.isArray(session?.viewedVideos)
      ? session.viewedVideos.length
      : 0;
    done = count > 0;
    subtitle =
      totalVideos != null ? `${count} of ${totalVideos} watched` : `${count} watched`;
  } else {
    done = !!session?.[config.key];
    subtitle = done ? "Completed" : "Not started";
  }

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
      {done ? (
        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
      ) : (
        <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
      )}
      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm font-medium truncate ${
            done ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          {config.label}
        </p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

export default function ProgressTracker({ topicId, totalPapers, totalVideos }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchSession = useCallback(
    async (isRefresh = false) => {
      if (!topicId) return;
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError("");
      try {
        const result = await getWorkspaceSession(topicId);
        if (result.success) {
          setSession(result.data);
        } else {
          setError(result.error || "Failed to load progress");
        }
      } catch (err) {
        setError(err.message || "Failed to load progress");
      } finally {
        isRefresh ? setRefreshing(false) : setLoading(false);
      }
    },
    [topicId],
  );

  useEffect(() => {
    fetchSession(false);
  }, [fetchSession]);

  const completedCount = CHECKLIST_CONFIG.reduce((acc, config) => {
    if (config.key === "papers") {
      return acc + (Array.isArray(session?.openedPapers) && session.openedPapers.length > 0 ? 1 : 0);
    }
    if (config.key === "videos") {
      return acc + (Array.isArray(session?.viewedVideos) && session.viewedVideos.length > 0 ? 1 : 0);
    }
    return acc + (session?.[config.key] ? 1 : 0);
  }, 0);

  const totalCount = CHECKLIST_CONFIG.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <ListChecks className="h-4 w-4" />
          Research Progress
        </CardTitle>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={() => fetchSession(true)}
          disabled={loading || refreshing}
        >
          {refreshing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <p className="text-sm text-destructive text-center py-4">{error}</p>
        ) : (
          <>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  {completedCount} of {totalCount} completed
                </span>
                <span className="text-xs font-semibold text-foreground">
                  {percentage}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            <div>
              {CHECKLIST_CONFIG.map((config) => (
                <ChecklistRow
                  key={config.key}
                  config={config}
                  session={session}
                  totalPapers={totalPapers}
                  totalVideos={totalVideos}
                />
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}