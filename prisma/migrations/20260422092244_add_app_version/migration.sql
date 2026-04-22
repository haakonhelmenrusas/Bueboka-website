-- CreateTable
CREATE TABLE "AppVersion" (
    "id" TEXT NOT NULL,
    "minVersion" TEXT NOT NULL,
    "currentVersion" TEXT NOT NULL,
    "updateMessage" TEXT NOT NULL,
    "iosMinVersion" TEXT NOT NULL,
    "iosStoreUrl" TEXT NOT NULL,
    "androidMinVersion" TEXT NOT NULL,
    "androidStoreUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppVersion_pkey" PRIMARY KEY ("id")
);
