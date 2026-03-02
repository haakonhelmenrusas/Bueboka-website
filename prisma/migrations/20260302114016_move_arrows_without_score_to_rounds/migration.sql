/*
  Warnings:

  - You are about to drop the column `arrowsWithoutScore` on the `practices` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "competition_rounds_competitionId_idx";

-- AlterTable
ALTER TABLE "competition_rounds" ADD COLUMN     "arrowsWithoutScore" INTEGER,
ALTER COLUMN "arrows" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ends" ADD COLUMN     "arrowsWithoutScore" INTEGER,
ALTER COLUMN "arrows" DROP NOT NULL;

-- AlterTable
ALTER TABLE "practices" DROP COLUMN "arrowsWithoutScore";
