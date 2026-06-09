"use client";

import SkillMatchScore from "./skill-match-score";
import MissingSkillsList from "./missing-skills-list";
import PrioritySkills from "./priority-skills";
import LearningRoadmap from "./learning-roadmap";
import RoadmapTimeline from "./roadmap-timeline";
import RecommendedCourses from "./recommended-courses";
import ProjectRecommendations from "./project-recommendations";
import YoutubeRecommendations from "./youtube-recommendations";
import LearningTimeline from "./learning-timeline";
import ProgressTracker from "./progress-tracker";
import DownloadReport from "./download-report";

// normalizeAnalysis
// SectionWrapper
// AnalysisResults

const normalizeAnalysis = (analysis) => {
  if (!analysis) return null;
  return {
    matchScore: parseInt(analysis.matchScore || analysis.match_score || 0, 10),
    missingSkills: analysis.missingSkills || analysis.missing_skills || [],
    prioritySkills: (() => {
      const ps = analysis.prioritySkills || analysis.priority_skills;
      if (!ps) return { high: [], medium: [], low: [] };
      if (Array.isArray(ps)) {
        return ps.reduce(
          (acc, s) => {
            const level = (s.priority || "low").toLowerCase();
            if (acc[level]) acc[level].push(s.skill || s.name || String(s));
            return acc;
          },
          { high: [], medium: [], low: [] },
        );
      }
      return {
        high: ps.high || [],
        medium: ps.medium || [],
        low: ps.low || [],
      };
    })(),
    learningRoadmap:
      analysis.learningRoadmap ||
      analysis.learning_roadmap ||
      analysis.roadmap ||
      [],
    recommendedCourses:
      analysis.recommendedCourses ||
      analysis.recommended_courses ||
      analysis.courses ||
      [],
    projectRecommendations:
      analysis.projectRecommendations ||
      analysis.project_recommendations ||
      analysis.projects ||
      [],
    learningTimeline:
      analysis.learningTimeline ||
      analysis.learning_timeline ||
      analysis.timeline ||
      null,
    youtubeVideos: analysis.youtubeVideos || analysis.youtube_videos || [],
  };
};

function SectionWrapper({ children, delay = 0 }) {
  return (
    <div
      className="animate-fade-in-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}
    >
      {children}
    </div>
  );
}

export default function AnalysisResults({
  analysis,
  role,
  userSkills,
  experience,
  userId,
}) {
  const normalized = normalizeAnalysis(analysis);

  if (!normalized) return null;

  const {
    matchScore,
    missingSkills,
    prioritySkills,
    learningRoadmap,
    recommendedCourses,
    projectRecommendations,
    learningTimeline,
    youtubeVideos,
  } = normalized;

  return (
    <>
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.45s cubic-bezier(0.22, 1, 0.36, 1);
        }
      `}</style>

      <div className="w-full space-y-6">
        {/* Top bar: score + download */}
        <SectionWrapper delay={0}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <SkillMatchScore score={matchScore} />
           <DownloadReport
              analysis={{ ...normalized, targetRole: role, currentSkills: userSkills }}
              role={role}
              userSkills={userSkills}
              experience={experience}
            />
          </div>
        </SectionWrapper>

        {/* Learning timeline */}
        {learningTimeline && (
          <SectionWrapper delay={80}>
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
              <LearningTimeline timeline={learningTimeline} />
            </div>
          </SectionWrapper>
        )}

        {/* Two-column: missing skills + priority skills */}
        <SectionWrapper delay={160}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {missingSkills.length > 0 && (
              <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
                <MissingSkillsList missingSkills={missingSkills} />
              </div>
            )}
            {((prioritySkills?.high?.length ?? 0) > 0 ||
              (prioritySkills?.medium?.length ?? 0) > 0 ||
              (prioritySkills?.low?.length ?? 0) > 0) && (
              <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
                <PrioritySkills prioritySkills={prioritySkills} />
              </div>
            )}
          </div>
        </SectionWrapper>

        {/* Learning roadmap */}
        {learningRoadmap.length > 0 && (
          <SectionWrapper delay={240}>
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
              <LearningRoadmap roadmap={learningRoadmap} />
            </div>
          </SectionWrapper>
        )}

        {/* Visual roadmap timeline */}
        {learningRoadmap.length > 0 && (
          <SectionWrapper delay={280}>
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
              <RoadmapTimeline roadmap={learningRoadmap} role={role} />
            </div>
          </SectionWrapper>
        )}

        {/* Progress tracker */}
        {missingSkills.length > 0 && userId && (
          <SectionWrapper delay={320}>
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
              <ProgressTracker
                skills={missingSkills}
                userId={userId}
                role={role}
              />
            </div>
          </SectionWrapper>
        )}

        {/* Recommended courses */}
        {recommendedCourses.length > 0 && (
          <SectionWrapper delay={400}>
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
              <RecommendedCourses courses={recommendedCourses} />
            </div>
          </SectionWrapper>
        )}

        {/* YouTube tutorials */}
        {youtubeVideos.length > 0 && (
          <SectionWrapper delay={440}>
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
              <YoutubeRecommendations youtubeVideos={youtubeVideos} />
            </div>
          </SectionWrapper>
        )}

        {/* Project recommendations */}
        {projectRecommendations.length > 0 && (
          <SectionWrapper delay={480}>
            <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-5">
              <ProjectRecommendations projects={projectRecommendations} />
            </div>
          </SectionWrapper>
        )}
      </div>
    </>
  );
}
