/*
  Warnings:

  - You are about to drop the column `targetSizeCm` on the `round_types` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PracticeType" AS ENUM ('TRENING', 'KONKURRANSE');

-- AlterTable
ALTER TABLE "practices" ADD COLUMN     "practiceType" "PracticeType" NOT NULL DEFAULT 'TRENING';

-- AlterTable
ALTER TABLE "round_types" DROP COLUMN "targetSizeCm",
ADD COLUMN     "arrowsWithScore" INTEGER,
ADD COLUMN     "numberArrows" INTEGER,
ADD COLUMN     "targetType" JSONB;
