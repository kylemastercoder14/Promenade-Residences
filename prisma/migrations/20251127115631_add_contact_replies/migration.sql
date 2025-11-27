-- CreateTable
CREATE TABLE "contact_reply" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "adminId" TEXT,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_reply_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contact_reply_contactId_idx" ON "contact_reply"("contactId");

-- CreateIndex
CREATE INDEX "contact_reply_adminId_idx" ON "contact_reply"("adminId");

-- AddForeignKey
ALTER TABLE "contact_reply" ADD CONSTRAINT "contact_reply_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_reply" ADD CONSTRAINT "contact_reply_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
