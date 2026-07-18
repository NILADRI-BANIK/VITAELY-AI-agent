"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProjectDetailsError({ error, reset }) {
  const router = useRouter();

  // ─── logError ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("ProjectDetails Error:", error);
    }
  }, [error]);

  return (
    <div className="max-w-4xl mx-auto">

      {/* ── Back Button ── */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/project-ideas")}
        className="gap-2 text-muted-foreground hover:text-foreground -ml-2 mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Projects
      </Button>

      {/* ── Error Card ── */}
      <div className="border rounded-xl p-12 text-center space-y-6 bg-card">

        {/* ── Icon ── */}
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-destructive/10 border border-destructive/20">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>
        </div>

        {/* ── Heading ── */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight">
            Failed to Load Project
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            The project could not be loaded. It may have been deleted or there
            was a temporary issue.
          </p>
        </div>

        {/* ── Error Message ── */}
        {error?.message && (
          <div className="bg-destructive/5 border border-destructive/20 rounded-lg px-4 py-3 max-w-sm mx-auto text-left">
            <p className="text-xs text-destructive font-mono break-words">
              {error.message}
            </p>
          </div>
        )}

        {/* ── Actions ── */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/project-ideas")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Button>
        </div>

      </div>
    </div>
  );
}