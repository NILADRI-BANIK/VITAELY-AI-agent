"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function ProjectIdeasError({ error, reset }) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("ProjectIdeas Error:", error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-destructive/10 border border-destructive/20">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Something went wrong
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            An error occurred while loading the AI Project Idea Generator. This
            might be a temporary issue.
          </p>
        </div>

        {/* Error Message */}
        {error?.message && (
          <div className="bg-destructive/5 border border-destructive/20 rounded-lg px-4 py-3 text-left">
            <p className="text-xs text-destructive font-mono break-words">
              {error.message}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} className="gap-2" variant="default">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>

          <Link href="/dashboard">
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              <Home className="w-4 h-4" />
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
