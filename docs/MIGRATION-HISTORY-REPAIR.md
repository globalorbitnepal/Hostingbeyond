# Migration history repair — `beyond_ai` ordering

## Problem

`beyond_ai` originally lived at `20250924190000_beyond_ai`, which sorts **before** `20260912120000_customer_auth` even though its SQL adds foreign keys to `"CustomerUser"`. Fresh `npx prisma migrate deploy` on an empty database therefore failed.

Existing servers applied migrations incrementally when `customer_auth` already existed, so they were unaffected until a **greenfield** `migrate deploy`.

## Durable fix (repository)

The migration directory was **renamed** (**`migration.sql` unchanged** — do not edit SQL):

| Before                     | After                      |
| -------------------------- | -------------------------- |
| `20250924190000_beyond_ai` | `20260913120000_beyond_ai` |

Chronological order is now: `orbit_cms_init` → `customer_auth` → `beyond_ai` → …

### Verified checksum (repo)

Compute on the app host after checkout (must match before repair):

```bash
shasum -a 256 prisma/migrations/20260913120000_beyond_ai/migration.sql
```

**Expected SHA-256:** `3db9c110578b28f1ffe6c7ad0136300ca9f19a40834d4697536fdc72d37249c6`

Prisma stores this value in `"_prisma_migrations".checksum` when the migration was first applied (for the same file bytes).

---

## Who must approve (production vs local dev)

| Target                                                                | Policy                                                                                                                                                                                                                                        |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Production** (`hosting.theglobalorbit.com` / server `DATABASE_URL`) | **Separate owner approval** required. **Verified restorable backup**, explicit **database target confirmation** (host + database name, not secrets), and a **maintenance window** before any `_prisma_migrations` change or `migrate deploy`. |
| **`hostingbeyond_db`** (local dev on `127.0.0.1`)                     | **Separate owner approval** — same controls as production if repair is ever run there. This runbook does **not** authorize touching `hostingbeyond_db` without that approval.                                                                 |
| **`hostingbeyond_integration_test`**                                  | Greenfield / integration testing only; use the [integration verification](#verification-isolated-integration-db-only) section.                                                                                                                |

**Never** run repair SQL against a database until `DATABASE_URL` (or `psql` connection) is confirmed to be the intended target.

---

## When repair is required

| Database state                                                   | Action                                                                               |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Row `20250924190000_beyond_ai` in `_prisma_migrations`, finished | **Run repair** after new code is on the host, **before** `npx prisma migrate deploy` |
| Row `20260913120000_beyond_ai` already present                   | **Skip repair**; proceed to migrate status / deploy                                  |
| No `beyond_ai` row (greenfield)                                  | **Skip repair**; `migrate deploy` applies `20260913120000_beyond_ai` in order        |
| Checksum mismatch vs repo                                        | **Stop** — do not rename; investigate tampering or post-apply file edits             |

---

## Safe execution order (existing database)

Do **not** run `npx prisma migrate deploy` from a release that contains the **renamed** migration until history repair **completes successfully** (or the DB already records the new name).

| Step | Action                                                                                                                              |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Owner approval, maintenance window, **logical backup**, restore drill evidence                                                      |
| 2    | Confirm `DATABASE_URL` target (database name + host only)                                                                           |
| 3    | Deploy application **code** that includes `20260913120000_beyond_ai` and `20261016140000_domain_renew_inflight_unique`              |
| 4    | Read-only **pre-checks** (below) — stop on failure                                                                                  |
| 5    | **Phase 3a duplicate in-flight renew pre-check** — stop if duplicates exist                                                         |
| 6    | **Transactional history repair** (below) — exactly one row updated                                                                  |
| 7    | **Post-repair verification** (below)                                                                                                |
| 8    | `npx prisma migrate status` — expect pending `20261016140000_domain_renew_inflight_unique` only (typical prod @ `e1c1fb2` + repair) |
| 9    | `npx prisma migrate deploy`                                                                                                         |
| 10   | Post-deploy verification (index exists, `migrate status` clean, app smoke)                                                          |

---

## Read-only pre-checks (stop on any failure)

Run against the **intended** database only.

```sql
-- P1: Exactly one OLD record
SELECT COUNT(*) AS old_beyond_ai_rows
FROM "_prisma_migrations"
WHERE migration_name = '20250924190000_beyond_ai';
-- STOP unless old_beyond_ai_rows = 1

-- P2: NEW name must not exist
SELECT COUNT(*) AS new_beyond_ai_rows
FROM "_prisma_migrations"
WHERE migration_name = '20260913120000_beyond_ai';
-- STOP unless new_beyond_ai_rows = 0

-- P3: Applied state + checksum (single row)
SELECT migration_name, finished_at, rolled_back_at, checksum, started_at
FROM "_prisma_migrations"
WHERE migration_name = '20250924190000_beyond_ai';
-- STOP if finished_at IS NULL
-- STOP if rolled_back_at IS NOT NULL
-- STOP if checksum <> '3db9c110578b28f1ffe6c7ad0136300ca9f19a40834d4697536fdc72d37249c6'
```

**Optional schema sanity** (if `beyond_ai` should already be applied):

```sql
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('BeyondAiSubscription', 'BeyondAiProject');
-- STOP if history says applied but tables are missing (investigate before repair)
```

---

## Phase 3a pre-check — duplicate in-flight renewals

Before `migrate deploy` applies `20261016140000_domain_renew_inflight_unique`, the migration **aborts** if duplicate in-flight renew rows exist. Run this **after** history repair, **before** `migrate deploy`:

```sql
SELECT "userId", LOWER("domain") AS domain_key, COUNT(*) AS cnt
FROM "DomainOrder"
WHERE "userId" IS NOT NULL
  AND "orderType" = 'renew'
  AND status IN ('PROCESSING', 'REGISTERING', 'RECONCILIATION_REQUIRED')
GROUP BY "userId", LOWER("domain")
HAVING COUNT(*) > 1;
```

| Result        | Action                                                                                                                    |
| ------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Zero rows** | Safe to run `migrate deploy` for Phase 3a                                                                                 |
| **Any rows**  | **STOP** — reconcile or complete/cancel duplicate in-flight renew orders before deploy; migration will raise an exception |

---

## Transactional repair (PostgreSQL)

Use **`psql`** with `ON_ERROR_STOP` so any failure rolls back the transaction:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1
```

(`psql` may require a URL **without** Prisma’s `?schema=public` query parameter.)

### Capture pre-update state (for post-verify)

```sql
BEGIN;

CREATE TEMP TABLE _beyond_ai_repair_snapshot AS
SELECT migration_name, finished_at, rolled_back_at, checksum, started_at, logs
FROM "_prisma_migrations"
WHERE migration_name = '20250924190000_beyond_ai';

SELECT COUNT(*) AS snapshot_rows FROM _beyond_ai_repair_snapshot;
-- STOP (ROLLBACK) unless snapshot_rows = 1
```

### Pre-checks inside transaction

```sql
DO $precheck$
DECLARE
  old_count int;
  new_count int;
  rec record;
  expected_checksum text := '3db9c110578b28f1ffe6c7ad0136300ca9f19a40834d4697536fdc72d37249c6';
BEGIN
  SELECT COUNT(*) INTO old_count
  FROM "_prisma_migrations"
  WHERE migration_name = '20250924190000_beyond_ai';
  IF old_count <> 1 THEN
    RAISE EXCEPTION 'precheck: expected exactly 1 old beyond_ai row, got %', old_count;
  END IF;

  SELECT COUNT(*) INTO new_count
  FROM "_prisma_migrations"
  WHERE migration_name = '20260913120000_beyond_ai';
  IF new_count <> 0 THEN
    RAISE EXCEPTION 'precheck: new migration name already exists (% rows)', new_count;
  END IF;

  SELECT finished_at, rolled_back_at, checksum INTO rec
  FROM "_prisma_migrations"
  WHERE migration_name = '20250924190000_beyond_ai';

  IF rec.finished_at IS NULL THEN
    RAISE EXCEPTION 'precheck: finished_at IS NULL';
  END IF;
  IF rec.rolled_back_at IS NOT NULL THEN
    RAISE EXCEPTION 'precheck: rolled_back_at IS NOT NULL';
  END IF;
  IF rec.checksum IS DISTINCT FROM expected_checksum THEN
    RAISE EXCEPTION 'precheck: checksum mismatch (stored %, expected %)', rec.checksum, expected_checksum;
  END IF;
END;
$precheck$;
```

### Update with row-count enforcement

`GET DIAGNOSTICS` must run in the **same** PL/pgSQL block as the `UPDATE`:

```sql
DO $repair$
DECLARE
  updated_rows int;
  expected_checksum text := '3db9c110578b28f1ffe6c7ad0136300ca9f19a40834d4697536fdc72d37249c6';
BEGIN
  UPDATE "_prisma_migrations"
  SET migration_name = '20260913120000_beyond_ai'
  WHERE migration_name = '20250924190000_beyond_ai'
    AND finished_at IS NOT NULL
    AND rolled_back_at IS NULL
    AND checksum = expected_checksum;

  GET DIAGNOSTICS updated_rows = ROW_COUNT;
  IF updated_rows <> 1 THEN
    RAISE EXCEPTION 'repair: expected exactly 1 row updated, got %', updated_rows;
  END IF;
END;
$repair$;
```

### Post-update verification (same transaction)

```sql
-- Only the new name exists for beyond_ai
SELECT migration_name, finished_at, rolled_back_at, checksum
FROM "_prisma_migrations"
WHERE migration_name LIKE '%beyond_ai%';
-- Expect exactly one row: 20260913120000_beyond_ai

SELECT COUNT(*) AS old_remaining
FROM "_prisma_migrations"
WHERE migration_name = '20250924190000_beyond_ai';
-- STOP (ROLLBACK) unless old_remaining = 0

-- checksum and applied-state unchanged vs snapshot
SELECT
  n.migration_name AS new_name,
  n.finished_at IS NOT DISTINCT FROM s.finished_at AS finished_unchanged,
  n.rolled_back_at IS NOT DISTINCT FROM s.rolled_back_at AS rolled_back_unchanged,
  n.checksum IS NOT DISTINCT FROM s.checksum AS checksum_unchanged,
  n.started_at IS NOT DISTINCT FROM s.started_at AS started_unchanged
FROM "_prisma_migrations" n
JOIN _beyond_ai_repair_snapshot s ON true
WHERE n.migration_name = '20260913120000_beyond_ai';
-- STOP (ROLLBACK) unless all *_unchanged columns are true

COMMIT;
```

If any step fails, run `ROLLBACK;` (or disconnect — `ON_ERROR_STOP` aborts the script). **Do not** run `migrate deploy` until repair commits successfully.

### Clients without reliable PL/pgSQL (`DO` blocks)

If you cannot run the blocks above:

1. Run read-only pre-checks **P1–P3** manually and record results.
2. `BEGIN;`
3. Run the `UPDATE` with the same `WHERE` clause (including checksum and `finished_at` / `rolled_back_at`).
4. Run `SELECT COUNT(*) FROM "_prisma_migrations" WHERE migration_name = '20260913120000_beyond_ai';` — must be **1**.
5. Run `SELECT COUNT(*) FROM "_prisma_migrations" WHERE migration_name = '20250924190000_beyond_ai';` — must be **0**.
6. Compare `checksum`, `finished_at`, `rolled_back_at` to values saved before `UPDATE`.
7. **`COMMIT` only if all checks pass; otherwise `ROLLBACK`.**

`psql` does not expose `ROW_COUNT` to the client after a bare `UPDATE`; the **count queries in steps 4–5** are the safe equivalent.

---

## After repair — Prisma deploy

On the app host with the **same** database `DATABASE_URL`:

```bash
npx prisma migrate status
npx prisma migrate deploy
```

If `migrate deploy` reports a **checksum mismatch** on `20260913120000_beyond_ai`:

- **Stop.** Do not use `migrate resolve --applied` until schema equivalence is proven (tables/constraints from `beyond_ai` exist and match expectations).
- Restore from backup or engage DBA — renaming the row should have preserved checksum; mismatch indicates unexpected drift.

---

## Checksum mismatch fallback (last resort)

```bash
npx prisma migrate resolve --applied 20260913120000_beyond_ai
```

Only when:

- Live schema **already matches** `20260913120000_beyond_ai/migration.sql`, and
- Owner accepts writing history without re-running SQL.

---

## Verification (isolated integration DB only)

```bash
set -a && source .env.integration.local && set +a
# Destructive on integration DB only:
npx prisma db execute --stdin --schema prisma/schema.prisma <<'SQL'
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
SQL
npx prisma migrate deploy
```

Expect **15** migrations, no errors, including `20261016140000_domain_renew_inflight_unique`.

Do **not** run the `DROP SCHEMA` step against `hostingbeyond_db` or production.
