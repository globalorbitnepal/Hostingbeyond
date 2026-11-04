-- Beyond Master AI usage log. Does not alter Beyond AI subscription tables.
CREATE TABLE "BeyondMasterUsage" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "latencyMs" INTEGER,
    "promptTokens" INTEGER,
    "completionTokens" INTEGER,
    "customerUserId" TEXT,
    "ipHash" TEXT,
    "errorCode" TEXT,

    CONSTRAINT "BeyondMasterUsage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BeyondMasterUsage_createdAt_idx" ON "BeyondMasterUsage"("createdAt");
CREATE INDEX "BeyondMasterUsage_customerUserId_idx" ON "BeyondMasterUsage"("customerUserId");
CREATE INDEX "BeyondMasterUsage_provider_idx" ON "BeyondMasterUsage"("provider");
CREATE INDEX "BeyondMasterUsage_status_idx" ON "BeyondMasterUsage"("status");
