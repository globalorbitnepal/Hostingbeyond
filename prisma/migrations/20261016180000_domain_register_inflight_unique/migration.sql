-- One in-flight registration order per domain (case-insensitive).
-- Reversible: DROP INDEX "DomainOrder_domain_register_inflight_key";

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM (
      SELECT LOWER("domain") AS domain_key, COUNT(*) AS cnt
      FROM "DomainOrder"
      WHERE "orderType" = 'register'
        AND status IN ('PROCESSING', 'REGISTERING', 'RECONCILIATION_REQUIRED')
      GROUP BY LOWER("domain")
      HAVING COUNT(*) > 1
    ) dup
  ) THEN
    RAISE EXCEPTION
      'Cannot add register in-flight unique index: duplicate in-flight DomainOrder register rows exist for the same domain';
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "DomainOrder_domain_register_inflight_key"
ON "DomainOrder" ((LOWER("domain")))
WHERE "orderType" = 'register'
  AND status IN ('PROCESSING', 'REGISTERING', 'RECONCILIATION_REQUIRED');
