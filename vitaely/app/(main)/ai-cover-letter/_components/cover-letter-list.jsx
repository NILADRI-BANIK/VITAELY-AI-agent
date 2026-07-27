"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  FileText,
  Pencil,
  Copy,
  Trash2,
  Download,
  Eye,
  Plus,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

export default function CoverLetterList({ coverLetters = [] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState(null);
  const [loadingAction, setLoadingAction] = useState(null);

  const handleDelete = (id) => {
    setLoadingId(id);
    setLoadingAction("delete");
    startTransition(async () => {
      try {
        await deleteCoverLetter(id);
        toast.success("Cover letter deleted");
      } catch {
        toast.error("Failed to delete cover letter");
      } finally {
        setLoadingId(null);
        setLoadingAction(null);
      }
    });
  };

  const handleDuplicate = (id) => {
    setLoadingId(id);
    setLoadingAction("duplicate");
    startTransition(async () => {
      try {
        await duplicateCoverLetter(id);
        toast.success("Cover letter duplicated");
      } catch {
        toast.error("Failed to duplicate cover letter");
      } finally {
        setLoadingId(null);
        setLoadingAction(null);
      }
    });
  };

  if (coverLetters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <div className="p-4 rounded-2xl bg-muted/60">
          <FileText className="h-10 w-10 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="text-lg font-semibold">No cover letters yet</p>
          <p className="text-sm text-muted-foreground">
            Generate your first AI-powered cover letter to get started
          </p>
        </div>
        <Button onClick={() => router.push("/ai-cover-letter/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Create Cover Letter
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {coverLetters.map((cl) => {
        const isThisLoading = loadingId === cl.id;

        return (
          <Card key={cl.id} className="flex flex-col group">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base leading-snug line-clamp-2 flex-1">
                  {cl.title}
                </CardTitle>
                <Badge variant="secondary" className="text-xs shrink-0 capitalize">
                  {cl.selectedTemplate.replace(/-/g, " ")}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="flex-1 pb-2">
              <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                {cl.content}
              </p>
            </CardContent>

            <CardFooter className="flex flex-col items-start gap-3 pt-3 border-t">
              <p className="text-xs text-muted-foreground">
                Updated{" "}
                {formatDistanceToNow(new Date(cl.updatedAt), {
                  addSuffix: true,
                })}
              </p>

              <div className="flex flex-wrap gap-2 w-full">
                {/* Open */}
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 min-w-[72px]"
                  onClick={() => router.push(`/ai-cover-letter/${cl.id}`)}
                >
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  Open
                </Button>

                {/* Edit */}
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 min-w-[72px]"
                  onClick={() => router.push(`/ai-cover-letter/edit/${cl.id}`)}
                >
                  <Pencil className="h-3.5 w-3.5 mr-1" />
                  Edit
                </Button>

                {/* Duplicate */}
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 min-w-[72px]"
                  disabled={isThisLoading && loadingAction === "duplicate"}
                  onClick={() => handleDuplicate(cl.id)}
                >
                  {isThisLoading && loadingAction === "duplicate" ? (
                    <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 mr-1" />
                  )}
                  Copy
                </Button>

                {/* Download */}
                <CoverLetterDownload coverLetter={cl} />

                {/* Delete */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 min-w-[72px] text-destructive hover:text-destructive hover:border-destructive"
                      disabled={isThisLoading && loadingAction === "delete"}
                    >
                      {isThisLoading && loadingAction === "delete" ? (
                        <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                      )}
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Cover Letter?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete{" "}
                        <strong>{cl.title}</strong>. This action cannot be
                        undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(cl.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}