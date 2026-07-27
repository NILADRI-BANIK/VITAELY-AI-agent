import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function POST(request) {
  try {
    // ── 1. Auth check ──────────────────────────────────────────────
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ── 2. Read uploaded file ──────────────────────────────────────
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // ── 3. Validate file type ──────────────────────────────────────
    const fileName = file.name?.toLowerCase() || "";
    const fileType = file.type || "";

    const isPDF =
      fileType === "application/pdf" ||
      fileName.endsWith(".pdf");

    if (!isPDF) {
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 }
      );
    }

    // ── 4. Validate file size ──────────────────────────────────────
    const MAX_SIZE = 10 * 1024 * 1024;

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // ── 5. Convert file to buffer ──────────────────────────────────
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ── 6. Extract text from PDF ───────────────────────────────────
    let extractedText = "";

    try {
      const pdfParse = (await import("pdf-parse")).default;

      const pdfData = await pdfParse(buffer, { max: 0 });

      extractedText = pdfData.text?.trim() || "";
    } catch (pdfError) {
      console.error("PDF parse error:", pdfError);

      return NextResponse.json(
        {
          error:
            "Failed to read PDF. Make sure it is a valid, non-encrypted PDF.",
        },
        { status: 422 }
      );
    }

    // ── 7. Validate extracted text ────────────────────────────────
    if (!extractedText || extractedText.length < 50) {
      return NextResponse.json(
        {
          error:
            "Could not extract text from this PDF. It may be image-based or scanned. Please use a text-based PDF.",
        },
        { status: 422 }
      );
    }

    // ── 8. Parse resume using Gemini AI ───────────────────────────
    let parsed;

    try {
      const prompt = `
You are an expert resume parser.

Extract all information from the resume text below and return ONLY a valid JSON object.
No explanation. No markdown. No code block. Just raw JSON.

The JSON must follow this exact structure:
{
  "contactInfo": {
    "name": "",
    "email": "",
    "mobile": "",
    "linkedin": "",
    "twitter": ""
  },
  "summary": "",
  "skills": "",
  "experience": [
    {
      "title": "",
      "organization": "",
      "startDate": "",
      "endDate": "",
      "description": "",
      "current": false
    }
  ],
  "education": [
    {
      "title": "",
      "organization": "",
      "startDate": "",
      "endDate": "",
      "description": "",
      "current": false
    }
  ],
  "projects": [
    {
      "title": "",
      "organization": "",
      "startDate": "",
      "endDate": "",
      "description": "",
      "current": false
    }
  ]
}

Rules:
1. skills must be a plain comma-separated string of all skills found
2. For dates use format like "Jan 2022" or "2022"
3. If a field is not found, use empty string "" or empty array []
4. description fields should be a single readable paragraph
5. For current roles where end date is missing, set current: true and endDate: ""
6. linkedin must be a full URL if found
7. twitter must be a full URL if found
8. Return ONLY the JSON object

Resume text:
"""
${extractedText}
"""
      `.trim();

      const result = await model.generateContent(prompt);

      const responseText = result.response.text().trim();

      const cleaned = responseText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();

      parsed = JSON.parse(cleaned);
    } catch (aiError) {
      console.error("Gemini AI parse error:", aiError);

      return NextResponse.json(
        {
          error:
            "AI failed to parse the resume. Please try again or fill the form manually.",
        },
        { status: 500 }
      );
    }

    // ── 9. Validate parsed data ───────────────────────────────────
    const hasName = parsed?.contactInfo?.name?.trim();
    const hasEmail = parsed?.contactInfo?.email?.trim();

    if (!hasName && !hasEmail) {
      return NextResponse.json(
        {
          error:
            "Could not find contact information in the resume. Please check the PDF and try again.",
        },
        { status: 422 }
      );
    }

    // ── 10. Success response ──────────────────────────────────────
    return NextResponse.json(
      {
        success: true,
        data: parsed,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Unexpected error in parse-resume route:",
      error
    );

    return NextResponse.json(
      {
        error: "Internal server error. Please try again.",
      },
      { status: 500 }
    );
  }
}