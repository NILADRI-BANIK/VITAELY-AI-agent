import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  buildProjectGeneratorPrompt,
  buildRoadmapPrompt,
  buildERDiagramPrompt,
  buildReadmePrompt,
  buildInterviewQuestionsPrompt,
  buildEnhancementSuggestionsPrompt,
  buildMentorChatPrompt,
  buildDeploymentPrompt,
} from "./prompts";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// ─── Helper: call Gemini and parse JSON safely ───────────────────────────────
const callGemini = async (prompt) => {
  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
  try {
    return JSON.parse(cleanedText);
  } catch {
    throw new Error("Invalid JSON returned by Gemini.");
  }
};

// ─── 1. Generate Project Ideas ───────────────────────────────────────────────
export const generateProjectIdeas = async ({
  skills,
  experienceLevel,
  domain,
  complexity,
  category,
  projectCount = 3,
}) => {
  if (!skills || !experienceLevel || !domain || !complexity || !category) {
    throw new Error("Missing required inputs for project generation.");
  }

  const prompt = buildProjectGeneratorPrompt({
    skills,
    experienceLevel,
    domain,
    complexity,
    category,
    projectCount,
  });

  const parsed = await callGemini(prompt);

  if (!parsed.projects || !Array.isArray(parsed.projects)) {
    throw new Error(
      "Invalid response format from AI. Expected projects array.",
    );
  }

  return parsed.projects;
};

// ─── 2. Generate Project Roadmap ─────────────────────────────────────────────
export const generateRoadmap = async ({
  title,
  description,
  techStack,
  difficulty,
}) => {
  if (!title || !description || !techStack || !difficulty) {
    throw new Error("Missing required inputs for roadmap generation.");
  }

  const prompt = buildRoadmapPrompt({
    title,
    description,
    techStack,
    difficulty,
  });
  const parsed = await callGemini(prompt);

  if (!parsed.roadmap) {
    throw new Error(
      "Invalid response format from AI. Expected roadmap object.",
    );
  }

  return parsed.roadmap;
};

// ─── 3. Generate ER Diagram ──────────────────────────────────────────────────
export const generateERDiagram = async ({
  title,
  description,
  coreFeatures,
}) => {
  if (!title || !description || !coreFeatures) {
    throw new Error("Missing required inputs for ER diagram generation.");
  }

  const prompt = buildERDiagramPrompt({ title, description, coreFeatures });
  const parsed = await callGemini(prompt);

  if (!parsed.erd) {
    throw new Error("Invalid response format from AI. Expected erd object.");
  }

  return parsed.erd;
};

// ─── 4. Generate README ──────────────────────────────────────────────────────
export const generateReadme = async ({
  title,
  description,
  techStack,
  coreFeatures,
  difficulty,
  estimatedDuration,
}) => {
  if (!title || !description || !techStack || !coreFeatures) {
    throw new Error("Missing required inputs for README generation.");
  }

  const prompt = buildReadmePrompt({
    title,
    description,
    techStack,
    coreFeatures,
    difficulty,
    estimatedDuration,
  });

  const parsed = await callGemini(prompt);

  if (!parsed.readme) {
    throw new Error("Invalid response format from AI. Expected readme object.");
  }

  return parsed.readme;
};

// ─── 5. Generate Interview Questions ─────────────────────────────────────────
export const generateInterviewQuestions = async ({
  title,
  techStack,
  coreFeatures,
  difficulty,
}) => {
  if (!title || !techStack || !coreFeatures || !difficulty) {
    throw new Error(
      "Missing required inputs for interview questions generation.",
    );
  }

  const prompt = buildInterviewQuestionsPrompt({
    title,
    techStack,
    coreFeatures,
    difficulty,
  });

  const parsed = await callGemini(prompt);

  if (!parsed.interviewQuestions) {
    throw new Error(
      "Invalid response format from AI. Expected interviewQuestions object.",
    );
  }

  return parsed.interviewQuestions;
};

// ─── 6. Generate Enhancement Suggestions ─────────────────────────────────────
export const generateEnhancements = async ({
  title,
  description,
  techStack,
  coreFeatures,
}) => {
  if (!title || !description || !techStack || !coreFeatures) {
    throw new Error("Missing required inputs for enhancement suggestions.");
  }

  const prompt = buildEnhancementSuggestionsPrompt({
    title,
    description,
    techStack,
    coreFeatures,
  });

  const parsed = await callGemini(prompt);

  if (!parsed.enhancements) {
    throw new Error(
      "Invalid response format from AI. Expected enhancements object.",
    );
  }

  return parsed.enhancements;
};

// ─── 7. Generate Mentor Chat Response ────────────────────────────────────────
export const generateMentorResponse = async ({
  project,
  conversationHistory = [],
  userMessage,
}) => {
  if (!project || !userMessage) {
    throw new Error("Missing required inputs for mentor chat.");
  }

  const prompt = buildMentorChatPrompt({
    project,
    conversationHistory,
    userMessage,
  });

  const parsed = await callGemini(prompt);

  if (!parsed.response) {
    throw new Error(
      "Invalid response format from AI. Expected response string.",
    );
  }

  return parsed;
};

// ─── 8. Generate Deployment Suggestions ──────────────────────────────────────
export const generateDeploymentSuggestions = async ({
  title,
  techStack,
  complexity,
}) => {
  if (!title || !techStack || !complexity) {
    throw new Error("Missing required inputs for deployment suggestions.");
  }

  const prompt = buildDeploymentPrompt({ title, techStack, complexity });
  const parsed = await callGemini(prompt);

  if (!parsed.deployment) {
    throw new Error(
      "Invalid response format from AI. Expected deployment object.",
    );
  }

  return parsed.deployment;
};
