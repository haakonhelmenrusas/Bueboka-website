-- Consolidated migration: full schema as of 2026-03-05
-- This replaces all previous individual migrations.

-- ─── Enums ───────────────────────────────────────────────────────────────────

CREATE TYPE "Material" AS ENUM ('KARBON', 'ALUMINIUM', 'TREVERK');

CREATE TYPE "Placement" AS ENUM ('BAK_LINJEN', 'OVER_LINJEN', 'ANNET');

CREATE TYPE "Environment" AS ENUM ('INDOOR', 'OUTDOOR');

CREATE TYPE "WeatherCondition" AS ENUM (
    'SUN', 'CLOUDED', 'CLEAR', 'RAIN', 'WIND', 'SNOW',
    'FOG', 'THUNDER', 'CHANGING_CONDITIONS', 'OTHER'
);

CREATE TYPE "BowType" AS ENUM (
    'RECURVE', 'COMPOUND', 'LONGBOW', 'BAREBOW',
    'HORSEBOW', 'TRADITIONAL', 'OTHER'
);

CREATE TYPE "PracticeCategory" AS ENUM ('SKIVE_INDOOR', 'SKIVE_OUTDOOR', 'JAKT_3D', 'FELT');

-- ─── Tables ──────────────────────────────────────────────────────────────────

CREATE TABLE "user" (
    "id"            TEXT         NOT NULL,
    "email"         TEXT         NOT NULL,
    "emailVerified" BOOLEAN      NOT NULL DEFAULT false,
    "name"          TEXT,
    "club"          TEXT,
    "image"         TEXT,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "account" (
    "id"                    TEXT         NOT NULL,
    "userId"                TEXT         NOT NULL,
    "accountId"             TEXT         NOT NULL,
    "providerId"            TEXT         NOT NULL,
    "accessToken"           TEXT,
    "refreshToken"          TEXT,
    "accessTokenExpiresAt"  TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope"                 TEXT,
    "idToken"               TEXT,
    "password"              TEXT,
    "createdAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"             TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "session" (
    "id"        TEXT         NOT NULL,
    "userId"    TEXT         NOT NULL,
    "token"     TEXT         NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "verification" (
    "id"         TEXT         NOT NULL,
    "identifier" TEXT         NOT NULL,
    "value"      TEXT         NOT NULL,
    "expiresAt"  TIMESTAMP(3) NOT NULL,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "bows" (
    "id"         TEXT             NOT NULL,
    "userId"     TEXT             NOT NULL,
    "name"       TEXT             NOT NULL,
    "type"       "BowType"        NOT NULL,
    "eyeToNock"  DOUBLE PRECISION,
    "aimMeasure" DOUBLE PRECISION,
    "eyeToSight" DOUBLE PRECISION,
    "notes"      TEXT,
    "isFavorite" BOOLEAN          NOT NULL DEFAULT false,
    "createdAt"  TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMP(3)     NOT NULL,

    CONSTRAINT "bows_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "arrows" (
    "id"          TEXT             NOT NULL,
    "userId"      TEXT             NOT NULL,
    "name"        TEXT             NOT NULL,
    "arrowsCount" INTEGER,
    "diameter"    DOUBLE PRECISION,
    "weight"      DOUBLE PRECISION,
    "length"      DOUBLE PRECISION,
    "material"    "Material"       NOT NULL,
    "spine"       TEXT,
    "pointType"   TEXT,
    "pointWeight" DOUBLE PRECISION,
    "vanes"       TEXT,
    "nock"        TEXT,
    "notes"       TEXT,
    "isFavorite"  BOOLEAN          NOT NULL DEFAULT false,
    "createdAt"   TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3)     NOT NULL,

    CONSTRAINT "arrows_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "round_types" (
    "id"                 TEXT         NOT NULL,
    "name"               TEXT         NOT NULL,
    "distanceMeters"     INTEGER,
    "targetType"         JSONB,
    "numberArrows"       INTEGER,
    "arrowsWithoutScore" INTEGER,
    "roundScore"         INTEGER,
    "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"          TIMESTAMP(3) NOT NULL,

    CONSTRAINT "round_types_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "practices" (
    "id"               TEXT                  NOT NULL,
    "userId"           TEXT                  NOT NULL,
    "date"             TIMESTAMP(3)          NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes"            TEXT,
    "totalScore"       INTEGER               NOT NULL,
    "rating"           INTEGER,
    "location"         TEXT,
    "environment"      "Environment"         NOT NULL,
    "weather"          "WeatherCondition"[],
    "practiceCategory" "PracticeCategory"    NOT NULL DEFAULT 'SKIVE_INDOOR',
    "roundTypeId"      TEXT,
    "bowId"            TEXT,
    "arrowsId"         TEXT,
    "createdAt"        TIMESTAMP(3)          NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"        TIMESTAMP(3)          NOT NULL,

    CONSTRAINT "practices_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ends" (
    "id"                 TEXT         NOT NULL,
    "practiceId"         TEXT         NOT NULL,
    "arrows"             INTEGER,
    "arrowsWithoutScore" INTEGER,
    "scores"             INTEGER[],
    "roundScore"         INTEGER,
    "distanceMeters"     INTEGER,
    "distanceFrom"       INTEGER,
    "distanceTo"         INTEGER,
    "targetSizeCm"       INTEGER,
    "arrowsPerEnd"       INTEGER,
    "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"          TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ends_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "competitions" (
    "id"                   TEXT                  NOT NULL,
    "userId"               TEXT                  NOT NULL,
    "date"                 TIMESTAMP(3)          NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name"                 TEXT                  NOT NULL,
    "location"             TEXT,
    "organizerName"        TEXT,
    "notes"                TEXT,
    "totalScore"           INTEGER               NOT NULL,
    "placement"            INTEGER,
    "numberOfParticipants" INTEGER,
    "personalBest"         BOOLEAN               NOT NULL DEFAULT false,
    "environment"          "Environment"         NOT NULL,
    "weather"              "WeatherCondition"[],
    "practiceCategory"     "PracticeCategory"    NOT NULL DEFAULT 'SKIVE_INDOOR',
    "bowId"                TEXT,
    "arrowsId"             TEXT,
    "createdAt"            TIMESTAMP(3)          NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"            TIMESTAMP(3)          NOT NULL,

    CONSTRAINT "competitions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "competition_rounds" (
    "id"                 TEXT         NOT NULL,
    "competitionId"      TEXT         NOT NULL,
    "roundNumber"        INTEGER      NOT NULL,
    "arrows"             INTEGER,
    "arrowsWithoutScore" INTEGER,
    "scores"             INTEGER[],
    "roundScore"         INTEGER,
    "distanceMeters"     INTEGER,
    "targetSizeCm"       INTEGER,
    "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"          TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competition_rounds_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "bow_specifications" (
    "id"                    TEXT         NOT NULL,
    "userId"                TEXT         NOT NULL,
    "bowId"                 TEXT         NOT NULL,
    "intervalSightReal"     INTEGER,
    "intervalSightMeasured" INTEGER,
    "placement"             "Placement",
    "createdAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"             TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bow_specifications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sight_marks" (
    "id"                 TEXT         NOT NULL,
    "userId"             TEXT         NOT NULL,
    "bowSpecificationId" TEXT         NOT NULL,
    "givenMarks"         DOUBLE PRECISION[],
    "givenDistances"     DOUBLE PRECISION[],
    "ballisticsParameters" JSONB      NOT NULL,
    "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"          TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sight_marks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sight_mark_results" (
    "id"                TEXT             NOT NULL,
    "userId"            TEXT             NOT NULL,
    "sightMarkId"       TEXT             NOT NULL,
    "distanceFrom"      DOUBLE PRECISION NOT NULL,
    "distanceTo"        DOUBLE PRECISION NOT NULL,
    "interval"          DOUBLE PRECISION NOT NULL,
    "angles"            DOUBLE PRECISION[],
    "distances"         DOUBLE PRECISION[],
    "sightMarksByAngle" JSONB            NOT NULL,
    "arrowSpeedByAngle" JSONB            NOT NULL,
    "createdAt"         TIMESTAMP(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"         TIMESTAMP(3)     NOT NULL,

    CONSTRAINT "sight_mark_results_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_achievements" (
    "id"            TEXT         NOT NULL,
    "userId"        TEXT         NOT NULL,
    "achievementId" TEXT         NOT NULL,
    "unlockedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "progress"      INTEGER      NOT NULL DEFAULT 0,
    "notified"      BOOLEAN      NOT NULL DEFAULT false,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────

CREATE UNIQUE INDEX "user_email_key"                        ON "user"("email");
CREATE UNIQUE INDEX "account_providerId_accountId_key"      ON "account"("providerId", "accountId");
CREATE UNIQUE INDEX "session_token_key"                     ON "session"("token");
CREATE INDEX        "practices_userId_idx"                  ON "practices"("userId");
CREATE INDEX        "practices_date_idx"                    ON "practices"("date");
CREATE INDEX        "competitions_userId_idx"               ON "competitions"("userId");
CREATE INDEX        "competitions_date_idx"                 ON "competitions"("date");
CREATE UNIQUE INDEX "bow_specifications_userId_bowId_key"   ON "bow_specifications"("userId", "bowId");
CREATE INDEX        "user_achievements_userId_idx"          ON "user_achievements"("userId");
CREATE UNIQUE INDEX "user_achievements_userId_achievementId_key" ON "user_achievements"("userId", "achievementId");

-- ─── Foreign Keys ────────────────────────────────────────────────────────────

ALTER TABLE "account"
    ADD CONSTRAINT "account_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "session"
    ADD CONSTRAINT "session_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "bows"
    ADD CONSTRAINT "bows_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "arrows"
    ADD CONSTRAINT "arrows_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "practices"
    ADD CONSTRAINT "practices_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "practices"
    ADD CONSTRAINT "practices_bowId_fkey"
    FOREIGN KEY ("bowId") REFERENCES "bows"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "practices"
    ADD CONSTRAINT "practices_arrowsId_fkey"
    FOREIGN KEY ("arrowsId") REFERENCES "arrows"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "practices"
    ADD CONSTRAINT "practices_roundTypeId_fkey"
    FOREIGN KEY ("roundTypeId") REFERENCES "round_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ends"
    ADD CONSTRAINT "ends_practiceId_fkey"
    FOREIGN KEY ("practiceId") REFERENCES "practices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "competitions"
    ADD CONSTRAINT "competitions_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "competitions"
    ADD CONSTRAINT "competitions_bowId_fkey"
    FOREIGN KEY ("bowId") REFERENCES "bows"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "competitions"
    ADD CONSTRAINT "competitions_arrowsId_fkey"
    FOREIGN KEY ("arrowsId") REFERENCES "arrows"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "competition_rounds"
    ADD CONSTRAINT "competition_rounds_competitionId_fkey"
    FOREIGN KEY ("competitionId") REFERENCES "competitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "bow_specifications"
    ADD CONSTRAINT "bow_specifications_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "bow_specifications"
    ADD CONSTRAINT "bow_specifications_bowId_fkey"
    FOREIGN KEY ("bowId") REFERENCES "bows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "sight_marks"
    ADD CONSTRAINT "sight_marks_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "sight_marks"
    ADD CONSTRAINT "sight_marks_bowSpecificationId_fkey"
    FOREIGN KEY ("bowSpecificationId") REFERENCES "bow_specifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "sight_mark_results"
    ADD CONSTRAINT "sight_mark_results_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "sight_mark_results"
    ADD CONSTRAINT "sight_mark_results_sightMarkId_fkey"
    FOREIGN KEY ("sightMarkId") REFERENCES "sight_marks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_achievements"
    ADD CONSTRAINT "user_achievements_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

