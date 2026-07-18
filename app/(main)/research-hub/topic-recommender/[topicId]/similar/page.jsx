import { getWorkspaceData } from "@/actions/research-hub/topic-workspace";
import SimilarTopicsSection from "@/components/research-hub/workspace/similar-topics-section";

export default async function TopicSimilarPage({ params }) {
  const { topicId } = await params;

  const result = await getWorkspaceData(topicId);

  if (!result.success) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm font-medium text-destructive">
          {result.error || "Failed to load similar topics"}
        </p>
      </div>
    );
  }

  const topics = result.data?.similarTopics ?? [];

  return <SimilarTopicsSection topics={topics} />;
}