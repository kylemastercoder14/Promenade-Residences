-- CreateEnum
CREATE TYPE "MonthlyDueStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "monthly_due" ADD COLUMN     "status" "MonthlyDueStatus" NOT NULL DEFAULT 'PENDING';
