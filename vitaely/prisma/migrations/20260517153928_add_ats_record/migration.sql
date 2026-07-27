/*
  Warnings:

  - You are about to drop the column `atsScore` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `feedback` on the `Resume` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Resume" DROP COLUMN "atsScore",
DROP COLUMN "feedback";

-- CreateTable
CREATE TABLE "ATSRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resumeId" TEXT,
    "resumeTitle" TEXT,
    "atsScore" DOUBLE PRECISION NOT NULL,
    "feedback" TEXT NOT NULL,
    "suggestions" TEXT[],
    "keywords" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ATSRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ATSRecord_userId_idx" ON "ATSRecord"("userId");

-- AddForeignKey
ALTER TABLE "ATSRecord" ADD CONSTRAINT "ATSRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
