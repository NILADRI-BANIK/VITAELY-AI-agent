import { generateReadme } from "./generator";
import { formatReadme } from "./formatter";

// ─── Get Full README ──────────────────────────────────────────────────────────
export const getReadme = async ({
  title,
  description,
  techStack,
  coreFeatures,
  difficulty,
  estimatedDuration,
}) => {
  const raw = await generateReadme({
    title,
    description,
    techStack,
    coreFeatures,
    difficulty,
    estimatedDuration,
  });
  return formatReadme(raw);
};

// ─── Convert README to Markdown String ───────────────────────────────────────
export const convertReadmeToMarkdown = (readme = {}) => {
  const lines = [];

  if (readme.projectTitle) {
    lines.push(`# ${String(readme.projectTitle)}`);
    lines.push("");
  }

  if (readme.badges?.length > 0) {
    lines.push(readme.badges.join(" "));
    lines.push("");
  }

  if (readme.overview) {
    lines.push("## Overview");
    lines.push(String(readme.overview));
    lines.push("");
  }

  if (readme.features?.length > 0) {
    lines.push("## Features");
    readme.features.forEach((feature) => lines.push(`- ${String(feature)}`));
    lines.push("");
  }

  if (readme.techStack?.length > 0) {
    lines.push("## Tech Stack");
    readme.techStack.forEach((tech) => lines.push(`- ${String(tech)}`));
    lines.push("");
  }

  if (readme.prerequisites?.length > 0) {
    lines.push("## Prerequisites");
    readme.prerequisites.forEach((pre) => lines.push(`- ${String(pre)}`));
    lines.push("");
  }

  if (readme.installationSteps?.length > 0) {
    lines.push("## Installation");
    lines.push("```bash");
    readme.installationSteps.forEach((step) => lines.push(`- ${String(step)}`));
    lines.push("```");
    lines.push("");
  }

  if (readme.envVariables?.length > 0) {
    lines.push("## Environment Variables");
    lines.push("Create a `.env` file in the root directory:");
    lines.push("```env");
    readme.envVariables.forEach((env) => {
      lines.push(`# ${String(env.description)}`);
      lines.push(`${String(env.key)}=${String(env.example)}`);
    });
    lines.push("```");
    lines.push("");
  }

  if (readme.usageInstructions?.length > 0) {
    lines.push("## Usage");
    readme.usageInstructions.forEach((instruction) =>
      lines.push(`- ${String(instruction)}`),
    );
    lines.push("");
  }

  if (readme.folderStructure) {
    lines.push("## Folder Structure");
    lines.push("```");
    lines.push(readme.folderStructure);
    lines.push("```");
    lines.push("");
  }

  if (readme.contributingGuide) {
    lines.push("## Contributing");
    lines.push(readme.contributingGuide);
    lines.push("");
  }

  if (readme.licenseInfo) {
    lines.push("## License");
    lines.push(readme.licenseInfo);
    lines.push("");
  }

  return lines.join("\n");
};

// ─── Get README Sections List ─────────────────────────────────────────────────
export const getReadmeSections = (readme = {}) => {
  return Object.keys(readme).filter((key) => {
    const value = readme[key];
    if (!value) return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "string") return value.trim() !== "";
    return true;
  });
};

// ─── Get ENV Variables Only ───────────────────────────────────────────────────
export const getEnvVariables = (readme = {}) => {
  return (readme.envVariables || []).map((env) => ({
    key: env.key || "",
    description: env.description || "",
    example: env.example || "",
  }));
};

// ─── Get Installation Steps Only ─────────────────────────────────────────────
export const getInstallationSteps = (readme = {}) => {
  return readme.installationSteps || [];
};

// ─── Get Folder Structure Only ────────────────────────────────────────────────
export const getFolderStructure = (readme = {}) => {
  return readme.folderStructure || "";
};

// ─── Get README Summary ───────────────────────────────────────────────────────
export const getReadmeSummary = (readme = {}) => {
  return {
    projectTitle: readme.projectTitle || "",
    totalSections: getReadmeSections(readme).length,
    totalFeatures: readme.features?.length || 0,
    totalEnvVariables: readme.envVariables?.length || 0,
    totalInstallSteps: readme.installationSteps?.length || 0,
    hasContributing: !!readme.contributingGuide,
    license: readme.licenseInfo || "MIT",
  };
};
