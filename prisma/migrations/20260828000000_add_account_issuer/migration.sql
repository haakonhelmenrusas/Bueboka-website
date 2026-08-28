BEGIN;

-- 1. nullable first: safe against a populated table
ALTER TABLE "account" ADD COLUMN "issuer" TEXT;

-- 2. backfill every row
UPDATE "account" SET "issuer" = 'local:credential'
  WHERE "providerId" = 'credential';
UPDATE "account" SET "issuer" = 'https://accounts.google.com'
  WHERE "providerId" = 'google';

-- 3. catch-all for any provider not handled above
UPDATE "account" SET "issuer" = 'local:oauth:' || "providerId"
  WHERE "issuer" IS NULL;

-- 4. only now enforce the constraint
ALTER TABLE "account" ALTER COLUMN "issuer" SET NOT NULL;

-- 5. the index 1.7 declares
CREATE UNIQUE INDEX "account_issuer_accountId_key"
  ON "account" ("issuer", "accountId");

-- 6. 1.7 also expects userId indexed; only the FK exists today
CREATE INDEX "account_userId_idx" ON "account" ("userId");

COMMIT;
