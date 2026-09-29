-- CreateEnum
CREATE TYPE "ChallengeStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'COMPLETED', 'CANCELLED');

-- CreateModel Challenge
CREATE TABLE "challenges" (
    "id" TEXT NOT NULL,
    "challengerId" TEXT NOT NULL,
    "challengedId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "roundTypeId" TEXT,
    "customRules" JSONB,
    "startDate" TIMESTAMPTZ,
    "endDate" TIMESTAMPTZ,
    "status" "ChallengeStatus" NOT NULL DEFAULT 'PENDING',
    "winnerId" TEXT,
    "challengerScore" INTEGER,
    "challengedScore" INTEGER,
    "challengerTotalArrows" INTEGER,
    "challengedTotalArrows" INTEGER,
    "challengerSubmittedAt" TIMESTAMPTZ,
    "challengedSubmittedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateIndex on challenges
CREATE UNIQUE INDEX "challenges_challengerId_challengedId_name_createdAt_key" ON "challenges"("challengerId", "challengedId", "name", "createdAt");
CREATE INDEX "challenges_challengerId_idx" ON "challenges"("challengerId");
CREATE INDEX "challenges_challengedId_idx" ON "challenges"("challengedId");
CREATE INDEX "challenges_status_idx" ON "challenges"("status");
CREATE INDEX "challenges_createdAt_idx" ON "challenges"("createdAt");

-- Add relation fields to user
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "challengesSent" TEXT[], ADD COLUMN IF NOT EXISTS "challengesReceived" TEXT[], ADD COLUMN IF NOT EXISTS "challengesWon" TEXT[];

-- Add relation to RoundType
ALTER TABLE "round_types" ADD COLUMN IF NOT EXISTS "Challenge" TEXT[];
