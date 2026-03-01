/*
  Warnings:

  - The values [SKIVE,ANNET] on the enum `PracticeCategory` will be removed. If these variants are still used in the database, this will fail.

*/

-- Add new distance range columns to ends table first
ALTER TABLE "ends" ADD COLUMN "distanceFrom" INTEGER;
ALTER TABLE "ends" ADD COLUMN "distanceTo" INTEGER;

-- AlterEnum: Transform PracticeCategory enum
BEGIN;
-- Create new enum type
CREATE TYPE "PracticeCategory_new" AS ENUM ('SKIVE_INDOOR', 'SKIVE_OUTDOOR', 'JAKT_3D', 'FELT');

-- Add a temporary column to store the new values
ALTER TABLE "practices" ADD COLUMN "practiceCategory_new" "PracticeCategory_new";

-- Migrate existing data:
-- - SKIVE + INDOOR environment -> SKIVE_INDOOR
-- - SKIVE + OUTDOOR environment -> SKIVE_OUTDOOR
-- - ANNET -> SKIVE_INDOOR (default)
-- - Keep JAKT_3D and FELT as is
UPDATE "practices"
SET "practiceCategory_new" =
  CASE
    WHEN "practiceCategory" = 'SKIVE' AND "environment" = 'INDOOR' THEN 'SKIVE_INDOOR'::"PracticeCategory_new"
    WHEN "practiceCategory" = 'SKIVE' AND "environment" = 'OUTDOOR' THEN 'SKIVE_OUTDOOR'::"PracticeCategory_new"
    WHEN "practiceCategory" = 'ANNET' THEN 'SKIVE_INDOOR'::"PracticeCategory_new"
    WHEN "practiceCategory" = 'JAKT_3D' THEN 'JAKT_3D'::"PracticeCategory_new"
    WHEN "practiceCategory" = 'FELT' THEN 'FELT'::"PracticeCategory_new"
    ELSE 'SKIVE_INDOOR'::"PracticeCategory_new"
  END;

-- Drop the old column
ALTER TABLE "practices" DROP COLUMN "practiceCategory";

-- Rename the new column
ALTER TABLE "practices" RENAME COLUMN "practiceCategory_new" TO "practiceCategory";

-- Drop the old enum type
DROP TYPE "PracticeCategory";

-- Rename the new type
ALTER TYPE "PracticeCategory_new" RENAME TO "PracticeCategory";

-- Set default value
ALTER TABLE "practices" ALTER COLUMN "practiceCategory" SET DEFAULT 'SKIVE_INDOOR';

-- Make it not null if needed
ALTER TABLE "practices" ALTER COLUMN "practiceCategory" SET NOT NULL;

COMMIT;


