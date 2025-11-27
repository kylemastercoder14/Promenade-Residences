-- CreateEnum
CREATE TYPE "WhatsNewCategory" AS ENUM ('INVESTMENT', 'TRAVEL', 'SHOPPING', 'FOOD', 'LIFESTYLE', 'TECHNOLOGY', 'HEALTH', 'EDUCATION', 'ENTERTAINMENT', 'OTHER');

-- AlterTable
ALTER TABLE "whats_new" ADD COLUMN     "category" "WhatsNewCategory",
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "whats_new_category_idx" ON "whats_new"("category");

-- CreateIndex
CREATE INDEX "whats_new_isFeatured_idx" ON "whats_new"("isFeatured");
