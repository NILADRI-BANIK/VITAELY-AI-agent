import { getWorkspaceData } from "@/actions/research-hub/topic-workspace";
import PaperSection from "@/components/research-hub/workspace/paper-section";

export default async function TopicPapersPage({ params }) {
  const { topicId } = await params;

  const result = await getWorkspaceData(topicId);

  if (!result.success) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm font-medium text-destructive">
          {result.error || "Failed to load papers"}
        </p>
      </div>
    );
  }

  const papers = result.data?.papers?.papers ?? [];

  return <PaperSection papers={papers} topicId={topicId} />;
}