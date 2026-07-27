"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Copy, Trash2, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteCoverLetter, duplicateCoverLetter } from "@/actions/cover-letter";
import CoverLetterDownload from "./cover-letter-download";

export default function CoverLetterActions({ coverLetter }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [duplicating, setDuplicating] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteCoverLetter(coverLetter.id);
      toast.success("Cover letter deleted");
    } catch {
      toast.error("Failed to delete cover letter");
    } finally {
      setDeleting(false);
    }
  };

  const handleDuplicate = async () => {
    setDuplicating(true);
    try {
      await duplicateCoverLetter(coverLetter.id);
      toast.success("Cover letter duplicated");
    } catch {
      toast.error("Failed to duplicate cover letter");
    } finally {
      setDuplicating(false);
    }
  };

  // normalise: DB stores `template`, but old records might surface as either
  const resolvedTemplate = coverLetter.template ?? coverLetter.selectedTemplate ?? "modern-professional";

  const coverLetterForDownload = {
    ...coverLetter,
    template: resolvedTemplate,
    selectedTemplate: resolvedTemplate,
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push(`/ai-cover-letter/${coverLetter.id}`)}
      >
        <Eye className="h-4 w-4 mr-1" />
        Open
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push(`/ai-cover-letter/edit/${coverLetter.id}`)}
      >
        <Pencil className="h-4 w-4 mr-1" />
        Edit
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleDuplicate}
        disabled={duplicating}
      >
        {duplicating ? (
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        ) : (
          <Copy className="h-4 w-4 mr-1" />
        )}
        {duplicating ? "Duplicating..." : "Duplicate"}
      </Button>

      <CoverLetterDownload coverLetter={coverLetterForDownload} />

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={deleting}
            className="text-destructive hover:text-destructive hover:border-destructive"
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-1" />
            )}
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Cover Letter?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>{coverLetter.title}</strong>. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}