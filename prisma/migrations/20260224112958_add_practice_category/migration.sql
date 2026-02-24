-- CreateEnum
CREATE TYPE "PracticeCategory" AS ENUM ('FELT', 'JAKT_3D', 'SKIVE', 'ANNET');

-- AlterTable
ALTER TABLE "practices" ADD COLUMN     "practiceCategory" "PracticeCategory" NOT NULL DEFAULT 'SKIVE';
