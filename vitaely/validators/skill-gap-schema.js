import { z } from "zod";

export const skillGapSchema = z.object({
  targetRole: z
    .string()
    .min(2, "Role must be at least 2 characters")
    .max(100, "Role must be under 100 characters")
    .trim(),

  currentSkills: z
    .array(z.string().min(1).max(50).trim())
    .min(1, "Add at least one skill")
    .max(30, "Maximum 30 skills allowed"),

  experience: z.enum(["beginner", "intermediate", "advanced"], {
    errorMap: () => ({ message: "Select a valid experience level" }),
  }),
});

export const progressUpdateSchema = z.object({
  analysisId: z.string().cuid("Invalid analysis ID"),
  skillName: z.string().min(1).max(50).trim(),
  completed: z.boolean(),
});

export const skillGapIdSchema = z.object({
  id: z.string().cuid("Invalid ID"),
});