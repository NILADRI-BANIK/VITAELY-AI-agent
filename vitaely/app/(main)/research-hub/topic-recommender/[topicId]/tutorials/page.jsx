import { getWorkspaceData } from "@/actions/research-hub/topic-workspace";
import TutorialsSection from "@/components/research-hub/workspace/tutorials-section";

export default async function TopicTutorialsPage({ params }) {
  const { topicId } = await params;

  const result = await getWorkspaceData(topicId);

  if (!result.success) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm font-medium text-destructive">
          {result.error || "Failed to load tutorials"}
        </p>
      </div>
    );
  }

  const topic = result.data?.topic ?? null;

  return <TutorialsSection topic={topic} />;
}