-- AlterTable
ALTER TABLE "EmailRecord" ADD COLUMN     "receiverEmail" TEXT;

-- CreateTable
CREATE TABLE "EmailAttachment" (
    "id" TEXT NOT NULL,
    "emailRecordId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT,
    "fileSize" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmailAttachment_emailRecordId_idx" ON "EmailAttachment"("emailRecordId");

-- AddForeignKey
ALTER TABLE "EmailAttachment" ADD CONSTRAINT "EmailAttachment_emailRecordId_fkey" FOREIGN KEY ("emailRecordId") REFERENCES "EmailRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
