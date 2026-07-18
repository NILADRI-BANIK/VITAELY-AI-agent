"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, RotateCcw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function TopicWorkspaceError({ error, reset }) {
  const router = useRouter();

  useEffect(() => {
    console.error("Topic Workspace error:", error);
  }, [error]);

  return (
    <Card className="border-destructive/30">
      <CardContent className="pt-10 pb-10 flex flex-col items-center text-center gap-4">
        <div className="p-3 rounded-full bg-destructive/10">
          <AlertTriangle className="w-6 h-6 text-destructive" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-base font-semibold text-foreground">
            Something went wrong loading this workspace
          </p>
          <p className="text-sm text-muted-foreground max-w-md">
            {error?.message ||
              "One of the research data sources failed to respond. You can try again or go back to Topic Recommender."}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Button onClick={() => reset()} size="sm">
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/research-hub/topic-recommender")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Topic Recommender
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}