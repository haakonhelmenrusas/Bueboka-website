/*
  Warnings:

  - You are about to drop the `Arrows` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Bow` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `End` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Practice` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RoundType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."Material" AS ENUM ('KARBON', 'ALUMINIUM', 'TREVERK');

-- AlterEnum
ALTER TYPE "public"."WeatherCondition" ADD VALUE 'CLEAR';

-- DropForeignKey
ALTER TABLE "public"."Arrows" DROP CONSTRAINT "Arrows_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Bow" DROP CONSTRAINT "Bow_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."End" DROP CONSTRAINT "End_practiceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Practice" DROP CONSTRAINT "Practice_arrowsId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Practice" DROP CONSTRAINT "Practice_bowId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Practice" DROP CONSTRAINT "Practice_roundTypeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Practice" DROP CONSTRAINT "Practice_userId_fkey";

-- DropTable
DROP TABLE "public"."Arrows";

-- DropTable
DROP TABLE "public"."Bow";

-- DropTable
DROP TABLE "public"."End";

-- DropTable
DROP TABLE "public"."Practice";

-- DropTable
DROP TABLE "public"."RoundType";

-- DropTable
DROP TABLE "public"."User";

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT,
    "club" TEXT,
    "profileImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bows" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."BowType" NOT NULL,
    "eyeToNock" INTEGER,
    "aimMeasure" INTEGER,
    "eyeToSight" INTEGER,
    "notes" TEXT,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."arrows" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "diameter" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "length" DOUBLE PRECISION,
    "material" "public"."Material" NOT NULL,
    "spine" TEXT,
    "pointType" TEXT,
    "pointWeight" DOUBLE PRECISION,
    "vanes" TEXT,
    "nock" TEXT,
    "notes" TEXT,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "arrows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."practices" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "totalScore" INTEGER NOT NULL,
    "location" TEXT,
    "environment" "public"."Environment" NOT NULL,
    "weather" "public"."WeatherCondition"[],
    "roundTypeId" TEXT NOT NULL,
    "bowId" TEXT,
    "arrowsId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "practices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."round_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "environment" "public"."Environment" NOT NULL,
    "distanceMeters" INTEGER,
    "targetSizeCm" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "round_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ends" (
    "id" TEXT NOT NULL,
    "practiceId" TEXT NOT NULL,
    "arrows" INTEGER NOT NULL,
    "scores" INTEGER[],
    "distanceMeters" INTEGER,
    "targetSizeCm" INTEGER,
    "arrowsPerEnd" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ends_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "public"."accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "public"."sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "practices_roundTypeId_key" ON "public"."practices"("roundTypeId");

-- AddForeignKey
ALTER TABLE "public"."accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bows" ADD CONSTRAINT "bows_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."arrows" ADD CONSTRAINT "arrows_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."practices" ADD CONSTRAINT "practices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."practices" ADD CONSTRAINT "practices_arrowsId_fkey" FOREIGN KEY ("arrowsId") REFERENCES "public"."arrows"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."practices" ADD CONSTRAINT "practices_bowId_fkey" FOREIGN KEY ("bowId") REFERENCES "public"."bows"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."practices" ADD CONSTRAINT "practices_roundTypeId_fkey" FOREIGN KEY ("roundTypeId") REFERENCES "public"."round_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ends" ADD CONSTRAINT "ends_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "public"."practices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
