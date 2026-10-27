-- One in-flight transfer per customer + domain (case-insensitive).
-- Reversible: DROP INDEX "DomainTransferRecord_user_domain_inflight_key";

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM (
      SELECT "userId", LOWER("domain") AS domain_key, COUNT(*) AS cnt
      FROM "DomainTransferRecord"
      WHERE "userId" IS NOT NULL
        AND status IN (
          'PENDING_PAYMENT',
          'PAID',
          'SUBMITTED',
          'IN_PROGRESS'
        )
      GROUP BY "userId", LOWER("domain")
      HAVING COUNT(*) > 1
    ) dup
  ) THEN
    RAISE EXCEPTION
      'Cannot add transfer in-flight unique index: duplicate in-flight DomainTransferRecord rows exist for the same user and domain';
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "DomainTransferRecord_user_domain_inflight_key"
ON "DomainTransferRecord" ("userId", (LOWER("domain")))
WHERE "userId" IS NOT NULL
  AND status IN (
    'PENDING_PAYMENT',
    'PAID',
    'SUBMITTED',
    'IN_PROGRESS'
  );
