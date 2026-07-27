import { getWorkspaceData } from "@/actions/research-hub/topic-workspace";
import YoutubeSection from "@/components/research-hub/workspace/youtube-section";

export default async function TopicVideosPage({ params }) {
  const { topicId } = await params;

  const result = await getWorkspaceData(topicId);

  if (!result.success) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm font-medium text-destructive">
          {result.error || "Failed to load videos"}
        </p>
      </div>
    );
  }

  const videos = result.data?.videos ?? [];

  return <YoutubeSection videos={videos} topicId={topicId} />;
}