DO $$ BEGIN
  CREATE TYPE "HostingOrderCheckoutStatus" AS ENUM (
    'PENDING',
    'CHECKOUT_CREATED',
    'COMPLETED',
    'EXPIRED',
    'CANCELLED',
    'FAILED'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "HostingOrderCheckout" (
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

CREATE UNIQUE INDEX IF NOT EXISTS "HostingOrderCheckout_idempotencyKey_key" ON "HostingOrderCheckout"("idempotencyKey");
CREATE UNIQUE INDEX IF NOT EXISTS "HostingOrderCheckout_stripeCheckoutSessionId_key" ON "HostingOrderCheckout"("stripeCheckoutSessionId");
CREATE INDEX IF NOT EXISTS "HostingOrderCheckout_hostingOrderId_status_idx" ON "HostingOrderCheckout"("hostingOrderId", "status");
CREATE INDEX IF NOT EXISTS "HostingOrderCheckout_userId_idx" ON "HostingOrderCheckout"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "HostingOrderCheckout_one_open_per_order_key"
ON "HostingOrderCheckout" ("hostingOrderId")
WHERE status = 'CHECKOUT_CREATED';

DO $$ BEGIN
  ALTER TABLE "HostingOrderCheckout" ADD CONSTRAINT "HostingOrderCheckout_hostingOrderId_fkey" FOREIGN KEY ("hostingOrderId") REFERENCES "HostingOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "HostingOrderCheckout" ADD CONSTRAINT "HostingOrderCheckout_userId_fkey" FOREIGN KEY ("userId") REFERENCES "CustomerUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
