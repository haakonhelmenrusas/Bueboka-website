-- Step 1: Add nullable bowId column to sight_marks
ALTER TABLE "sight_marks" ADD COLUMN "bowId" TEXT;

-- Step 2: Backfill bowId from bow_specifications
UPDATE "sight_marks" sm
SET "bowId" = bs."bowId"
FROM "bow_specifications" bs
WHERE sm."bowSpecificationId" = bs."id";

-- Step 3: Make bowId non-nullable now that all rows are backfilled
ALTER TABLE "sight_marks" ALTER COLUMN "bowId" SET NOT NULL;

-- Step 4: Add foreign key constraint from sight_marks.bowId to bows.id (cascade delete)
ALTER TABLE "sight_marks" ADD CONSTRAINT "sight_marks_bowId_fkey" FOREIGN KEY ("bowId") REFERENCES "bows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 5: Drop the old foreign key to bow_specifications
ALTER TABLE "sight_marks" DROP CONSTRAINT "sight_marks_bowSpecificationId_fkey";

-- Step 6: Drop the bowSpecificationId column
ALTER TABLE "sight_marks" DROP COLUMN "bowSpecificationId";

-- Step 7: Drop the bow_specifications table
DROP TABLE "bow_specifications";

-- Step 8: Drop the Placement enum type
DROP TYPE "Placement";
