import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send email using Gmail via Nodemailer
 * @param {string} receiverEmail - Recipient email address
 * @param {string} emailContent - Full email content (Subject + Body)
 * @param {Array} attachments - Array of { fileName, fileUrl, fileType, fileSize }
 * @param {string} purpose - Email purpose label
 */
export async function sendEmail({
  receiverEmail,
  emailContent,
  attachments = [],
  purpose = "Email",
}) {
  try {
    // 1. Validate environment variables
    if (!process.env.EMAIL_USER) {
      throw new Error("EMAIL_USER is not set in environment variables.");
    }

    if (!process.env.EMAIL_PASS) {
      throw new Error("EMAIL_PASS is not set in environment variables.");
    }

    // 2. Validate receiver email
    if (!receiverEmail || !receiverEmail.trim()) {
      throw new Error("Receiver email is required.");
    }

    // 3. Validate email content
    if (!emailContent || !emailContent.trim()) {
      throw new Error("Email content is required.");
    }

    // 4. Extract subject from generated email content
    // Gemini generates: "Subject: ..." on first line
    const lines = emailContent.trim().split("\n");

    let subject = purpose;
    let body = emailContent;

    if (lines[0]?.toLowerCase().startsWith("subject:")) {
      subject = lines[0].replace(/^subject:/i, "").trim();
      body = lines.slice(1).join("\n").trim();
    }

    // 5. Build attachments array for Nodemailer
    // Fetch each file from UploadThing URL and convert to buffer
    const mailAttachments = await Promise.all(
      attachments
        .filter((file) => file.fileUrl && file.fileName)
        .map(async (file) => {
          const response = await fetch(file.fileUrl);

          if (!response.ok) {
            throw new Error(
              `Failed to fetch attachment: ${file.fileName} (${response.statusText})`
            );
          }

          const arrayBuffer = await response.arrayBuffer();

          return {
            filename: file.fileName,
            content: Buffer.from(arrayBuffer),
          };
        })
    );

    // 6. Send email via Nodemailer
    const info = await transporter.sendMail({
      from: `"SENSAI" <${process.env.EMAIL_USER}>`,
      to: receiverEmail.trim(),
      subject,
      text: body,
      attachments: mailAttachments.length > 0 ? mailAttachments : undefined,
    });

    console.log("Email sent:", info.messageId);

    // 7. Return success
    return {
      success: true,
      emailId: info.messageId,
    };
  } catch (error) {
    console.error("sendEmail error:", error);

    throw new Error(
      error instanceof Error ? error.message : "Failed to send email."
    );
  }
}