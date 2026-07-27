import { notFound } from "next/navigation";
import { getCoverLetter } from "@/actions/cover-letter";
import CoverLetterEditor from "../../_components/cover-letter-editor";

export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const coverLetter = await getCoverLetter(id);
    return { title: `Edit: ${coverLetter.title} | SENSAI` };
  } catch {
    return { title: "Edit Cover Letter | SENSAI" };
  }
}

export default async function EditCoverLetterPage({ params }) {
  const { id } = await params;

  let coverLetter;
  try {
    coverLetter = await getCoverLetter(id);
  } catch {
    notFound();
  }

  // normalise before passing to client component
  const normalised = {
    ...coverLetter,
    template: coverLetter.template ?? "modern-professional",
    selectedTemplate: coverLetter.template ?? "modern-professional",
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <CoverLetterEditor coverLetter={normalised} />
    </div>
  );
}