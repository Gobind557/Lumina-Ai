-- CreateTable
CREATE TABLE "EmailOpenEvent" (
    "id" TEXT NOT NULL,
    "emailId" TEXT NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailOpenEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmailOpenEvent_emailId_idx" ON "EmailOpenEvent"("emailId");

-- CreateIndex
CREATE INDEX "EmailOpenEvent_openedAt_idx" ON "EmailOpenEvent"("openedAt");

-- AddForeignKey
ALTER TABLE "EmailOpenEvent" ADD CONSTRAINT "EmailOpenEvent_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "Email"("id") ON DELETE CASCADE ON UPDATE CASCADE;
