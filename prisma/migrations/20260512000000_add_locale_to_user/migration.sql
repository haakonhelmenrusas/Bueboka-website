-- Add nullable locale column to user table. Null means "not yet chosen";
-- the client falls back to localStorage / default until the user picks one.
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "locale" TEXT;
