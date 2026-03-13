-- Add targetType column to ends and competition_rounds.
-- IF NOT EXISTS keeps this safe whether or not the column was previously added via db push.
ALTER TABLE "ends" ADD COLUMN IF NOT EXISTS "targetType" TEXT;
ALTER TABLE "competition_rounds" ADD COLUMN IF NOT EXISTS "targetType" TEXT;

