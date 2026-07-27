import { notFound } from "next/navigation";
import { getCoverLetter } from "@/actions/cover-letter";
import CoverLetterPreview from "../_components/cover-letter-preview";
import CoverLetterActions from "../_components/cover-letter-actions";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";

export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const coverLetter = await getCoverLetter(id);
    return { title: `${coverLetter.title} | SENSAI` };
  } catch {
    return { title: "Cover Letter | SENSAI" };
  }
}

export default async function CoverLetterViewPage({ params }) {
  const { id } = await params;

  let coverLetter;
  try {
    coverLetter = await getCoverLetter(id);
  } catch {
    notFound();
  }

  const formData =
    typeof coverLetter.formData === "object" && coverLetter.formData !== null
      ? coverLetter.formData
      : {};

  // always read from DB field `template`
  const resolvedTemplate = coverLetter.template ?? "modern-professional";

  const letterForPreview = {
    id: coverLetter.id,
    content: coverLetter.content,
    template: resolvedTemplate,
    selectedTemplate: resolvedTemplate,
    createdAt: coverLetter.createdAt,
    companyName: formData.companyName ?? "",
    position: formData.jobTitle ?? "",
    // map saved applicant fields (yourName/yourEmail/yourPhone) to the
    // sender* props every template component expects
    senderName: formData.yourName ?? "",
    senderEmail: formData.yourEmail ?? "",
    senderPhone: formData.yourPhone ?? "",
  };

  const templateLabel = resolvedTemplate.replace(/-/g, " ");

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {coverLetter.title}
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="capitalize">
              {templateLabel}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Updated{" "}
              {formatDistanceToNow(new Date(coverLetter.updatedAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>
        <CoverLetterActions coverLetter={coverLetter} />
      </div>

      <Separator />

      <div className="flex justify-center">
        <div className="w-full max-w-4xl overflow-x-auto">
          <CoverLetterPreview
            letter={letterForPreview}
            scale={1}
            className="mx-auto shadow-lg"
          />
        </div>
      </div>
    </div>
  );
}