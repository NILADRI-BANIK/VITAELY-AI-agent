"use client";

import { useState, useCallback, useRef } from "react";
import {
  generateAndSaveProjectIdeas,
  getProjectIdeas,
  saveProjectIdea,
  unsaveProjectIdea,
  getSavedProjects,
  toggleFavoriteProject,
  getFavoriteProjects,
  deleteProjectIdea,
  getProjectHistory,
  getProjectRoadmapAction,
  getProjectERDiagramAction,
  getProjectReadmeAction,
  getInterviewQuestionsAction,
  getEnhancementsAction,
  getDeploymentSuggestionsAction,
  getDatabaseRecommendationAction,
  getAPIRecommendationsAction,
  getMentorResponseAction,
  getTrendingProjectsAction,
  searchProjectsAction,
  getProjectScoreSummaryAction,
  trackProjectExport,
} from "@/actions/project-generator";

export const useProjectGenerator = () => {
  // ─── Form State ─────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    skills: "",
    experienceLevel: "",
    domain: "",
    complexity: "",
    category: "",
    projectCount: 3,
  });

  // ─── UI State ────────────────────────────────────────────────────────────────
  const [projects, setProjects] = useState([]);
  const [savedProjects, setSavedProjects] = useState([]);
  const [favoriteProjects, setFavoriteProjects] = useState([]);
  const [history, setHistory] = useState([]);
  const [trendingProjects, setTrendingProjects] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  // ─── Feature State ───────────────────────────────────────────────────────────
  const [roadmap, setRoadmap] = useState(null);
  const [erDiagram, setErDiagram] = useState(null);
  const [readme, setReadme] = useState(null);
  const [interviewQuestions, setInterviewQuestions] = useState(null);
  const [enhancements, setEnhancements] = useState(null);
  const [deploymentSuggestions, setDeploymentSuggestions] = useState(null);
  const [databaseRecommendation, setDatabaseRecommendation] = useState(null);
  const [apiRecommendations, setApiRecommendations] = useState(null);
  const [scoreSummary, setScoreSummary] = useState(null);
  const [mentorChat, setMentorChat] = useState([]);

  // ─── Loading State ───────────────────────────────────────────────────────────
  const [loading, setLoading] = useState({
    generating: false,
    loadingProjects: false,
    loadingSaved: false,
    loadingFavorites: false,
    loadingHistory: false,
    loadingTrending: false,
    loadingSearch: false,
    loadingRoadmap: false,
    loadingERDiagram: false,
    loadingReadme: false,
    loadingInterviewQuestions: false,
    loadingEnhancements: false,
    loadingDeployment: false,
    loadingDatabase: false,
    loadingAPIs: false,
    loadingScore: false,
    loadingMentor: false,
    savingProject: false,
    deletingProject: false,
    exportingProject: false,
  });

  // ─── Error State ─────────────────────────────────────────────────────────────
  const [errors, setErrors] = useState({});

  // ─── Cache ───────────────────────────────────────────────────────────────────
  const cache = useRef({});

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const setLoadingKey = (key, value) =>
    setLoading((prev) => ({ ...prev, [key]: value }));

  const setErrorKey = (key, value) =>
    setErrors((prev) => ({ ...prev, [key]: value }));

  const clearError = (key) =>
    setErrors((prev) => ({ ...prev, [key]: null }));

  // ─── Update Form ─────────────────────────────────────────────────────────────
  const updateFormData = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

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

  // ─── Generate Projects ────────────────────────────────────────────────────────
  const generateProjects = useCallback(async () => {
    const { skills, experienceLevel, domain, complexity, category, projectCount } =
      formData;

    if (!skills || !experienceLevel || !domain || !complexity || !category) {
      setErrorKey("generating", "Please fill in all required fields.");
      return;
    }

    clearError("generating");
    setLoadingKey("generating", true);
    setProjects([]);
    setSelectedProject(null);

    try {
      const result = await generateAndSaveProjectIdeas({
        skills,
        experienceLevel,
        domain,
        complexity,
        category,
        projectCount: Number(projectCount),
      });

      if (!result.success) throw new Error(result.error);

      setProjects(result.data);
      cache.current["projects"] = result.data;
    } catch (error) {
      setErrorKey("generating", error.message);
    } finally {
      setLoadingKey("generating", false);
    }
  }, [formData]);

  // ─── Regenerate Projects ──────────────────────────────────────────────────────
  const regenerateProjects = useCallback(async () => {
    cache.current["projects"] = null;
    setRoadmap(null);
    setErDiagram(null);
    setReadme(null);
    setInterviewQuestions(null);
    setEnhancements(null);
    setDeploymentSuggestions(null);
    setDatabaseRecommendation(null);
    setApiRecommendations(null);
    setScoreSummary(null);
    setMentorChat([]);
    await generateProjects();
  }, [generateProjects]);

  // ─── Load All User Projects ───────────────────────────────────────────────────
  const loadProjects = useCallback(async () => {
    setLoadingKey("loadingProjects", true);
    clearError("loadingProjects");
    try {
      const result = await getProjectIdeas();
      if (!result.success) throw new Error(result.error);
      setProjects(result.data);
    } catch (error) {
      setErrorKey("loadingProjects", error.message);
    } finally {
      setLoadingKey("loadingProjects", false);
    }
  }, []);

  // ─── Save Project ─────────────────────────────────────────────────────────────
  const handleSaveProject = useCallback(async (projectIdeaId) => {
    setLoadingKey("savingProject", true);
    clearError("savingProject");
    try {
      const result = await saveProjectIdea(projectIdeaId);
      if (!result.success) throw new Error(result.error);
      await loadSavedProjects();
    } catch (error) {
      setErrorKey("savingProject", error.message);
    } finally {
      setLoadingKey("savingProject", false);
    }
  }, [loadSavedProjects]);

  // ─── Unsave Project ───────────────────────────────────────────────────────────
  const handleUnsaveProject = useCallback(async (projectIdeaId) => {
    setLoadingKey("savingProject", true);
    clearError("savingProject");
    try {
      const result = await unsaveProjectIdea(projectIdeaId);
      if (!result.success) throw new Error(result.error);
      setSavedProjects((prev) => prev.filter((p) => p.id !== projectIdeaId));
    } catch (error) {
      setErrorKey("savingProject", error.message);
    } finally {
      setLoadingKey("savingProject", false);
    }
  }, []);

  // ─── Load Saved Projects ──────────────────────────────────────────────────────
  const loadSavedProjects = useCallback(async () => {
    setLoadingKey("loadingSaved", true);
    clearError("loadingSaved");
    try {
      const result = await getSavedProjects();
      if (!result.success) throw new Error(result.error);
      setSavedProjects(result.data);
    } catch (error) {
      setErrorKey("loadingSaved", error.message);
    } finally {
      setLoadingKey("loadingSaved", false);
    }
  }, []);

  // ─── Toggle Favorite ──────────────────────────────────────────────────────────
  const handleToggleFavorite = useCallback(async (projectIdeaId) => {
    clearError("favorite");
    try {
      const result = await toggleFavoriteProject(projectIdeaId);
      if (!result.success) throw new Error(result.error);
      await loadFavoriteProjects();
    } catch (error) {
      setErrorKey("favorite", error.message);
    }
  }, [loadFavoriteProjects]);

  // ─── Load Favorite Projects ───────────────────────────────────────────────────
  const loadFavoriteProjects = useCallback(async () => {
    setLoadingKey("loadingFavorites", true);
    clearError("loadingFavorites");
    try {
      const result = await getFavoriteProjects();
      if (!result.success) throw new Error(result.error);
      setFavoriteProjects(result.data);
    } catch (error) {
      setErrorKey("loadingFavorites", error.message);
    } finally {
      setLoadingKey("loadingFavorites", false);
    }
  }, []);

  // ─── Delete Project ───────────────────────────────────────────────────────────
  const handleDeleteProject = useCallback(async (projectIdeaId) => {
    setLoadingKey("deletingProject", true);
    clearError("deletingProject");
    try {
      const result = await deleteProjectIdea(projectIdeaId);
      if (!result.success) throw new Error(result.error);
      setProjects((prev) => prev.filter((p) => p.id !== projectIdeaId));
      if (selectedProject?.id === projectIdeaId) setSelectedProject(null);
    } catch (error) {
      setErrorKey("deletingProject", error.message);
    } finally {
      setLoadingKey("deletingProject", false);
    }
  }, [selectedProject]);

  // ─── Load History ─────────────────────────────────────────────────────────────
  const loadHistory = useCallback(async () => {
    setLoadingKey("loadingHistory", true);
    clearError("loadingHistory");
    try {
      const result = await getProjectHistory();
      if (!result.success) throw new Error(result.error);
      setHistory(result.data);
    } catch (error) {
      setErrorKey("loadingHistory", error.message);
    } finally {
      setLoadingKey("loadingHistory", false);
    }
  }, []);

  // ─── Load Trending ────────────────────────────────────────────────────────────
  const loadTrendingProjects = useCallback(async () => {
    if (cache.current["trending"]) {
      setTrendingProjects(cache.current["trending"]);
      return;
    }
    setLoadingKey("loadingTrending", true);
    clearError("loadingTrending");
    try {
      const result = await getTrendingProjectsAction();
      if (!result.success) throw new Error(result.error);
      setTrendingProjects(result.data);
      cache.current["trending"] = result.data;
    } catch (error) {
      setErrorKey("loadingTrending", error.message);
    } finally {
      setLoadingKey("loadingTrending", false);
    }
  }, []);

  // ─── Search Projects ──────────────────────────────────────────────────────────
  const searchProjects = useCallback(async (query) => {
    if (!query?.trim()) {
      setSearchResults([]);
      return;
    }
    setLoadingKey("loadingSearch", true);
    clearError("loadingSearch");
    try {
      const result = await searchProjectsAction(query);
      if (!result.success) throw new Error(result.error);
      setSearchResults(result.data);
    } catch (error) {
      setErrorKey("loadingSearch", error.message);
    } finally {
      setLoadingKey("loadingSearch", false);
    }
  }, []);

  // ─── Load Roadmap ─────────────────────────────────────────────────────────────
  const loadRoadmap = useCallback(async (projectIdeaId) => {
    const cacheKey = `roadmap_${projectIdeaId}`;
    if (cache.current[cacheKey]) {
      setRoadmap(cache.current[cacheKey]);
      return;
    }
    setLoadingKey("loadingRoadmap", true);
    clearError("loadingRoadmap");
    try {
      const result = await getProjectRoadmapAction(projectIdeaId);
      if (!result.success) throw new Error(result.error);
      setRoadmap(result.data);
      cache.current[cacheKey] = result.data;
    } catch (error) {
      setErrorKey("loadingRoadmap", error.message);
    } finally {
      setLoadingKey("loadingRoadmap", false);
    }
  }, []);

  // ─── Load ER Diagram ──────────────────────────────────────────────────────────
  const loadERDiagram = useCallback(async (projectIdeaId) => {
    const cacheKey = `erd_${projectIdeaId}`;
    if (cache.current[cacheKey]) {
      setErDiagram(cache.current[cacheKey]);
      return;
    }
    setLoadingKey("loadingERDiagram", true);
    clearError("loadingERDiagram");
    try {
      const result = await getProjectERDiagramAction(projectIdeaId);
      if (!result.success) throw new Error(result.error);
      setErDiagram(result.data);
      cache.current[cacheKey] = result.data;
    } catch (error) {
      setErrorKey("loadingERDiagram", error.message);
    } finally {
      setLoadingKey("loadingERDiagram", false);
    }
  }, []);

  // ─── Load README ──────────────────────────────────────────────────────────────
  const loadReadme = useCallback(async (projectIdeaId) => {
    const cacheKey = `readme_${projectIdeaId}`;
    if (cache.current[cacheKey]) {
      setReadme(cache.current[cacheKey]);
      return;
    }
    setLoadingKey("loadingReadme", true);
    clearError("loadingReadme");
    try {
      const result = await getProjectReadmeAction(projectIdeaId);
      if (!result.success) throw new Error(result.error);
      setReadme(result.data);
      cache.current[cacheKey] = result.data;
    } catch (error) {
      setErrorKey("loadingReadme", error.message);
    } finally {
      setLoadingKey("loadingReadme", false);
    }
  }, []);

  // ─── Load Interview Questions ─────────────────────────────────────────────────
  const loadInterviewQuestions = useCallback(async (projectIdeaId) => {
    const cacheKey = `interview_${projectIdeaId}`;
    if (cache.current[cacheKey]) {
      setInterviewQuestions(cache.current[cacheKey]);
      return;
    }
    setLoadingKey("loadingInterviewQuestions", true);
    clearError("loadingInterviewQuestions");
    try {
      const result = await getInterviewQuestionsAction(projectIdeaId);
      if (!result.success) throw new Error(result.error);
      setInterviewQuestions(result.data);
      cache.current[cacheKey] = result.data;
    } catch (error) {
      setErrorKey("loadingInterviewQuestions", error.message);
    } finally {
      setLoadingKey("loadingInterviewQuestions", false);
    }
  }, []);

  // ─── Load Enhancements ────────────────────────────────────────────────────────
  const loadEnhancements = useCallback(async (projectIdeaId) => {
    const cacheKey = `enhancements_${projectIdeaId}`;
    if (cache.current[cacheKey]) {
      setEnhancements(cache.current[cacheKey]);
      return;
    }
    setLoadingKey("loadingEnhancements", true);
    clearError("loadingEnhancements");
    try {
      const result = await getEnhancementsAction(projectIdeaId);
      if (!result.success) throw new Error(result.error);
      setEnhancements(result.data);
      cache.current[cacheKey] = result.data;
    } catch (error) {
      setErrorKey("loadingEnhancements", error.message);
    } finally {
      setLoadingKey("loadingEnhancements", false);
    }
  }, []);

  // ─── Load Deployment Suggestions ─────────────────────────────────────────────
  const loadDeploymentSuggestions = useCallback(async (projectIdeaId) => {
    const cacheKey = `deployment_${projectIdeaId}`;
    if (cache.current[cacheKey]) {
      setDeploymentSuggestions(cache.current[cacheKey]);
      return;
    }
    setLoadingKey("loadingDeployment", true);
    clearError("loadingDeployment");
    try {
      const result = await getDeploymentSuggestionsAction(projectIdeaId);
      if (!result.success) throw new Error(result.error);
      setDeploymentSuggestions(result.data);
      cache.current[cacheKey] = result.data;
    } catch (error) {
      setErrorKey("loadingDeployment", error.message);
    } finally {
      setLoadingKey("loadingDeployment", false);
    }
  }, []);

  // ─── Load Database Recommendation ────────────────────────────────────────────
  const loadDatabaseRecommendation = useCallback(async (projectIdeaId) => {
    const cacheKey = `database_${projectIdeaId}`;
    if (cache.current[cacheKey]) {
      setDatabaseRecommendation(cache.current[cacheKey]);
      return;
    }
    setLoadingKey("loadingDatabase", true);
    clearError("loadingDatabase");
    try {
      const result = await getDatabaseRecommendationAction(projectIdeaId);
      if (!result.success) throw new Error(result.error);
      setDatabaseRecommendation(result.data);
      cache.current[cacheKey] = result.data;
    } catch (error) {
      setErrorKey("loadingDatabase", error.message);
    } finally {
      setLoadingKey("loadingDatabase", false);
    }
  }, []);

  // ─── Load API Recommendations ─────────────────────────────────────────────────
  const loadAPIRecommendations = useCallback(async (projectIdeaId) => {
    const cacheKey = `apis_${projectIdeaId}`;
    if (cache.current[cacheKey]) {
      setApiRecommendations(cache.current[cacheKey]);
      return;
    }
    setLoadingKey("loadingAPIs", true);
    clearError("loadingAPIs");
    try {
      const result = await getAPIRecommendationsAction(projectIdeaId);
      if (!result.success) throw new Error(result.error);
      setApiRecommendations(result.data);
      cache.current[cacheKey] = result.data;
    } catch (error) {
      setErrorKey("loadingAPIs", error.message);
    } finally {
      setLoadingKey("loadingAPIs", false);
    }
  }, []);

  // ─── Load Score Summary ───────────────────────────────────────────────────────
  const loadScoreSummary = useCallback(async (projectIdeaId) => {
    const cacheKey = `score_${projectIdeaId}`;
    if (cache.current[cacheKey]) {
      setScoreSummary(cache.current[cacheKey]);
      return;
    }
    setLoadingKey("loadingScore", true);
    clearError("loadingScore");
    try {
      const result = await getProjectScoreSummaryAction(projectIdeaId);
      if (!result.success) throw new Error(result.error);
      setScoreSummary(result.data);
      cache.current[cacheKey] = result.data;
    } catch (error) {
      setErrorKey("loadingScore", error.message);
    } finally {
      setLoadingKey("loadingScore", false);
    }
  }, []);

  // ─── Mentor Chat ──────────────────────────────────────────────────────────────
  const sendMentorMessage = useCallback(async (projectIdeaId, userMessage) => {
    if (!userMessage?.trim()) return;

    const userEntry = { role: "user", content: userMessage };
    setMentorChat((prev) => [...prev, userEntry]);
    setLoadingKey("loadingMentor", true);
    clearError("loadingMentor");

    try {
      const result = await getMentorResponseAction({
        projectIdeaId,
        conversationHistory: [...mentorChat, userEntry],
        userMessage,
      });
      if (!result.success) throw new Error(result.error);
      const assistantEntry = { role: "assistant", content: result.data.response };
      setMentorChat((prev) => [...prev, assistantEntry]);
    } catch (error) {
      setErrorKey("loadingMentor", error.message);
    } finally {
      setLoadingKey("loadingMentor", false);
    }
  }, [mentorChat]);

  // ─── Export Project ───────────────────────────────────────────────────────────
  const handleExportProject = useCallback(async (projectIdeaId, format = "pdf") => {
    setLoadingKey("exportingProject", true);
    clearError("exportingProject");
    try {
      const result = await trackProjectExport(projectIdeaId, format);
      if (!result.success) throw new Error(result.error);
    } catch (error) {
      setErrorKey("exportingProject", error.message);
    } finally {
      setLoadingKey("exportingProject", false);
    }
  }, []);

  // ─── Select Project ───────────────────────────────────────────────────────────
  const selectProject = useCallback((project) => {
    setSelectedProject(project);
    setRoadmap(null);
    setErDiagram(null);
    setReadme(null);
    setInterviewQuestions(null);
    setEnhancements(null);
    setDeploymentSuggestions(null);
    setDatabaseRecommendation(null);
    setApiRecommendations(null);
    setScoreSummary(null);
    setMentorChat([]);
  }, []);

  // ─── Clear Cache ──────────────────────────────────────────────────────────────
  const clearCache = useCallback(() => {
    cache.current = {};
  }, []);

  return {
    // Form
    formData,
    updateFormData,
    resetForm,

    // Projects
    projects,
    savedProjects,
    favoriteProjects,
    history,
    trendingProjects,
    searchResults,
    selectedProject,

    // Feature Data
    roadmap,
    erDiagram,
    readme,
    interviewQuestions,
    enhancements,
    deploymentSuggestions,
    databaseRecommendation,
    apiRecommendations,
    scoreSummary,
    mentorChat,

    // Loading
    loading,

    // Errors
    errors,

    // Actions
    generateProjects,
    regenerateProjects,
    loadProjects,
    handleSaveProject,
    handleUnsaveProject,
    loadSavedProjects,
    handleToggleFavorite,
    loadFavoriteProjects,
    handleDeleteProject,
    loadHistory,
    loadTrendingProjects,
    searchProjects,
    loadRoadmap,
    loadERDiagram,
    loadReadme,
    loadInterviewQuestions,
    loadEnhancements,
    loadDeploymentSuggestions,
    loadDatabaseRecommendation,
    loadAPIRecommendations,
    loadScoreSummary,
    sendMentorMessage,
    handleExportProject,
    selectProject,
    clearCache,
  };
};