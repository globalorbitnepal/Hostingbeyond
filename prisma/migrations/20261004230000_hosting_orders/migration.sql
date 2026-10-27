-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "HostingOrderStatus" AS ENUM ('DRAFT', 'PENDING_PAYMENT', 'PAID', 'PROVISIONING', 'ACTIVE', 'CANCELLED', 'FAILED', 'EXPIRED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AlterTable
ALTER TABLE "HostingProduct" ADD COLUMN IF NOT EXISTS "freeDomainAnnualEnabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE IF NOT EXISTS "HostingOrder" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "status" "HostingOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "productSlug" TEXT NOT NULL,
    "planKey" TEXT NOT NULL,
    "billingCycle" TEXT NOT NULL,
    "configuration" JSONB NOT NULL DEFAULT '{}',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "subtotal" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "tax" DECIMAL(10,2),
    "total" DECIMAL(10,2) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HostingOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "HostingOrder_userId_idx" ON "HostingOrder"("userId");
CREATE INDEX IF NOT EXISTS "HostingOrder_status_idx" ON "HostingOrder"("status");
CREATE INDEX IF NOT EXISTS "HostingOrder_productSlug_planKey_idx" ON "HostingOrder"("productSlug", "planKey");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "HostingOrder" ADD CONSTRAINT "HostingOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "CustomerUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
