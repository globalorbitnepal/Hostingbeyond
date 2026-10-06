-- AlterTable
ALTER TABLE "DomainTldPrice" ADD COLUMN IF NOT EXISTS "supplierMaxRegisterYears" INTEGER;
ALTER TABLE "DomainTldPrice" ADD COLUMN IF NOT EXISTS "retailRegisterByYear" JSONB;
ALTER TABLE "DomainTldPrice" ADD COLUMN IF NOT EXISTS "retailRenewByYear" JSONB;
