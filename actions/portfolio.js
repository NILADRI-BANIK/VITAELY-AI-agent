"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateWithRetry } from "@/lib/portfolio/deepseekClient";

// ─────────────────────────────────────────────
// HELPER — generate slug from name
// ─────────────────────────────────────────────
function generateSlug(name) {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-") +
    "-" +
    Date.now()
  );
}

// ─────────────────────────────────────────────
// HELPER — safe JSON parse
// ─────────────────────────────────────────────
function safeParseJSON(raw) {
  const cleaned = raw
    .replace(/```json|```/g, "")
    .replace(/[\x00-\x1F\x7F]/g, " ")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error("AI returned invalid JSON. Please try again.");
  }
}

// ─────────────────────────────────────────────
// HELPER — get verified user from DB
// ─────────────────────────────────────────────
async function getVerifiedUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  return user;
}

// ─────────────────────────────────────────────
// CREATE PORTFOLIO
// ─────────────────────────────────────────────
export async function createPortfolio(data) {
  const user = await getVerifiedUser();

  try {
    const portfolio = await db.portfolio.create({
      data: {
        userId: user.id,
        title: data.title || "My Portfolio",
        templateId: data.templateId || "modern",
        theme: data.theme || "dark",
        status: "draft",
        slug: data.fullName ? generateSlug(data.fullName) : null,
        isPublic: false,

        // Personal Info
        fullName: data.fullName || null,
        professionalTitle: data.professionalTitle || null,
        summary: data.summary || null,
        profileImage: data.profileImage || null,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,

        // Social Links
        linkedin: data.linkedin || null,
        github: data.github || null,
        twitter: data.twitter || null,
        portfolioUrl: data.portfolioUrl || null,
        leetcode: data.leetcode || null,
        hackerrank: data.hackerrank || null,
        codeforces: data.codeforces || null,

        // JSON Arrays
        skills: data.skills || [],
        hobbies: data.hobbies || [],
        experience: data.experience || [],
        education: data.education || [],
        projects: data.projects || [],
        certifications: data.certifications || [],
        achievements: data.achievements || [],

        // Resume source
        resumeUrl: data.resumeUrl || null,
        resumeFileName: data.resumeFileName || null,
        parsedResumeData: data.parsedResumeData || null,
      },
    });

    revalidatePath("/portfolio-generator");
    return portfolio;
  } catch (error) {
    console.error("Error creating portfolio:", error);
    throw new Error("Failed to create portfolio");
  }
}

// ─────────────────────────────────────────────
// UPDATE PORTFOLIO
// ─────────────────────────────────────────────
export async function updatePortfolio(portfolioId, data) {
  const user = await getVerifiedUser();

  // Verify ownership
  const existing = await db.portfolio.findFirst({
    where: { id: portfolioId, userId: user.id },
  });
  if (!existing) throw new Error("Portfolio not found or unauthorized");

  try {
    const portfolio = await db.portfolio.update({
      where: { id: portfolioId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.templateId !== undefined && { templateId: data.templateId }),
        ...(data.theme !== undefined && { theme: data.theme }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
        ...(data.deployedUrl !== undefined && { deployedUrl: data.deployedUrl }),
        ...(data.thumbnail !== undefined && { thumbnail: data.thumbnail }),

        // Personal Info
        ...(data.fullName !== undefined && { fullName: data.fullName }),
        ...(data.professionalTitle !== undefined && {
          professionalTitle: data.professionalTitle,
        }),
        ...(data.summary !== undefined && { summary: data.summary }),
        ...(data.profileImage !== undefined && {
          profileImage: data.profileImage,
        }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.address !== undefined && { address: data.address }),

        // Social Links
        ...(data.linkedin !== undefined && { linkedin: data.linkedin }),
        ...(data.github !== undefined && { github: data.github }),
        ...(data.twitter !== undefined && { twitter: data.twitter }),
        ...(data.portfolioUrl !== undefined && {
          portfolioUrl: data.portfolioUrl,
        }),
        ...(data.leetcode !== undefined && { leetcode: data.leetcode }),
        ...(data.hackerrank !== undefined && { hackerrank: data.hackerrank }),
        ...(data.codeforces !== undefined && { codeforces: data.codeforces }),
        

        // JSON Arrays
        ...(data.skills !== undefined && { skills: data.skills }),
        ...(data.hobbies !== undefined && { hobbies: data.hobbies }),
        ...(data.experience !== undefined && { experience: data.experience }),
        ...(data.education !== undefined && { education: data.education }),
        ...(data.projects !== undefined && { projects: data.projects }),
        ...(data.certifications !== undefined && {
          certifications: data.certifications,
        }),
        ...(data.achievements !== undefined && {
          achievements: data.achievements,
        }),

        // Generated data
        ...(data.generatedData !== undefined && {
          generatedData: data.generatedData,
        }),
        ...(data.generatedCode !== undefined && {
          generatedCode: data.generatedCode,
        }),

        // Resume source
        ...(data.resumeUrl !== undefined && { resumeUrl: data.resumeUrl }),
        ...(data.resumeFileName !== undefined && {
          resumeFileName: data.resumeFileName,
        }),
        ...(data.parsedResumeData !== undefined && {
          parsedResumeData: data.parsedResumeData,
        }),
      },
    });

    revalidatePath("/portfolio-generator");
    return portfolio;
  } catch (error) {
    console.error("Error updating portfolio:", error);
    throw new Error("Failed to update portfolio");
  }
}

// ─────────────────────────────────────────────
// GET ALL PORTFOLIOS (dashboard list)
// ─────────────────────────────────────────────
export async function getAllPortfolios() {
  const user = await getVerifiedUser();

  return await db.portfolio.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      title: true,
      templateId: true,
      theme: true,
      status: true,
      isPublic: true,
      slug: true,
      fullName: true,
      profileImage: true,
      thumbnail: true,
      deployedUrl: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  });
}

// ─────────────────────────────────────────────
// GET SINGLE PORTFOLIO BY ID
// ─────────────────────────────────────────────
export async function getPortfolioById(portfolioId) {
  const user = await getVerifiedUser();

  const portfolio = await db.portfolio.findFirst({
    where: {
      id: portfolioId,
      userId: user.id,
    },
  });

  if (!portfolio) throw new Error("Portfolio not found");

  return portfolio;
}

// ─────────────────────────────────────────────
// DELETE PORTFOLIO
// ─────────────────────────────────────────────
export async function deletePortfolio(portfolioId) {
  const user = await getVerifiedUser();

  // Verify ownership
  const existing = await db.portfolio.findFirst({
    where: { id: portfolioId, userId: user.id },
  });
  if (!existing) throw new Error("Portfolio not found or unauthorized");

  try {
    await db.portfolio.delete({
      where: { id: portfolioId },
    });

    revalidatePath("/portfolio-generator");
    return { success: true };
  } catch (error) {
    console.error("Error deleting portfolio:", error);
    throw new Error("Failed to delete portfolio");
  }
}

// ─────────────────────────────────────────────
// DUPLICATE PORTFOLIO
// ─────────────────────────────────────────────
export async function duplicatePortfolio(portfolioId) {
  const user = await getVerifiedUser();

  try {
    const original = await db.portfolio.findFirst({
      where: { id: portfolioId, userId: user.id },
    });

    if (!original) throw new Error("Portfolio not found");

    const {
      id,
      createdAt,
      updatedAt,
      slug,
      deployedUrl,
      ...rest
    } = original;

    const copy = await db.portfolio.create({
      data: {
        ...rest,
        title: `${original.title} (Copy)`,
        slug: original.fullName ? generateSlug(original.fullName) : null,
        status: "draft",
        isPublic: false,
        deployedUrl: null,
      },
    });

    revalidatePath("/portfolio-generator");
    return copy;
  } catch (error) {
    console.error("Error duplicating portfolio:", error);
    throw new Error("Failed to duplicate portfolio");
  }
}

// ─────────────────────────────────────────────
// SAVE GENERATED PORTFOLIO DATA TO DB
// ─────────────────────────────────────────────
export async function saveGeneratedPortfolio(portfolioId, generatedData) {
  const user = await getVerifiedUser();

  // Verify ownership
  const existing = await db.portfolio.findFirst({
    where: { id: portfolioId, userId: user.id },
  });
  if (!existing) throw new Error("Portfolio not found or unauthorized");

  try {
    const portfolio = await db.portfolio.update({
      where: { id: portfolioId },
      data: {
        generatedData,
        status: "generated",
      },
    });

    revalidatePath("/portfolio-generator");
    return portfolio;
  } catch (error) {
    console.error("Error saving generated portfolio:", error);
    throw new Error("Failed to save generated portfolio");
  }
}

// ─────────────────────────────────────────────
// AI — IMPROVE SUMMARY
// (Switched to DeepSeek — uses DEEPSEEK_KEY_PORTFOLIO via
// lib/portfolio/deepseekClient.js, isolated from GEMINI_API_KEY)
// ─────────────────────────────────────────────
export async function improvePortfolioSummary(currentSummary) {
  await getVerifiedUser();

  if (!currentSummary?.trim()) throw new Error("No summary provided");

  const prompt = `
    You are an expert portfolio writer.
    Improve the following professional summary to make it compelling, clear, and impactful.

    Current Summary:
    "${currentSummary}"

    Requirements:
    1. Start with a strong professional title or role
    2. Mention key skills and expertise
    3. Highlight achievements where possible
    4. Keep it 3-5 sentences
    5. Do NOT use first person (avoid "I", "my", "me")
    6. Use active voice
    7. Return ONLY the improved summary, no extra explanation
  `.trim();

  try {
    const raw = await generateWithRetry(prompt);
    const improved = raw?.trim();

    if (!improved) throw new Error("Empty AI response");

    return improved.replace(/\*\*/g, "").trim();
  } catch (error) {
    console.error("Error improving summary:", error);

    if (error.message?.includes("429") || error.message?.includes("quota")) {
      throw new Error("AI usage limit exceeded. Please try again later.");
    }

    throw new Error(error.message || "Failed to improve summary");
  }
}

// ─────────────────────────────────────────────
// AI — AUTO CATEGORIZE SKILLS
// (Switched to DeepSeek — uses DEEPSEEK_KEY_PORTFOLIO via
// lib/portfolio/deepseekClient.js, isolated from GEMINI_API_KEY)
// ─────────────────────────────────────────────
export async function categorizePortfolioSkills(rawSkills) {
  await getVerifiedUser();

  if (!rawSkills?.trim()) throw new Error("No skills provided");

  const prompt = `
    You are an expert portfolio writer.
    Categorize the following skills into relevant groups for a portfolio website.

    Skills: "${rawSkills}"

    Rules:
    1. Group related skills under category headings
    2. Use categories like: Frontend, Backend, Programming Languages, Tools & DevOps, Databases, Design, Soft Skills, etc.
    3. Only use categories relevant to the provided skills
    4. Return ONLY valid JSON — no extra text, no markdown, no code blocks

    Required JSON format:
    [
      {
        "category": "Frontend",
        "skills": ["React", "Tailwind CSS"]
      },
      {
        "category": "Backend",
        "skills": ["Node.js", "Express"]
      }
    ]
  `.trim();

  try {
    const raw = await generateWithRetry(prompt);

    if (!raw?.trim()) throw new Error("Empty AI response");

    return safeParseJSON(raw);
  } catch (error) {
    console.error("Error categorizing skills:", error);

    if (error.message?.includes("429") || error.message?.includes("quota")) {
      throw new Error("AI usage limit exceeded. Please try again later.");
    }

    throw new Error(error.message || "Failed to categorize skills");
  }
}

// ─────────────────────────────────────────────
// AI — IMPROVE EXPERIENCE / PROJECT DESCRIPTION
// (Switched to DeepSeek — uses DEEPSEEK_KEY_PORTFOLIO via
// lib/portfolio/deepseekClient.js, isolated from GEMINI_API_KEY)
// ─────────────────────────────────────────────
export async function improvePortfolioDescription(current, type = "experience") {
  await getVerifiedUser();

  if (!current?.trim()) throw new Error("No content provided");

  const prompt = `
    You are an expert portfolio writer.
    Improve the following ${type} description for a professional portfolio website.

    Current content:
    "${current}"

    Requirements:
    1. Use strong action verbs
    2. Add metrics or results where possible
    3. Keep it concise and impactful (2-4 sentences)
    4. Focus on achievements over responsibilities
    5. Return ONLY the improved description, no explanation
  `.trim();

  try {
    const raw = await generateWithRetry(prompt);
    const improved = raw?.trim();

    if (!improved) throw new Error("Empty AI response");

    return improved.replace(/\*\*/g, "").trim();
  } catch (error) {
    console.error("Error improving description:", error);

    if (error.message?.includes("429") || error.message?.includes("quota")) {
      throw new Error("AI usage limit exceeded. Please try again later.");
    }

    throw new Error(error.message || "Failed to improve description");
  }
}

// // ─────────────────────────────────────────────
// // AI — GENERATE FULL PORTFOLIO JSON FROM FORM DATA
// // NOTE: Left unchanged per explicit instruction. This function is
// // currently DEAD CODE — PortfolioForm.jsx does not import or call it.
// // The live path for portfolio generation is:
// //   PortfolioForm.jsx -> fetch("/api/portfolio/generate")
// //   -> app/api/portfolio/generate/route.js
// //   -> lib/portfolio/generatePortfolio.js (already DeepSeek)
// // Still uses Gemini/GEMINI_API_KEY as originally written.
// // ─────────────────────────────────────────────
// export async function generatePortfolioData(formData) {
//   await getVerifiedUser();

//   const prompt = `
//     You are an expert portfolio content writer.
//     Based on the following user data, generate a polished and complete portfolio JSON.

//     User Data:
//     ${JSON.stringify(formData, null, 2)}

//     Generate a JSON object with this exact structure:
//     {
//       "hero": {
//         "name": "",
//         "title": "",
//         "tagline": "",
//         "summary": ""
//       },
//       "about": "",
//       "skills": [
//         { "category": "", "skills": [] }
//       ],
//       "experience": [
//         {
//           "title": "",
//           "company": "",
//           "startDate": "",
//           "endDate": "",
//           "current": false,
//           "description": ""
//         }
//       ],
//       "education": [
//         {
//           "degree": "",
//           "institution": "",
//           "startDate": "",
//           "endDate": "",
//           "current": false,
//           "score": "",
//           "scoreType": "CGPA",
//           "outOf": "4.0",
//           "description": ""
//         }
//       ],
//       "projects": [
//         {
//           "title": "",
//           "description": "",
//           "techStack": [],
//           "github": "",
//           "liveUrl": "",
//           "startDate": "",
//           "endDate": ""
//         }
//       ],
//       "certifications": [
//         {
//           "title": "",
//           "issuer": "",
//           "date": "",
//           "url": ""
//         }
//       ],
//       "hobbies": [],
//       "contact": {
//         "email": "",
//         "phone": "",
//         "linkedin": "",
//         "github": "",
//         "twitter": "",
//         "portfolioUrl": ""
//       }
//     }

//     Rules:
//     1. Improve and enhance all text content
//     2. Make descriptions impactful and professional
//     3. Return ONLY valid JSON — no markdown, no code blocks, no extra text
//   `;

//   try {
//     const result = await model.generateContent(prompt);
//     const raw = result.response.text().trim();

//     if (!raw) throw new Error("Empty AI response");

//     return safeParseJSON(raw);
//   } catch (error) {
//     console.error("Error generating portfolio data:", error);
//     throw new Error(error.message || "Failed to generate portfolio data");
//   }
// }
