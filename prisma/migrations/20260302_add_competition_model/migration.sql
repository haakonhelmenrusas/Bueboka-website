-- CreateTable: Competition model
-- This migration separates competitions from practices

-- Create Competition table
CREATE TABLE "competitions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "organizerName" TEXT,
    "notes" TEXT,
    "totalScore" INTEGER NOT NULL,
    "placement" INTEGER,
    "numberOfParticipants" INTEGER,
    "personalBest" BOOLEAN DEFAULT false,
    "environment" "Environment" NOT NULL,
    "weather" "WeatherCondition"[],
    "practiceCategory" "PracticeCategory" NOT NULL DEFAULT 'SKIVE_INDOOR',
    "bowId" TEXT,
    "arrowsId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competitions_pkey" PRIMARY KEY ("id")
);

-- Create CompetitionRound table (similar to End but for competitions)
CREATE TABLE "competition_rounds" (
    "id" TEXT NOT NULL,
    "competitionId" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "arrows" INTEGER NOT NULL,
    "scores" INTEGER[],
    "roundScore" INTEGER,
    "distanceMeters" INTEGER,
    "targetSizeCm" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competition_rounds_pkey" PRIMARY KEY ("id")
);

-- Add indexes
CREATE INDEX "competitions_userId_idx" ON "competitions"("userId");
CREATE INDEX "competitions_date_idx" ON "competitions"("date");
CREATE INDEX "competition_rounds_competitionId_idx" ON "competition_rounds"("competitionId");

-- Add foreign keys
ALTER TABLE "competitions" ADD CONSTRAINT "competitions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "competitions" ADD CONSTRAINT "competitions_bowId_fkey" FOREIGN KEY ("bowId") REFERENCES "bows"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "competitions" ADD CONSTRAINT "competitions_arrowsId_fkey" FOREIGN KEY ("arrowsId") REFERENCES "arrows"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "competition_rounds" ADD CONSTRAINT "competition_rounds_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

