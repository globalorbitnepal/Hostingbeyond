-- CreateTable
CREATE TABLE "BeyondAiSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "monthlyCreditUsd" DOUBLE PRECISION NOT NULL,
    "creditRemainingUsd" DOUBLE PRECISION NOT NULL,
    "onDemandEnabled" BOOLEAN NOT NULL DEFAULT false,
    "onDemandAccruedUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "billingInterval" TEXT NOT NULL DEFAULT 'monthly',
    "currentPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BeyondAiSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeyondAiProject" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "domain" TEXT,
    "publishedUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BeyondAiProject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BeyondAiSubscription_userId_key" ON "BeyondAiSubscription"("userId");

-- CreateIndex
CREATE INDEX "BeyondAiSubscription_planId_idx" ON "BeyondAiSubscription"("planId");

-- CreateIndex
CREATE INDEX "BeyondAiSubscription_status_idx" ON "BeyondAiSubscription"("status");

-- CreateIndex
CREATE INDEX "BeyondAiProject_userId_idx" ON "BeyondAiProject"("userId");

-- AddForeignKey
ALTER TABLE "BeyondAiSubscription" ADD CONSTRAINT "BeyondAiSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "CustomerUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeyondAiProject" ADD CONSTRAINT "BeyondAiProject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "CustomerUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
