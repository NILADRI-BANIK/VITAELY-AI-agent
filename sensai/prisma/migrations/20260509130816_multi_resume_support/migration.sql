-- DropIndex
DROP INDEX "Resume_userId_key";

-- AlterTable
ALTER TABLE "Resume" ADD COLUMN     "title" TEXT NOT NULL DEFAULT 'Untitled Resume';

-- CreateIndex
CREATE INDEX "Resume_userId_idx" ON "Resume"("userId");
