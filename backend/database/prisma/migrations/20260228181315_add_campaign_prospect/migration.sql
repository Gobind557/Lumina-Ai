-- CreateEnum
CREATE TYPE "CampaignProspectStatus" AS ENUM ('ACTIVE', 'REPLIED');

-- CreateTable
CREATE TABLE "CampaignProspect" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "prospectId" TEXT NOT NULL,
    "status" "CampaignProspectStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignProspect_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CampaignProspect_campaignId_idx" ON "CampaignProspect"("campaignId");

-- CreateIndex
CREATE INDEX "CampaignProspect_prospectId_idx" ON "CampaignProspect"("prospectId");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignProspect_campaignId_prospectId_key" ON "CampaignProspect"("campaignId", "prospectId");

-- AddForeignKey
ALTER TABLE "CampaignProspect" ADD CONSTRAINT "CampaignProspect_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignProspect" ADD CONSTRAINT "CampaignProspect_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "Prospect"("id") ON DELETE CASCADE ON UPDATE CASCADE;
