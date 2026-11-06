/*
  Warnings:

  - You are about to drop the column `Challenge` on the `round_types` table. All the data in the column will be lost.
  - You are about to drop the column `challengesReceived` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `challengesSent` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `challengesWon` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "challenges" ALTER COLUMN "startDate" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "endDate" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "challengerSubmittedAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "challengedSubmittedAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "round_types" DROP COLUMN "Challenge";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "challengesReceived",
DROP COLUMN "challengesSent",
DROP COLUMN "challengesWon";

-- AddForeignKey
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_challengerId_fkey" FOREIGN KEY ("challengerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_challengedId_fkey" FOREIGN KEY ("challengedId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_roundTypeId_fkey" FOREIGN KEY ("roundTypeId") REFERENCES "round_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;
