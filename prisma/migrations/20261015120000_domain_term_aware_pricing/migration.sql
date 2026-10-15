-- Term-aware supplier minimum period and retail registration term metadata.
ALTER TABLE "DomainTldPrice" ADD COLUMN IF NOT EXISTS "supplierMinRegistrationPeriod" INTEGER;
ALTER TABLE "DomainTldPrice" ADD COLUMN IF NOT EXISTS "retailRegisterTermYears" INTEGER NOT NULL DEFAULT 1;
