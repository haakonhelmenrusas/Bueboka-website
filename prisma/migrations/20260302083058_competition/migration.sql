/*
  Warnings:

  - Made the column `personalBest` on table `competitions` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "competitions" ALTER COLUMN "personalBest" SET NOT NULL;

-- DropEnum
DROP TYPE "PracticeType";

-- CreateIndex
CREATE INDEX "practices_userId_idx" ON "practices"("userId");

-- CreateIndex
CREATE INDEX "practices_date_idx" ON "practices"("date");
