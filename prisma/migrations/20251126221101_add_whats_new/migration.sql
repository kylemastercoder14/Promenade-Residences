-- CreateEnum
CREATE TYPE "WhatsNewType" AS ENUM ('BLOG', 'NEWS', 'GO_TO_PLACES', 'MEDIA_HUB');

-- CreateTable
CREATE TABLE "whats_new" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "WhatsNewType" NOT NULL,
    "content" TEXT,
    "imageUrl" TEXT,
    "attachmentUrl" TEXT,
    "publication" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whats_new_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "whats_new_type_idx" ON "whats_new"("type");

-- CreateIndex
CREATE INDEX "whats_new_publication_idx" ON "whats_new"("publication");

-- CreateIndex
CREATE INDEX "whats_new_isArchived_idx" ON "whats_new"("isArchived");
