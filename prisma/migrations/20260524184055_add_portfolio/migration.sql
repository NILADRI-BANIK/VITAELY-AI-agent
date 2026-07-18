-- CreateTable
CREATE TABLE "Portfolio" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'My Portfolio',
    "slug" TEXT,
    "templateId" TEXT NOT NULL DEFAULT 'modern',
    "theme" TEXT NOT NULL DEFAULT 'dark',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "fullName" TEXT,
    "professionalTitle" TEXT,
    "summary" TEXT,
    "profileImage" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "linkedin" TEXT,
    "github" TEXT,
    "twitter" TEXT,
    "portfolioUrl" TEXT,
    "leetcode" TEXT,
    "hackerrank" TEXT,
    "skills" JSONB,
    "hobbies" JSONB,
    "experience" JSONB,
    "education" JSONB,
    "projects" JSONB,
    "certifications" JSONB,
    "achievements" JSONB,
    "generatedData" JSONB,
    "generatedCode" TEXT,
    "resumeUrl" TEXT,
    "resumeFileName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Portfolio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Portfolio_slug_key" ON "Portfolio"("slug");

-- CreateIndex
CREATE INDEX "Portfolio_userId_idx" ON "Portfolio"("userId");

-- AddForeignKey
ALTER TABLE "Portfolio" ADD CONSTRAINT "Portfolio_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
