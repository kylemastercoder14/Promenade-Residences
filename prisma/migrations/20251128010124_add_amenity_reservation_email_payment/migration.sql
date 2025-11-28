/*
  Warnings:

  - The `paymentMethod` column on the `amenity_reservation` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "amenity_reservation" ADD COLUMN     "email" TEXT,
ADD COLUMN     "proofOfPayment" TEXT,
DROP COLUMN "paymentMethod",
ADD COLUMN     "paymentMethod" "PaymentMethod";
