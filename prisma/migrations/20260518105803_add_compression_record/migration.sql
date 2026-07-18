-- CreateTable
CREATE TABLE "CompressionRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalSize" INTEGER NOT NULL,
    "compressedSize" INTEGER NOT NULL,
    "savedPercentage" DOUBLE PRECISION NOT NULL,
    "compressionLevel" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'success',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompressionRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompressionRecord_userId_idx" ON "CompressionRecord"("userId");

-- AddForeignKey
ALTER TABLE "CompressionRecord" ADD CONSTRAINT "CompressionRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
