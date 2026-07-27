"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { generateWithFallbackChain } from "@/lib/ai-providers";

function buildSectionInstructions(sectionsConfig) {
  if (!sectionsConfig) return "";

  // Must match the ids in constants/cover-letter.js DEFAULT_SECTIONS.
  const sectionLabels = {
    introduction: "an opening/introduction paragraph",
    experience: "a paragraph highlighting relevant experience",
    skills: "a dedicated skills/qualifications paragraph",
    achievements: "a paragraph highlighting specific achievements or measurable results",
    companyAlignment: "a paragraph showing alignment with the company's mission/culture/values",
    closing: "a closing paragraph with a call to action",
  };

  const included = Object.entries(sectionsConfig)
    .filter(([, enabled]) => enabled)
    .map(([key]) => sectionLabels[key])
    .filter(Boolean);

  const excluded = Object.entries(sectionsConfig)
    .filter(([, enabled]) => !enabled)
    .map(([key]) => sectionLabels[key])
    .filter(Boolean);

  let instructions = "";
  if (included.length) {
    instructions += `\nInclude the following sections: ${included.join(", ")}.`;
  }
  if (excluded.length) {
    instructions += `\nDo NOT include: ${excluded.join(", ")}.`;
  }
  return instructions;
}

/**
 * Builds the generation prompt. Explicitly instructs the model to
 * weave the applicant's actual experience/skills/tone/additional info
 * into specific sentences — not just acknowledge them as metadata —
 * since generic output was a known issue when these fields were only
 * listed as labeled context.
 */
function buildPrompt({
  jobTitle,
  companyName,
  jobDescription,
  yourName,
  yourEmail,
  yourPhone,
  yourSkills,
  yourExperience,
  tone,
  additionalInfo,
  sectionInstructions,
}) {
  return `Write a professional cover letter for the following:

Position: ${jobTitle}
Company: ${companyName}
Job Description: ${jobDescription}

Applicant Information:
Name: ${yourName || "the applicant"}
Email: ${yourEmail || "Not provided"}
Phone: ${yourPhone || "Not provided"}
Years of Experience: ${yourExperience || "Not provided"}
Key Skills: ${yourSkills || "Not provided"}
Desired Tone: ${tone || "Professional"}
Additional Information: ${additionalInfo || "None"}

CRITICAL REQUIREMENTS — the letter must NOT be generic:
- Explicitly reference the applicant's stated years of experience (e.g. mention "${yourExperience || "their experience"}" in context) rather than vaguely saying "extensive experience."
- Name-check at least 3 of the specific skills listed above directly in the body text, tied to concrete responsibilities from the job description — do not just restate the skill list verbatim, weave them into sentences about what the applicant has done or can do.
- Match the overall voice and word choice to the "${tone || "Professional"}" tone consistently throughout — this should be clearly distinguishable from a different tone, not interchangeable boilerplate.
- If additional information was provided, incorporate it naturally into the letter rather than appending it as an afterthought.
- Reference at least one specific requirement or responsibility mentioned in the job description, showing the letter was written for this role, not a generic template.

Write a compelling, personalized cover letter that:
1. Opens with a strong hook
2. Highlights relevant skills and experience
3. Shows enthusiasm for the role and company
4. Demonstrates knowledge of the job requirements
5. Closes with a clear call to action
${sectionInstructions}

Format the cover letter with proper paragraphs. Do not include placeholders like [Your Name] - use the actual information provided.

IMPORTANT: Do NOT include a sign-off, closing salutation, or signature line (e.g. "Sincerely,", "Best regards,", the applicant's name at the end, etc). The document template already renders its own signature block separately. End the letter body with the final call-to-action paragraph only — nothing after it.

Do not include any markdown formatting.`;
}

/**
 * Returns prefill values for the generator form's applicant fields.
 * Used to default name/email (still editable) and surface any
 * profile skills/experience the user already has on file.
 */
export async function getApplicantDefaults() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error("User not found");

  return {
    name: user.name ?? "",
    email: user.email ?? "",
    skills: Array.isArray(user.skills) ? user.skills.join(", ") : "",
    experience: user.experience ? `${user.experience} years` : "",
  };
}

export async function generateCoverLetter(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error("User not found");

  const {
    companyName,
    jobTitle,
    jobDescription,
    yourName,
    yourEmail,
    yourPhone,
    yourSkills,
    yourExperience,
    tone,
    additionalInfo,
    selectedTemplate,
    sectionsConfig,
    existingId,
  } = data;

  const sectionInstructions = buildSectionInstructions(sectionsConfig);

  const prompt = buildPrompt({
    jobTitle,
    companyName,
    jobDescription,
    yourName,
    yourEmail,
    yourPhone,
    yourSkills,
    yourExperience,
    tone,
    additionalInfo,
    sectionInstructions,
  });

  // Tries DeepSeek → Groq → Gemini → template-based fallback, in that
  // order. Never throws under normal operation — always returns
  // content, even if every AI provider is down.
  const { content, providerUsed } = await generateWithFallbackChain(prompt, {
    yourName,
    yourSkills,
    yourExperience,
    jobTitle,
    companyName,
    jobDescription,
    tone,
    additionalInfo,
  });

  if (providerUsed === "template") {
    console.warn(
      `[cover-letter] All AI providers failed for user ${user.id} — served template-based fallback`
    );
  }

  const title = `${jobTitle} at ${companyName}`;

  let coverLetter;

  if (existingId) {
    const existing = await db.coverLetter.findUnique({ where: { id: existingId } });
    if (!existing || existing.userId !== user.id) {
      throw new Error("Cover letter not found");
    }
    coverLetter = await db.coverLetter.update({
      where: { id: existingId },
      data: {
        title,
        content,
        formData: data,
        template: selectedTemplate || existing.template || "modern-professional",
      },
    });
  } else {
    coverLetter = await db.coverLetter.create({
      data: {
        userId: user.id,
        title,
        content,
        formData: data,
        template: selectedTemplate || "modern-professional",
      },
    });
  }

  revalidatePath("/ai-cover-letter");
  return { content, id: coverLetter.id, providerUsed };
}

export async function getCoverLetters() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error("User not found");

  return await db.coverLetter.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getCoverLetter(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error("User not found");

  const coverLetter = await db.coverLetter.findUnique({ where: { id } });
  if (!coverLetter || coverLetter.userId !== user.id) {
    throw new Error("Cover letter not found");
  }

  return coverLetter;
}

export async function updateCoverLetter(id, data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error("User not found");

  const existing = await db.coverLetter.findUnique({ where: { id } });
  if (!existing || existing.userId !== user.id) {
    throw new Error("Cover letter not found");
  }

  const existingFormData =
    typeof existing.formData === "object" && existing.formData !== null
      ? existing.formData
      : {};

  // Applicant/job fields the editor can update individually. Anything
  // present in `data` overwrites the saved value; anything omitted keeps
  // its existing value — so partial edits never wipe out other fields.
  const editableFormFields = [
    "yourName",
    "yourEmail",
    "yourPhone",
    "yourSkills",
    "yourExperience",
    "companyName",
    "jobTitle",
  ];

  const mergedFormData = { ...existingFormData };
  for (const key of editableFormFields) {
    if (data[key] !== undefined) {
      mergedFormData[key] = data[key];
    }
  }

  const updated = await db.coverLetter.update({
    where: { id },
    data: {
      title: data.title ?? existing.title,
      content: data.content ?? existing.content,
      formData: mergedFormData,
      // accept either field name from callers, always save to `template`
      template: data.selectedTemplate ?? data.template ?? existing.template,
    },
  });

  revalidatePath("/ai-cover-letter");
  revalidatePath(`/ai-cover-letter/edit/${id}`);
  return updated;
}

export async function deleteCoverLetter(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error("User not found");

  const existing = await db.coverLetter.findUnique({ where: { id } });
  if (!existing || existing.userId !== user.id) {
    throw new Error("Cover letter not found");
  }

  await db.coverLetter.delete({ where: { id } });

  revalidatePath("/ai-cover-letter");
  return { success: true };
}

export async function duplicateCoverLetter(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error("User not found");

  const existing = await db.coverLetter.findUnique({ where: { id } });
  if (!existing || existing.userId !== user.id) {
    throw new Error("Cover letter not found");
  }

  const duplicate = await db.coverLetter.create({
    data: {
      userId: user.id,
      title: `${existing.title} (Copy)`,
      content: existing.content,
      formData: existing.formData,
      template: existing.template,
    },
  });

  revalidatePath("/ai-cover-letter");
  return duplicate;
}