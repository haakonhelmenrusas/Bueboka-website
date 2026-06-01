-- Remap old mobile-app target type values to current API values.
-- '40cm_felt' and '60cm_felt' have direct equivalents.
-- '3d' and '20cm_felt' have no exact match — clear them.

-- ends table
UPDATE "ends" SET "targetType" = 'felt-40' WHERE "targetType" = '40cm_felt';
UPDATE "ends" SET "targetType" = 'felt-60' WHERE "targetType" = '60cm_felt';
UPDATE "ends" SET "targetType" = NULL WHERE "targetType" IN ('3d', '20cm_felt');

-- competition_rounds table
UPDATE "competition_rounds" SET "targetType" = 'felt-40' WHERE "targetType" = '40cm_felt';
UPDATE "competition_rounds" SET "targetType" = 'felt-60' WHERE "targetType" = '60cm_felt';
UPDATE "competition_rounds" SET "targetType" = NULL WHERE "targetType" IN ('3d', '20cm_felt');

-- round_types table: update the name column (format: "Xm - targetType")
UPDATE "round_types" SET "name" = REPLACE("name", '40cm_felt', 'felt-40') WHERE "name" LIKE '%40cm_felt%';
UPDATE "round_types" SET "name" = REPLACE("name", '60cm_felt', 'felt-60') WHERE "name" LIKE '%60cm_felt%';
UPDATE "round_types" SET "name" = REPLACE("name", '3d', 'other') WHERE "name" LIKE '%3d%';
UPDATE "round_types" SET "name" = REPLACE("name", '20cm_felt', 'other') WHERE "name" LIKE '%20cm_felt%';

-- round_types table: update the JSON targetType column
UPDATE "round_types"
SET "targetType" = jsonb_set("targetType"::jsonb, '{type}', '"felt-40"')
WHERE "targetType"::text LIKE '%40cm_felt%';

UPDATE "round_types"
SET "targetType" = jsonb_set("targetType"::jsonb, '{type}', '"felt-60"')
WHERE "targetType"::text LIKE '%60cm_felt%';

UPDATE "round_types"
SET "targetType" = NULL
WHERE "targetType"::text LIKE '%"3d"%' OR "targetType"::text LIKE '%20cm_felt%';