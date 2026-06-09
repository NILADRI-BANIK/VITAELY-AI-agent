-- CreateTable
CREATE TABLE "EmailRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "tone" TEXT NOT NULL,
    "length" TEXT NOT NULL,
    "recipientName" TEXT,
    "companyName" TEXT,
    "jobRole" TEXT,
    "skills" TEXT,
    "signature" TEXT,
    "purpose" TEXT NOT NULL,
    "generatedEmail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmailRecord_userId_idx" ON "EmailRecord"("userId");

-- AddForeignKey
ALTER TABLE "EmailRecord" ADD CONSTRAINT "EmailRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
