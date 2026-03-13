-- AlterTable: add optional name column to sight_marks
ALTER TABLE "sight_marks" ADD COLUMN IF NOT EXISTS "name" TEXT;

