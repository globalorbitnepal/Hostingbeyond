-- Beyond Master DNS proposals. Does not change NameSilo tables or domain registration rows.
CREATE TABLE "BeyondMasterDnsProposal" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "customerUserId" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "recordType" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "ttl" INTEGER NOT NULL,
    "priority" INTEGER,
    "recordId" TEXT,
    "snapshot" JSONB,
    "status" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "claimToken" TEXT,
    "providerStatus" TEXT,
    "verified" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BeyondMasterDnsProposal_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BeyondMasterDnsProposal_publicId_key" ON "BeyondMasterDnsProposal"("publicId");
CREATE UNIQUE INDEX "BeyondMasterDnsProposal_idempotencyKey_key" ON "BeyondMasterDnsProposal"("idempotencyKey");
CREATE INDEX "BeyondMasterDnsProposal_customerUserId_status_idx" ON "BeyondMasterDnsProposal"("customerUserId", "status");
CREATE INDEX "BeyondMasterDnsProposal_domain_idx" ON "BeyondMasterDnsProposal"("domain");
CREATE INDEX "BeyondMasterDnsProposal_expiresAt_idx" ON "BeyondMasterDnsProposal"("expiresAt");

ALTER TABLE "BeyondMasterDnsProposal" ADD CONSTRAINT "BeyondMasterDnsProposal_customerUserId_fkey" FOREIGN KEY ("customerUserId") REFERENCES "CustomerUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
