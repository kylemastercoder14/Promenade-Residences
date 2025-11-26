-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'GCASH', 'MAYA', 'OTHER_BANK');

-- CreateTable
CREATE TABLE "monthly_due" (
    "id" TEXT NOT NULL,
    "residentId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "amountPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paymentMethod" "PaymentMethod",
    "notes" TEXT,
    "attachment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "monthly_due_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "monthly_due_residentId_month_year_key" ON "monthly_due"("residentId", "month", "year");

-- AddForeignKey
ALTER TABLE "monthly_due" ADD CONSTRAINT "monthly_due_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "resident"("id") ON DELETE CASCADE ON UPDATE CASCADE;
