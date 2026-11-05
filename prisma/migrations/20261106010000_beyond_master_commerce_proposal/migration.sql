-- CreateTable
CREATE TABLE "BeyondMasterCommerceProposal" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "customerUserId" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "claimToken" TEXT,
    "resultMessage" TEXT,
    "verified" BOOLEAN,
    "executionErrorCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BeyondMasterCommerceProposal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BeyondMasterCommerceProposal_publicId_key" ON "BeyondMasterCommerceProposal"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "BeyondMasterCommerceProposal_idempotencyKey_key" ON "BeyondMasterCommerceProposal"("idempotencyKey");

-- CreateIndex
CREATE INDEX "BeyondMasterCommerceProposal_customerUserId_status_idx" ON "BeyondMasterCommerceProposal"("customerUserId", "status");

-- CreateIndex
CREATE INDEX "BeyondMasterCommerceProposal_expiresAt_idx" ON "BeyondMasterCommerceProposal"("expiresAt");

-- AddForeignKey
ALTER TABLE "BeyondMasterCommerceProposal" ADD CONSTRAINT "BeyondMasterCommerceProposal_customerUserId_fkey" FOREIGN KEY ("customerUserId") REFERENCES "CustomerUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
