import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { generateEmail } from "@/lib/email/generateEmail";

export async function POST(req) {
  try {
    // 1. Authenticate user
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 },
      );
    }

    // 2. Get user from DB
    const user = await db.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found in database." },
        { status: 404 },
      );
    }

    // 3. Parse request body
    const body = await req.json();

    const {
      prompt,
      tone,
      length,
      purpose,
      recipientName,
      companyName,
      jobRole,
      skills,
      signature,
      receiverEmail,
      attachments,
    } = body;

    // 4. Validate required fields
    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { error: "Prompt is required." },
        { status: 400 },
      );
    }

    if (!tone || !length || !purpose) {
      return NextResponse.json(
        { error: "Tone, length and purpose are required." },
        { status: 400 },
      );
    }

    // 5. Generate email using Gemini
    const generatedEmail = await generateEmail({
      prompt,
      tone,
      length,
      purpose,
      recipientName,
      companyName,
      jobRole,
      skills,
      signature,
    });

    // 6. Save EmailRecord to DB
    const emailRecord = await db.emailRecord.create({
      data: {
        userId: user.id,
        prompt,
        tone,
        length,
        purpose,
        recipientName: recipientName || null,
        companyName: companyName || null,
        jobRole: jobRole || null,
        skills: skills || null,
        signature: signature || null,
        receiverEmail: receiverEmail || null,
        generatedEmail,
      },
    });

    // 7. Save attachments if any
    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      await db.emailAttachment.createMany({
        data: attachments.map((file) => ({
          emailRecordId: emailRecord.id,
          fileName: file.fileName,
          fileUrl: file.fileUrl,
          fileType: file.fileType || null,
          fileSize: file.fileSize || null,
        })),
      });
    }

    // 8. Return generated email
    return NextResponse.json(
      { success: true, generatedEmail },
      { status: 200 },
    );
  } catch (error) {
    console.error("Email generation error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Email generation failed. Please try again.",
      },
      { status: 500 },
    );
  }
}