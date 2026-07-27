"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, X, Loader2, RotateCcw } from "lucide-react";
import { experienceLevels } from "@/data/experience-levels";
import { projectDomains } from "@/data/project-domains";
import { projectComplexity } from "@/data/project-complexity";
import { projectCategories } from "@/data/project-categories";
import { cn } from "@/lib/utils";

const PROJECT_COUNT_OPTIONS = [1, 2, 3, 4, 5];

export default function ProjectGeneratorForm({
  formData,
  updateFormData,
  resetForm,
  generateProjects,
  loading,
  errors,
}) {
  const [skillInput, setSkillInput] = useState(""); // REMOVED the separate `skillTags` useState.
  //
  // The old code had TWO copies of skills data:
  //   • skillTags  — local state in this component
  //   • formData.skills — parent state passed down as a prop
  //
  // They could silently diverge: the lazy `useState(() => formData.skills...)`
  // initialiser only runs ONCE on mount, so any later external change to
  // formData.skills (e.g. after tab-switch remount, a future "load saved form"
  // feature, or parent reset) would not be reflected in skillTags — keeping the
  // Generate button permanently disabled.
  //
  // Solution: derive skillTags directly from formData.skills on every render.
  // formData.skills is now the single source of truth; the two states can never
  // drift apart because there is only one state.
  // ─────────────────────────────────────────────────────────────────────────────
  const skillTags = formData.skills
    ? formData.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  // ─── Skill Tag Handlers ───────────────────────────────────────────────────
  const handleAddSkill = (e) => {
    if ((e.key === "Enter" || e.key === ",") && skillInput.trim()) {
      e.preventDefault();
      const newSkill = skillInput.trim().replace(/,+$/, "").trim();
      if (
        newSkill &&
        !skillTags.some((s) => s.toLowerCase() === newSkill.toLowerCase())
      ) {
        const updated = [...skillTags, newSkill];
        // Only update parent — skillTags is derived from formData.skills,
        // so the badge list will re-render automatically.
        updateFormData("skills", updated.join(", "));
      }
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill) => {
    const updated = skillTags.filter(
      (s) => s.toLowerCase() !== skill.toLowerCase(),
    );
    updateFormData("skills", updated.join(", "));
  };

  const handleReset = () => {
    // No need to clear skillTags separately — resetForm() sets formData.skills
    // to "" which automatically makes the derived skillTags array empty.
    setSkillInput("");
    resetForm();
  };

  const isFormValid =
    formData.skills?.trim().length > 0 &&
    formData.experienceLevel &&
    formData.domain &&
    formData.complexity &&
    formData.category;

  return (
    <div className="border rounded-xl bg-card p-6 space-y-6 sticky top-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-base font-semibold">Generate Ideas</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="h-8 px-2 text-muted-foreground hover:text-foreground gap-1 text-xs"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </Button>
      </div>

      {/* ── Error ── */}
      {errors?.generating && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
          <p className="text-xs text-destructive">{errors.generating}</p>
        </div>
      )}

      {/* ── Skills Input ── */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Your Skills <span className="text-destructive">*</span>
        </Label>
        <div className="border rounded-md bg-background focus-within:ring-2 focus-within:ring-ring min-h-[42px] px-3 py-2 flex flex-wrap gap-2">
          {skillTags.map((skill) => (
            <Badge
              key={skill}
              variant="secondary"
              className="gap-1 text-xs h-6 pl-2 pr-1"
            >
              {skill}
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="hover:text-destructive transition-colors ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          <input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleAddSkill}
            placeholder={
              skillTags.length === 0
                ? "Type a skill and press Enter..."
                : "Add more..."
            }
            className="flex-1 min-w-[120px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Press Enter or comma to add each skill
        </p>
      </div>

      {/* ── Experience Level ── */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Experience Level <span className="text-destructive">*</span>
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {experienceLevels.map((level) => (
            <button
              key={level.id}
              type="button"
              onClick={() => updateFormData("experienceLevel", level.id)}
              className={cn(
                "border rounded-lg py-2 px-3 text-xs font-medium transition-all duration-200 text-center",
                formData.experienceLevel === level.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground",
              )}
            >
              {level.label}
              <div className="text-[10px] font-normal mt-0.5 opacity-70">
                {level.id === "beginner"
                  ? "0–1 yr"
                  : level.id === "intermediate"
                    ? "1–3 yrs"
                    : "3+ yrs"}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Domain ── */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Domain <span className="text-destructive">*</span>
        </Label>
        <Select
          value={formData.domain}
          onValueChange={(val) => updateFormData("domain", val)}
        >
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Select a domain..." />
          </SelectTrigger>
          <SelectContent>
            {projectDomains.map((domain) => (
              <SelectItem key={domain.id} value={domain.id}>
                {domain.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Complexity ── */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Complexity <span className="text-destructive">*</span>
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {projectComplexity.map((level) => {
            const colorMap = {
              green:
                "border-green-500 bg-green-500/10 text-green-600 dark:text-green-400",
              amber:
                "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400",
              red: "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400",
            };
            const isSelected = formData.complexity === level.id;
            return (
              <button
                key={level.id}
                type="button"
                onClick={() => updateFormData("complexity", level.id)}
                className={cn(
                  "border rounded-lg py-2 px-3 text-xs font-medium transition-all duration-200 text-center",
                  isSelected
                    ? colorMap[level.color]
                    : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground",
                )}
              >
                {level.label}
                <div className="text-[10px] font-normal mt-0.5 opacity-70">
                  {level.estimatedDuration.split(" ")[0]}{" "}
                  {level.estimatedDuration.split(" ")[1]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Category ── */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Project Category <span className="text-destructive">*</span>
        </Label>
        <Select
          value={formData.category}
          onValueChange={(val) => updateFormData("category", val)}
        >
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Select a category..." />
          </SelectTrigger>
          <SelectContent>
            {projectCategories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                <div className="flex items-center gap-2">
                  <span>{cat.label}</span>
                  <span className="text-xs text-muted-foreground">
                    — {cat.badge}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Project Count ── */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Number of Ideas</Label>
        <div className="flex gap-2">
          {PROJECT_COUNT_OPTIONS.map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => updateFormData("projectCount", count)}
              className={cn(
                "flex-1 border rounded-lg py-2 text-sm font-medium transition-all duration-200",
                formData.projectCount === count
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground",
              )}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      {/* ── Generate Button ── */}
      <Button
        onClick={generateProjects}
        disabled={!isFormValid || loading?.generating}
        className="w-full gap-2 h-11"
        size="lg"
      >
        {loading?.generating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating Ideas...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Generate Project Ideas
          </>
        )}
      </Button>

      {!isFormValid && (
        <p className="text-xs text-muted-foreground text-center">
          Fill in all required fields to generate ideas
        </p>
      )}
    </div>
  );
}