-- CreateTable
CREATE TABLE "bow_specifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bowId" TEXT NOT NULL,
    "intervalSightReal" INTEGER,
    "intervalSightMeasured" INTEGER,
    "placement" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bow_specifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sight_marks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bowSpecificationId" TEXT NOT NULL,
    "givenMarks" DOUBLE PRECISION[],
    "givenDistances" DOUBLE PRECISION[],
    "ballisticsParameters" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sight_marks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sight_mark_results" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sightMarkId" TEXT NOT NULL,
    "distanceFrom" DOUBLE PRECISION NOT NULL,
    "distanceTo" DOUBLE PRECISION NOT NULL,
    "interval" DOUBLE PRECISION NOT NULL,
    "angles" DOUBLE PRECISION[],
    "distances" DOUBLE PRECISION[],
    "sightMarksByAngle" JSONB NOT NULL,
    "arrowSpeedByAngle" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sight_mark_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bow_specifications_userId_bowId_key" ON "bow_specifications"("userId", "bowId");

-- AddForeignKey
ALTER TABLE "bow_specifications" ADD CONSTRAINT "bow_specifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bow_specifications" ADD CONSTRAINT "bow_specifications_bowId_fkey" FOREIGN KEY ("bowId") REFERENCES "bows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sight_marks" ADD CONSTRAINT "sight_marks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sight_marks" ADD CONSTRAINT "sight_marks_bowSpecificationId_fkey" FOREIGN KEY ("bowSpecificationId") REFERENCES "bow_specifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sight_mark_results" ADD CONSTRAINT "sight_mark_results_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sight_mark_results" ADD CONSTRAINT "sight_mark_results_sightMarkId_fkey" FOREIGN KEY ("sightMarkId") REFERENCES "sight_marks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
