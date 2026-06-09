import "server-only";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not configured.");
}
// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_TEXT_LENGTH = 15000; // Gemini token limit safety

// ─────────────────────────────────────────────
// HELPER — safe JSON parse with fallback
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
    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        throw new Error("AI returned invalid JSON. Please try again.");
      }
    }
    throw new Error("AI returned invalid JSON. Please try again.");
  }
}

// ─────────────────────────────────────────────
// HELPER — normalize parsed resume data
// Prevents null/undefined crashes on frontend
// ─────────────────────────────────────────────
function normalizeParsedResume(data) {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid parsed resume structure.");
  }

  // Basic Info
  data.basicInfo = data.basicInfo || {};
  data.basicInfo.fullName = data.basicInfo.fullName || "";
  data.basicInfo.professionalTitle = data.basicInfo.professionalTitle || "";
  data.basicInfo.summary = data.basicInfo.summary || "";

  // Contact
  data.contact = data.contact || {};
  data.contact.email = data.contact.email || "";
  data.contact.phone = data.contact.phone || "";
  data.contact.address = data.contact.address || "";
  data.contact.linkedin = data.contact.linkedin || "";
  data.contact.github = data.contact.github || "";
  data.contact.twitter = data.contact.twitter || "";
  data.contact.portfolioUrl = data.contact.portfolioUrl || "";
  data.contact.leetcode = data.contact.leetcode || "";
  data.contact.hackerrank = data.contact.hackerrank || "";
  data.contact.codeforces = data.contact.codeforces || "";

  // Arrays
  data.skills = Array.isArray(data.skills) ? data.skills : [];
  data.hobbies = Array.isArray(data.hobbies) ? data.hobbies : [];
  data.experience = Array.isArray(data.experience) ? data.experience : [];
  data.education = Array.isArray(data.education) ? data.education : [];
  data.projects = Array.isArray(data.projects) ? data.projects : [];
  data.certifications = Array.isArray(data.certifications)
    ? data.certifications
    : [];
  data.achievements = Array.isArray(data.achievements) ? data.achievements : [];

  // Normalize skills
  data.skills = data.skills
    .filter((group) => typeof group === "object" && group !== null)
    .map((group) => ({
      category: group?.category || "General",
      skills: Array.isArray(group?.skills) ? group.skills.filter(Boolean) : [],
      proficiency: group?.proficiency || "",
    }));

  // Normalize experience
  data.experience = data.experience.map((exp) => ({
    title: exp?.title || "",
    organization: exp?.organization || exp?.company || "",
    location: exp?.location || "",
    startDate: exp?.startDate || "",
    endDate: exp?.endDate || "",
    current: exp?.current || false,
    description: exp?.description || "",
  }));

  // Normalize education
  data.education = data.education.map((edu) => ({
    degree: edu?.degree || "",
    institution: edu?.institution || "",
    university: edu?.university || "",
    startDate: edu?.startDate || "",
    endDate: edu?.endDate || "",
    current: edu?.current || false,
    scoreType: edu?.scoreType || "CGPA",
    score: edu?.score || "",
    outOf: edu?.outOf || "4.0",
    description: edu?.description || "",
  }));

  // Normalize projects
  data.projects = data.projects.map((proj) => ({
    title: proj?.title || "",
    techStack: Array.isArray(proj?.techStack)
      ? proj.techStack.filter(Boolean)
      : typeof proj?.techStack === "string"
        ? proj.techStack
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    organization: proj?.organization || "",
    github: proj?.github || "",
    liveUrl: proj?.liveUrl || proj?.liveDemo || proj?.live_url || "",
    startDate: proj?.startDate || "",
    endDate: proj?.endDate || "",
    current: proj?.current || false,
    description: proj?.description || "",
  }));

  // Normalize certifications
  data.certifications = data.certifications.map((cert) => ({
    name: cert?.name || cert?.title || "",
    organization: cert?.organization || cert?.issuer || "",
    issueDate: cert?.issueDate || cert?.date || "",
    credentialUrl: cert?.credentialUrl || cert?.url || "",
  }));

  // Normalize achievements
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
        await new Promise((resolve) =>
          setTimeout(resolve, 2000 * Math.pow(2, i)),
        );
      }
    }
  }
  throw lastError;
}

// ─────────────────────────────────────────────
// HELPER — extract text from PDF buffer
// ─────────────────────────────────────────────
async function extractPDFText(buffer) {
  try {
    const pdfParse = (await import("pdf-parse")).default;
    const pdfData = await pdfParse(buffer, { max: 10 });
    return pdfData.text?.trim() || "";
  } catch (error) {
    console.error("PDF parse error:", error);
    throw new Error(
      "Failed to read PDF. Make sure it is a valid, non-encrypted PDF.",
    );
  }
}

// ─────────────────────────────────────────────
// HELPER — extract text from DOCX buffer
// ─────────────────────────────────────────────
async function extractDOCXText(buffer) {
  try {
    const mammoth = (await import("mammoth")).default;
    const result = await mammoth.extractRawText({ buffer });
    return result.value?.trim() || "";
  } catch (error) {
    console.error("DOCX parse error:", error);
    throw new Error(
      "Failed to read DOCX. Make sure it is a valid Word document.",
    );
  }
}

// ─────────────────────────────────────────────
// MAIN EXPORT — Parse Resume File
// ─────────────────────────────────────────────
/**
 * Parses a resume file (PDF or DOCX) and extracts structured portfolio data
 * @param {Buffer} buffer    - File buffer
 * @param {string} fileType  - "pdf" or "docx"
 * @param {number} fileSize  - File size in bytes
 * @returns {Promise<Object>} - Structured parsed resume data
 */
export async function parseResumeFile(buffer, fileType, fileSize) {
  // ── Validate inputs ────────────────────────
  if (!buffer) {
    throw new Error("No file buffer provided.");
  }

  if (!["pdf", "docx"].includes(fileType)) {
    throw new Error("Only PDF and DOCX files are supported.");
  }

  if (fileSize > MAX_FILE_SIZE) {
    throw new Error("File size must be less than 10MB.");
  }

  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
  }

  // ── Extract text ───────────────────────────
  let extractedText = "";

  if (fileType === "pdf") {
    extractedText = await extractPDFText(buffer);
  } else if (fileType === "docx") {
    extractedText = await extractDOCXText(buffer);
  }

  // ── Validate extracted text ────────────────
  if (!extractedText || extractedText.length < 50) {
    throw new Error(
      "Could not extract text from this file. It may be image-based or scanned. Please use a text-based PDF or DOCX.",
    );
  }

  // ── Trim to token limit ────────────────────
  const trimmedText =
    extractedText.length > MAX_TEXT_LENGTH
      ? extractedText.slice(0, MAX_TEXT_LENGTH)
      : extractedText;

  const PROMPT_SAFE_LENGTH = 12000;
  const safeText =
    trimmedText.length > PROMPT_SAFE_LENGTH
      ? trimmedText.slice(0, PROMPT_SAFE_LENGTH)
      : trimmedText;

  // ── Build Gemini prompt ────────────────────
  const prompt = `
You are an expert resume parser for a portfolio website generator.

Extract all information from the resume text below and return ONLY a valid JSON object.
No explanation. No markdown. No code block. Just raw JSON.

The JSON must follow EXACTLY this structure:
{
  "basicInfo": {
    "fullName": "",
    "professionalTitle": "",
    "summary": ""
  },
  "contact": {
    "email": "",
    "phone": "",
    "address": "",
    "linkedin": "",
    "github": "",
    "twitter": "",
    "portfolioUrl": "",
    "leetcode": "",
    "hackerrank": "",
    "codeforces": ""
  },
  "skills": [
    {
      "category": "",
      "skills": [],
      "proficiency": ""
    }
  ],
  "hobbies": [],
  "experience": [
    {
      "title": "",
      "organization": "",
      "location": "",
      "startDate": "",
      "endDate": "",
      "current": false,
      "description": ""
    }
  ],
  "education": [
    {
      "degree": "",
      "institution": "",
      "university": "",
      "startDate": "",
      "endDate": "",
      "current": false,
      "scoreType": "CGPA",
      "score": "",
      "outOf": "4.0",
      "description": ""
    }
  ],
  "projects": [
    {
      "title": "",
      "techStack": [],
      "organization": "",
      "github": "",
      "liveUrl": "",
      "startDate": "",
      "endDate": "",
      "current": false,
      "description": ""
    }
  ],
  "certifications": [
    {
      "name": "",
      "organization": "",
      "issueDate": "",
      "credentialUrl": ""
    }
  ],
  "achievements": [
    {
      "title": "",
      "description": ""
    }
  ]
}

EXTRACTION RULES:
1. basicInfo.professionalTitle — detect from resume context (e.g. "Full Stack Developer")
2. basicInfo.summary — extract or professionally rephrase existing summary (3-5 sentences, no "I")
3. skills — group into: Frontend, Backend, Programming Languages, Tools & DevOps, Databases, Design, Soft Skills
4. skills[].proficiency — detect as "Beginner", "Intermediate", "Advanced", or "Expert" from context
5. skills[].skills — must be an ARRAY of individual skill strings
6. hobbies — extract if found, otherwise return []
7. experience[].location — extract city/country if mentioned
8. education[].university — extract parent university name if different from institution
9. education[].scoreType — detect "CGPA" or "Percentage" from context
10. projects[].techStack — extract as ARRAY of technology names (NOT comma string)
11. achievements — extract hackathons, awards, contest ranks, publications if any
12. For dates use format "Jan 2022" or "2022" — NEVER invent dates
13. For current roles: current: true, endDate: ""
14. All URLs must be full URLs (https://...) — NEVER fabricate URLs
15. If a field is not found: use "" or []
16. Return ONLY the JSON object — no markdown, no explanation
17. NEVER invent or fabricate data — only extract what exists in the resume
18. NEVER fabricate companies, URLs, GitHub links, projects, or achievements
19. You may professionally rephrase summary text but do not invent facts

Resume text:
"""
${safeText}
"""
  `.trim();

  // ── Call Gemini ────────────────────────────
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

    if (
      error.message?.includes("503") ||
      error.message?.includes("Service Unavailable") ||
      error.status === 503
    ) {
      throw new Error(
        "Gemini AI is temporarily unavailable. Please try again in a moment.",
      );
    }

    throw new Error(
      "AI failed to parse the resume. Please try again or fill the form manually.",
    );
  }

  if (!raw || !raw.trim()) {
    throw new Error("AI returned empty response. Please try again.");
  }

  // ── Parse JSON ─────────────────────────────
  let parsed;
  try {
    parsed = safeParseJSON(raw);
  } catch (parseError) {
    console.error("JSON parse error:", parseError);
    if (process.env.NODE_ENV === "development") {
      console.error("Raw response preview:", raw.slice(0, 500));
    }
    throw new Error(
      "AI returned invalid data. Please try again or fill the form manually.",
    );
  }

  // ── Validate minimum data ──────────────────
  const hasName = parsed?.basicInfo?.fullName?.trim();
  const hasEmail = parsed?.contact?.email?.trim();

  if (!hasName && !hasEmail) {
    throw new Error(
      "Could not find contact information in the resume. Please check the file and try again.",
    );
  }

  // ── Normalize and return ───────────────────
  try {
    return normalizeParsedResume(parsed);
  } catch (normalizeError) {
    console.error("Normalize error:", normalizeError);
    throw new Error("Failed to process resume data. Please try again.");
  }
}

// ─────────────────────────────────────────────
// EXPORT — detect file type from File object
// Utility for API routes
// ─────────────────────────────────────────────
/**
 * Detects file type from a File/Blob object
 * @param {File} file
 * @returns {"pdf"|"docx"|null}
 */
export function detectFileType(file) {
  if (!file) return null;

  const name = file.name?.toLowerCase() || "";
  const type = file.type || "";

  if (type === "application/pdf" || name.endsWith(".pdf")) return "pdf";

  if (
    type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    name.endsWith(".docx")
  ) {
    return "docx";
  }

  return null;
}
