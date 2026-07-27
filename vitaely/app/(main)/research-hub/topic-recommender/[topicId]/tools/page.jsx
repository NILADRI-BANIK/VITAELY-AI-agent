import { getWorkspaceData } from "@/actions/research-hub/topic-workspace";
import ToolsSection from "@/components/research-hub/workspace/tools-section";

export default async function TopicToolsPage({ params }) {
  const { topicId } = await params;

  const result = await getWorkspaceData(topicId);

  if (!result.success) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm font-medium text-destructive">
          {result.error || "Failed to load tools"}
        </p>
      </div>
    );
  }

  const topic = result.data?.topic ?? null;

  return <ToolsSection topic={topic} />;
}