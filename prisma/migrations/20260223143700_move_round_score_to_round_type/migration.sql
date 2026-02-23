-- AlterTable
ALTER TABLE "practices" DROP COLUMN IF EXISTS "roundScore";

-- AlterTable
ALTER TABLE "round_types" ADD COLUMN IF NOT EXISTS "roundScore" INTEGER;

