-- DropForeignKey
ALTER TABLE "practices" DROP CONSTRAINT "practices_roundTypeId_fkey";

-- DropIndex
DROP INDEX "practices_roundTypeId_key";

-- AlterTable
ALTER TABLE "practices" ALTER COLUMN "roundTypeId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "practices" ADD CONSTRAINT "practices_roundTypeId_fkey" FOREIGN KEY ("roundTypeId") REFERENCES "round_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;
