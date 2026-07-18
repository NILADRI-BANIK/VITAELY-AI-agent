import { notFound } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Lightbulb,
  TrendingUp,
  Sparkles,
  Gauge,
} from "lucide-react";
import { getSavedTopicById } from "@/actions/research-hub/topic-workspace";
import { ResearchTopicProvider } from "@/contexts/research-topic-context";
import WorkspaceTabNav from "@/components/research-hub/workspace/workspace-tab-nav";

export async function generateMetadata({ params }) {
  const { topicId } = await params;

  try {
    const result = await getSavedTopicById(topicId);
    return {
      title: result.success ? result.data.topicName : "Research Workspace",
    };
  } catch {
    return { title: "Research Workspace" };
  }
}

function ScoreBadge({ icon: Icon, label, value }) {
  if (value == null) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border bg-muted text-muted-foreground border-border">
      <Icon className="w-3 h-3" />
      {label} {value}
    </span>
  );
}

export default async function TopicWorkspaceLayout({ children, params }) {
  const { topicId } = await params;

  let result;
  try {
    result = await getSavedTopicById(topicId);
  } catch {
    notFound();
  }

  if (!result.success || !result.data) {
    notFound();
  }

  const topic = result.data;
  const topicName = topic.topicName ?? "Untitled Topic";

  return (
    <ResearchTopicProvider initialTopic={topic}>
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6 flex-wrap">
          <Link href="/research-hub" className="hover:text-foreground transition-colors">
            Research Hub
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link
            href="/research-hub/topic-recommender"
            className="hover:text-foreground transition-colors"
          >
            Topic Recommender
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-medium truncate max-w-[240px]">
            {topicName}
          </span>
        </nav>

        <div className="mb-6 flex items-start gap-3">
          <div className="p-3 rounded-2xl bg-yellow-500/10 shrink-0">
            <Lightbulb className="w-6 h-6 text-yellow-500" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold truncate">
              {topicName}
            </h1>
            {topic.rationale && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {topic.rationale}
              </p>
            )}
            <div className="flex items-center gap-1.5 flex-wrap mt-2">
              <ScoreBadge icon={TrendingUp} label="Trend" value={topic.trendScore} />
              <ScoreBadge icon={Sparkles} label="Novelty" value={topic.noveltyScore} />
              <ScoreBadge icon={Gauge} label="Feasibility" value={topic.feasibilityScore} />
              {topic.paperCount != null && (
                <span className="text-xs text-muted-foreground">
                  {topic.paperCount.toLocaleString()} papers
                </span>
              )}
            </div>
          </div>
        </div>

        <WorkspaceTabNav topicId={topicId} />

        <div className="mt-6">
          <Suspense fallback={<div className="text-sm text-muted-foreground py-10 text-center">Loading...</div>}>
            {children}
          </Suspense>
        </div>
      </div>
    </ResearchTopicProvider>
  );
}