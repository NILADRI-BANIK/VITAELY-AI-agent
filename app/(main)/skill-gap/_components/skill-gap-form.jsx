"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Briefcase} from "lucide-react";
import { skillGapSchema } from "@/validators/skill-gap-schema";
import TagInput from "@/components/ui/tag-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EXPERIENCE_LABELS } from "@/constants/skill-gap-prompts";

const SkillGapForm = ({ onSubmit, isLoading = false }) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(skillGapSchema),
    defaultValues: {
      targetRole: "",
      currentSkills: [],
      experience: undefined,
    },
  });

  const onFormSubmit = async (data) => {
    await onSubmit(data);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          <CardTitle>Skill Gap Analyzer</CardTitle>
        </div>
        <CardDescription>
          Enter your dream job role and current skills to get a personalized
          learning roadmap.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">

          <div className="space-y-2">
            <Label htmlFor="targetRole">
              Dream Job Role <span className="text-destructive">*</span>
            </Label>
            <Input
              id="targetRole"
              placeholder="e.g. Frontend Developer, Data Scientist, AI Engineer"
              disabled={isLoading}
              {...register("targetRole")}
              className={errors.targetRole ? "border-destructive" : ""}
            />
            {errors.targetRole && (
              <p className="text-xs text-destructive">
                {errors.targetRole.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>
              Current Skills <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="currentSkills"
              control={control}
              render={({ field }) => (
                <TagInput
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="e.g. JavaScript, Python, React..."
                  maxTags={30}
                  minTagLength={1}
                  maxTagLength={50}
                  disabled={isLoading}
                />
              )}
            />
            {errors.currentSkills && (
              <p className="text-xs text-destructive">
                {errors.currentSkills.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>
              Experience Level <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="experience"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isLoading}
                >
                  <SelectTrigger
                    className={errors.experience ? "border-destructive" : ""}
                  >
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(EXPERIENCE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.experience && (
              <p className="text-xs text-destructive">
                {errors.experience.message}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze My Skills"
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={() => reset()}
            >
              Reset
            </Button>
          </div>

        </form>
      </CardContent>
    </Card>
  );
};

export default SkillGapForm;