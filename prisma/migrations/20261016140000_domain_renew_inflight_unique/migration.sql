-- One in-flight renewal order per customer + domain.
-- Reversible: DROP INDEX "DomainOrder_user_domain_renew_inflight_key";

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM (
      SELECT "userId", LOWER("domain") AS domain_key, COUNT(*) AS cnt
      FROM "DomainOrder"
      WHERE "userId" IS NOT NULL
        AND "orderType" = 'renew'
        AND status IN ('PROCESSING', 'REGISTERING', 'RECONCILIATION_REQUIRED')
      GROUP BY "userId", LOWER("domain")
      HAVING COUNT(*) > 1
    ) dup
  ) THEN
    RAISE EXCEPTION
      'Cannot add renew in-flight unique index: duplicate in-flight DomainOrder renew rows exist for the same user and domain';
  END IF;
END $$;

CREATE UNIQUE INDEX "DomainOrder_user_domain_renew_inflight_key"
ON "DomainOrder" ("userId", (LOWER("domain")))
WHERE "userId" IS NOT NULL
  AND "orderType" = 'renew'
  AND status IN ('PROCESSING', 'REGISTERING', 'RECONCILIATION_REQUIRED');
