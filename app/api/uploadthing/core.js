import { createUploadthing } from "uploadthing/next";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

const f = createUploadthing();

export const ourFileRouter = {
  emailAttachment: f({
    pdf: { maxFileSize: "16MB", maxFileCount: 5 },
    image: { maxFileSize: "8MB", maxFileCount: 5 },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      maxFileSize: "16MB",
      maxFileCount: 5,
    },
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      {
        maxFileSize: "16MB",
        maxFileCount: 5,
      },
    "application/vnd.ms-powerpoint": {
      maxFileSize: "16MB",
      maxFileCount: 5,
    },
    "application/msword": {
      maxFileSize: "16MB",
      maxFileCount: 5,
    },
  })
    .middleware(async () => {
      // 1. Authenticate user
      const { userId: clerkUserId } = await auth();

      if (!clerkUserId) {
        throw new Error("Unauthorized. Please log in.");
      }

      // 2. Get user from DB
      const user = await db.user.findUnique({
        where: { clerkUserId },
      });

      if (!user) {
        throw new Error("User not found in database.");
      }

      // 3. Pass userId to onUploadComplete
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Return file info to client
      return {
        fileName: file.name,
        fileUrl: file.url,
        fileSize: file.size,
        fileType: file.type,
        userId: metadata.userId,
      };
    }),
};

export const fileRouter = ourFileRouter;