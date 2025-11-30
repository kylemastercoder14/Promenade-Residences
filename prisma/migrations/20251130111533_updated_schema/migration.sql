/*
  Warnings:

  - You are about to drop the column `paymentStatus` on the `amenity_reservation` table. All the data in the column will be lost.
  - You are about to drop the column `chassisNumber` on the `vehicle_registration` table. All the data in the column will be lost.
  - You are about to drop the column `engineNumber` on the `vehicle_registration` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "amenity_reservation" DROP COLUMN "paymentStatus",
ADD COLUMN     "rejectionRemarks" TEXT;

-- AlterTable
ALTER TABLE "vehicle_registration" DROP COLUMN "chassisNumber",
DROP COLUMN "engineNumber";

-- DropEnum
DROP TYPE "PaymentStatus";

-- CreateTable
CREATE TABLE "payment_transaction" (
    "id" TEXT NOT NULL,
    "monthlyDueId" TEXT,
    "residentId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentMethod" "PaymentMethod",
    "notes" TEXT,
    "proofOfPayment" TEXT,
    "status" "MonthlyDueStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_transaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "payment_transaction" ADD CONSTRAINT "payment_transaction_monthlyDueId_fkey" FOREIGN KEY ("monthlyDueId") REFERENCES "monthly_due"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transaction" ADD CONSTRAINT "payment_transaction_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "resident"("id") ON DELETE CASCADE ON UPDATE CASCADE;
