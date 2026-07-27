import { getWorkspaceData } from "@/actions/research-hub/topic-workspace";
import DatasetsSection from "@/components/research-hub/workspace/datasets-section";

export default async function TopicDatasetsPage({ params }) {
  const { topicId } = await params;

  const result = await getWorkspaceData(topicId);

  if (!result.success) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm font-medium text-destructive">
          {result.error || "Failed to load datasets"}
        </p>
      </div>
    );
  }

  const datasets = result.data?.datasets ?? [];

  return <DatasetsSection datasets={datasets} />;
}