-- NameSilo Orbit pricing + provider routing (dev/staging — not applied to production until approved)

ALTER TABLE "DomainTldPrice" ADD COLUMN IF NOT EXISTS "namesiloRegister" DECIMAL(10,4);
ALTER TABLE "DomainTldPrice" ADD COLUMN IF NOT EXISTS "namesiloRenew" DECIMAL(10,4);
ALTER TABLE "DomainTldPrice" ADD COLUMN IF NOT EXISTS "namesiloTransfer" DECIMAL(10,4);
ALTER TABLE "DomainTldPrice" ADD COLUMN IF NOT EXISTS "namesiloSyncedAt" TIMESTAMP(3);
ALTER TABLE "DomainTldPrice" ADD COLUMN IF NOT EXISTS "namesiloPriceStatus" TEXT;
ALTER TABLE "DomainTldPrice" ADD COLUMN IF NOT EXISTS "lifecycleProvider" TEXT;
ALTER TABLE "DomainTldPrice" ADD COLUMN IF NOT EXISTS "retailPriceLocked" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "DomainRegistration" ADD COLUMN IF NOT EXISTS "registrarProvider" TEXT NOT NULL DEFAULT 'domain-name-api';
