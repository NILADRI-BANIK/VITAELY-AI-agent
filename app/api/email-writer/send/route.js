import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { sendEmail } from "@/lib/email/sendEmail";

export async function POST(req) {
  try {
    // 1. Authenticate user
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // 2. Get user from DB
    const user = await db.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found in database." },
        { status: 404 }
      );
    }

    // 3. Parse request body
    const body = await req.json();

    const {
      receiverEmail,
      emailContent,
      attachments = [],
      purpose = "Email",
    } = body;

    // 4. Validate required fields
    if (!receiverEmail || !receiverEmail.trim()) {
      return NextResponse.json(
        { error: "Receiver email is required." },
        { status: 400 }
      );
    }

    if (!emailContent || !emailContent.trim()) {
      return NextResponse.json(
        { error: "Email content is required." },
        { status: 400 }
      );
    }

    // 5. Send email
    const result = await sendEmail({
      receiverEmail,
      emailContent,
      attachments,
      purpose,
    });

    // 6. Return success
    return NextResponse.json(
      { success: true, emailId: result.emailId },
      { status: 200 }
    );

  } catch (error) {
    console.error("Send email error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to send email. Please try again.",
      },
      { status: 500 }
    );
  }
}