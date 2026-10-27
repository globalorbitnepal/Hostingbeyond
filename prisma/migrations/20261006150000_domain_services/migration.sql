-- Domain services enums (must exist before tables reference them)
DO $$ BEGIN
  CREATE TYPE "DomainOrderStatus" AS ENUM (
  'PENDING_PAYMENT',
  'PAID',
  'PROCESSING',
  'REGISTERING',
  'REGISTERED',
  'RECONCILIATION_REQUIRED',
  'FAILED',
  'REFUND_PENDING',
  'REFUNDED',
  'CANCELLED'
);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "DomainServiceStatus" AS ENUM (
  'ACTIVE',
  'PENDING_REGISTRATION',
  'EXPIRED',
  'SUSPENDED',
  'TRANSFER_OUT',
  'FAILED'
);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "DomainTransferStatus" AS ENUM (
  'DRAFT',
  'PENDING_PAYMENT',
  'PAID',
  'SUBMITTED',
  'IN_PROGRESS',
  'COMPLETED',
  'FAILED',
  'CANCELLED'
);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "MigrationRequestStatus" AS ENUM (
  'NEW',
  'REVIEWING',
  'SCHEDULED',
  'IN_PROGRESS',
  'WAITING_FOR_CUSTOMER',
  'COMPLETED',
  'FAILED',
  'CANCELLED'
);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "WalletTransactionType" AS ENUM (
  'CREDIT',
  'DEBIT',
  'RESERVE',
  'RELEASE',
  'REFUND'
);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "WalletTransactionStatus" AS ENUM (
  'PENDING',
  'COMPLETED',
  'FAILED',
  'REVERSED'
);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "DomainProviderLogLevel" AS ENUM ('INFO', 'WARN', 'ERROR');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TYPE "ActivityAction" ADD VALUE IF NOT EXISTS 'DOMAIN_PRICING_UPDATE';
ALTER TYPE "ActivityAction" ADD VALUE IF NOT EXISTS 'DOMAIN_ORDER_UPDATE';
ALTER TYPE "ActivityAction" ADD VALUE IF NOT EXISTS 'DOMAIN_PROVIDER_SYNC';
ALTER TYPE "ActivityAction" ADD VALUE IF NOT EXISTS 'MIGRATION_REQUEST_UPDATE';
ALTER TYPE "ActivityAction" ADD VALUE IF NOT EXISTS 'WALLET_TRANSACTION';

CREATE TABLE IF NOT EXISTS "DomainTldPrice" (
  "id" TEXT NOT NULL,
  "tld" TEXT NOT NULL,
  "supplierRegister" DECIMAL(10,4),
  "supplierRenew" DECIMAL(10,4),
  "supplierTransfer" DECIMAL(10,4),
  "supplierRestore" DECIMAL(10,4),
  "supplierCurrency" TEXT NOT NULL DEFAULT 'USD',
  "supplierSyncedAt" TIMESTAMP(3),
  "retailRegister" DECIMAL(10,2) NOT NULL,
  "retailRenew" DECIMAL(10,2) NOT NULL,
  "retailTransfer" DECIMAL(10,2) NOT NULL,
  "retailRestore" DECIMAL(10,2),
  "retailCurrency" TEXT NOT NULL DEFAULT 'USD',
  "minMarginPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
  "premiumMarkupPercent" DECIMAL(5,2),
  "promoRegister" DECIMAL(10,2),
  "promoEndsAt" TIMESTAMP(3),
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DomainTldPrice_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "DomainTldPrice_tld_key" ON "DomainTldPrice"("tld");
CREATE INDEX IF NOT EXISTS "DomainTldPrice_enabled_idx" ON "DomainTldPrice"("enabled");

CREATE TABLE IF NOT EXISTS "DomainOrder" (
  "id" TEXT NOT NULL,
  "publicId" TEXT NOT NULL,
  "userId" TEXT,
  "orderType" TEXT NOT NULL,
  "domain" TEXT NOT NULL,
  "tld" TEXT NOT NULL,
  "status" "DomainOrderStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
  "provider" TEXT NOT NULL DEFAULT 'domain-name-api',
  "providerOrderId" TEXT,
  "supplierCost" DECIMAL(10,4),
  "retailPrice" DECIMAL(10,2) NOT NULL,
  "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "tax" DECIMAL(10,2),
  "total" DECIMAL(10,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "paymentProvider" TEXT,
  "paymentReference" TEXT,
  "walletTransactionId" TEXT,
  "idempotencyKey" TEXT,
  "errorCode" TEXT,
  "errorMessageInternal" TEXT,
  "errorMessageCustomer" TEXT,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DomainOrder_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "DomainOrder_publicId_key" ON "DomainOrder"("publicId");
CREATE UNIQUE INDEX IF NOT EXISTS "DomainOrder_idempotencyKey_key" ON "DomainOrder"("idempotencyKey");
CREATE INDEX IF NOT EXISTS "DomainOrder_userId_idx" ON "DomainOrder"("userId");
CREATE INDEX IF NOT EXISTS "DomainOrder_status_idx" ON "DomainOrder"("status");
CREATE INDEX IF NOT EXISTS "DomainOrder_domain_idx" ON "DomainOrder"("domain");
CREATE INDEX IF NOT EXISTS "DomainOrder_createdAt_idx" ON "DomainOrder"("createdAt");
DO $$ BEGIN
  ALTER TABLE "DomainOrder" ADD CONSTRAINT "DomainOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "CustomerUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "DomainRegistration" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "domain" TEXT NOT NULL,
  "tld" TEXT NOT NULL,
  "status" "DomainServiceStatus" NOT NULL DEFAULT 'PENDING_REGISTRATION',
  "providerDomainId" TEXT,
  "orderId" TEXT,
  "registeredAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3),
  "autoRenew" BOOLEAN NOT NULL DEFAULT true,
  "lastRenewalAt" TIMESTAMP(3),
  "nameservers" JSONB,
  "transferLock" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DomainRegistration_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "DomainRegistration_domain_key" ON "DomainRegistration"("domain");
CREATE UNIQUE INDEX IF NOT EXISTS "DomainRegistration_orderId_key" ON "DomainRegistration"("orderId");
CREATE INDEX IF NOT EXISTS "DomainRegistration_userId_idx" ON "DomainRegistration"("userId");
CREATE INDEX IF NOT EXISTS "DomainRegistration_status_idx" ON "DomainRegistration"("status");
CREATE INDEX IF NOT EXISTS "DomainRegistration_expiresAt_idx" ON "DomainRegistration"("expiresAt");
DO $$ BEGIN
  ALTER TABLE "DomainRegistration" ADD CONSTRAINT "DomainRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "CustomerUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "DomainRegistration" ADD CONSTRAINT "DomainRegistration_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "DomainOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "DomainTransferRecord" (
  "id" TEXT NOT NULL,
  "publicId" TEXT NOT NULL,
  "userId" TEXT,
  "domain" TEXT NOT NULL,
  "tld" TEXT NOT NULL,
  "status" "DomainTransferStatus" NOT NULL DEFAULT 'DRAFT',
  "authCodeHint" TEXT,
  "currentRegistrar" TEXT,
  "providerTransferId" TEXT,
  "supplierCost" DECIMAL(10,4),
  "retailPrice" DECIMAL(10,2) NOT NULL,
  "total" DECIMAL(10,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "orderId" TEXT,
  "errorCode" TEXT,
  "errorMessageInternal" TEXT,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DomainTransferRecord_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "DomainTransferRecord_publicId_key" ON "DomainTransferRecord"("publicId");
CREATE INDEX IF NOT EXISTS "DomainTransferRecord_userId_idx" ON "DomainTransferRecord"("userId");
CREATE INDEX IF NOT EXISTS "DomainTransferRecord_status_idx" ON "DomainTransferRecord"("status");
CREATE INDEX IF NOT EXISTS "DomainTransferRecord_domain_idx" ON "DomainTransferRecord"("domain");
DO $$ BEGIN
  ALTER TABLE "DomainTransferRecord" ADD CONSTRAINT "DomainTransferRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "CustomerUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "MigrationRequest" (
  "id" TEXT NOT NULL,
  "publicId" TEXT NOT NULL,
  "userId" TEXT,
  "customerName" TEXT NOT NULL,
  "customerEmail" TEXT NOT NULL,
  "customerPhone" TEXT,
  "websiteUrl" TEXT,
  "currentProvider" TEXT,
  "domain" TEXT,
  "websiteType" TEXT,
  "emailAccountsCount" INTEGER,
  "websiteSize" TEXT,
  "databaseRequired" BOOLEAN NOT NULL DEFAULT false,
  "preferredDate" TIMESTAMP(3),
  "notes" TEXT,
  "status" "MigrationRequestStatus" NOT NULL DEFAULT 'NEW',
  "priority" INTEGER NOT NULL DEFAULT 0,
  "assignedStaff" TEXT,
  "adminNotes" TEXT,
  "customerNotes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MigrationRequest_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "MigrationRequest_publicId_key" ON "MigrationRequest"("publicId");
CREATE INDEX IF NOT EXISTS "MigrationRequest_status_idx" ON "MigrationRequest"("status");
CREATE INDEX IF NOT EXISTS "MigrationRequest_customerEmail_idx" ON "MigrationRequest"("customerEmail");
CREATE INDEX IF NOT EXISTS "MigrationRequest_createdAt_idx" ON "MigrationRequest"("createdAt");
DO $$ BEGIN
  ALTER TABLE "MigrationRequest" ADD CONSTRAINT "MigrationRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "CustomerUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "CustomerWallet" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CustomerWallet_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "CustomerWallet_userId_key" ON "CustomerWallet"("userId");
DO $$ BEGIN
  ALTER TABLE "CustomerWallet" ADD CONSTRAINT "CustomerWallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "CustomerUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "WalletTransaction" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" "WalletTransactionType" NOT NULL,
  "status" "WalletTransactionStatus" NOT NULL DEFAULT 'PENDING',
  "amount" DECIMAL(12,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "balanceAfter" DECIMAL(12,2),
  "referenceType" TEXT,
  "referenceId" TEXT,
  "idempotencyKey" TEXT,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "WalletTransaction_idempotencyKey_key" ON "WalletTransaction"("idempotencyKey");
CREATE INDEX IF NOT EXISTS "WalletTransaction_userId_idx" ON "WalletTransaction"("userId");
CREATE INDEX IF NOT EXISTS "WalletTransaction_status_idx" ON "WalletTransaction"("status");
CREATE INDEX IF NOT EXISTS "WalletTransaction_createdAt_idx" ON "WalletTransaction"("createdAt");
DO $$ BEGIN
  ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "CustomerUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "DomainProviderLog" (
  "id" TEXT NOT NULL,
  "level" "DomainProviderLogLevel" NOT NULL DEFAULT 'INFO',
  "operation" TEXT NOT NULL,
  "success" BOOLEAN NOT NULL,
  "durationMs" INTEGER,
  "errorCode" TEXT,
  "errorMessageInternal" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DomainProviderLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "DomainProviderLog_createdAt_idx" ON "DomainProviderLog"("createdAt");
CREATE INDEX IF NOT EXISTS "DomainProviderLog_operation_idx" ON "DomainProviderLog"("operation");
CREATE INDEX IF NOT EXISTS "DomainProviderLog_success_idx" ON "DomainProviderLog"("success");

CREATE TABLE IF NOT EXISTS "DomainAuditLog" (
  "id" TEXT NOT NULL,
  "adminUserId" TEXT,
  "action" TEXT NOT NULL,
  "resource" TEXT,
  "resourceId" TEXT,
  "details" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DomainAuditLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "DomainAuditLog_createdAt_idx" ON "DomainAuditLog"("createdAt");
CREATE INDEX IF NOT EXISTS "DomainAuditLog_resource_idx" ON "DomainAuditLog"("resource");
