import "server-only";
import { generateWithRetry } from "./deepseekClient";

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is not configured.");
}

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_TEXT_LENGTH = 15000; // token limit safety

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
// HELPER — regex fallback extraction
// Safety net for when the AI omits basicInfo/contact fields
// (observed: some models inconsistently drop top-level fields
// on long structured-extraction prompts even though they reliably
// extract array sections like education/experience). This never
// overrides a value the AI DID provide — it only fills gaps.
// ─────────────────────────────────────────────
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_REGEX =
  /(\+?\d{1,3}[\s.-]?)?\(?\d{3,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/;

function extractFallbackBasics(text) {
  const fallback = { fullName: "", email: "", phone: "" };
  if (!text) return fallback;

  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const emailMatch = text.match(EMAIL_REGEX);
  if (emailMatch) fallback.email = emailMatch[0];

  const phoneMatch = text.match(PHONE_REGEX);
  if (phoneMatch && phoneMatch[0].replace(/\D/g, "").length >= 7) {
    fallback.phone = phoneMatch[0].trim();
  }

  // Name — heuristic: first non-empty line that isn't an email/phone/URL
  // and looks like "First Last" (2-4 words, mostly letters).
  for (const line of lines.slice(0, 5)) {
    if (EMAIL_REGEX.test(line)) continue;
    if (PHONE_REGEX.test(line) && line.replace(/\D/g, "").length >= 7) continue;
    if (/https?:\/\//i.test(line)) continue;
    if (line.length > 60) continue;

    const words = line.split(/\s+/).filter(Boolean);
    if (words.length >= 2 && words.length <= 4) {
      const looksLikeName = words.every((w) =>
        /^[A-Za-z][A-Za-z.'-]*$/.test(w),
      );
      if (looksLikeName) {
        fallback.fullName = line;
        break;
      }
    }
  }

  return fallback;
}

// ─────────────────────────────────────────────
// HELPER — normalize parsed resume data
// ─────────────────────────────────────────────
function normalizeParsedResume(data, sourceText) {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid parsed resume structure.");
  }

  data.basicInfo = data.basicInfo || {};
  data.basicInfo.fullName = data.basicInfo.fullName || "";
  data.basicInfo.professionalTitle = data.basicInfo.professionalTitle || "";
  data.basicInfo.summary = data.basicInfo.summary || "";

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

  // Regex fallback — only fills genuinely empty fields, never overwrites
  // anything the AI actually extracted.
  const fallback = extractFallbackBasics(sourceText);
  if (!data.basicInfo.fullName && fallback.fullName) {
    data.basicInfo.fullName = fallback.fullName;
  }
  if (!data.contact.email && fallback.email) {
    data.contact.email = fallback.email;
  }
  if (!data.contact.phone && fallback.phone) {
    data.contact.phone = fallback.phone;
  }

  data.skills = Array.isArray(data.skills) ? data.skills : [];
  data.hobbies = Array.isArray(data.hobbies) ? data.hobbies : [];
  data.experience = Array.isArray(data.experience) ? data.experience : [];
  data.education = Array.isArray(data.education) ? data.education : [];
  data.projects = Array.isArray(data.projects) ? data.projects : [];
  data.certifications = Array.isArray(data.certifications)
    ? data.certifications
    : [];
  data.achievements = Array.isArray(data.achievements) ? data.achievements : [];

  data.skills = data.skills
    .filter((group) => typeof group === "object" && group !== null)
    .map((group) => ({
      category: group?.category || "General",
      skills: Array.isArray(group?.skills) ? group.skills.filter(Boolean) : [],
      proficiency: group?.proficiency || "",
    }));

  data.experience = data.experience.map((exp) => ({
    title: exp?.title || "",
    organization: exp?.organization || exp?.company || "",
    location: exp?.location || "",
    startDate: exp?.startDate || "",
    endDate: exp?.endDate || "",
    current: exp?.current || false,
    description: exp?.description || "",
  }));

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

  data.certifications = data.certifications.map((cert) => ({
    name: cert?.name || cert?.title || "",
    organization: cert?.organization || cert?.issuer || "",
    issueDate: cert?.issueDate || cert?.date || "",
    credentialUrl: cert?.credentialUrl || cert?.url || "",
  }));

  data.achievements = data.achievements.map((ach) => ({
    title: ach?.title || "",
    description: ach?.description || "",
  }));

  data.hobbies = data.hobbies
    .filter((h) => typeof h === "string")
    .map((h) => h.trim())
    .filter(Boolean);

  return data;
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
export async function parseResumeFile(buffer, fileType, fileSize) {
  if (!buffer) {
    throw new Error("No file buffer provided.");
  }

  if (!["pdf", "docx"].includes(fileType)) {
    throw new Error("Only PDF and DOCX files are supported.");
  }

  if (fileSize > MAX_FILE_SIZE) {
    throw new Error("File size must be less than 10MB.");
  }

  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set in environment variables.");
  }

  let extractedText = "";

  if (fileType === "pdf") {
    extractedText = await extractPDFText(buffer);
  } else if (fileType === "docx") {
    extractedText = await extractDOCXText(buffer);
  }

  if (!extractedText || extractedText.length < 50) {
    throw new Error(
      "Could not extract text from this file. It may be image-based or scanned. Please use a text-based PDF or DOCX.",
    );
  }

  const trimmedText =
    extractedText.length > MAX_TEXT_LENGTH
      ? extractedText.slice(0, MAX_TEXT_LENGTH)
      : extractedText;

  const PROMPT_SAFE_LENGTH = 12000;
  const safeText =
    trimmedText.length > PROMPT_SAFE_LENGTH
      ? trimmedText.slice(0, PROMPT_SAFE_LENGTH)
      : trimmedText;

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

CRITICAL — READ CAREFULLY:
1. basicInfo.fullName is MANDATORY. The candidate's full name almost always
   appears as the very first line or largest text at the top of the resume,
   before any contact details. You MUST locate and extract it. Do NOT leave
   basicInfo.fullName empty unless the text truly contains no name anywhere.
2. contact.email and contact.phone are also high priority — scan the entire
   text for an email address (contains "@") and a phone number (digit
   sequence, often near the top or in a header/footer).
3. basicInfo.professionalTitle — detect from resume context (e.g. "Full Stack Developer")
4. basicInfo.summary — extract or professionally rephrase existing summary (3-5 sentences, no "I")
5. skills — group into: Frontend, Backend, Programming Languages, Tools & DevOps, Databases, Design, Soft Skills
6. skills[].proficiency — detect as "Beginner", "Intermediate", "Advanced", or "Expert" from context
7. skills[].skills — must be an ARRAY of individual skill strings
8. hobbies — extract if found, otherwise return []
9. experience[].location — extract city/country if mentioned
10. education[].university — extract parent university name if different from institution
11. education[].scoreType — detect "CGPA" or "Percentage" from context
12. projects[].techStack — extract as ARRAY of technology names (NOT comma string)
13. achievements — extract hackathons, awards, contest ranks, publications if any
14. For dates use format "Jan 2022" or "2022" — NEVER invent dates
15. For current roles: current: true, endDate: ""
16. All URLs must be full URLs (https://...) — NEVER fabricate URLs
17. If a field is not found: use "" or []
18. Return ONLY the JSON object — no markdown, no explanation
19. NEVER invent or fabricate data — only extract what exists in the resume
20. NEVER fabricate companies, URLs, GitHub links, projects, or achievements
21. You may professionally rephrase summary text but do not invent facts
22. FINAL CHECK before responding: confirm basicInfo.fullName, contact.email,
    and basicInfo.professionalTitle are populated if that information exists
    anywhere in the resume text below.

Resume text:
"""
${safeText}
"""
  `.trim();

  let raw;
  try {
    // Lower temperature for structured extraction — this is a rigid
    // JSON-extraction task, not creative writing, so we want the model
    // to be as literal/deterministic as possible about which fields to
    // include, rather than the default 0.7 tuned for prose generation.
    raw = await generateWithRetry(prompt, 2, 0.1);
  } catch (error) {
    console.error("DeepSeek API error:", error);

    if (error.message?.includes("429") || error.message?.includes("quota")) {
      throw new Error("AI usage limit exceeded. Please try again later.");
    }

    if (error.message?.includes("API_KEY_INVALID")) {
      throw new Error("Invalid DeepSeek API key.");
    }

    if (
      error.message?.includes("503") ||
      error.message?.includes("Service Unavailable") ||
      error.status === 503
    ) {
      throw new Error(
        "DeepSeek AI is temporarily unavailable. Please try again in a moment.",
      );
    }

    throw new Error(
      "AI failed to parse the resume. Please try again or fill the form manually.",
    );
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
      console.error("Raw response preview:", raw.slice(0, 500));
    }
    throw new Error(
      "AI returned invalid data. Please try again or fill the form manually.",
    );
  }

  // Normalize (includes regex fallback for basicInfo/contact gaps)
  let normalized;
  try {
    normalized = normalizeParsedResume(parsed, safeText);
  } catch (normalizeError) {
    console.error("Normalize error:", normalizeError);
    throw new Error("Failed to process resume data. Please try again.");
  }

  const hasName = normalized?.basicInfo?.fullName?.trim();
  const hasEmail = normalized?.contact?.email?.trim();

  if (!hasName && !hasEmail) {
    throw new Error(
      "Could not find contact information in the resume. Please check the file and try again.",
    );
  }

  return normalized;
}

// ─────────────────────────────────────────────
// EXPORT — detect file type from File object
// ─────────────────────────────────────────────
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
