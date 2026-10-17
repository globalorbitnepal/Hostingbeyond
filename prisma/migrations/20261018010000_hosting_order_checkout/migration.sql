-- CreateEnum
CREATE TYPE "HostingOrderCheckoutStatus" AS ENUM (
  'PENDING',
  'CHECKOUT_CREATED',
  'COMPLETED',
  'EXPIRED',
  'CANCELLED',
  'FAILED'
);

-- CreateTable
CREATE TABLE "HostingOrderCheckout" (
    "id" TEXT NOT NULL,
    "hostingOrderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "stripeCheckoutSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "status" "HostingOrderCheckoutStatus" NOT NULL DEFAULT 'PENDING',
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HostingOrderCheckout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HostingOrderCheckout_idempotencyKey_key" ON "HostingOrderCheckout"("idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "HostingOrderCheckout_stripeCheckoutSessionId_key" ON "HostingOrderCheckout"("stripeCheckoutSessionId");

-- CreateIndex
CREATE INDEX "HostingOrderCheckout_hostingOrderId_status_idx" ON "HostingOrderCheckout"("hostingOrderId", "status");

-- CreateIndex
CREATE INDEX "HostingOrderCheckout_userId_idx" ON "HostingOrderCheckout"("userId");

-- One open Stripe checkout session per hosting order.
CREATE UNIQUE INDEX "HostingOrderCheckout_one_open_per_order_key"
ON "HostingOrderCheckout" ("hostingOrderId")
WHERE status = 'CHECKOUT_CREATED';

-- AddForeignKey
ALTER TABLE "HostingOrderCheckout" ADD CONSTRAINT "HostingOrderCheckout_hostingOrderId_fkey" FOREIGN KEY ("hostingOrderId") REFERENCES "HostingOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostingOrderCheckout" ADD CONSTRAINT "HostingOrderCheckout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "CustomerUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
