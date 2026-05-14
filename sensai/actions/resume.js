"use server";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function createResume(
  content,
  profileImage = null,
  selectedTemplate = "classic",
  formData = null,
  title = "Untitled Resume"
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  try {
    const resume = await db.resume.create({
      data: {
        userId: user.id,
        title,
        content,
        profileImage,
        selectedTemplate,
        formData,
      },
    });

    revalidatePath("/resume");
    return resume;
  } catch (error) {
    console.error("Error creating resume:", error);
    throw new Error("Failed to create resume");
  }
}

export async function updateResume(
  resumeId,
  content,
  profileImage = null,
  selectedTemplate = "classic",
  formData = null,
  title = null
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  try {
    const resume = await db.resume.update({
      where: {
        id: resumeId,
        userId: user.id,
      },
      data: {
        content,
        selectedTemplate,
        ...(profileImage !== null && { profileImage }),
        ...(formData !== null && { formData }),
        ...(title !== null && { title }),
      },
    });

    revalidatePath("/resume");
    return resume;
  } catch (error) {
    console.error("Error updating resume:", error);
    throw new Error("Failed to update resume");
  }
}

export async function getAllResumes() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  return await db.resume.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      title: true,
      selectedTemplate: true,
      profileImage: true,
      atsScore: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getResumeById(resumeId) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  return await db.resume.findUnique({
    where: {
      id: resumeId,
      userId: user.id,
    },
    select: {
      id: true,
      title: true,
      content: true,
      profileImage: true,
      selectedTemplate: true,
      formData: true,
      atsScore: true,
      feedback: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function deleteResume(resumeId) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  try {
    await db.resume.delete({
      where: {
        id: resumeId,
        userId: user.id,
      },
    });

    revalidatePath("/resume");
    return { success: true };
  } catch (error) {
    console.error("Error deleting resume:", error);
    throw new Error("Failed to delete resume");
  }
}

export async function duplicateResume(resumeId) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  try {
    const original = await db.resume.findUnique({
      where: { id: resumeId, userId: user.id },
    });

    if (!original) throw new Error("Resume not found");

    const copy = await db.resume.create({
      data: {
        userId: user.id,
        title: `${original.title} (Copy)`,
        content: original.content,
        profileImage: original.profileImage,
        selectedTemplate: original.selectedTemplate,
        formData: original.formData,
      },
    });

    revalidatePath("/resume");
    return copy;
  } catch (error) {
    console.error("Error duplicating resume:", error);
    throw new Error("Failed to duplicate resume");
  }
}

export async function improveWithAI({ current, type }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      industry: true,
      industryInsight: true,
    },
  });
  if (!user) throw new Error("User not found");

  const industry = user.industry || "professional";

  const prompt = `
    As an expert resume writer, improve the following ${type} description for a ${industry} professional.
    Make it more impactful, quantifiable, and aligned with industry standards.
    Current content: "${current}"

    Requirements:
    1. Use action verbs
    2. Include metrics and results where possible
    3. Highlight relevant technical skills
    4. Keep it concise but detailed
    5. Focus on achievements over responsibilities
    6. Use industry-specific keywords
    
    Format the response as a single paragraph without any additional text or explanations.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const improvedContent = response.text().trim();

    if (!improvedContent) throw new Error("Empty response from AI");

    return improvedContent;
  } catch (error) {
    console.error("Error improving content:", error);
    throw new Error("Failed to improve content");
  }
}

export async function categorizeSkills(rawSkills) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  if (!rawSkills?.trim()) throw new Error("No skills provided");

  const prompt = `
    You are an expert resume writer. Categorize the following skills into relevant groups.
    
    Skills: "${rawSkills}"
    
    Rules:
    1. Group related skills under appropriate category headings
    2. Use common resume categories like: Technical Skills, Programming Languages, Frameworks & Libraries, Data & Tools, Soft Skills, Finance & Accounting, Design, Marketing, Management, etc.
    3. Only use categories that are relevant to the provided skills
    4. Each skill goes under exactly one category
    5. Return ONLY the formatted markdown below — no extra text, no explanation, no code blocks
    
    Required output format (use exactly this structure):
    ### Category Name
    * Skill 1
    * Skill 2
    
    ### Another Category
    * Skill 3
    * Skill 4
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const categorized = response.text().trim();

    if (!categorized) throw new Error("Empty response from AI");

    return categorized;
  } catch (error) {
    console.error("Error categorizing skills:", error);
    throw new Error("Failed to categorize skills");
  }
}

// ← NEW FUNCTION: Improve Professional Summary with AI  // ← NEW LINE 1
export async function improveSummaryWithAI(currentSummary) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  if (!currentSummary?.trim()) {
    throw new Error("No summary provided");
  }

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
    select: {
      industry: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const industry = user.industry || "professional";

  const prompt = `
    You are an expert resume writer.

    Improve the following professional summary
    for a ${industry} professional.

    Current Summary:
    "${currentSummary}"

    Requirements:
    1. Start with a strong professional title
    2. Mention years of experience
    3. Highlight achievements with metrics
    4. Include industry keywords
    5. Use ATS-friendly language
    6. Use active voice
    7. Keep it 3-5 sentences
    8. Do NOT use first person

    Return ONLY the improved summary.
  `;

  try {
    const result = await model.generateContent(prompt);

    const response = result.response;

    const improvedSummary = (
      await response.text()
    ).trim();

    if (!improvedSummary) {
      throw new Error("Empty AI response");
    }

    return improvedSummary
      .replace(/\*\*/g, "")
      .trim();

  } catch (error) {
    console.error(
      "Error improving summary:",
      error
    );

    if (error.message?.includes("429")) {
      throw new Error(
        "AI usage limit exceeded. Please try again later."
      );
    }

    throw new Error(
      error.message ||
      "Failed to improve summary"
    );
  }
}
