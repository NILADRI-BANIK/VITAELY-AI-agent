import { Suspense } from "react";
import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getCoverLetters } from "@/actions/cover-letter";
import CoverLetterHistory from "./_components/cover-letter-history";

export const metadata = {
  title: "AI Cover Letter | SENSAI",
};

async function CoverLetterDashboard() {
  const coverLetters = await getCoverLetters();

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cover Letters</h1>
          <p className="text-muted-foreground mt-1">
            Generate, manage, and download your AI-powered cover letters
          </p>
        </div>
        <Button asChild>
          <Link href="/ai-cover-letter/new">
            <Plus className="h-4 w-4 mr-2" />
            New Cover Letter
          </Link>
        </Button>
      </div>

      <Separator />

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <FileText className="h-4 w-4" />
        <span>
          {coverLetters.length}{" "}
          {coverLetters.length === 1 ? "cover letter" : "cover letters"} saved
        </span>
      </div>

      <CoverLetterHistory initialData={coverLetters} />
    </div>
  );
}

export default function AICoverLetterPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8 space-y-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 bg-muted rounded" />
            <div className="h-4 w-48 bg-muted rounded" />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <CoverLetterDashboard />
    </Suspense>
  );
}