-- Migrate existing competition practices to competitions table
-- This script moves all practices with practiceType='KONKURRANSE' to the new competitions table

-- First, insert competition data from existing practices
INSERT INTO "competitions" (
    "id",
    "userId",
    "date",
    "name",
    "location",
    "notes",
    "totalScore",
    "environment",
    "weather",
    "practiceCategory",
    "bowId",
    "arrowsId",
    "createdAt",
    "updatedAt"
)
SELECT
    "id",
    "userId",
    "date",
    COALESCE("location", 'Konkurranse') as "name", -- Use location as name, default to 'Konkurranse'
    "location",
    "notes",
    "totalScore",
    "environment",
    "weather",
    "practiceCategory",
    "bowId",
    "arrowsId",
    "createdAt",
    "updatedAt"
FROM "practices"
WHERE "practiceType" = 'KONKURRANSE';

-- Migrate ends to competition_rounds
INSERT INTO "competition_rounds" (
    "id",
    "competitionId",
    "roundNumber",
    "arrows",
    "scores",
    "roundScore",
    "distanceMeters",
    "targetSizeCm",
    "createdAt",
    "updatedAt"
)
SELECT
    e."id",
    e."practiceId" as "competitionId",
    ROW_NUMBER() OVER (PARTITION BY e."practiceId" ORDER BY e."createdAt") as "roundNumber",
    e."arrows",
    e."scores",
    e."roundScore",
    e."distanceMeters",
    e."targetSizeCm",
    e."createdAt",
    e."updatedAt"
FROM "ends" e
INNER JOIN "practices" p ON e."practiceId" = p."id"
WHERE p."practiceType" = 'KONKURRANSE';

-- Delete the migrated ends from the ends table
DELETE FROM "ends"
WHERE "practiceId" IN (
    SELECT "id" FROM "practices" WHERE "practiceType" = 'KONKURRANSE'
);

-- Delete the migrated practices
DELETE FROM "practices"
WHERE "practiceType" = 'KONKURRANSE';

-- Now drop the practiceType column from practices table
ALTER TABLE "practices" DROP COLUMN "practiceType";

