-- Beyond Master: shared rate limits, monthly AI budget ledger, human support queue fields

-- AlterEnum
ALTER TYPE "ActivityAction" ADD VALUE IF NOT EXISTS 'BEYOND_MASTER_SUPPORT_QUEUE';
ALTER TYPE "ActivityAction" ADD VALUE IF NOT EXISTS 'BEYOND_MASTER_SUPPORT_MESSAGE';

-- CreateTable
CREATE TABLE "BeyondMasterRateLimitBucket" (
    "id" TEXT NOT NULL,
    "bucketKey" VARCHAR(200) NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BeyondMasterRateLimitBucket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeyondMasterAiBudgetMonth" (
    "id" TEXT NOT NULL,
    "monthKey" VARCHAR(12) NOT NULL,
    "spentCents" INTEGER NOT NULL DEFAULT 0,
    "reservedCents" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BeyondMasterAiBudgetMonth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeyondMasterAiBudgetReservation" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "monthKey" TEXT NOT NULL,
    "customerUserId" TEXT,
    "reservedCents" INTEGER NOT NULL,
    "actualCents" INTEGER,
    "reconciledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BeyondMasterAiBudgetReservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeyondMasterAiCustomerMonthSpend" (
    "id" TEXT NOT NULL,
    "monthKey" TEXT NOT NULL,
    "customerUserId" TEXT NOT NULL,
    "spentCents" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BeyondMasterAiCustomerMonthSpend_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "BeyondMasterChatThread" ADD COLUMN "supportQueueStatus" TEXT,
ADD COLUMN "supportAssignedAdminId" TEXT,
ADD COLUMN "supportTicketReference" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "BeyondMasterRateLimitBucket_bucketKey_key" ON "BeyondMasterRateLimitBucket"("bucketKey");

-- CreateIndex
CREATE INDEX "BeyondMasterRateLimitBucket_windowStart_idx" ON "BeyondMasterRateLimitBucket"("windowStart");

-- CreateIndex
CREATE UNIQUE INDEX "BeyondMasterAiBudgetMonth_monthKey_key" ON "BeyondMasterAiBudgetMonth"("monthKey");

-- CreateIndex
CREATE UNIQUE INDEX "BeyondMasterAiBudgetReservation_requestId_key" ON "BeyondMasterAiBudgetReservation"("requestId");

-- CreateIndex
CREATE INDEX "BeyondMasterAiBudgetReservation_monthKey_idx" ON "BeyondMasterAiBudgetReservation"("monthKey");

-- CreateIndex
CREATE INDEX "BeyondMasterAiBudgetReservation_customerUserId_idx" ON "BeyondMasterAiBudgetReservation"("customerUserId");

-- CreateIndex
CREATE INDEX "BeyondMasterAiCustomerMonthSpend_monthKey_idx" ON "BeyondMasterAiCustomerMonthSpend"("monthKey");

-- CreateIndex
CREATE UNIQUE INDEX "BeyondMasterAiCustomerMonthSpend_monthKey_customerUserId_key" ON "BeyondMasterAiCustomerMonthSpend"("monthKey", "customerUserId");

-- CreateIndex
CREATE INDEX "BeyondMasterChatThread_supportQueueStatus_idx" ON "BeyondMasterChatThread"("supportQueueStatus");

-- CreateIndex
CREATE INDEX "BeyondMasterChatThread_supportAssignedAdminId_idx" ON "BeyondMasterChatThread"("supportAssignedAdminId");

-- AddForeignKey
ALTER TABLE "BeyondMasterChatThread" ADD CONSTRAINT "BeyondMasterChatThread_supportAssignedAdminId_fkey" FOREIGN KEY ("supportAssignedAdminId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeyondMasterAiCustomerMonthSpend" ADD CONSTRAINT "BeyondMasterAiCustomerMonthSpend_customerUserId_fkey" FOREIGN KEY ("customerUserId") REFERENCES "CustomerUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
