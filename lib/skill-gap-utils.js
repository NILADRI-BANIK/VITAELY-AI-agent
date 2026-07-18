export const normalizeSkill = (skill) =>
  skill.toLowerCase().trim().replace(/\s+/g, " ");

export const normalizeSkillList = (skills = []) =>
  skills.map(normalizeSkill);

export const calculateMatchScore = (currentSkills = [], requiredSkills = []) => {
  if (!requiredSkills.length) return 0;

  const normalized = normalizeSkillList(currentSkills);
  const normalizedRequired = normalizeSkillList(requiredSkills);

  const matched = normalizedRequired.filter((skill) =>
    normalized.some(
      (current) => current.includes(skill) || skill.includes(current)
    )
  );

  return Math.round((matched.length / normalizedRequired.length) * 100);
};

export const findMissingSkills = (currentSkills = [], requiredSkills = []) => {
  const normalized = normalizeSkillList(currentSkills);

  return requiredSkills.filter((skill) => {
    const normalizedSkill = normalizeSkill(skill);
    return !normalized.some(
      (current) => current.includes(normalizedSkill) || normalizedSkill.includes(current)
    );
  });
};

export const findMatchedSkills = (currentSkills = [], requiredSkills = []) => {
  const normalized = normalizeSkillList(currentSkills);

  return requiredSkills.filter((skill) => {
    const normalizedSkill = normalizeSkill(skill);
    return normalized.some(
      (current) => current.includes(normalizedSkill) || normalizedSkill.includes(current)
    );
  });
};

export const assignSkillPriority = (missingSkills = [], prioritySkills = []) => {
  const highPriority = normalizeSkillList(
    prioritySkills.filter((s) => s.priority === "high").map((s) => s.skill)
  );
  const mediumPriority = normalizeSkillList(
    prioritySkills.filter((s) => s.priority === "medium").map((s) => s.skill)
  );

  return missingSkills.map((skill) => {
    const normalized = normalizeSkill(skill);
    if (highPriority.some((p) => p.includes(normalized) || normalized.includes(p))) {
      return { skill, priority: "high" };
    }
    if (mediumPriority.some((p) => p.includes(normalized) || normalized.includes(p))) {
      return { skill, priority: "medium" };
    }
    return { skill, priority: "low" };
  });
};

export const estimateLearningHours = (missingSkills = [], experience = "beginner") => {
  const baseHoursPerSkill = {
    beginner: 40,
    intermediate: 25,
    advanced: 15,
  };

  const hours = (baseHoursPerSkill[experience] || 25) * missingSkills.length;

  return {
    totalHours: hours,
    hoursPerWeek: experience === "beginner" ? 10 : experience === "intermediate" ? 15 : 20,
    estimatedWeeks: Math.ceil(hours / (experience === "beginner" ? 10 : experience === "intermediate" ? 15 : 20)),
  };
};

export const formatTimeline = (missingSkills = [], experience = "beginner") => {
  const { estimatedWeeks } = estimateLearningHours(missingSkills, experience);

  if (estimatedWeeks <= 4) return "1 month";
  if (estimatedWeeks <= 8) return "2 months";
  if (estimatedWeeks <= 12) return "3 months";
  if (estimatedWeeks <= 24) return `${Math.ceil(estimatedWeeks / 4)} months`;
  return `${Math.ceil(estimatedWeeks / 52 * 10) / 10} years`;
};

export const getScoreLabel = (score) => {
  if (score >= 80) return { label: "Excellent Match", color: "text-green-500" };
  if (score >= 60) return { label: "Good Match", color: "text-blue-500" };
  if (score >= 40) return { label: "Partial Match", color: "text-yellow-500" };
  if (score >= 20) return { label: "Weak Match", color: "text-orange-500" };
  return { label: "Poor Match", color: "text-red-500" };
};

export const getScoreProgressColor = (score) => {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-blue-500";
  if (score >= 40) return "bg-yellow-500";
  if (score >= 20) return "bg-orange-500";
  return "bg-red-500";
};

const extractSkillName = (s) =>
  typeof s === "string" ? s : s?.skill || s?.name || String(s);

export const groupSkillsByPriority = (prioritySkills = []) => {
  if (!Array.isArray(prioritySkills)) {
    return {
      high: (prioritySkills?.high || []).map(extractSkillName),
      medium: (prioritySkills?.medium || []).map(extractSkillName),
      low: (prioritySkills?.low || []).map(extractSkillName),
    };
  }
  return {
    high: prioritySkills.filter((s) => s.priority === "high").map(extractSkillName),
    medium: prioritySkills.filter((s) => s.priority === "medium").map(extractSkillName),
    low: prioritySkills.filter((s) => s.priority === "low").map(extractSkillName),
  };
};

export const deduplicateSkills = (skills = []) => {
  const seen = new Set();
  return skills.filter((skill) => {
    const normalized = normalizeSkill(skill);
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
};

export const parseGroqSkillGapResponse = (rawResponse) => {
  try {
    const parsed = typeof rawResponse === "string"
      ? JSON.parse(rawResponse)
      : rawResponse;

    return {
      matchScore: Math.min(100, Math.max(0, Number(parsed.matchScore) || 0)),
      missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
      prioritySkills: Array.isArray(parsed.prioritySkills) ? parsed.prioritySkills : [],
      roadmap: Array.isArray(parsed.roadmap) ? parsed.roadmap : [],
      courses: Array.isArray(parsed.courses) ? parsed.courses : [],
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      timeline: parsed.timeline || "3-6 months",
    };
  } catch (error) {
    console.error("parseGroqSkillGapResponse error:", error.message);
    return {
      matchScore: 0,
      missingSkills: [],
      prioritySkills: [],
      roadmap: [],
      courses: [],
      projects: [],
      timeline: "Unknown",
    };
  }
};
