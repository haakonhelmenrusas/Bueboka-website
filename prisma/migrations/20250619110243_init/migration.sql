-- CreateEnum
CREATE TYPE "Environment" AS ENUM ('INDOOR', 'OUTDOOR');

-- CreateEnum
CREATE TYPE "WeatherCondition" AS ENUM ('SUN', 'CLOUDED', 'RAIN', 'WIND', 'SNOW', 'FOG', 'THUNDER', 'CHANGING_CONDITIONS', 'OTHER');

-- CreateEnum
CREATE TYPE "BowType" AS ENUM ('RECURVE', 'COMPOUND', 'LONGBOW', 'BAREBOW', 'HORSEBOW', 'TRADITIONAL', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT NOT NULL,
    "club" TEXT,
    "profileImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bow" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "BowType" NOT NULL,
    "eyeToNock" INTEGER,
    "aimMeasure" INTEGER,
    "eyeToSight" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Arrows" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "diameter" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "length" DOUBLE PRECISION,
    "material" TEXT,
    "spine" TEXT,
    "pointType" TEXT,
    "pointWeight" DOUBLE PRECISION,
    "vanes" TEXT,
    "nock" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Arrows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Practice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "totalScore" INTEGER NOT NULL,
    "location" TEXT,
    "environment" "Environment" NOT NULL,
    "weather" "WeatherCondition"[],
    "roundTypeId" TEXT NOT NULL,
    "bowId" TEXT NOT NULL,
    "arrowsId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Practice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoundType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "environment" "Environment" NOT NULL,
    "distanceMeters" INTEGER,
    "targetSizeCm" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoundType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "End" (
    "id" TEXT NOT NULL,
    "practiceId" TEXT NOT NULL,
    "arrows" INTEGER NOT NULL,
    "scores" INTEGER[],
    "distanceMeters" INTEGER,
    "targetSizeCm" INTEGER,
    "arrowsPerEnd" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "End_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Practice_roundTypeId_key" ON "Practice"("roundTypeId");

-- AddForeignKey
ALTER TABLE "Bow" ADD CONSTRAINT "Bow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Arrows" ADD CONSTRAINT "Arrows_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Practice" ADD CONSTRAINT "Practice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Practice" ADD CONSTRAINT "Practice_roundTypeId_fkey" FOREIGN KEY ("roundTypeId") REFERENCES "RoundType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Practice" ADD CONSTRAINT "Practice_bowId_fkey" FOREIGN KEY ("bowId") REFERENCES "Bow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Practice" ADD CONSTRAINT "Practice_arrowsId_fkey" FOREIGN KEY ("arrowsId") REFERENCES "Arrows"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "End" ADD CONSTRAINT "End_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
