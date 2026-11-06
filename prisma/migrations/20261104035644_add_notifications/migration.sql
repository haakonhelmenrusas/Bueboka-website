/*
  Warnings:

  - You are about to drop the column `endDate` on the `challenges` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `challenges` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('CHALLENGE_RECEIVED', 'CHALLENGE_SENT', 'CHALLENGE_ACCEPTED', 'CHALLENGE_DECLINED', 'CHALLENGE_CANCELLED', 'CHALLENGE_SUBMITTED');

-- AlterTable
ALTER TABLE "challenges" DROP COLUMN "endDate",
DROP COLUMN "startDate";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "pushToken" TEXT;

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "challengeId" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_userId_read_idx" ON "notifications"("userId", "read");

-- CreateIndex
CREATE INDEX "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
