import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateWithFallbackChain } from "@/lib/ai-providers";

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobDescription } = await request.json();

    if (!jobDescription || !jobDescription.trim()) {
      return NextResponse.json(
        { error: "jobDescription is required" },
        { status: 400 }
      );
    }

    // Response shape must match what JobAnalysisPanel.jsx expects:
    // requiredSkills[], preferredSkills[], keyResponsibilities[],
    // companyCulture (string), experienceLevel (string), keywords[],
    // summary (string), recommendations[].
    const prompt = `Analyze the following job description and extract structured information.

Job Description:
${jobDescription}

Return ONLY a valid JSON object (no markdown, no code fences, no commentary) with exactly this shape:
{
  "summary": "a 2-3 sentence plain-language summary of the role",
  "experienceLevel": "e.g. Entry-level, Mid-level, Senior, Lead/Principal",
  "requiredSkills": ["skill1", "skill2", ...],
  "preferredSkills": ["skill1", "skill2", ...],
  "keywords": ["ATS-relevant keyword1", "keyword2", ...],
  "keyResponsibilities": ["responsibility1", "responsibility2", ...],
  "companyCulture": "a short paragraph inferring the company culture/values from the listing's tone and content",
  "recommendations": ["actionable tip1 for tailoring a cover letter to this role", "tip2", ...]
}

Keep each array to a reasonable length (3-8 items). If the job description doesn't mention something (e.g. company culture), make a brief reasonable inference rather than leaving it empty, but do not fabricate specific facts not implied by the text.`;

    // Uses the same DeepSeek → Groq → Gemini → template fallback chain
    // as cover letter generation, instead of being Gemini-only. The
    // template fallback here just won't be useful for JSON-shaped
    // analysis (see fields=null below), so a template-fallback result
    // is treated as a failure for this endpoint specifically — partial
    // analysis isn't better than no analysis, and the panel already
    // handles "no analysis yet" gracefully.
    const { content: rawText, providerUsed } = await generateWithFallbackChain(
      prompt,
      null // no template fallback fields — see note below
    );

    if (providerUsed === "template") {
      // generateWithFallbackChain's template fallback is built for
      // cover letter prose, not structured JSON analysis, and was
      // called with fields=null here, so it would throw or produce
      // garbage. Treat this as "all real providers failed."
      return NextResponse.json(
        { error: "AI providers are temporarily unavailable. Please try again in a moment." },
        { status: 503 }
      );
    }

    // Strip any accidental markdown code fences before parsing
    const cleaned = rawText.replace(/```json|```/g, "").trim();

    let analysis;
    try {
      analysis = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("Failed to parse job analysis JSON:", parseErr, rawText);
      return NextResponse.json(
        { error: "Failed to parse analysis result" },
        { status: 502 }
      );
    }

    return NextResponse.json(analysis);
  } catch (err) {
    console.error("Job analysis error:", err);
    return NextResponse.json(
      { error: "Failed to analyze job description." },
      { status: 500 }
    );
  }
}