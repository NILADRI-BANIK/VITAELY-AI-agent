"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { generateCoverLetter, getApplicantDefaults } from "@/actions/cover-letter";
import { DEFAULT_SECTIONS_CONFIG } from "@/constants/cover-letter";

const defaultFormData = {
  jobTitle: "",
  companyName: "",
  jobDescription: "",
  tone: "professional",
  template: "modern-professional",
  theme: "default",
  // Applicant fields — name/email prefilled from profile but editable;
  // phone/skills/experience have no profile source, start blank.
  yourName: "",
  yourEmail: "",
  yourPhone: "",
  yourSkills: "",
  yourExperience: "",
  // Uses the canonical section ids/defaults from constants/cover-letter.js
  // (introduction, experience, skills, achievements, companyAlignment,
  // closing) instead of a hand-written duplicate that can drift out of
  // sync with the actual Sections tab toggles.
  sectionsConfig: { ...DEFAULT_SECTIONS_CONFIG },
};

export function useCoverLetter() {
  const [formData, setFormData] = useState(defaultFormData);
  const [coverLetter, setCoverLetter] = useState(null);
  const [jobAnalysis, setJobAnalysis] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Prefill name/email from the user's profile once on mount.
  // Still editable afterward — this only sets the initial value.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const defaults = await getApplicantDefaults();
        if (cancelled) return;
        setFormData((prev) => ({
          ...prev,
          yourName: prev.yourName || defaults.name,
          yourEmail: prev.yourEmail || defaults.email,
          yourSkills: prev.yourSkills || defaults.skills,
          yourExperience: prev.yourExperience || defaults.experience,
        }));
      } catch {
        // not logged in or profile fetch failed — leave fields blank,
        // user can still type them in manually
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateForm = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const analyzeJob = async () => {
    if (!formData.jobDescription.trim()) return;
    setIsAnalyzing(true);
    try {
      // Analysis is client-preview only — not persisted
      const res = await fetch("/api/analyze-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription: formData.jobDescription }),
      });

      if (res.ok) {
        const data = await res.json();
        setJobAnalysis(data);
      }
    } catch {
      // silently fail analysis
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generate = async (existingId = null) => {
    setIsGenerating(true);
    try {
      const result = await generateCoverLetter({
        jobTitle: formData.jobTitle,
        companyName: formData.companyName,
        jobDescription: formData.jobDescription,
        tone: formData.tone,
        selectedTemplate: formData.template,
        sectionsConfig: formData.sectionsConfig,
        yourName: formData.yourName,
        yourEmail: formData.yourEmail,
        yourPhone: formData.yourPhone,
        yourSkills: formData.yourSkills,
        yourExperience: formData.yourExperience,
        existingId,
      });

      // Carry company/position/sender info through so every consumer
      // (preview panel, view page before a refetch, etc.) has them
      // immediately without waiting on a DB round-trip.
      setCoverLetter({
        content: result.content,
        id: result.id,
        template: formData.template,
        companyName: formData.companyName,
        position: formData.jobTitle,
        senderName: formData.yourName,
        senderEmail: formData.yourEmail,
        senderPhone: formData.yourPhone,
      });

      // All AI providers (DeepSeek, Groq, Gemini) were unavailable —
      // the letter was built from a template instead. Let the user
      // know without blocking them, so they can choose to regenerate
      // later for a more personalized result.
      if (result.providerUsed === "template") {
        toast.warning(
          "AI providers were temporarily unavailable, so we generated a basic letter from your details. You can try regenerating later for a more personalized version."
        );
      }

      return result;
    } catch (err) {
      console.error("Generation failed:", err);
      toast.error(err?.message || "Failed to generate cover letter. Please try again.");
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    formData,
    updateForm,
    coverLetter,
    jobAnalysis,
    isGenerating,
    isAnalyzing,
    analyzeJob,
    generate,
  };
}