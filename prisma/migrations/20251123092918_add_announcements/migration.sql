-- CreateEnum
CREATE TYPE "AnnouncementCategory" AS ENUM ('IMPORTANT', 'EMERGENCY', 'UTILITIES', 'OTHER');

-- CreateEnum
CREATE TYPE "PublicationStatus" AS ENUM ('PUBLISHED', 'DRAFT');

-- CreateTable
CREATE TABLE "announcement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "AnnouncementCategory" NOT NULL,
    "isForAll" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT NOT NULL,
    "attachment" TEXT,
    "schedule" TIMESTAMP(3),
    "isPin" BOOLEAN NOT NULL DEFAULT false,
    "publication" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "announcement_pkey" PRIMARY KEY ("id")
);
