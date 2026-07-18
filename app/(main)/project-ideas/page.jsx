"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Sparkles, Search, TrendingUp, Zap } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ProjectGeneratorForm from "@/components/project-generator/ProjectGeneratorForm";
import ProjectIdeaCard from "@/components/project-generator/ProjectIdeaCard";
import TrendingProjects from "@/components/project-generator/TrendingProjects";
import ProjectSearch from "@/components/project-generator/ProjectSearch";
import GithubStructureGuide from "@/components/project-generator/GithubStructureGuide";
import {
  generateAndSaveProjectIdeas,
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

export default function ProjectIdeasPage() {
  // ─── Form State ───────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    skills: "",
    experienceLevel: "",
    domain: "",
    complexity: "",
    category: "",
    projectCount: 3,
  });

  // ─── Generated Projects ───────────────────────────────────────────────────────
  const [projects, setProjects] = useState([]);

  // ─── Per-Project AI Section Data ──────────────────────────────────────────────
  const [roadmaps, setRoadmaps] = useState({});
  const [erDiagrams, setErDiagrams] = useState({});
  const [readmes, setReadmes] = useState({});
  const [interviewQs, setInterviewQs] = useState({});
  const [enhancements, setEnhancements] = useState({});
  const [deployments, setDeployments] = useState({});
  const [databases, setDatabases] = useState({});
  const [apis, setApis] = useState({});
  const [mentorChats, setMentorChats] = useState({});

  // ─── Global Loading & Error ───────────────────────────────────────────────────
  const [loading, setLoading] = useState({ generating: false });
  const [errors, setErrors] = useState({});

  // ─── Per-Project Loading & Error ──────────────────────────────────────────────
  const [projectLoading, setProjectLoading] = useState({});
  const [projectErrors, setProjectErrors] = useState({});

  const projectLoadingRef = useRef(projectLoading);

useEffect(() => {
  projectLoadingRef.current = projectLoading;
}, [projectLoading]);

  // ─── Save & Favourite State ───────────────────────────────────────────────────
  const [savedIds, setSavedIds] = useState(new Set());
  const [favoritedIds, setFavoritedIds] = useState(new Set());

  // ─── GitHub Structure Guide Target ────────────────────────────────────────────
  const [guideProject, setGuideProject] = useState(null);

  // ─── Active Tab ───────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("generate");

  useEffect(() => {
    getSavedProjects().then((res) => {
      if (res.success) setSavedIds(new Set(res.data.map((p) => p.id)));
    });
    getFavoriteProjects().then((res) => {
      if (res.success) setFavoritedIds(new Set(res.data.map((p) => p.id)));
    });
  }, []);

  // ─── setProjectLoad ───────────────────────────────────────────────────────────
  const setProjectLoad = useCallback((projectId, key, value) => {
    setProjectLoading((prev) => ({
      ...prev,
      [projectId]: { ...(prev[projectId] || {}), [key]: value },
    }));
  }, []);

  // ─── setProjectErr ────────────────────────────────────────────────────────────
  const setProjectErr = useCallback((projectId, key, value) => {
    setProjectErrors((prev) => ({
      ...prev,
      [projectId]: { ...(prev[projectId] || {}), [key]: value },
    }));
  }, []);

  // ─── loadProjectSection ───────────────────────────────────────────────────────
  // FIX (Bug 2): The original code listed only [setProjectLoad, setProjectErr]
  // in the dependency array while also reading `projectLoading` inside the
  // callback body. That created a stale closure: the loading guard
  //   `if (projectLoading[projectId]?.[loadingKey]) return;`
  // always saw the snapshot from the first render (all false), so clicking a
  // section button twice before the first response came back would fire two
  // parallel API requests.
  //
  // Fix: read the always-current value via projectLoadingRef instead of
  // capturing a potentially stale copy from the closure.
  const loadProjectSection = useCallback(
    async ({ projectId, loadingKey, errorKey, action, onSuccess }) => {
      // Guard against duplicate concurrent requests using the ref (always fresh)
      if (projectLoadingRef.current[projectId]?.[loadingKey]) return;

      setProjectLoad(projectId, loadingKey, true);
      setProjectErr(projectId, errorKey, null);
      try {
        const result = await action(projectId);
        if (result.success) {
          onSuccess(result.data);
        } else {
          setProjectErr(projectId, errorKey, result.error || "Failed to load");
        }
      } catch {
        setProjectErr(projectId, errorKey, "Something went wrong");
      } finally {
        setProjectLoad(projectId, loadingKey, false);
      }
    },
    [setProjectLoad, setProjectErr], // stable — ref keeps loading state current
  );

  // ─── updateFormData ───────────────────────────────────────────────────────────
  const updateFormData = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // ─── resetForm ────────────────────────────────────────────────────────────────
  const resetForm = useCallback(() => {
    setFormData({
      skills: "",
      experienceLevel: "",
      domain: "",
      complexity: "",
      category: "",
      projectCount: 3,
    });
  }, []);

  // ─── generateProjects ─────────────────────────────────────────────────────────
  const generateProjects = useCallback(async () => {
    setLoading((prev) => ({ ...prev, generating: true }));
    setErrors((prev) => ({ ...prev, generating: null }));
    try {
      const result = await generateAndSaveProjectIdeas(formData);
      if (result.success) {
        const newProjects = result.data || [];
        setProjects(newProjects);
        setRoadmaps({});
        setErDiagrams({});
        setReadmes({});
        setInterviewQs({});
        setEnhancements({});
        setDeployments({});
        setDatabases({});
        setApis({});
        setMentorChats({});
        setProjectLoading({});
        setProjectErrors({});
        setGuideProject(newProjects[0] || null);
      } else {
        setErrors((prev) => ({
          ...prev,
          generating: result.error || "Generation failed",
        }));
      }
    } catch {
      setErrors((prev) => ({
        ...prev,
        generating: "Failed to generate. Please try again.",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, generating: false }));
    }
  }, [formData]);

  // ─── handleSave ───────────────────────────────────────────────────────────────
  const handleSave = useCallback(
    async (projectId) => {
      setProjectLoad(projectId, "savingProject", true);
      setProjectErr(projectId, "savingProject", null);
      try {
        const result = await saveProjectIdea(projectId);
        if (result.success) {
          setSavedIds((prev) => new Set([...prev, projectId]));
        } else {
          setProjectErr(projectId, "savingProject", result.error);
        }
      } catch {
        setProjectErr(projectId, "savingProject", "Failed to save");
      } finally {
        setProjectLoad(projectId, "savingProject", false);
      }
    },
    [setProjectLoad, setProjectErr],
  );

  // ─── handleUnsave ─────────────────────────────────────────────────────────────
  const handleUnsave = useCallback(
    async (projectId) => {
      setProjectLoad(projectId, "savingProject", true);
      try {
        const result = await unsaveProjectIdea(projectId);
        if (result.success) {
          setSavedIds((prev) => {
            const next = new Set(prev);
            next.delete(projectId);
            return next;
          });
        }
      } catch {
        setProjectErr(projectId, "savingProject", "Failed to unsave");
      } finally {
        setProjectLoad(projectId, "savingProject", false);
      }
    },
    [setProjectLoad, setProjectErr],
  );

  // ─── handleToggleFavorite ─────────────────────────────────────────────────────
  const handleToggleFavorite = useCallback(
    async (projectId) => {
      try {
        const result = await toggleFavoriteProject(projectId);
        if (result.success) {
          setFavoritedIds((prev) => {
            const next = new Set(prev);
            if (result.favorited) next.add(projectId);
            else next.delete(projectId);
            return next;
          });
        } else {
          setProjectErr(projectId, "favorite", result.error);
        }
      } catch {
        setProjectErr(projectId, "favorite", "Failed to toggle favourite");
      }
    },
    [setProjectErr],
  );

  // ─── handleDelete ─────────────────────────────────────────────────────────────
  const handleDelete = useCallback(
    async (projectId) => {
      setProjectLoad(projectId, "deletingProject", true);
      setProjectErr(projectId, "deletingProject", null);
      try {
        const result = await deleteProjectIdea(projectId);
        if (result.success) {
          setProjects((prev) => prev.filter((p) => p.id !== projectId));
          const cleanup = (setter) =>
            setter((prev) => {
              const next = { ...prev };
              delete next[projectId];
              return next;
            });
          cleanup(setRoadmaps);
          cleanup(setErDiagrams);
          cleanup(setReadmes);
          cleanup(setInterviewQs);
          cleanup(setEnhancements);
          cleanup(setDeployments);
          cleanup(setDatabases);
          cleanup(setApis);
          cleanup(setMentorChats);
          cleanup(setProjectLoading);
          cleanup(setProjectErrors);
          setSavedIds((prev) => {
            const next = new Set(prev);
            next.delete(projectId);
            return next;
          });
          setFavoritedIds((prev) => {
            const next = new Set(prev);
            next.delete(projectId);
            return next;
          });
          setGuideProject((prev) => (prev?.id === projectId ? null : prev));
        } else {
          setProjectErr(projectId, "deletingProject", result.error);
        }
      } catch {
        setProjectErr(projectId, "deletingProject", "Failed to delete");
      } finally {
        setProjectLoad(projectId, "deletingProject", false);
      }
    },
    [setProjectLoad, setProjectErr],
  );

  // ─── handleExport ─────────────────────────────────────────────────────────────
  const handleExport = useCallback(
    async (projectId) => {
      setProjectLoad(projectId, "exportingProject", true);
      try {
        await trackProjectExport(projectId, "pdf");
      } catch {
        setProjectErr(projectId, "exportingProject", "Export failed");
      } finally {
        setProjectLoad(projectId, "exportingProject", false);
      }
    },
    [setProjectLoad, setProjectErr],
  );

  // ─── handleLoadRoadmap ────────────────────────────────────────────────────────
  const handleLoadRoadmap = useCallback(
    (projectId) =>
      loadProjectSection({
        projectId,
        loadingKey: "loadingRoadmap",
        errorKey: "loadingRoadmap",
        action: getProjectRoadmapAction,
        onSuccess: (data) =>
          setRoadmaps((prev) => ({ ...prev, [projectId]: data })),
      }),
    [loadProjectSection],
  );

  // ─── handleLoadERDiagram ──────────────────────────────────────────────────────
  const handleLoadERDiagram = useCallback(
    (projectId) =>
      loadProjectSection({
        projectId,
        loadingKey: "loadingERDiagram",
        errorKey: "loadingERDiagram",
        action: getProjectERDiagramAction,
        onSuccess: (data) =>
          setErDiagrams((prev) => ({ ...prev, [projectId]: data })),
      }),
    [loadProjectSection],
  );

  // ─── handleLoadReadme ─────────────────────────────────────────────────────────
  const handleLoadReadme = useCallback(
    (projectId) =>
      loadProjectSection({
        projectId,
        loadingKey: "loadingReadme",
        errorKey: "loadingReadme",
        action: getProjectReadmeAction,
        onSuccess: (data) =>
          setReadmes((prev) => ({ ...prev, [projectId]: data })),
      }),
    [loadProjectSection],
  );

  // ─── handleLoadInterviewQuestions ─────────────────────────────────────────────
  const handleLoadInterviewQuestions = useCallback(
    (projectId) =>
      loadProjectSection({
        projectId,
        loadingKey: "loadingInterviewQuestions",
        errorKey: "loadingInterviewQuestions",
        action: getInterviewQuestionsAction,
        onSuccess: (data) =>
          setInterviewQs((prev) => ({ ...prev, [projectId]: data })),
      }),
    [loadProjectSection],
  );

  // ─── handleLoadEnhancements ───────────────────────────────────────────────────
  const handleLoadEnhancements = useCallback(
    (projectId) =>
      loadProjectSection({
        projectId,
        loadingKey: "loadingEnhancements",
        errorKey: "loadingEnhancements",
        action: getEnhancementsAction,
        onSuccess: (data) =>
          setEnhancements((prev) => ({ ...prev, [projectId]: data })),
      }),
    [loadProjectSection],
  );

  // ─── handleLoadDeployment ─────────────────────────────────────────────────────
  const handleLoadDeployment = useCallback(
    (projectId) =>
      loadProjectSection({
        projectId,
        loadingKey: "loadingDeployment",
        errorKey: "loadingDeployment",
        action: getDeploymentSuggestionsAction,
        onSuccess: (data) =>
          setDeployments((prev) => ({ ...prev, [projectId]: data })),
      }),
    [loadProjectSection],
  );

  // ─── handleLoadDatabase ───────────────────────────────────────────────────────
  const handleLoadDatabase = useCallback(
    (projectId) =>
      loadProjectSection({
        projectId,
        loadingKey: "loadingDatabase",
        errorKey: "loadingDatabase",
        action: getDatabaseRecommendationAction,
        onSuccess: (data) =>
          setDatabases((prev) => ({ ...prev, [projectId]: data })),
      }),
    [loadProjectSection],
  );

  // ─── handleLoadAPIs ───────────────────────────────────────────────────────────
  const handleLoadAPIs = useCallback(
    (projectId) =>
      loadProjectSection({
        projectId,
        loadingKey: "loadingAPIs",
        errorKey: "loadingAPIs",
        action: getAPIRecommendationsAction,
        onSuccess: (data) =>
          setApis((prev) => ({ ...prev, [projectId]: data })),
      }),
    [loadProjectSection],
  );

  // ─── handleSendMentorMessage ──────────────────────────────────────────────────
  // FIX (Bug 3): The original had no loading guard, so the user could send
  // multiple messages before the first AI response arrived, which would result
  // in out-of-order messages being appended to the chat.
  const handleSendMentorMessage = useCallback(
    async (projectId, message) => {
      // Guard: prevent sending while the previous response is still in-flight
      if (projectLoadingRef.current[projectId]?.loadingMentor) return;

      const currentChat = (mentorChats[projectId] || []).slice(-20);
      const userMsg = { role: "user", content: message };

      setMentorChats((prev) => ({
        ...prev,
        [projectId]: [...(prev[projectId] || []), userMsg],
      }));

      setProjectLoad(projectId, "loadingMentor", true);
      setProjectErr(projectId, "loadingMentor", null);

      try {
        const result = await getMentorResponseAction({
          projectIdeaId: projectId,
          conversationHistory: currentChat,
          userMessage: message,
        });
        if (result.success) {
          setMentorChats((prev) => ({
            ...prev,
            [projectId]: [
              ...(prev[projectId] || []),
              { role: "assistant", content: result.data },
            ],
          }));
        } else {
          setProjectErr(
            projectId,
            "loadingMentor",
            result.error || "No response from mentor",
          );
        }
      } catch {
        setProjectErr(
          projectId,
          "loadingMentor",
          "Failed to get mentor response",
        );
      } finally {
        setProjectLoad(projectId, "loadingMentor", false);
      }
    },
    [mentorChats, setProjectLoad, setProjectErr], // stable — ref keeps loading state current
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 max-w-6xl">
        {/* ── Page Header ── */}
        <div className="text-center mb-10 space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">
              AI Project Idea Generator
            </h1>
          </div>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto leading-relaxed">
            Generate personalised project ideas based on your skills, experience
            level, and career goals — with roadmaps, tech stacks, and resume
            impact scores.
          </p>
          {projects.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {projects.length} project
              {projects.length !== 1 ? "s" : ""} generated
            </Badge>
          )}
        </div>

        {/* ── Tabs ── */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="generate" className="gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="my-projects" className="gap-1.5">
              <Search className="w-3.5 h-3.5" />
              My Projects
            </TabsTrigger>
            <TabsTrigger value="trending" className="gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              Trending
            </TabsTrigger>
          </TabsList>

          {/* ── Generate Tab ── */}
          <TabsContent value="generate">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* ── Form Panel ── */}
              <div className="lg:col-span-1">
                <ProjectGeneratorForm
                  formData={formData}
                  updateFormData={updateFormData}
                  resetForm={resetForm}
                  generateProjects={generateProjects}
                  loading={loading}
                  errors={errors}
                />
              </div>

              {/* ── Results Panel ── */}
              <div className="lg:col-span-2 space-y-6">
                {/* ── Empty State ── */}
                {!loading.generating && projects.length === 0 && (
                  <div className="border rounded-xl p-12 text-center space-y-4">
                    <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto">
                      <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-base font-semibold">
                        Ready to generate?
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                        Add your skills and preferences in the form to generate
                        personalised project ideas.
                      </p>
                    </div>
                  </div>
                )}

                {/* ── Generating State ── */}
                {loading.generating && (
                  <div className="border rounded-xl p-12 text-center space-y-4 animate-pulse">
                    <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto">
                      <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-base font-semibold">
                        Generating ideas...
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        AI is crafting personalised project ideas for you.
                      </p>
                    </div>
                  </div>
                )}

                {/* ── Project Cards ── */}
                {projects.map((project, index) => (
                  <ProjectIdeaCard
                    key={project.id}
                    project={project}
                    projectIndex={index}
                    roadmap={roadmaps[project.id]}
                    erDiagram={erDiagrams[project.id]}
                    readme={readmes[project.id]}
                    interviewQuestions={interviewQs[project.id]}
                    enhancements={enhancements[project.id]}
                    deploymentSuggestions={deployments[project.id]}
                    databaseRecommendation={databases[project.id]}
                    apiRecommendations={apis[project.id]}
                    mentorChat={mentorChats[project.id] || []}
                    loading={projectLoading[project.id] || {}}
                    errors={projectErrors[project.id] || {}}
                    isSaved={savedIds.has(project.id)}
                    isFavorited={favoritedIds.has(project.id)}
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
                ))}

                {/* ── GitHub Structure Guide ── */}
                {projects.length > 0 && (
                  <div className="space-y-3">
                    {projects.length > 1 && (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                          GitHub structure for:
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          {projects.map((p, i) => (
                            <Button
                              key={p.id}
                              variant={
                                guideProject?.id === p.id
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              onClick={() => setGuideProject(p)}
                              className="text-xs h-7"
                            >
                              #{String(i + 1).padStart(2, "0")}{" "}
                              {p.title.length > 22
                                ? p.title.slice(0, 22) + "…"
                                : p.title}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                    <GithubStructureGuide
                      project={guideProject || projects[0]}
                    />
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ── My Projects Tab ── */}
          <TabsContent value="my-projects">
            <ProjectSearch />
          </TabsContent>

          {/* ── Trending Tab ── */}
          <TabsContent value="trending">
            <TrendingProjects />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}