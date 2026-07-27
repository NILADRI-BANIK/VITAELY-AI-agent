// ─── Score Weights ────────────────────────────────────────────────────────────
const WEIGHTS = {
  complexity: 0.25,
  techStackRelevance: 0.2,
  industryDemand: 0.2,
  uniqueness: 0.15,
  deployability: 0.1,
  features: 0.1,
};

// ─── Calculate Resume Impact Score ───────────────────────────────────────────
export const calculateResumeImpactScore = ({
  difficulty,
  techStack,
  coreFeatures,
  bonusFeatures,
  resumeImpactScore,
  category,
}) => {
  if (resumeImpactScore && typeof resumeImpactScore === "number") {
    return Math.min(10, Math.max(1, resumeImpactScore));
  }

  let score = 5;

  if (difficulty === "Hard") score += 2;
  else if (difficulty === "Medium") score += 1;

  const allTech = [
    ...(techStack?.frontend || []),
    ...(techStack?.backend || []),
    ...(techStack?.database || []),
    ...(techStack?.devops || []),
  ];

  const highDemandTech = [
    "Next.js",
    "TypeScript",
    "React",
    "Node.js",
    "PostgreSQL",
    "Prisma",
    "Docker",
    "AWS",
    "GraphQL",
    "Redis",
    "Kubernetes",
    "Python",
    "TensorFlow",
    "OpenAI",
    "Gemini",
  ];

  const matchCount = allTech.filter((t) =>
    highDemandTech.some((h) => t.toLowerCase().includes(h.toLowerCase())),
  ).length;

  score += Math.min(2, matchCount * 0.4);

  const featureCount =
    (coreFeatures?.length || 0) + (bonusFeatures?.length || 0);
  if (featureCount >= 8) score += 1;

  const highImpactCategories = [
    "portfolio",
    "startup",
    "hackathon",
    "capstone",
  ];
  if (highImpactCategories.includes(category)) score += 0.5;

  return Math.round(Math.min(10, Math.max(1, score)));
};

// ─── Calculate Industry Demand Score ─────────────────────────────────────────
export const calculateIndustryDemandScore = ({
  domain,
  techStack,
  industryDemandScore,
}) => {
  if (industryDemandScore && typeof industryDemandScore === "number") {
    return Math.min(10, Math.max(1, industryDemandScore));
  }

  const highDemandDomains = {
    "artificial-intelligence": 10,
    "web-development": 9,
    "data-science": 9,
    "devops-cloud": 8,
    "mobile-development": 8,
    cybersecurity: 8,
    fintech: 7,
    "blockchain-web3": 6,
    edtech: 7,
    healthcare: 7,
    "iot-embedded": 6,
    "game-development": 5,
    "open-source-tools": 7,
  };

  return highDemandDomains[domain] || 6;
};

// ─── Calculate Overall Project Score ─────────────────────────────────────────
export const calculateOverallScore = ({
  resumeImpactScore,
  industryDemandScore,
  uniquenessScore,
  difficulty,
}) => {
  const complexityScore =
    difficulty === "Hard" ? 9 : difficulty === "Medium" ? 6 : 4;

  const weighted =
    complexityScore * WEIGHTS.complexity +
    (resumeImpactScore || 5) * WEIGHTS.techStackRelevance +
    (industryDemandScore || 5) * WEIGHTS.industryDemand +
    (uniquenessScore || 5) * WEIGHTS.uniqueness +
    5 * WEIGHTS.deployability +
    5 * WEIGHTS.features;

  return Math.round(Math.min(10, Math.max(1, weighted * 2)));
};

// ─── Get Score Label ──────────────────────────────────────────────────────────
export const getScoreLabel = (score) => {
  if (score >= 9) return "Exceptional";
  if (score >= 7) return "Strong";
  if (score >= 5) return "Good";
  if (score >= 3) return "Average";
  return "Basic";
};

// ─── Get Score Color ──────────────────────────────────────────────────────────
export const getScoreColor = (score) => {
  if (score >= 8) return "green";
  if (score >= 6) return "teal";
  if (score >= 4) return "amber";
  return "red";
};

// ─── Get Score Badge ──────────────────────────────────────────────────────────
export const getScoreBadge = (score) => {
  if (score >= 9) return "🔥 Must Build";
  if (score >= 7) return "⭐ Highly Recommended";
  if (score >= 5) return "✅ Good Choice";
  if (score >= 3) return "📘 Learning Value";
  return "🔧 Basic Project";
};

// ─── Get Full Score Summary ───────────────────────────────────────────────────
export const getScoreSummary = (project) => {
  const resume = calculateResumeImpactScore(project);
  const demand = calculateIndustryDemandScore(project);
  const overall = calculateOverallScore({
    resumeImpactScore: resume,
    industryDemandScore: demand,
    uniquenessScore: project.uniquenessScore || 5,
    difficulty: project.difficulty,
  });

  return {
    resumeImpactScore: resume,
    industryDemandScore: demand,
    overallScore: overall,
    label: getScoreLabel(overall),
    color: getScoreColor(overall),
    badge: getScoreBadge(overall),
  };
};
