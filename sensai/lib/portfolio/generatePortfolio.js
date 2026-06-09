import "server-only";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// ─────────────────────────────────────────────
// HELPER — safe JSON parse
// ─────────────────────────────────────────────
function safeParseJSON(raw) {
  const cleaned = raw
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/gi, "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, " ")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Try to extract JSON object from response
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    const match =
      start !== -1 && end !== -1 && end > start
        ? [cleaned.slice(start, end + 1)]
        : null;
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        throw new Error("AI returned invalid JSON. Please try again.");
      }
    }
    throw new Error("AI returned invalid JSON. Please try again.");
  }
}

// ─────────────────────────────────────────────
// HELPER — normalize generated data
// Ensures no null/undefined crashes in templates
// ─────────────────────────────────────────────
function normalizeGeneratedData(data) {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid portfolio data structure.");
  }

  // Hero section
  data.hero = data.hero || {};
  data.hero.name = data.hero.name || "";
  data.hero.title = data.hero.title || "";
  data.hero.tagline = data.hero.tagline || "";
  data.hero.summary = data.hero.summary || "";

  // About
  data.about = data.about || "";

  // Contact
  data.contact = data.contact || {};
  data.contact.email = data.contact.email || "";
  data.contact.phone = data.contact.phone || "";
  data.contact.linkedin = data.contact.linkedin || "";
  data.contact.github = data.contact.github || "";
  data.contact.twitter = data.contact.twitter || "";
  data.contact.portfolioUrl = data.contact.portfolioUrl || "";
  data.contact.leetcode = data.contact.leetcode || "";
  data.contact.hackerrank = data.contact.hackerrank || "";

  // Arrays — ensure they are valid arrays
  data.skills = Array.isArray(data.skills) ? data.skills : [];
  data.experience = Array.isArray(data.experience) ? data.experience : [];
  data.education = Array.isArray(data.education) ? data.education : [];
  data.projects = Array.isArray(data.projects) ? data.projects : [];
  data.certifications = Array.isArray(data.certifications)
    ? data.certifications
    : [];
  data.hobbies = Array.isArray(data.hobbies) ? data.hobbies : [];
  data.achievements = Array.isArray(data.achievements) ? data.achievements : [];

  // Normalize skills array
  data.skills = data.skills
    .filter((group) => typeof group === "object" && group !== null)
    .map((group) => ({
      category: group?.category || "General",
      skills: Array.isArray(group?.skills) ? group.skills.filter(Boolean) : [],
      proficiency: group?.proficiency || "",
    }));

  // Normalize experience array
  data.experience = data.experience.map((exp) => ({
    title: exp?.title || "",
    company: exp?.company || exp?.organization || "",
    location: exp?.location || "",
    startDate: exp?.startDate || "",
    endDate: exp?.endDate || "",
    current: exp?.current || false,
    description: exp?.description || "",
  }));

  // Normalize education array
  data.education = data.education.map((edu) => ({
    degree: edu?.degree || "",
    institution: edu?.institution || "",
    university: edu?.university || "",
    startDate: edu?.startDate || "",
    endDate: edu?.endDate || "",
    current: edu?.current || false,
    score: edu?.score || "",
    scoreType: edu?.scoreType || "CGPA",
    outOf: edu?.outOf || "4.0",
    description: edu?.description || "",
  }));

  // Normalize projects array
  data.projects = data.projects.map((proj) => ({
    title: proj?.title || "",
    description: proj?.description || "",
    techStack: Array.isArray(proj?.techStack)
      ? proj.techStack.filter(Boolean)
      : typeof proj?.techStack === "string"
        ? proj.techStack
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    github: proj?.github || "",
    liveUrl: proj?.liveUrl || proj?.liveDemo || proj?.live_url || "",
    startDate: proj?.startDate || "",
    endDate: proj?.endDate || "",
    current: proj?.current || false,
  }));

  // Normalize certifications array
  data.certifications = data.certifications.map((cert) => ({
    title: cert?.title || cert?.name || "",
    issuer: cert?.issuer || cert?.organization || "",
    date: cert?.date || cert?.issueDate || "",
    url: cert?.url || cert?.credentialUrl || "",
  }));

  // Normalize achievements array
  data.achievements = data.achievements.map((ach) => ({
    title: ach?.title || "",
    description: ach?.description || "",
  }));

  // Normalize hobbies — ensure all strings
  data.hobbies = data.hobbies
    .filter((h) => typeof h === "string")
    .map((h) => h.trim())
    .filter(Boolean);

  return data;
}

// ─────────────────────────────────────────────
// HELPER — retry Gemini on failure
// ─────────────────────────────────────────────
async function generateWithRetry(prompt, retries = 2) {
  let lastError;
  for (let i = 0; i <= retries; i++) {
    try {
      const result = await model.generateContent(prompt);
      if (!result?.response) {
        throw new Error("Empty Gemini response");
      }
      return result.response.text();
    } catch (error) {
      lastError = error;
      console.warn(`Gemini attempt ${i + 1} failed:`, error.message);
      if (i < retries) {
        // Wait before retry
        await new Promise((resolve) =>
          setTimeout(resolve, 2000 * Math.pow(2, i)),
        );
      }
    }
  }
  throw lastError;
}

// ─────────────────────────────────────────────
// MAIN EXPORT — Generate Portfolio JSON
// ─────────────────────────────────────────────
/**
 * Generates a complete portfolio JSON from user form data using Gemini AI
 * @param {Object} formData - User's portfolio form data
 * @returns {Promise<Object>} - Complete normalized portfolio JSON
 */
export async function generatePortfolioData(formData) {
  if (!formData || typeof formData !== "object" || Array.isArray(formData)) {
    throw new Error("Form data is required.");
  }

  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
  }

  const MAX_PROMPT_LENGTH = 12000;
  const formDataString = JSON.stringify(formData, null, 2);
  const truncatedFormData =
    formDataString.length > MAX_PROMPT_LENGTH
      ? formDataString.slice(0, MAX_PROMPT_LENGTH) + "\n...[truncated]"
      : formDataString;

  const prompt = `
You are an expert portfolio content writer and career coach.
Based on the following user data, generate a polished, professional, and complete portfolio JSON.

User Data:
${truncatedFormData}

Generate a JSON object with EXACTLY this structure (no extra fields, no missing fields):
{
  "hero": {
    "name": "Full name of the person",
    "title": "Professional title or role",
    "tagline": "Short punchy one-liner about the person (max 15 words)",
    "summary": "Compelling 3-4 sentence professional summary"
  },
  "about": "Engaging 2-3 paragraph about section",
  "skills": [
    {
      "category": "Category name (e.g. Frontend, Backend)",
      "skills": ["skill1", "skill2"],
      "proficiency": "Advanced"
    }
  ],
  "experience": [
    {
      "title": "Job title",
      "company": "Company name",
      "location": "City, Country",
      "startDate": "Month Year",
      "endDate": "Month Year",
      "current": false,
      "description": "2-3 impactful sentences about achievements"
    }
  ],
  "education": [
    {
      "degree": "Degree name",
      "institution": "Institution name",
      "university": "Parent university if any",
      "startDate": "Month Year",
      "endDate": "Month Year",
      "current": false,
      "score": "3.8",
      "scoreType": "CGPA",
      "outOf": "4.0",
      "description": "Optional description"
    }
  ],
  "projects": [
    {
      "title": "Project title",
      "description": "2-3 impactful sentences",
      "techStack": ["React", "Node.js"],
      "github": "https://github.com/...",
      "liveUrl": "https://...",
      "startDate": "Month Year",
      "endDate": "Month Year",
      "current": false
    }
  ],
  "certifications": [
    {
      "title": "Certificate name",
      "issuer": "Issuing organization",
      "date": "Month Year",
      "url": "https://..."
    }
  ],
  "hobbies": ["hobby1", "hobby2"],
  "achievements": [
    {
      "title": "Achievement title",
      "description": "Brief description"
    }
  ],
  "contact": {
    "email": "",
    "phone": "",
    "linkedin": "",
    "github": "",
    "twitter": "",
    "portfolioUrl": "",
    "leetcode": "",
    "hackerrank": ""
  }
}

CRITICAL RULES:
1. hero.name — use the exact name from the input data
2. hero.tagline — create a short, memorable one-liner (not a full sentence)
3. hero.summary — make it powerful, avoid "I" pronoun, use active voice
4. about — write in third person, highlight achievements and personality
5. skills — group into logical categories, keep skills as individual strings in array
6. experience — enhance descriptions with action verbs and metrics
7. projects — make descriptions impactful, list tech as clean string array
8. certifications — only include if provided in input
9. achievements — only include if provided in input
10. hobbies — keep as simple string array
11. contact — copy exact values from input, do NOT fabricate URLs
12. All date formats: "Month Year" (e.g. "Jan 2022") or empty string ""
13. For current roles: current: true, endDate: ""
14. techStack must be an ARRAY of strings, NOT a comma-separated string
15. Return ONLY the JSON object — absolutely no markdown, no code blocks, no extra text
16. NEVER invent data that was not provided — only enhance what exists
`.trim();

  let raw;
  try {
    raw = await generateWithRetry(prompt);
  } catch (error) {
    console.error("Gemini API error:", error);

    if (error.message?.includes("429") || error.message?.includes("quota")) {
      throw new Error("AI usage limit exceeded. Please try again later.");
    }

    if (error.message?.includes("API_KEY_INVALID")) {
      throw new Error("Invalid Gemini API key.");
    }

    throw new Error(error.message || "AI generation failed. Please try again.");
  }

  if (!raw || !raw.trim()) {
    throw new Error("AI returned empty response. Please try again.");
  }

  let parsed;
  try {
    parsed = safeParseJSON(raw);
  } catch (parseError) {
    console.error("JSON parse error:", parseError);
    if (process.env.NODE_ENV === "development") {
      console.error("Raw response:", raw.slice(0, 500));
    }
    throw new Error("AI returned invalid data format. Please try again.");
  }

  // Normalize and return
  try {
    return normalizeGeneratedData(parsed);
  } catch (normalizeError) {
    console.error("Normalize error:", normalizeError);
    throw new Error("Failed to process AI response. Please try again.");
  }
}
