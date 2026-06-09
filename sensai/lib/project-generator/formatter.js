// ─── Format Project Ideas ────────────────────────────────────────────────────
export const formatProjectIdeas = (projects = []) => {
  return projects.map((project) => ({
    title: project.title || "Untitled Project",
    tagline: project.tagline || "",
    description: project.description || "",
    difficulty: project.difficulty || "Medium",
    estimatedDuration: project.estimatedDuration || "2-4 weeks",
    techStack: {
      frontend: project.techStack?.frontend || [],
      backend: project.techStack?.backend || [],
      database: project.techStack?.database || [],
      devops: project.techStack?.devops || [],
      apis: project.techStack?.apis || [],
    },
    coreFeatures: project.coreFeatures || [],
    bonusFeatures: project.bonusFeatures || [],
    learningOutcomes: project.learningOutcomes || [],
    resumeImpactScore: Math.min(
      10,
      Math.max(1, Number(project.resumeImpactScore) || 5),
    ),
    industryDemandScore: Math.min(
      10,
      Math.max(1, Number(project.industryDemandScore) || 5),
    ),
    uniquenessScore: Math.min(
      10,
      Math.max(1, Number(project.uniquenessScore) || 5),
    ),
    targetUsers: project.targetUsers || "",
    problemSolved: project.problemSolved || "",
    monetizationPotential: project.monetizationPotential || "",
  }));
};

// ─── Format Roadmap ──────────────────────────────────────────────────────────
export const formatRoadmap = (roadmap = {}) => {
  return {
    totalDuration: roadmap.totalDuration || "",
    phases: (roadmap.phases || []).map((phase) => ({
      phase: phase.phase || 1,
      title: phase.title || "",
      duration: phase.duration || "",
      tasks: phase.tasks || [],
      deliverable: phase.deliverable || "",
      tips: phase.tips || "",
    })),
    milestones: roadmap.milestones || [],
    commonMistakes: roadmap.commonMistakes || [],
    successCriteria: roadmap.successCriteria || [],
  };
};

// ─── Format ER Diagram ───────────────────────────────────────────────────────
export const formatERDiagram = (erd = {}) => {
  return {
    entities: (erd.entities || []).map((entity) => ({
      name: entity.name || "",
      description: entity.description || "",
      attributes: (entity.attributes || []).map((attr) => ({
        name: attr.name || "",
        type: attr.type || "String",
        constraints: attr.constraints || "",
      })),
    })),
    relationships: (erd.relationships || []).map((rel) => ({
      from: rel.from || "",
      to: rel.to || "",
      type: rel.type || "one-to-many",
      label: rel.label || "",
    })),
    notes: erd.notes || [],
  };
};

// ─── Format README ───────────────────────────────────────────────────────────
export const formatReadme = (readme = {}) => {
  return {
    projectTitle: readme.projectTitle || "",
    badges: readme.badges || [],
    overview: readme.overview || "",
    features: readme.features || [],
    techStack: readme.techStack || [],
    prerequisites: readme.prerequisites || [],
    installationSteps: readme.installationSteps || [],
    envVariables: (readme.envVariables || []).map((env) => ({
      key: env.key || "",
      description: env.description || "",
      example: env.example || "",
    })),
    usageInstructions: readme.usageInstructions || [],
    folderStructure: readme.folderStructure || "",
    contributingGuide: readme.contributingGuide || "",
    licenseInfo: readme.licenseInfo || "MIT",
  };
};

// ─── Format Interview Questions ──────────────────────────────────────────────
export const formatInterviewQuestions = (interviewQuestions = {}) => {
  return {
    projectSpecific: (interviewQuestions.projectSpecific || []).map((q) => ({
      question: q.question || "",
      category: q.category || "Implementation",
      expectedAnswer: q.expectedAnswer || "",
      difficulty: q.difficulty || "Medium",
    })),
    techStackQuestions: (interviewQuestions.techStackQuestions || []).map(
      (q) => ({
        technology: q.technology || "",
        question: q.question || "",
        expectedAnswer: q.expectedAnswer || "",
      }),
    ),
    behavioural: interviewQuestions.behavioural || [],
    systemDesign: interviewQuestions.systemDesign || [],
  };
};

// ─── Format Enhancement Suggestions ─────────────────────────────────────────
export const formatEnhancements = (enhancements = {}) => {
  return {
    aiFeatures: (enhancements.aiFeatures || []).map((f) => ({
      title: f.title || "",
      description: f.description || "",
      implementation: f.implementation || "",
      impact: f.impact || "Medium",
    })),
    scalabilityUpgrades: (enhancements.scalabilityUpgrades || []).map((u) => ({
      title: u.title || "",
      description: u.description || "",
      technology: u.technology || "",
    })),
    resumeBoosterFeatures: enhancements.resumeBoosterFeatures || [],
    modernTechUpgrades: (enhancements.modernTechUpgrades || []).map((u) => ({
      current: u.current || "",
      suggested: u.suggested || "",
      reason: u.reason || "",
    })),
    openSourceIdeas: enhancements.openSourceIdeas || [],
    monetizationIdeas: enhancements.monetizationIdeas || [],
  };
};

// ─── Format Mentor Chat Response ─────────────────────────────────────────────
export const formatMentorResponse = (data = {}) => {
  return {
    response: data.response || "",
    codeSnippet: data.codeSnippet || null,
    resources: (data.resources || []).map((r) => ({
      title: r.title || "",
      url: r.url || "",
    })),
    followUpQuestions: data.followUpQuestions || [],
  };
};

// ─── Format Deployment Suggestions ──────────────────────────────────────────
export const formatDeploymentSuggestions = (deployment = {}) => {
  return {
    recommended: {
      platform: deployment.recommended?.platform || "",
      reason: deployment.recommended?.reason || "",
      estimatedCost: deployment.recommended?.estimatedCost || "Free",
      difficulty: deployment.recommended?.difficulty || "Easy",
    },
    alternatives: (deployment.alternatives || []).map((alt) => ({
      platform: alt.platform || "",
      bestFor: alt.bestFor || "",
      estimatedCost: alt.estimatedCost || "",
    })),
    deploymentSteps: deployment.deploymentSteps || [],
    envSetup: deployment.envSetup || [],
    domainAndSSL: deployment.domainAndSSL || "",
    ciCdRecommendation: deployment.ciCdRecommendation || "",
    monitoringTools: deployment.monitoringTools || [],
  };
};
