/*
  Warnings:

  - You are about to drop the column `hackerrank` on the `Portfolio` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Portfolio" DROP COLUMN "hackerrank",
ADD COLUMN     "codeforces" TEXT;
