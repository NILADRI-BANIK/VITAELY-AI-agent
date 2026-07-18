"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  PlusCircle,
  FileText,
  Trash2,
  Edit,
  Copy,
  Download,
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
import { deleteResume, duplicateResume, getResumeById } from "@/actions/resume";
import ResumeBuilder from "./resume-builder";

export default function ResumeList({ initialResumes }) {
  const router = useRouter();

  // ← view: "list" shows resume cards, "builder" shows resume builder
  const [view, setView] = useState("list");
  const [resumes, setResumes] = useState(initialResumes || []);
  const [selectedResume, setSelectedResume] = useState(null);
  const [isLoadingResume, setIsLoadingResume] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [duplicatingId, setDuplicatingId] = useState(null);

  // ← open blank builder for new resume
  const handleNewResume = () => {
    setSelectedResume(null);
    setView("builder");
  };

  // ← load resume data and open builder
  const handleEditResume = async (resumeId) => {
    setIsLoadingResume(true);
    try {
      const resume = await getResumeById(resumeId);
      setSelectedResume(resume);
      setView("builder");
    } catch (error) {
      toast.error("Failed to load resume");
    } finally {
      setIsLoadingResume(false);
    }
  };

  // ← delete resume and refresh list
  const handleDeleteResume = async (resumeId) => {
    setDeletingId(resumeId);
    try {
      await deleteResume(resumeId);
      setResumes((prev) => prev.filter((r) => r.id !== resumeId));
      toast.success("Resume deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete resume");
    } finally {
      setDeletingId(null);
    }
  };

  // ← duplicate resume and refresh list
  const handleDuplicateResume = async (resumeId) => {
    setDuplicatingId(resumeId);
    try {
      const copy = await duplicateResume(resumeId);
      setResumes((prev) => [
        {
          id: copy.id,
          title: copy.title,
          selectedTemplate: copy.selectedTemplate,
          profileImage: copy.profileImage,
          atsScore: copy.atsScore,
          createdAt: copy.createdAt,
          updatedAt: copy.updatedAt,
        },
        ...prev,
      ]);
      toast.success("Resume duplicated successfully!");
    } catch (error) {
      toast.error("Failed to duplicate resume");
    } finally {
      setDuplicatingId(null);
    }
  };

  // ← go back to list from builder
  const handleBack = () => {
    setView("list");
    setSelectedResume(null);
    router.refresh(); // ← refresh to get updated list from server
  };

  // ← show builder view
  if (view === "builder") {
    return (
      <ResumeBuilder
        initialContent={selectedResume?.content || null}
        initialImage={selectedResume?.profileImage || null}
        initialTemplate={selectedResume?.selectedTemplate || "classic"}
        initialFormData={selectedResume?.formData || null}
        initialTitle={selectedResume?.title || "Untitled Resume"}
        resumeId={selectedResume?.id || null}
        onBack={handleBack}
      />
    );
  }

  // ← show list view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-bold gradient-title text-5xl md:text-6xl">
            My Resumes
          </h1>
          <p className="text-muted-foreground mt-1">
            {resumes.length} resume{resumes.length !== 1 ? "s" : ""} saved
          </p>
        </div>
        <Button onClick={handleNewResume} className="shrink-0">
          <PlusCircle className="h-4 w-4 mr-2" />
          New Resume
        </Button>
      </div>

      {/* Empty state */}
      {resumes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-lg text-center space-y-4">
          <FileText className="h-16 w-16 text-muted-foreground" />
          <div>
            <h3 className="text-lg font-medium">No resumes yet</h3>
            <p className="text-muted-foreground text-sm mt-1">
              Create your first resume to get started
            </p>
          </div>
          <Button onClick={handleNewResume}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Resume
          </Button>
        </div>
      )}

      {/* Resume Cards Grid */}
      {resumes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resumes.map((resume) => (
            <Card
              key={resume.id}
              className="flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Profile image thumbnail */}
                    {resume.profileImage ? (
                      <img
                        src={resume.profileImage}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover border border-border shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <CardTitle className="text-sm font-medium truncate">
                        {resume.title || "Untitled Resume"}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground capitalize mt-0.5">
                        {resume.selectedTemplate} template
                      </p>
                    </div>
                  </div>

                  {/* ATS Score badge */}
                  {resume.atsScore && (
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                        resume.atsScore >= 80
                          ? "bg-green-100 text-green-700"
                          : resume.atsScore >= 60
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      ATS {resume.atsScore}%
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pb-2">
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>
                    Created:{" "}
                    {format(new Date(resume.createdAt), "MMM dd, yyyy")}
                  </p>
                  <p>
                    Updated:{" "}
                    {format(new Date(resume.updatedAt), "MMM dd, yyyy · hh:mm a")}
                  </p>
                </div>
              </CardContent>

              <CardFooter className="flex gap-2 pt-2 flex-wrap">
                {/* Edit button */}
                <Button
                  size="sm"
                  variant="default"
                  className="flex-1"
                  onClick={() => handleEditResume(resume.id)}
                  disabled={isLoadingResume}
                >
                  {isLoadingResume ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </>
                  )}
                </Button>

                {/* Duplicate button */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDuplicateResume(resume.id)}
                  disabled={duplicatingId === resume.id}
                >
                  {duplicatingId === resume.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>

                {/* Delete button with confirmation */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={deletingId === resume.id}
                    >
                      {deletingId === resume.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Resume?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete{" "}
                        <span className="font-medium">
                          {resume.title || "this resume"}
                        </span>
                        ? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteResume(resume.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}