-- CreateEnum
CREATE TYPE "ResidencyType" AS ENUM ('RESIDENT', 'TENANT');

-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('MALE', 'FEMALE', 'PREFER_NOT_TO_SAY');

-- AlterTable
ALTER TABLE "vehicle_registration" ADD COLUMN     "residentId" TEXT;

-- CreateTable
CREATE TABLE "resident" (
    "id" TEXT NOT NULL,
    "typeOfResidency" "ResidencyType" NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "suffix" TEXT,
    "sex" "Sex" NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "emailAddress" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "isHead" BOOLEAN NOT NULL DEFAULT false,
    "mapId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resident_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "vehicle_registration" ADD CONSTRAINT "vehicle_registration_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "resident"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resident" ADD CONSTRAINT "resident_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "maps"("id") ON DELETE SET NULL ON UPDATE CASCADE;
