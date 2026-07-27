import { getWorkspaceData } from "@/actions/research-hub/topic-workspace";
import StatsSection from "@/components/research-hub/workspace/stats-section";
import TimelineSection from "@/components/research-hub/workspace/timeline-section";

export default async function TopicStatsPage({ params }) {
  const { topicId } = await params;

  const result = await getWorkspaceData(topicId);

  if (!result.success) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm font-medium text-destructive">
          {result.error || "Failed to load statistics"}
        </p>
      </div>
    );
  }

  const stats = result.data?.stats ?? {};
  const topic = result.data?.topic ?? null;
  const timeline = result.data?.timeline ?? [];

  return (
    <div className="flex flex-col gap-6">
      <StatsSection stats={stats} topic={topic} />
      <TimelineSection timeline={timeline} />
    </div>
  );
}