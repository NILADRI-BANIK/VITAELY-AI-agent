import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateEmail({
  prompt,
  tone,
  length,
  purpose,
  recipientName,
  companyName,
  jobRole,
  skills,
  signature,
}) {
  try {
    // ── Validate API Key ──────────────────────────────────────────────
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set in environment variables.");
    }

    // ── Length Instructions ───────────────────────────────────────────
    const lengthGuide = {
      Short: "Keep the email concise — 3 to 5 sentences maximum.",
      Medium: "Write a balanced email — 2 to 3 short paragraphs.",
      Long: "Write a detailed email — 4 to 5 well-structured paragraphs.",
    };

    // ── Build Dynamic Prompt ──────────────────────────────────────────
    const fullPrompt = `
You are a professional email writing assistant.

Write a ${tone} email for the following purpose: ${purpose}.

${lengthGuide[length] || lengthGuide["Medium"]}

Details:
${recipientName ? `- Recipient Name: ${recipientName}` : ""}
${companyName ? `- Company Name: ${companyName}` : ""}
${jobRole ? `- Job Role: ${jobRole}` : ""}
${skills ? `- Skills: ${skills}` : ""}
${signature ? `- Sender Name / Signature: ${signature}` : ""}

User Request:
${prompt}

IMPORTANT INSTRUCTIONS:
- Start with: Subject: [your subject line]
- Then write the full email below the subject line.
- Include a proper greeting, body, and closing.
- Use "${signature || "Regards"}" as the sign-off name.
- Do NOT add any explanation, notes, or commentary outside the email.
- Do NOT use markdown formatting like ** or ## — plain text only.
- Output only the email content, nothing else.
`.trim();

    // ── Call Gemini API ───────────────────────────────────────────────
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    if (!text || !text.trim()) {
      throw new Error("Gemini returned an empty response. Please try again.");
    }

    return text.trim();

  } catch (error) {
    // ── Handle Gemini-specific errors ─────────────────────────────────
    if (error.message?.includes("API_KEY_INVALID")) {
      throw new Error("Invalid Gemini API key. Please check your environment variables.");
    }

    if (error.message?.includes("SAFETY")) {
      throw new Error("Email could not be generated due to content safety restrictions. Please modify your prompt.");
    }

    if (error.message?.includes("quota") || error.message?.includes("RESOURCE_EXHAUSTED")) {
      throw new Error("Gemini API quota exceeded. Please try again later.");
    }

    // Re-throw original error for all other cases
    throw new Error(error.message || "Failed to generate email using Gemini.");
  }
}