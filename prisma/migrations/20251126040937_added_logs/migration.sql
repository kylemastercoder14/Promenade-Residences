-- CreateEnum
CREATE TYPE "LogAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'ARCHIVE', 'RETRIEVE', 'LOGIN', 'LOGOUT', 'PASSWORD_CHANGE', 'PROFILE_UPDATE', 'STATUS_CHANGE', 'PAYMENT_CREATE', 'PAYMENT_UPDATE', 'PAYMENT_DELETE');

-- CreateEnum
CREATE TYPE "LogModule" AS ENUM ('ACCOUNTS', 'RESIDENTS', 'VEHICLE_REGISTRATIONS', 'ANNOUNCEMENTS', 'AMENITY_RESERVATIONS', 'MAPS', 'MONTHLY_DUES', 'SETTINGS', 'AUTH');

-- CreateTable
CREATE TABLE "system_log" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" "LogAction" NOT NULL,
    "module" "LogModule" NOT NULL,
    "entityId" TEXT,
    "entityType" TEXT,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "system_log_userId_idx" ON "system_log"("userId");

-- CreateIndex
CREATE INDEX "system_log_module_idx" ON "system_log"("module");

-- CreateIndex
CREATE INDEX "system_log_action_idx" ON "system_log"("action");

-- CreateIndex
CREATE INDEX "system_log_createdAt_idx" ON "system_log"("createdAt");

-- AddForeignKey
ALTER TABLE "system_log" ADD CONSTRAINT "system_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
