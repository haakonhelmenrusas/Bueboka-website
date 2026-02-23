/*
  Warnings:

  - You are about to drop the column `arrowsWithScore` on the `round_types` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "practices" ADD COLUMN     "roundScore" INTEGER;

-- AlterTable
ALTER TABLE "round_types" DROP COLUMN "arrowsWithScore",
ADD COLUMN     "arrowsWithoutScore" INTEGER;
