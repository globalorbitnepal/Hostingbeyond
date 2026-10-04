-- CreateEnum
CREATE TYPE "HostingAddonBillingMode" AS ENUM ('MATCH_HOSTING', 'MONTHLY', 'ANNUAL', 'ONE_TIME');

CREATE TYPE "HostingAddonType" AS ENUM ('BUSINESS_EMAIL', 'DOMAIN_PRIVACY', 'BACKUP', 'SUPPORT', 'MIGRATION', 'STORAGE', 'IP', 'SSL', 'SECURITY', 'OTHER');

-- AlterTable HostingOrder
ALTER TABLE "HostingOrder" ADD COLUMN IF NOT EXISTS "lineItemsSnapshot" JSONB;
ALTER TABLE "HostingOrder" ADD COLUMN IF NOT EXISTS "paymentProvider" TEXT;
ALTER TABLE "HostingOrder" ADD COLUMN IF NOT EXISTS "paymentReference" TEXT;
ALTER TABLE "HostingOrder" ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT;
ALTER TABLE "HostingOrder" ADD COLUMN IF NOT EXISTS "paidAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "HostingAddon" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "type" "HostingAddonType" NOT NULL DEFAULT 'OTHER',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INT NOT NULL DEFAULT 0,
    "billingMode" "HostingAddonBillingMode" NOT NULL DEFAULT 'MATCH_HOSTING',
    "eligibility" JSONB NOT NULL DEFAULT '{}',
    "pricingReference" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HostingAddon_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "HostingAddon_slug_key" ON "HostingAddon"("slug");
CREATE INDEX "HostingAddon_active_idx" ON "HostingAddon"("active");
CREATE INDEX "HostingAddon_displayOrder_idx" ON "HostingAddon"("displayOrder");
