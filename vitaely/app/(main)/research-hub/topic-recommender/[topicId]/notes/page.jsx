import NotesSection from "@/components/research-hub/workspace/notes-section";

export default async function TopicNotesPage({ params }) {
  const { topicId } = await params;

  return <NotesSection topicId={topicId} />;
}