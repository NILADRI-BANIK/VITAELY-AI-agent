import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Analyzes a resume using Gemini AI and returns ATS score + feedback
 * @param {string} resumeText - Extracted plain text from resume
 * @param {string} jobDescription - Optional job description to match against
 * @returns {Promise<Object>} - ATS analysis result
 */
export async function analyzeResumeWithGemini(resumeText, jobDescription = "") {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const hasJobDescription =
      jobDescription && jobDescription.trim().length > 0;

    const prompt = `
You are an expert ATS (Applicant Tracking System) analyzer and career coach.
Analyze the following resume${hasJobDescription ? " against the provided job description" : ""} and return a detailed ATS analysis.

RESUME TEXT:
"""
${resumeText}
"""

${hasJobDescription ? `JOB DESCRIPTION:\n"""\n${jobDescription}\n"""` : ""}

Analyze the resume and respond ONLY with a valid JSON object in this exact format (no markdown, no backticks, no extra text):

{
  "atsScore": <number between 0 and 100>,
  "feedback": "<2-3 sentence overall feedback about the resume quality and ATS compatibility>",
  "suggestions": [
    "<specific actionable improvement suggestion 1>",
    "<specific actionable improvement suggestion 2>",
    "<specific actionable improvement suggestion 3>",
    "<specific actionable improvement suggestion 4>",
    "<specific actionable improvement suggestion 5>"
  ],
  "keywords": [
    "<important keyword found in resume 1>",
    "<important keyword found in resume 2>",
    "<important keyword found in resume 3>",
    "<important keyword found in resume 4>",
    "<important keyword found in resume 5>"
  ],
  "missingKeywords": [
    "<important keyword missing from resume 1>",
    "<important keyword missing from resume 2>",
    "<important keyword missing from resume 3>"
  ]
}

Scoring Guide:
- 90-100: Excellent ATS compatibility, strong keywords, well-formatted
- 70-89: Good resume with minor improvements needed
- 50-69: Average resume, several improvements required
- 30-49: Below average, significant improvements needed
- 0-29: Poor ATS compatibility, major overhaul required

Important rules:
- atsScore must be a number (not a string)
- suggestions must have exactly 5 items
- keywords must have exactly 5 items
- missingKeywords must have 3 items${hasJobDescription ? " based on the job description" : " based on common industry standards"}
- feedback must be a single string (not an array)
- Return ONLY the JSON object, nothing else
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean response — remove markdown code blocks if present
    const cleaned = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    // Parse JSON safely
    let analysis;
    try {
      analysis = JSON.parse(cleaned);
    } catch (parseError) {
      console.error("Gemini response parse error:", parseError);
      console.error("Raw Gemini response:", text);
      throw new Error("Failed to parse AI response. Please try again.");
    }

    // Validate and sanitize response fields
    const atsScore = Math.min(100, Math.max(0, Number(analysis.atsScore) || 0));

    const feedback =
      typeof analysis.feedback === "string"
        ? analysis.feedback
        : "Resume analyzed successfully.";

    const suggestions = Array.isArray(analysis.suggestions)
      ? analysis.suggestions.filter((s) => typeof s === "string").slice(0, 5)
      : [];

    const keywords = Array.isArray(analysis.keywords)
      ? analysis.keywords.filter((k) => typeof k === "string").slice(0, 5)
      : [];

    const missingKeywords = Array.isArray(analysis.missingKeywords)
      ? analysis.missingKeywords
          .filter((k) => typeof k === "string")
          .slice(0, 3)
      : [];

    return {
      atsScore,
      feedback,
      suggestions,
      keywords,
      missingKeywords,
    };
  } catch (error) {
    console.error("Gemini ATS analysis error:", error);
    throw new Error(error.message || "AI analysis failed. Please try again.");
  }
}
