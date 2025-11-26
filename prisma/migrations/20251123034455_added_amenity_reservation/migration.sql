-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('RESIDENT', 'TENANT', 'VISITOR');

-- CreateEnum
CREATE TYPE "AmenityType" AS ENUM ('COURT', 'GAZEBO', 'PARKING_AREA');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'REFUNDED');

-- CreateTable
CREATE TABLE "amenity_reservation" (
    "id" TEXT NOT NULL,
    "userType" "UserType" NOT NULL,
    "userId" TEXT,
    "fullName" TEXT NOT NULL,
    "amenity" "AmenityType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "numberOfGuests" INTEGER NOT NULL,
    "purpose" TEXT,
    "paymentMethod" TEXT NOT NULL,
    "amountToPay" DOUBLE PRECISION NOT NULL,
    "amountPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "receiptUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "amenity_reservation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "amenity_reservation" ADD CONSTRAINT "amenity_reservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
