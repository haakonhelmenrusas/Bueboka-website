-- Add publicAchievements field to user table.
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "publicAchievements" BOOLEAN NOT NULL DEFAULT false;
