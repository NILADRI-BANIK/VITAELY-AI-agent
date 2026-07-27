"use client";

import { useRouter } from "next/navigation";
import {
  Search,
  FlaskConical,
  BookMarked,
  Map,
  ArrowRight,
  Check,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { markActivityDone } from "@/actions/research-hub/topic-workspace";

const SHORTCUTS = [
  {
    key: "gapAnalysisDone",
    icon: Search,
    label: "Analyze Research Gaps",
    description: "Find open problems and under-explored areas in this topic.",
    color: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    buildHref: (topicName, topicId) =>
      `/research-hub/topic-recommender/${topicId}/gaps`,
  },
  {
    key: "methodologyDone",
    icon: FlaskConical,
    label: "Generate Methodology",
    description: "Build a rigorous research methodology for this topic.",
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    buildHref: (topicName, topicId) =>
      `/research-hub/methodology-builder?topic=${encodeURIComponent(topicName)}&topicId=${topicId}`,
  },
  {
    key: null,
    icon: BookMarked,
    label: "Generate Literature Review",
    description: "Produce a structured review of existing work on this topic.",
    color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    buildHref: (topicName, topicId) =>
      `/research-hub/literature-review?topic=${encodeURIComponent(topicName)}&topicId=${topicId}`,
  },
  {
    key: "roadmapDone",
    icon: Map,
    label: "Generate Research Roadmap",
    description: "Create a phased roadmap with milestones for this topic.",
    color: "bg-red-500/10 text-red-600 border-red-500/20",
    buildHref: (topicName, topicId) =>
      `/research-hub/roadmap-generator?topic=${encodeURIComponent(topicName)}&topicId=${topicId}`,
  },
];

function ShortcutCard({ shortcut, topicName, topicId, done, onNavigate }) {
  const Icon = shortcut.icon;
  const href = shortcut.buildHref(topicName, topicId);

  function handleClick() {
    onNavigate?.(shortcut, href);
  }

  return (
    <Card className="w-full border border-border hover:border-primary/40 transition-colors h-full">
      <CardContent className="pt-5 flex flex-col gap-2.5">
        <div className="flex items-start justify-between gap-2">
          <span
            className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border ${shortcut.color}`}
          >
            <Icon className="w-4 h-4" />
          </span>
          {done && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border bg-green-500/10 text-green-600 border-green-500/20">
              <Check className="w-3 h-3" />
              Done
            </span>
          )}
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground">
            {shortcut.label}
          </p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {shortcut.description}
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          className="w-full mt-1"
          onClick={handleClick}
        >
          Get Started
          <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
        </Button>
      </CardContent>
    </Card>
  );
}

export default function ShortcutsSection({
  topic,
  topicId,
  session = null,
}) {
  const router = useRouter();

  const topicName = topic?.topicName ?? topic?.topic ?? topic?.title ?? "";

  async function handleNavigate(shortcut, href) {
    if (shortcut.key && topicId) {
      markActivityDone(topicId, shortcut.key).catch(() => {});
    }
    router.push(href);
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Continue your research journey with this topic pre-filled.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SHORTCUTS.map((shortcut) => (
          <ShortcutCard
            key={shortcut.label}
            shortcut={shortcut}
            topicName={topicName}
            topicId={topicId}
            done={shortcut.key ? !!session?.[shortcut.key] : false}
            onNavigate={handleNavigate}
          />
        ))}
      </div>
    </div>
  );
}