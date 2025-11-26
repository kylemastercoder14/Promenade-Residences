-- CreateTable
CREATE TABLE "maps" (
    "id" TEXT NOT NULL,
    "blockNo" TEXT NOT NULL,
    "lotNo" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "lotSize" DOUBLE PRECISION NOT NULL,
    "houseType" TEXT NOT NULL,
    "minPrice" DOUBLE PRECISION NOT NULL,
    "maxPrice" DOUBLE PRECISION NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "attachmentUrl" TEXT NOT NULL,
    "availability" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "maps_pkey" PRIMARY KEY ("id")
);
