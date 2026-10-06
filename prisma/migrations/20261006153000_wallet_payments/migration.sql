-- CreateEnum
CREATE TYPE "WalletPaymentStatus" AS ENUM ('PENDING', 'CHECKOUT_CREATED', 'SUCCEEDED', 'FAILED', 'CANCELLED', 'REFUNDED');

-- CreateTable
CREATE TABLE "WalletPayment" (
    "id" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "WalletPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "provider" TEXT NOT NULL DEFAULT 'stripe',
    "providerCheckoutSessionId" TEXT,
    "providerPaymentIntentId" TEXT,
    "walletTransactionId" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "WalletPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WalletPayment_publicId_key" ON "WalletPayment"("publicId");
CREATE UNIQUE INDEX "WalletPayment_providerCheckoutSessionId_key" ON "WalletPayment"("providerCheckoutSessionId");
CREATE UNIQUE INDEX "WalletPayment_providerPaymentIntentId_key" ON "WalletPayment"("providerPaymentIntentId");
CREATE UNIQUE INDEX "WalletPayment_walletTransactionId_key" ON "WalletPayment"("walletTransactionId");
CREATE UNIQUE INDEX "WalletPayment_idempotencyKey_key" ON "WalletPayment"("idempotencyKey");
CREATE INDEX "WalletPayment_userId_idx" ON "WalletPayment"("userId");
CREATE INDEX "WalletPayment_status_idx" ON "WalletPayment"("status");
CREATE INDEX "WalletPayment_createdAt_idx" ON "WalletPayment"("createdAt");

-- AddForeignKey
ALTER TABLE "WalletPayment" ADD CONSTRAINT "WalletPayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "CustomerUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
