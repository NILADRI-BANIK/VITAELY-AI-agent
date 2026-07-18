-- AlterTable
ALTER TABLE "Portfolio" ADD COLUMN     "deployedUrl" TEXT,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parsedResumeData" JSONB,
ADD COLUMN     "thumbnail" TEXT;
