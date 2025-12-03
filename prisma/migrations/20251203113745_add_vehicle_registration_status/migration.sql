-- CreateEnum
CREATE TYPE "VehicleRegistrationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "vehicle_registration" ADD COLUMN     "status" "VehicleRegistrationStatus" NOT NULL DEFAULT 'PENDING';
