"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ProjectIdeaCard from "@/components/project-generator/ProjectIdeaCard";
import GithubStructureGuide from "@/components/project-generator/GithubStructureGuide";
import {
  getProjectIdeaById,
  saveProjectIdea,
  unsaveProjectIdea,
  toggleFavoriteProject,
  deleteProjectIdea,
  trackProjectExport,
  getProjectRoadmapAction,
  getProjectERDiagramAction,
  getProjectReadmeAction,
  getInterviewQuestionsAction,
  getEnhancementsAction,
  getDeploymentSuggestionsAction,
  getDatabaseRecommendationAction,
  getAPIRecommendationsAction,
  getMentorResponseAction,
  getSavedProjects,
  getFavoriteProjects,
} from "@/actions/project-generator";

export default function ProjectDetailsPage() {
  const { projectId } = useParams();
  const router = useRouter();

  // ─── Project State ────────────────────────────────────────────────────────
  const [project, setProject] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  // ─── AI Section Data ──────────────────────────────────────────────────────
  const [roadmap, setRoadmap] = useState(null);
  const [erDiagram, setErDiagram] = useState(null);
  const [readme, setReadme] = useState(null);
  const [interviewQuestions, setInterviewQuestions] = useState(null);
  const [enhancements, setEnhancements] = useState(null);
  const [deploymentSuggestions, setDeploymentSuggestions] = useState(null);
  const [databaseRecommendation, setDatabaseRecommendation] = useState(null);
  const [apiRecommendations, setApiRecommendations] = useState(null);
  const [mentorChat, setMentorChat] = useState([]);

  // ─── Section Loading & Error ──────────────────────────────────────────────
  const [sectionLoading, setSectionLoading] = useState({});
  const [sectionErrors, setSectionErrors] = useState({});
  const sectionLoadingRef = useRef(sectionLoading);

  useEffect(() => {
    sectionLoadingRef.current = sectionLoading;
  }, [sectionLoading]);

  // ─── Save & Favourite State ───────────────────────────────────────────────
  const [isSaved, setIsSaved] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  // ─── loadProject ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!projectId) return;

    const loadProject = async () => {
      setPageLoading(true);
      setPageError(null);
      try {
        const [projectRes, savedRes, favRes] = await Promise.all([
          getProjectIdeaById(projectId),
          getSavedProjects(),
          getFavoriteProjects(),
        ]);

        if (!projectRes.success) throw new Error(projectRes.error);
        setProject(projectRes.data);

        if (savedRes.success) {
          setIsSaved(savedRes.data.some((p) => p.id === projectId));
        }
        if (favRes.success) {
          setIsFavorited(favRes.data.some((p) => p.id === projectId));
        }
      } catch (error) {
        setPageError(error.message || "Failed to load project");
      } finally {
        setPageLoading(false);
      }
    };

    loadProject();
  }, [projectId]);

  // ─── setSectionLoad ───────────────────────────────────────────────────────
  const setSectionLoad = useCallback((key, value) => {
    setSectionLoading((prev) => ({ ...prev, [key]: value }));
  }, []);

  // ─── setSectionErr ────────────────────────────────────────────────────────
  const setSectionErr = useCallback((key, value) => {
    setSectionErrors((prev) => ({ ...prev, [key]: value }));
  }, []);

  // ─── loadSection ─────────────────────────────────────────────────────────
  const loadSection = useCallback(
    async ({ loadingKey, errorKey, action, onSuccess }) => {
      if (sectionLoadingRef.current[loadingKey]) return;
      setSectionLoad(loadingKey, true);
      setSectionErr(errorKey, null);
      try {
        const result = await action(projectId);
        if (result.success) {
          onSuccess(result.data);
        } else {
          setSectionErr(errorKey, result.error || "Failed to load");
        }
      } catch {
        setSectionErr(errorKey, "Something went wrong");
      } finally {
        setSectionLoad(loadingKey, false);
      }
    },
    [projectId, setSectionLoad, setSectionErr],
  );

  // ─── handleSave ───────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    setSectionLoad("savingProject", true);
    setSectionErr("savingProject", null);
    try {
      const result = await saveProjectIdea(projectId);
      if (result.success) {
        setIsSaved(true);
      } else {
        setSectionErr("savingProject", result.error);
      }
    } catch {
      setSectionErr("savingProject", "Failed to save");
    } finally {
      setSectionLoad("savingProject", false);
    }
  }, [projectId, setSectionLoad, setSectionErr]);

  // ─── handleUnsave ─────────────────────────────────────────────────────────
  const handleUnsave = useCallback(async () => {
    setSectionLoad("savingProject", true);
    try {
      const result = await unsaveProjectIdea(projectId);
      if (result.success) setIsSaved(false);
    } catch {
      setSectionErr("savingProject", "Failed to unsave");
    } finally {
      setSectionLoad("savingProject", false);
    }
  }, [projectId, setSectionLoad, setSectionErr]);

  // ─── handleToggleFavorite ─────────────────────────────────────────────────
  const handleToggleFavorite = useCallback(async () => {
    try {
      const result = await toggleFavoriteProject(projectId);
      if (result.success) {
        setIsFavorited(result.favorited);
      } else {
        setSectionErr("favorite", result.error);
      }
    } catch {
      setSectionErr("favorite", "Failed to toggle favourite");
    }
  }, [projectId, setSectionErr]);

  // ─── handleDelete ─────────────────────────────────────────────────────────
  const handleDelete = useCallback(async () => {
    setSectionLoad("deletingProject", true);
    setSectionErr("deletingProject", null);
    try {
      const result = await deleteProjectIdea(projectId);
      if (result.success) {
        router.push("/project-ideas");
      } else {
        setSectionErr("deletingProject", result.error);
      }
    } catch {
      setSectionErr("deletingProject", "Failed to delete");
    } finally {
      setSectionLoad("deletingProject", false);
    }
  }, [projectId, router, setSectionLoad, setSectionErr]);

  // ─── handleExport ─────────────────────────────────────────────────────────
  const handleExport = useCallback(async () => {
    setSectionLoad("exportingProject", true);
    try {
      await trackProjectExport(projectId, "pdf");
    } catch {
      setSectionErr("exportingProject", "Export failed");
    } finally {
      setSectionLoad("exportingProject", false);
    }
  }, [projectId, setSectionLoad, setSectionErr]);

  // ─── handleLoadRoadmap ────────────────────────────────────────────────────
  const handleLoadRoadmap = useCallback(
    () =>
      loadSection({
        loadingKey: "loadingRoadmap",
        errorKey: "loadingRoadmap",
        action: getProjectRoadmapAction,
        onSuccess: setRoadmap,
      }),
    [loadSection],
  );

  // ─── handleLoadERDiagram ──────────────────────────────────────────────────
  const handleLoadERDiagram = useCallback(
    () =>
      loadSection({
        loadingKey: "loadingERDiagram",
        errorKey: "loadingERDiagram",
        action: getProjectERDiagramAction,
        onSuccess: setErDiagram,
      }),
    [loadSection],
  );

  // ─── handleLoadReadme ─────────────────────────────────────────────────────
  const handleLoadReadme = useCallback(
    () =>
      loadSection({
        loadingKey: "loadingReadme",
        errorKey: "loadingReadme",
        action: getProjectReadmeAction,
        onSuccess: setReadme,
      }),
    [loadSection],
  );

  // ─── handleLoadInterviewQuestions ─────────────────────────────────────────
  const handleLoadInterviewQuestions = useCallback(
    () =>
      loadSection({
        loadingKey: "loadingInterviewQuestions",
        errorKey: "loadingInterviewQuestions",
        action: getInterviewQuestionsAction,
        onSuccess: setInterviewQuestions,
      }),
    [loadSection],
  );

  // ─── handleLoadEnhancements ───────────────────────────────────────────────
  const handleLoadEnhancements = useCallback(
    () =>
      loadSection({
        loadingKey: "loadingEnhancements",
        errorKey: "loadingEnhancements",
        action: getEnhancementsAction,
        onSuccess: setEnhancements,
      }),
    [loadSection],
  );

  // ─── handleLoadDeployment ─────────────────────────────────────────────────
  const handleLoadDeployment = useCallback(
    () =>
      loadSection({
        loadingKey: "loadingDeployment",
        errorKey: "loadingDeployment",
        action: getDeploymentSuggestionsAction,
        onSuccess: setDeploymentSuggestions,
      }),
    [loadSection],
  );

  // ─── handleLoadDatabase ───────────────────────────────────────────────────
  const handleLoadDatabase = useCallback(
    () =>
      loadSection({
        loadingKey: "loadingDatabase",
        errorKey: "loadingDatabase",
        action: getDatabaseRecommendationAction,
        onSuccess: setDatabaseRecommendation,
      }),
    [loadSection],
  );

  // ─── handleLoadAPIs ───────────────────────────────────────────────────────
  const handleLoadAPIs = useCallback(
    () =>
      loadSection({
        loadingKey: "loadingAPIs",
        errorKey: "loadingAPIs",
        action: getAPIRecommendationsAction,
        onSuccess: setApiRecommendations,
      }),
    [loadSection],
  );

  // ─── handleSendMentorMessage ──────────────────────────────────────────────
  const handleSendMentorMessage = useCallback(
    async (_, message) => {
      if (sectionLoadingRef.current.loadingMentor) return;

      const currentChat = mentorChat.slice(-20);
      const userMsg = { role: "user", content: message };

      setMentorChat((prev) => [...prev, userMsg]);
      setSectionLoad("loadingMentor", true);
      setSectionErr("loadingMentor", null);

      try {
        const result = await getMentorResponseAction({
          projectIdeaId: projectId,
          conversationHistory: currentChat,
          userMessage: message,
        });
        if (result.success) {
          setMentorChat((prev) => [
            ...prev,
            { role: "assistant", content: result.data },
          ]);
        } else {
          setSectionErr("loadingMentor", result.error || "No response");
        }
      } catch {
        setSectionErr("loadingMentor", "Failed to get mentor response");
      } finally {
        setSectionLoad("loadingMentor", false);
      }
    },
    [mentorChat, projectId, setSectionLoad, setSectionErr],
  );

  // ─── Page Loading State ───────────────────────────────────────────────────
  if (pageLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-24 rounded-md" />
        <div className="border rounded-xl p-6 space-y-4 bg-card">
          <div className="space-y-2">
            <Skeleton className="h-6 w-3/4 rounded-md" />
            <Skeleton className="h-4 w-1/2 rounded" />
          </div>
          <div className="grid grid-cols-3 gap-4 p-3 bg-muted/30 rounded-lg">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-16 rounded" />
                  <Skeleton className="h-3 w-8 rounded" />
                </div>
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-md" />
            ))}
          </div>
          <div className="space-y-2 pt-2">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-5/6 rounded" />
            <Skeleton className="h-4 w-4/6 rounded" />
          </div>
        </div>
      </div>
    );
  }

  // ─── Page Error State ─────────────────────────────────────────────────────
  if (pageError) {
    return (
      <div className="max-w-4xl mx-auto text-center space-y-4 py-20">
        <p className="text-destructive text-sm">{pageError}</p>
        <Button
          variant="outline"
          onClick={() => router.push("/project-ideas")}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Button>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ── Back Button ── */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="gap-2 text-muted-foreground hover:text-foreground -ml-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      {/* ── Full Project Card ── */}
      <ProjectIdeaCard
        project={project}
        projectIndex={0}
        roadmap={roadmap}
        erDiagram={erDiagram}
        readme={readme}
        interviewQuestions={interviewQuestions}
        enhancements={enhancements}
        deploymentSuggestions={deploymentSuggestions}
        databaseRecommendation={databaseRecommendation}
        apiRecommendations={apiRecommendations}
        mentorChat={mentorChat}
        loading={sectionLoading}
        errors={sectionErrors}
        isSaved={isSaved}
        isFavorited={isFavorited}
        onSave={handleSave}
        onUnsave={handleUnsave}
        onToggleFavorite={handleToggleFavorite}
        onDelete={handleDelete}
        onExport={handleExport}
        onLoadRoadmap={handleLoadRoadmap}
        onLoadERDiagram={handleLoadERDiagram}
        onLoadReadme={handleLoadReadme}
        onLoadInterviewQuestions={handleLoadInterviewQuestions}
        onLoadEnhancements={handleLoadEnhancements}
        onLoadDeployment={handleLoadDeployment}
        onLoadDatabase={handleLoadDatabase}
        onLoadAPIs={handleLoadAPIs}
        onSendMentorMessage={handleSendMentorMessage}
      />

      {/* ── GitHub Structure Guide ── */}
      <GithubStructureGuide project={project} />
    </div>
  );
}