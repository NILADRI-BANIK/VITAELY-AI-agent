// SKILL_GAP_SYSTEM_PROMPT
// buildSkillGapPrompt
// buildAdzunaSearchQuery
// EXPERIENCE_LABELS
// PRIORITY_COLORS
// MAX_SKILLS_INPUT
// MIN_SKILLS_INPUT
// MAX_ROLE_LENGTH

export const SKILL_GAP_SYSTEM_PROMPT = `You are a strict technical hiring manager and career coach. Your job is to identify EVERY skill gap between a candidate's current skills and what is truly required for their target role.

CRITICAL RULES you must ALWAYS follow:
1. You MUST return valid JSON only. No markdown. No explanation. No extra text.
2. missingSkills MUST contain every technical skill a ${"{targetRole}"} needs that is NOT in the candidate's current skills list.
3. Having only 2-3 skills for a technical role ALWAYS means there are missing skills. Return them ALL.
4. Experience level affects matchScore slightly but NEVER reduces or empties missingSkills.
5. Be exhaustive — list 5 to 15 missing skills for any technical role where the candidate has fewer than 10 current skills.
6. Never return an empty missingSkills array for a technical role unless the candidate lists 15+ directly relevant skills.`;

export const buildSkillGapPrompt = (targetRole, currentSkills, experience) => `
You are evaluating a candidate for the role of: ${targetRole}
Experience Level: ${experience}
Current Skills (${currentSkills.length} total): ${currentSkills.join(", ")}

STEP 1 — List every core technical skill required for a ${targetRole} in the industry today.
STEP 2 — Remove any skill already present in: ${currentSkills.join(", ")}
STEP 3 — Everything remaining goes into missingSkills. This list should have at least 5 items for most technical roles.
STEP 4 — Score matchScore as: (currentSkills that match required / total required) * 100

STRICT ENFORCEMENT:
- If currentSkills has fewer than 8 items for a ${targetRole}, missingSkills MUST have at least 6 items.
- Do NOT treat high experience as a substitute for missing skills.
- Do NOT return empty missingSkills for roles like developer, analyst, engineer, designer, or scientist.

Return ONLY this JSON structure, no other text:
{
  "matchScore": <number 0-100, calculated strictly by skill overlap>,
  "missingSkills": [<string — at least 5 specific technical skill names>],
  "prioritySkills": [
    {
      "skill": <string>,
      "priority": <"high" | "medium" | "low">,
      "reason": <string — one sentence>
    }
  ],
  "roadmap": [
    {
      "step": <number>,
      "title": <string>,
      "description": <string>,
      "duration": <string e.g. "2 months">,
      "resources": [<string>]
    }
  ],
  "courses": [
    {
      "title": <string>,
      "platform": <string>,
      "url": <string>,
      "duration": <string>,
      "level": <string>
    }
  ],
  "projects": [
    {
      "title": <string>,
      "description": <string>,
      "skills": [<string>],
      "difficulty": <"beginner" | "intermediate" | "advanced">
    }
  ],
  "timeline": <string e.g. "4-6 months">
}`;

export const buildAdzunaSearchQuery = (targetRole) =>
  `${targetRole} required skills`;

export const EXPERIENCE_LABELS = {
  beginner: "Beginner (0-1 years)",
  intermediate: "Intermediate (2-4 years)",
  advanced: "Advanced (5+ years)",
};

export const PRIORITY_COLORS = {
  high: "destructive",
  medium: "warning",
  low: "secondary",
};

export const MAX_SKILLS_INPUT = 30;
export const MIN_SKILLS_INPUT = 1;
export const MAX_ROLE_LENGTH = 100;