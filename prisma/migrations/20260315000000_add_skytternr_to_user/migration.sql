-- Add skytternr column to user table.
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "skytternr" TEXT;
