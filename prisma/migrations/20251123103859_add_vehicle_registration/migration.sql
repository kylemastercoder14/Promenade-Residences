-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('SEDAN', 'SUV', 'TRUCK', 'MOTORCYCLE');

-- CreateEnum
CREATE TYPE "RelationshipToVehicle" AS ENUM ('OWNER', 'FAMILY_MEMBER', 'COMPANY_DRIVER');

-- CreateTable
CREATE TABLE "vehicle_registration" (
    "id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "yearOfManufacture" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "plateNumber" TEXT NOT NULL,
    "vehicleType" "VehicleType" NOT NULL,
    "chassisNumber" TEXT NOT NULL,
    "engineNumber" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "relationshipToVehicle" "RelationshipToVehicle" NOT NULL,
    "orAttachment" TEXT,
    "crAttachment" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicle_registration_pkey" PRIMARY KEY ("id")
);
