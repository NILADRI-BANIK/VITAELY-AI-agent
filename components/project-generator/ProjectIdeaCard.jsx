"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Bookmark,
  BookmarkCheck,
  Heart,
  HeartHandshake,
  Copy,
  Check,
  FileDown,
  Share2,
  Trash2,
  Loader2,
  Map,
  Database,
  Rocket,
  Code2,
  MessageSquare,
  Sparkles,
  GitBranch,
  FileText,
  Lightbulb,
  Clock,
  Users,
  Target,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { convertReadmeToMarkdown } from "@/lib/project-generator/readme";

// ─── Score Bar ─────────────────────────────────────────────────────────────────
const ScoreBar = ({ score = 5, label }) => {
  const clampedScore = Math.min(10, Math.max(1, Number(score) || 5));
  const percentage = (clampedScore / 10) * 100;
  const color =
    clampedScore >= 7
      ? "bg-green-500"
      : clampedScore >= 5
        ? "bg-amber-500"
        : "bg-red-500";
  const textColor =
    clampedScore >= 7
      ? "text-green-600 dark:text-green-400"
      : clampedScore >= 5
        ? "text-amber-600 dark:text-amber-400"
        : "text-red-500";

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={cn("text-xs font-semibold", textColor)}>
          {clampedScore}/10
        </span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700",
            color,
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// ─── Difficulty Badge ──────────────────────────────────────────────────────────
const DifficultyBadge = ({ difficulty }) => {
  const styleMap = {
    Easy: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
    Medium:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    Hard: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  };
  return (
    <span
      className={cn(
        "text-xs font-medium px-2.5 py-0.5 rounded-full border",
        styleMap[difficulty] || styleMap["Medium"],
      )}
    >
      {difficulty}
    </span>
  );
};

// ─── Tech Tag ──────────────────────────────────────────────────────────────────
const TechTag = ({ tech }) => (
  <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-md font-medium">
    {tech}
  </span>
);

// ─── Section Load Button ───────────────────────────────────────────────────────
const SectionLoadButton = ({ onLoad, isLoading, label, icon: Icon }) => (
  <Button
    variant="outline"
    size="sm"
    onClick={onLoad}
    disabled={isLoading}
    className="gap-2 w-full"
  >
    {isLoading ? (
      <Loader2 className="w-4 h-4 animate-spin" />
    ) : (
      <Icon className="w-4 h-4" />
    )}
    {isLoading ? `Generating ${label}...` : `Generate ${label}`}
  </Button>
);

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ProjectIdeaCard({
  project,
  projectIndex = 0,
  roadmap,
  erDiagram,
  readme,
  interviewQuestions,
  enhancements,
  deploymentSuggestions,
  databaseRecommendation,
  apiRecommendations,
  mentorChat = [],
  loading = {},
  errors = {},
  onSave,
  onUnsave,
  onToggleFavorite,
  onDelete,
  onExport,
  onLoadRoadmap,
  onLoadERDiagram,
  onLoadReadme,
  onLoadInterviewQuestions,
  onLoadEnhancements,
  onLoadDeployment,
  onLoadDatabase,
  onLoadAPIs,
  onSendMentorMessage,
  isSaved = false,
  isFavorited = false,
}) {
  const [copied, setCopied] = useState(false);
  const [mentorInput, setMentorInput] = useState("");

  // ─── Data Normalisation ──────────────────────────────────────────────────────
  const title = project?.title || "Untitled Project";
  const tagline = project?.tagline || "";
  const description = project?.description || "";
  const difficulty = project?.difficulty || "Medium";
  const duration = project?.estimatedDuration || project?.duration || "";
  const rawTechStack = project?.techStack;
  const techStack =
    typeof rawTechStack === "string"
      ? (() => {
          try {
            return JSON.parse(rawTechStack);
          } catch {
            return {};
          }
        })()
      : rawTechStack || {};
  const coreFeatures = project?.coreFeatures || project?.features || [];
  const bonusFeatures = project?.bonusFeatures || [];
  const learningOutcomes = project?.learningOutcomes || [];
  const targetUsers = project?.targetUsers || "";
  const problemSolved = project?.problemSolved || "";
  const monetizationPotential = project?.monetizationPotential || "";
  const resumeScore = Math.min(
    10,
    Math.max(
      1,
      Number(project?.resumeImpactScore || project?.resumeScore) || 5,
    ),
  );
  const demandScore = Math.min(
    10,
    Math.max(1, Number(project?.industryDemandScore) || 5),
  );
  const uniquenessScore = Math.min(
    10,
    Math.max(1, Number(project?.uniquenessScore) || 5),
  );

  const allTechTags = [
    ...(techStack?.frontend || []),
    ...(techStack?.backend || []),
    ...(techStack?.database || []),
    ...(techStack?.devops || []),
  ].slice(0, 12);

  // ─── Copy Handler ────────────────────────────────────────────────────────────
  const handleCopy = () => {
    const text = [
      title,
      tagline,
      "",
      description,
      "",
      `Tech Stack: ${allTechTags.join(", ")}`,
      `Features: ${coreFeatures.join(", ")}`,
    ].join("\n");

    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  };

  // ─── Share Handler ───────────────────────────────────────────────────────────
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title, text: description }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // ─── README Copy Handler ─────────────────────────────────────────────────────
  const handleCopyReadme = () => {
    if (!readme) return;
    const md = convertReadmeToMarkdown(readme);

    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(md).catch(() => {});
  };

  // ─── Mentor Submit ───────────────────────────────────────────────────────────
  const handleMentorSubmit = (e) => {
    e.preventDefault();
    if (!mentorInput.trim() || loading?.loadingMentor) return;
    onSendMentorMessage?.(project?.id, mentorInput.trim());
    setMentorInput("");
  };

  return (
    <Card className="border rounded-xl bg-card overflow-hidden">
      {/* ── Header ── */}
      <CardHeader className="pb-4 space-y-4">
        {/* Title Row */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground font-mono">
              #{String(projectIndex + 1).padStart(2, "0")}
            </span>
            <DifficultyBadge difficulty={difficulty} />
            {duration && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {duration}
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold leading-tight">{title}</h3>
          {tagline && (
            <p className="text-sm text-muted-foreground italic">{tagline}</p>
          )}
        </div>

        {/* Score Row */}
        <div className="grid grid-cols-3 gap-4 p-3 bg-muted/30 rounded-lg">
          <ScoreBar score={resumeScore} label="Resume Impact" />
          <ScoreBar score={demandScore} label="Industry Demand" />
          <ScoreBar score={uniquenessScore} label="Uniqueness" />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={
              isSaved
                ? () => onUnsave?.(project?.id)
                : () => onSave?.(project?.id)
            }
            disabled={loading?.savingProject}
            className="gap-1.5 h-8 text-xs"
          >
            {loading?.savingProject ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : isSaved ? (
              <BookmarkCheck className="w-3.5 h-3.5 text-primary" />
            ) : (
              <Bookmark className="w-3.5 h-3.5" />
            )}
            {isSaved ? "Saved" : "Save"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleFavorite?.(project?.id)}
            className="gap-1.5 h-8 text-xs"
          >
            {isFavorited ? (
              <HeartHandshake className="w-3.5 h-3.5 text-red-500" />
            ) : (
              <Heart className="w-3.5 h-3.5" />
            )}
            {isFavorited ? "Favorited" : "Favorite"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-1.5 h-8 text-xs"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copied ? "Copied!" : "Copy"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport?.(project?.id)}
            disabled={loading?.exportingProject}
            className="gap-1.5 h-8 text-xs"
          >
            {loading?.exportingProject ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileDown className="w-3.5 h-3.5" />
            )}
            Export
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="gap-1.5 h-8 text-xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete?.(project?.id)}
            disabled={loading?.deletingProject}
            className="gap-1.5 h-8 text-xs text-destructive hover:text-destructive ml-auto"
          >
            {loading?.deletingProject ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
          </Button>
        </div>

        {errors?.savingProject && (
          <p className="text-xs text-destructive">{errors.savingProject}</p>
        )}

        {errors?.favorite && (
          <p className="text-xs text-destructive">{errors.favorite}</p>
        )}

        {errors?.deletingProject && (
          <p className="text-xs text-destructive">{errors.deletingProject}</p>
        )}
      </CardHeader>

      <Separator />

      {/* ── Content ── */}
      <CardContent className="pt-5 space-y-5">
        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>

        {/* Tech Stack */}
        {allTechTags.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide">
              Tech Stack
            </p>
            <div className="flex flex-wrap gap-1.5">
              {allTechTags.map((tech, index) => (
                <TechTag key={`${tech}-${index}`} tech={tech} />
              ))}
            </div>
            {techStack?.apis?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {techStack.apis.map((api, index) => (
                  <span
                    key={`${api}-${index}`}
                    className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-md"
                  >
                    {api}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Core Features */}
        {coreFeatures.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide">
              Core Features
            </p>
            <ul className="space-y-1.5">
              {coreFeatures.map((feature, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Learning Outcomes */}
        {learningOutcomes.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
              What You Will Learn
            </p>
            <div className="flex flex-wrap gap-1.5">
              {learningOutcomes.map((outcome, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="text-xs font-normal"
                >
                  {outcome}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Target Users + Problem Solved */}
        {(targetUsers || problemSolved) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {targetUsers && (
              <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                <p className="text-xs font-semibold flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-primary" />
                  Target Users
                </p>
                <p className="text-xs text-muted-foreground">{targetUsers}</p>
              </div>
            )}
            {problemSolved && (
              <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                <p className="text-xs font-semibold flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-primary" />
                  Problem Solved
                </p>
                <p className="text-xs text-muted-foreground">{problemSolved}</p>
              </div>
            )}
          </div>
        )}

        {/* ── Advanced Sections ── */}
        <Accordion type="single" collapsible className="space-y-2">
          {/* Roadmap */}
          <AccordionItem value="roadmap" className="border rounded-lg px-4">
            <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline hover:text-primary">
              <div className="flex items-center gap-2">
                <Map className="w-4 h-4 text-primary" />
                Development Roadmap
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-3">
              {roadmap ? (
                <>
                  <p className="text-xs text-muted-foreground">
                    Total Duration:{" "}
                    <span className="font-medium text-foreground">
                      {roadmap.totalDuration}
                    </span>
                  </p>
                  {roadmap.phases?.map((phase) => (
                    <div
                      key={phase.phase}
                      className="border rounded-lg p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">
                          Phase {phase.phase}: {phase.title}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {phase.duration}
                        </Badge>
                      </div>
                      <ul className="space-y-1">
                        {phase.tasks?.map((task, i) => (
                          <li
                            key={i}
                            className="text-xs text-muted-foreground flex items-start gap-1.5"
                          >
                            <span className="text-primary mt-0.5">›</span>
                            {task}
                          </li>
                        ))}
                      </ul>
                      {phase.deliverable && (
                        <p className="text-xs text-primary font-medium">
                          ✓ {phase.deliverable}
                        </p>
                      )}
                    </div>
                  ))}
                  {roadmap.milestones?.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold">Milestones</p>
                      {roadmap.milestones.map((m, i) => (
                        <p key={i} className="text-xs text-muted-foreground">
                          🏁 {m}
                        </p>
                      ))}
                    </div>
                  )}
                  {roadmap.commonMistakes?.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-amber-500">
                        Common Mistakes to Avoid
                      </p>
                      {roadmap.commonMistakes.map((m, i) => (
                        <p key={i} className="text-xs text-muted-foreground">
                          ⚠️ {m}
                        </p>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <SectionLoadButton
                  onLoad={() => onLoadRoadmap?.(project?.id)}
                  isLoading={loading?.loadingRoadmap}
                  label="Roadmap"
                  icon={Map}
                />
              )}
              {errors?.loadingRoadmap && (
                <p className="text-xs text-destructive">
                  {errors.loadingRoadmap}
                </p>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Interview Questions */}
          <AccordionItem value="interview" className="border rounded-lg px-4">
            <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline hover:text-primary">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Interview Questions
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-3">
              {interviewQuestions ? (
                <>
                  {interviewQuestions.projectSpecific?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide">
                        Project Specific
                      </p>
                      {interviewQuestions.projectSpecific.map((q, i) => (
                        <div
                          key={i}
                          className="border rounded-lg p-3 space-y-1"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-medium">{q.question}</p>
                            <Badge
                              variant="outline"
                              className="text-xs shrink-0"
                            >
                              {q.difficulty}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {q.expectedAnswer}
                          </p>
                          {q.category && (
                            <span className="text-[10px] text-primary/70">
                              {q.category}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {interviewQuestions.techStackQuestions?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide">
                        Tech Stack Questions
                      </p>
                      {interviewQuestions.techStackQuestions.map((q, i) => (
                        <div
                          key={i}
                          className="border rounded-lg p-3 space-y-1"
                        >
                          <Badge variant="secondary" className="text-xs mb-1">
                            {q.technology}
                          </Badge>
                          <p className="text-xs font-medium">{q.question}</p>
                          <p className="text-xs text-muted-foreground">
                            {q.expectedAnswer}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  {interviewQuestions.behavioural?.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wide">
                        Behavioural
                      </p>
                      {interviewQuestions.behavioural.map((q, i) => (
                        <p key={i} className="text-xs text-muted-foreground">
                          • {q}
                        </p>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <SectionLoadButton
                  onLoad={() => onLoadInterviewQuestions?.(project?.id)}
                  isLoading={loading?.loadingInterviewQuestions}
                  label="Interview Questions"
                  icon={MessageSquare}
                />
              )}
              {errors?.loadingInterviewQuestions && (
                <p className="text-xs text-destructive">
                  {errors.loadingInterviewQuestions}
                </p>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Enhancements */}
          <AccordionItem
            value="enhancements"
            className="border rounded-lg px-4"
          >
            <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline hover:text-primary">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                AI Enhancement Suggestions
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-3">
              {enhancements ? (
                <>
                  {enhancements.aiFeatures?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide">
                        AI Features to Add
                      </p>
                      {enhancements.aiFeatures.map((f, i) => (
                        <div
                          key={i}
                          className="border rounded-lg p-3 space-y-1"
                        >
                          <div className="flex justify-between items-center">
                            <p className="text-xs font-medium">{f.title}</p>
                            <Badge variant="outline" className="text-xs">
                              {f.impact} Impact
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {f.description}
                          </p>
                          {f.implementation && (
                            <p className="text-xs text-primary/80">
                              How: {f.implementation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {enhancements.resumeBoosterFeatures?.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wide">
                        Resume Boosters
                      </p>
                      {enhancements.resumeBoosterFeatures.map((f, i) => (
                        <p key={i} className="text-xs text-muted-foreground">
                          ⭐ {f}
                        </p>
                      ))}
                    </div>
                  )}
                  {enhancements.monetizationIdeas?.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wide">
                        Monetization Ideas
                      </p>
                      {enhancements.monetizationIdeas.map((m, i) => (
                        <p key={i} className="text-xs text-muted-foreground">
                          💰 {m}
                        </p>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <SectionLoadButton
                  onLoad={() => onLoadEnhancements?.(project?.id)}
                  isLoading={loading?.loadingEnhancements}
                  label="Enhancement Suggestions"
                  icon={Sparkles}
                />
              )}
              {errors?.loadingEnhancements && (
                <p className="text-xs text-destructive">
                  {errors.loadingEnhancements}
                </p>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Deployment */}
          <AccordionItem value="deployment" className="border rounded-lg px-4">
            <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline hover:text-primary">
              <div className="flex items-center gap-2">
                <Rocket className="w-4 h-4 text-primary" />
                Deployment Suggestions
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-3">
              {deploymentSuggestions ? (
                <>
                  {deploymentSuggestions.recommended && (
                    <div className="border-2 border-primary/30 rounded-lg p-3 space-y-1.5 bg-primary/5">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">
                          ⭐ {deploymentSuggestions.recommended.platform}
                        </p>
                        <Badge className="text-xs">
                          {deploymentSuggestions.recommended.estimatedCost}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {deploymentSuggestions.recommended.reason}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {deploymentSuggestions.recommended.difficulty} Setup
                      </Badge>
                    </div>
                  )}
                  {deploymentSuggestions.alternatives?.map((alt, i) => (
                    <div key={i} className="border rounded-lg p-3 space-y-0.5">
                      <div className="flex justify-between items-center">
                        <p className="text-xs font-medium">{alt.platform}</p>
                        <span className="text-xs text-muted-foreground">
                          {alt.estimatedCost}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {alt.bestFor}
                      </p>
                    </div>
                  ))}
                  {deploymentSuggestions.deploymentSteps?.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold">Deployment Steps</p>
                      {deploymentSuggestions.deploymentSteps.map((step, i) => (
                        <p key={i} className="text-xs text-muted-foreground">
                          {i + 1}. {step}
                        </p>
                      ))}
                    </div>
                  )}
                  {deploymentSuggestions.ciCdRecommendation && (
                    <div className="bg-muted/30 rounded-lg p-2">
                      <p className="text-xs">
                        <span className="font-medium">CI/CD: </span>
                        <span className="text-muted-foreground">
                          {deploymentSuggestions.ciCdRecommendation}
                        </span>
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <SectionLoadButton
                  onLoad={() => onLoadDeployment?.(project?.id)}
                  isLoading={loading?.loadingDeployment}
                  label="Deployment Plan"
                  icon={Rocket}
                />
              )}
              {errors?.loadingDeployment && (
                <p className="text-xs text-destructive">
                  {errors.loadingDeployment}
                </p>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Database */}
          <AccordionItem value="database" className="border rounded-lg px-4">
            <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline hover:text-primary">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-primary" />
                Database Recommendation
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-3">
              {databaseRecommendation ? (
                <>
                  {databaseRecommendation.recommended && (
                    <div className="border-2 border-primary/30 rounded-lg p-3 space-y-2 bg-primary/5">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">
                          {databaseRecommendation.recommended.name}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {databaseRecommendation.recommended.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        ORM: {databaseRecommendation.recommended.withORM}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {databaseRecommendation.recommended.hostedOn?.map(
                          (h, i) => (
                            <span
                              key={i}
                              className="text-xs bg-muted px-2 py-0.5 rounded"
                            >
                              {h}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                  {databaseRecommendation.alternatives?.map((alt, i) => (
                    <div key={i} className="border rounded-lg p-3 space-y-0.5">
                      <div className="flex justify-between items-center">
                        <p className="text-xs font-medium">{alt.name}</p>
                        <Badge variant="outline" className="text-xs">
                          {alt.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {alt.withORM}
                      </p>
                    </div>
                  ))}
                </>
              ) : (
                <SectionLoadButton
                  onLoad={() => onLoadDatabase?.(project?.id)}
                  isLoading={loading?.loadingDatabase}
                  label="Database Recommendation"
                  icon={Database}
                />
              )}
              {errors?.loadingDatabase && (
                <p className="text-xs text-destructive">
                  {errors.loadingDatabase}
                </p>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* API Recommendations */}
          <AccordionItem value="apis" className="border rounded-lg px-4">
            <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline hover:text-primary">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-primary" />
                API Recommendations
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-2">
              {apiRecommendations ? (
                apiRecommendations.recommended?.length > 0 ? (
                  apiRecommendations.recommended.map((api, i) => (
                    <div
                      key={i}
                      className="border rounded-lg p-3 flex items-start justify-between gap-2"
                    >
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold">{api.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {api.use}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          by {api.provider}
                        </p>
                      </div>
                      {api.freetier && (
                        <Badge variant="secondary" className="text-xs shrink-0">
                          Free Tier
                        </Badge>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No APIs found.
                  </p>
                )
              ) : (
                <SectionLoadButton
                  onLoad={() => onLoadAPIs?.(project?.id)}
                  isLoading={loading?.loadingAPIs}
                  label="API Recommendations"
                  icon={Code2}
                />
              )}
              {errors?.loadingAPIs && (
                <p className="text-xs text-destructive">{errors.loadingAPIs}</p>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* README */}
          <AccordionItem value="readme" className="border rounded-lg px-4">
            <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline hover:text-primary">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                GitHub README Generator
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-3">
              {readme ? (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground font-medium">
                      {readme.projectTitle}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={handleCopyReadme}
                    >
                      <Copy className="w-3 h-3" />
                      Copy Markdown
                    </Button>
                  </div>
                  {readme.overview && (
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {readme.overview}
                    </p>
                  )}
                  {readme.features?.length > 0 && (
                    <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                      <p className="text-xs font-semibold mb-2">Features</p>
                      {readme.features.slice(0, 5).map((f, i) => (
                        <p key={i} className="text-xs text-muted-foreground">
                          • {f}
                        </p>
                      ))}
                    </div>
                  )}
                  {readme.envVariables?.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold">
                        Environment Variables
                      </p>
                      {readme.envVariables.map((env, i) => (
                        <div
                          key={i}
                          className="font-mono text-xs bg-muted/40 px-2 py-1 rounded"
                        >
                          {env.key}=
                          <span className="text-muted-foreground">
                            {env.example}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {readme.folderStructure && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold">Folder Structure</p>
                      <pre className="text-xs text-muted-foreground bg-muted/40 rounded-lg p-3 overflow-x-auto whitespace-pre">
                        {readme.folderStructure}
                      </pre>
                    </div>
                  )}
                </>
              ) : (
                <SectionLoadButton
                  onLoad={() => onLoadReadme?.(project?.id)}
                  isLoading={loading?.loadingReadme}
                  label="README"
                  icon={FileText}
                />
              )}
              {errors?.loadingReadme && (
                <p className="text-xs text-destructive">
                  {errors.loadingReadme}
                </p>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* ER Diagram */}
          <AccordionItem value="erd" className="border rounded-lg px-4">
            <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline hover:text-primary">
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-primary" />
                ER Diagram
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-3">
              {erDiagram ? (
                <>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>Entities: {erDiagram.entities?.length || 0}</span>
                    <span>
                      Relationships: {erDiagram.relationships?.length || 0}
                    </span>
                  </div>
                  {erDiagram.entities?.map((entity, index) => (
                    <div
                      key={`${entity.name}-${index}`}
                      className="border rounded-lg p-3 space-y-2"
                    >
                      <p className="text-xs font-semibold">{entity.name}</p>
                      {entity.description && (
                        <p className="text-xs text-muted-foreground">
                          {entity.description}
                        </p>
                      )}
                      <div className="space-y-0.5">
                        {entity.attributes?.map((attr) => (
                          <div
                            key={attr.name}
                            className="flex items-center gap-2 text-xs"
                          >
                            <span className="font-mono text-muted-foreground">
                              {attr.name}
                            </span>
                            <span className="text-primary/70">{attr.type}</span>
                            {attr.constraints && (
                              <span className="text-amber-500 text-[10px]">
                                {attr.constraints}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {erDiagram.relationships?.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold">Relationships</p>
                      {erDiagram.relationships.map((rel, i) => (
                        <p
                          key={i}
                          className="text-xs text-muted-foreground font-mono"
                        >
                          {rel.from} → {rel.to}{" "}
                          <span className="text-primary/70">({rel.type})</span>
                          {rel.label && (
                            <span className="text-muted-foreground">
                              {" "}
                              — {rel.label}
                            </span>
                          )}
                        </p>
                      ))}
                    </div>
                  )}
                  {erDiagram.notes?.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold">Notes</p>
                      {erDiagram.notes.map((note, i) => (
                        <p key={i} className="text-xs text-muted-foreground">
                          📝 {note}
                        </p>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <SectionLoadButton
                  onLoad={() => onLoadERDiagram?.(project?.id)}
                  isLoading={loading?.loadingERDiagram}
                  label="ER Diagram"
                  icon={GitBranch}
                />
              )}
              {errors?.loadingERDiagram && (
                <p className="text-xs text-destructive">
                  {errors.loadingERDiagram}
                </p>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* AI Mentor Chat */}
          <AccordionItem value="mentor" className="border rounded-lg px-4">
            <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline hover:text-primary">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-primary" />
                AI Mentor Chat
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-3">
              {mentorChat.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {mentorChat.map((msg, i) => (
                    <div
                      key={i}
                      className={cn(
                        "rounded-lg px-3 py-2 text-xs",
                        msg.role === "user"
                          ? "bg-primary/10 text-foreground ml-8"
                          : "bg-muted text-muted-foreground mr-8",
                      )}
                    >
                      <span className="font-medium text-[10px] uppercase tracking-wide block mb-0.5 opacity-60">
                        {msg.role === "user" ? "You" : "SensAI Mentor"}
                      </span>
                      {typeof msg.content === "object"
                        ? (msg.content?.response ?? "")
                        : msg.content}
                    </div>
                  ))}
                  {loading?.loadingMentor && (
                    <div className="bg-muted rounded-lg px-3 py-2 flex items-center gap-2 mr-8">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span className="text-xs text-muted-foreground">
                        Thinking...
                      </span>
                    </div>
                  )}
                </div>
              )}
              <form onSubmit={handleMentorSubmit} className="flex gap-2">
                <input
                  value={mentorInput}
                  onChange={(e) => setMentorInput(e.target.value)}
                  placeholder="Ask about this project..."
                  disabled={loading?.loadingMentor}
                  className="flex-1 min-w-0 text-xs border rounded-md px-3 py-2 bg-background outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 placeholder:text-muted-foreground"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!mentorInput.trim() || loading?.loadingMentor}
                  className="h-9 px-3 shrink-0"
                >
                  {loading?.loadingMentor ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <MessageSquare className="w-3.5 h-3.5" />
                  )}
                </Button>
              </form>
              {errors?.loadingMentor && (
                <p className="text-xs text-destructive">
                  {errors.loadingMentor}
                </p>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Bonus Features */}
        {bonusFeatures.length > 0 && (
          <div className="space-y-2 pt-1">
            <p className="text-xs font-semibold uppercase tracking-wide flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Bonus Features
            </p>
            <ul className="space-y-1">
              {bonusFeatures.map((feature, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-xs text-muted-foreground"
                >
                  <span className="text-primary mt-0.5 shrink-0">+</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Monetization Potential */}
        {monetizationPotential && (
          <div className="bg-muted/30 rounded-lg p-3 space-y-1">
            <p className="text-xs font-semibold flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
              Monetization Potential
            </p>
            <p className="text-xs text-muted-foreground">
              {monetizationPotential}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
