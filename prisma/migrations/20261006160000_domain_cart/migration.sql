-- CreateTable
CREATE TABLE IF NOT EXISTS "DomainCart" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DomainCart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "DomainCartItem" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "tld" TEXT NOT NULL,
    "periodYears" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL,
    "register" DECIMAL(10,2) NOT NULL,
    "renew" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DomainCartItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "DomainCart_userId_key" ON "DomainCart"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "DomainCartItem_cartId_idx" ON "DomainCartItem"("cartId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "DomainCartItem_cartId_domain_key" ON "DomainCartItem"("cartId", "domain");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "DomainCart" ADD CONSTRAINT "DomainCart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "CustomerUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "DomainCartItem" ADD CONSTRAINT "DomainCartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "DomainCart"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
