import { generateRoadmap } from "./generator";
import { formatRoadmap } from "./formatter";

// ─── Get Full Roadmap ────────────────────────────────────────────────────────
export const getProjectRoadmap = async ({
  title,
  description,
  techStack,
  difficulty,
}) => {
  const raw = await generateRoadmap({
    title,
    description,
    techStack,
    difficulty,
  });
  return formatRoadmap(raw);
};

// ─── Get Phase Titles Only (for progress tracker) ────────────────────────────
export const getRoadmapPhaseTitles = (roadmap = {}) => {
  if (!roadmap.phases || !Array.isArray(roadmap.phases)) return [];
  return roadmap.phases.map((phase) => ({
    phase: phase.phase || 1,
    title: phase.title || "",
    duration: phase.duration || "",
  }));
};

// ─── Get Current Phase by Progress ───────────────────────────────────────────
export const getCurrentPhase = (roadmap = {}, completedPhases = 0) => {
  if (!roadmap.phases || !Array.isArray(roadmap.phases)) return null;
  const index = Math.max(
    0,
    Math.min(completedPhases, roadmap.phases.length - 1),
  );
  return roadmap.phases[index] || null;
};

// ─── Calculate Total Estimated Weeks ─────────────────────────────────────────
export const calculateTotalWeeks = (roadmap = {}) => {
  if (!roadmap.totalDuration) return null;
  return roadmap.totalDuration;
};

// ─── Get All Tasks Flat List ──────────────────────────────────────────────────
export const getAllTasksFlat = (roadmap = {}) => {
  if (!roadmap.phases || !Array.isArray(roadmap.phases)) return [];
  return roadmap.phases.flatMap((phase) =>
    (phase.tasks || []).map((task) => ({
      phase: phase.phase || 1,
      phaseTitle: phase.title || "",
      task,
    })),
  );
};

// ─── Get Roadmap Summary ──────────────────────────────────────────────────────
export const getRoadmapSummary = (roadmap = {}) => {
  return {
    totalDuration: roadmap.totalDuration || "",
    totalPhases: roadmap.phases?.length || 0,
    totalTasks:
      roadmap.phases?.reduce((acc, p) => acc + (p.tasks?.length || 0), 0) || 0,
    milestones: Array.isArray(roadmap.milestones) ? roadmap.milestones : [],
    successCriteria: Array.isArray(roadmap.successCriteria)
      ? roadmap.successCriteria
      : [],
    commonMistakes: Array.isArray(roadmap.commonMistakes)
      ? roadmap.commonMistakes
      : [],
  };
};
