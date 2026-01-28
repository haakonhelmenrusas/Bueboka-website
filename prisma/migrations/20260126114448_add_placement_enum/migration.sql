/*
  Warnings:

  - The `placement` column on the `bow_specifications` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Placement" AS ENUM ('BAK_LINJEN', 'OVER_LINJEN', 'ANNET');

-- AlterTable
ALTER TABLE "bow_specifications" DROP COLUMN "placement",
ADD COLUMN     "placement" "Placement";
