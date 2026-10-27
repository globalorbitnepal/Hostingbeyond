# HostingBeyond — production read-only preflight (owner-operated)

> **Preparation only.** This document does not connect to production by itself.  
> **Secrets:** Never log, echo, `set -x`, or ticket-paste `DATABASE_URL`, `PGPASSWORD`, or `.env` contents.

**Related:** `docs/MIGRATION-HISTORY-REPAIR.md`, `docs/RELEASE-GATE.md`, `ops/backup/README.md`.

---

## 1. Prerequisites

| #   | Requirement                                                                                                                                            |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P1  | Owner confirms **SSH host** and **PostgreSQL database name** (`EXPECTED_DB_NAME`) before any connection — no guessing.                                 |
| P2  | SSH as **`hostingbeyond`**; app path **`/srv/apps/hostingbeyond`**.                                                                                    |
| P3  | Use **only** `/srv/apps/hostingbeyond/.env` for database settings when authorized.                                                                     |
| P4  | `psql` available on the server.                                                                                                                        |
| P5  | GitHub secret **`HOSTINGBEYOND_PRODUCTION_MIGRATE_APPROVED`** is **not** `true` until after preflight PASS + backup approval (`docs/RELEASE-GATE.md`). |
| P6  | Backup/restore plan reviewed (Section 6); execution is a **separate** approved window.                                                                 |

**Stop before connecting** if P1 cannot be satisfied.

---

## 2. Repository constants (for PASS/STOP scoring)

**`beyond_ai` SQL checksum** (`prisma/migrations/20260913120000_beyond_ai/migration.sql`; byte-identical to removed `20250924190000_beyond_ai`):

`3db9c110578b28f1ffe6c7ad0136300ca9f19a40834d4697536fdc72d37249c6`

**Inflight `DomainOrder.status`** (`prisma/schema.prisma` → `DomainOrderStatus`):

`PROCESSING`, `REGISTERING`, `RECONCILIATION_REQUIRED`

**Inflight duplicate checks** (from `20261016140000_domain_renew_inflight_unique` / `20261016180000_domain_register_inflight_unique`):

| Check    | `orderType`  | Grouping                                                        |
| -------- | ------------ | --------------------------------------------------------------- |
| Register | `'register'` | `LOWER("domain")`                                               |
| Renew    | `'renew'`    | `"userId"`, `LOWER("domain")` (requires `"userId" IS NOT NULL`) |

**Partial unique indexes** (same migrations):

- `DomainOrder_user_domain_renew_inflight_key`
- `DomainOrder_domain_register_inflight_key`

**Beyond AI tables** (`20260913120000_beyond_ai`): `BeyondAiSubscription`, `BeyondAiProject`

**Repo migration inventory** — do not hard-code a folder count in tickets. Canonical list:

- File: `prisma/migrations/INVENTORY.txt`
- Verify locally/CI: `node scripts/verify-migration-inventory.mjs`
- Print names for B9 diff: `node scripts/verify-migration-inventory.mjs --print`

Phase 2 names that **must** appear in that inventory:

- `20261025120000_namesilo_pricing_provider`
- `20261025130000_transfer_registrar_wallet`

**Checkout / invoice migrations (unverified on production until B9/B10):** `20261018010000_hosting_order_checkout` creates `HostingOrderCheckout`. **Do not assume** production `_prisma_migrations` contains checkout or Phase 2 names until the owner runs read-only SQL. Current deploy **blocks build/restart** when `prisma migrate status` reports pending migrations and `HOSTINGBEYOND_PRODUCTION_MIGRATE_APPROVED` is not `true`.

---

## 3. Connection bootstrap (corrected — owner executes when authorized)

Design:

1. Read `DATABASE_URL` from **`ENV_FILE`** inside Node (not from an empty shell `DATABASE_URL`).
2. Parse with `URL`, **decode** user/password/database path (`%40`, etc.).
3. Drop Prisma-only query params (`schema`, `connection_limit`, etc.); map recognized **libpq** query params to `PG*` env vars (see script).
4. Write **`PGHOST` / `PGPORT` / `PGUSER` / `PGPASSWORD` / `PGDATABASE`** to a **`chmod 600`** temp file; `source` it — **never** pass a credential-bearing URL as a `psql` argument.
5. Compare **`PGDATABASE`** and **`current_database()`** to **`EXPECTED_DB_NAME`** before any preflight SQL.
6. `set -euo pipefail`; connection or mismatch **aborts** (no preflight file run).

```bash
# --- NOT EXECUTED until owner authorizes on production ---
set -euo pipefail
cd /srv/apps/hostingbeyond
test -f .env
test "$(pwd)" = "/srv/apps/hostingbeyond"

# Owner must set this (confirmed database name only — not a connection string).
EXPECTED_DB_NAME='REPLACE_WITH_CONFIRMED_DATABASE_NAME'
case "$EXPECTED_DB_NAME" in
  '' | REPLACE_WITH_CONFIRMED_DATABASE_NAME)
    echo "STOP: set EXPECTED_DB_NAME to the confirmed production database name" >&2
    exit 1
    ;;
esac

# Do not enable: set -x  (would leak PGPASSWORD)

PGENV_FILE="$(mktemp)"
chmod 600 "$PGENV_FILE"
trap 'rm -f -- "$PGENV_FILE"' EXIT INT TERM HUP

ENV_FILE=/srv/apps/hostingbeyond/.env node >"$PGENV_FILE" <<'NODE'
const fs = require("fs");

const envPath = process.env.ENV_FILE;
if (!envPath) process.exit(2);

const text = fs.readFileSync(envPath, "utf8");
let raw = "";
for (const line of text.split("\n")) {
  const m = line.match(/^DATABASE_URL=(.*)$/);
  if (!m) continue;
  let v = m[1].trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1);
  }
  raw = v;
  break;
}
if (!raw) process.exit(3);

let u;
try {
  u = new URL(raw);
} catch {
  process.exit(4);
}
if (u.protocol !== "postgresql:" && u.protocol !== "postgres:") {
  process.exit(5);
}

const sp = new URLSearchParams(u.search);
for (const prismaOnly of ["schema", "connection_limit", "pool_timeout", "socket_timeout", "pgbouncer"]) {
  sp.delete(prismaOnly);
}

const pgdatabase = decodeURIComponent(u.pathname.replace(/^\//, "") || "");
const pguser = decodeURIComponent(u.username || "");
const pgpassword = decodeURIComponent(u.password || "");
let pghost = u.hostname || "";
if (pghost.startsWith("[") && pghost.endsWith("]")) {
  pghost = pghost.slice(1, -1);
}
const pgport = u.port || "5432";

function shExport(name, value) {
  return `export ${name}=${JSON.stringify(value)}\n`;
}

let out = "";
out += shExport("PGHOST", pghost);
out += shExport("PGPORT", pgport);
out += shExport("PGUSER", pguser);
out += shExport("PGPASSWORD", pgpassword);
out += shExport("PGDATABASE", pgdatabase);

const libpqQueryToEnv = {
  sslmode: "PGSSLMODE",
  sslrootcert: "PGSSLROOTCERT",
  sslcert: "PGSSLCERT",
  sslkey: "PGSSLKEY",
  sslcrl: "PGSSLCRL",
  connect_timeout: "PGCONNECT_TIMEOUT",
  application_name: "PGAPPNAME",
  options: "PGOPTIONS",
  target_session_attrs: "PGTARGETSESSIONATTRS",
  gssencmode: "PGGSSENCMODE",
};
for (const [param, envName] of Object.entries(libpqQueryToEnv)) {
  const v = sp.get(param);
  if (v != null && v !== "") {
    out += shExport(envName, v);
    sp.delete(param);
  }
}

const unmapped = [...sp.keys()];
if (unmapped.length > 0) {
  console.error(
    "STOP: unmapped DATABASE_URL query param name(s): " + unmapped.sort().join(", "),
  );
  process.exit(6);
}

process.stdout.write(out);
NODE

set -a
# shellcheck disable=SC1090
source "$PGENV_FILE"
set +a
rm -f -- "$PGENV_FILE"
trap - EXIT INT TERM HUP

unset DATABASE_URL

if [ "$PGDATABASE" != "$EXPECTED_DB_NAME" ]; then
  echo "STOP: parsed PGDATABASE does not match EXPECTED_DB_NAME" >&2
  exit 1
fi

# Read-only connectivity + second target check (no connection string on argv).
ACTUAL_DB="$(psql -v ON_ERROR_STOP=1 -t -A -c "SELECT current_database();" | tr -d '[:space:]')"
SERVER_ADDR="$(psql -v ON_ERROR_STOP=1 -t -A -c "SELECT COALESCE(inet_server_addr()::text, 'local');" | tr -d '[:space:]')"

echo "PREFLIGHT_TARGET database=${ACTUAL_DB} server_addr=${SERVER_ADDR}"

if [ "$ACTUAL_DB" != "$EXPECTED_DB_NAME" ]; then
  echo "STOP: current_database() does not match EXPECTED_DB_NAME" >&2
  exit 1
fi
echo "PASS: database target confirmed"
```

If Node exits non-zero, **stop** — do not run preflight SQL. Do not print `.env` or connection strings for debugging.

---

## 4. Read-only preflight SQL (owner executes only after Section 3 PASS)

Save as `/tmp/hb-preflight-readonly.sql` (contents are **SELECT-only**):

```sql
\set ON_ERROR_STOP on

-- B1: beyond_ai migration rows (sanitized)
SELECT migration_name,
       (finished_at IS NOT NULL) AS finished,
       (rolled_back_at IS NOT NULL) AS rolled_back,
       CASE
         WHEN checksum = '3db9c110578b28f1ffe6c7ad0136300ca9f19a40834d4697536fdc72d37249c6' THEN 'MATCH'
         ELSE 'MISMATCH'
       END AS checksum_vs_repo
FROM "_prisma_migrations"
WHERE migration_name IN (
  '20250924190000_beyond_ai',
  '20260913120000_beyond_ai'
)
ORDER BY migration_name;

-- B2: beyond_ai path (counts only)
SELECT
  COUNT(*) FILTER (WHERE migration_name = '20250924190000_beyond_ai') AS old_beyond_ai_rows,
  COUNT(*) FILTER (WHERE migration_name = '20260913120000_beyond_ai') AS new_beyond_ai_rows
FROM "_prisma_migrations"
WHERE migration_name IN (
  '20250924190000_beyond_ai',
  '20260913120000_beyond_ai'
);

-- B3: Beyond AI tables (existence counts only)
SELECT v.tablename,
       (
         SELECT COUNT(*)
         FROM pg_tables t
         WHERE t.schemaname = 'public'
           AND t.tablename = v.tablename
       ) AS table_exists
FROM (VALUES ('BeyondAiSubscription'), ('BeyondAiProject')) AS v(tablename);

-- B4: Duplicate in-flight register groups (count only — no domains)
SELECT COUNT(*) AS duplicate_register_inflight_groups
FROM (
  SELECT LOWER("domain") AS domain_key
  FROM "DomainOrder"
  WHERE "orderType" = 'register'
    AND status IN ('PROCESSING', 'REGISTERING', 'RECONCILIATION_REQUIRED')
  GROUP BY LOWER("domain")
  HAVING COUNT(*) > 1
) d;

-- B5: Duplicate in-flight renew groups (count only)
SELECT COUNT(*) AS duplicate_renew_inflight_groups
FROM (
  SELECT "userId", LOWER("domain") AS domain_key
  FROM "DomainOrder"
  WHERE "userId" IS NOT NULL
    AND "orderType" = 'renew'
    AND status IN ('PROCESSING', 'REGISTERING', 'RECONCILIATION_REQUIRED')
  GROUP BY "userId", LOWER("domain")
  HAVING COUNT(*) > 1
) d;

-- B6: New inflight unique migrations (status only)
SELECT migration_name,
       (finished_at IS NOT NULL) AS finished,
       (rolled_back_at IS NOT NULL) AS rolled_back
FROM "_prisma_migrations"
WHERE migration_name IN (
  '20261016140000_domain_renew_inflight_unique',
  '20261016180000_domain_register_inflight_unique'
)
ORDER BY migration_name;

-- B7: Expected partial unique indexes (present / absent)
SELECT e.indexname,
       (i.indexname IS NOT NULL) AS present
FROM (
  VALUES
    ('DomainOrder_user_domain_renew_inflight_key'),
    ('DomainOrder_domain_register_inflight_key')
) AS e(indexname)
LEFT JOIN pg_indexes i
  ON i.schemaname = 'public'
 AND i.indexname = e.indexname
ORDER BY e.indexname;

-- B8: Migration inventory summary
SELECT
  COUNT(*) AS total_migration_rows,
  COUNT(*) FILTER (WHERE finished_at IS NOT NULL) AS finished_rows,
  COUNT(*) FILTER (WHERE finished_at IS NULL) AS unfinished_rows
FROM "_prisma_migrations";

-- B9: Applied migration names (for diff vs repo list — no logs column)
SELECT migration_name,
       (finished_at IS NOT NULL) AS finished
FROM "_prisma_migrations"
ORDER BY migration_name;

-- B10: Hosting checkout + invoice objects (existence only — counts, no row data)
SELECT 'HostingOrderCheckout' AS object_name,
       (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename = 'HostingOrderCheckout') AS table_exists
UNION ALL
SELECT 'Invoice',
       (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Invoice')
UNION ALL
SELECT 'HostingOrderCheckoutStatus_enum',
       (SELECT COUNT(*) FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE n.nspname = 'public' AND t.typname = 'HostingOrderCheckoutStatus');

SELECT e.indexname,
       (i.indexname IS NOT NULL) AS present
FROM (
  VALUES
    ('HostingOrderCheckout_one_open_per_order_key'),
    ('HostingOrderCheckout_idempotencyKey_key'),
    ('HostingOrderCheckout_stripeCheckoutSessionId_key')
) AS e(indexname)
LEFT JOIN pg_indexes i
  ON i.schemaname = 'public' AND i.indexname = e.indexname
ORDER BY e.indexname;

SELECT migration_name,
       (finished_at IS NOT NULL) AS finished
FROM "_prisma_migrations"
WHERE migration_name IN (
  '20261017163000_invoices',
  '20261017194500_invoice_user_restrict',
  '20261018010000_hosting_order_checkout'
)
ORDER BY migration_name;

-- B10b: HostingOrderCheckout columns (migration 20261018010000 — existence only)
SELECT e.column_name,
       (c.column_name IS NOT NULL) AS present
FROM (
  VALUES
    ('id'),
    ('hostingOrderId'),
    ('userId'),
    ('idempotencyKey'),
    ('stripeCheckoutSessionId'),
    ('stripePaymentIntentId'),
    ('status'),
    ('failureReason'),
    ('createdAt'),
    ('updatedAt')
) AS e(column_name)
LEFT JOIN information_schema.columns c
  ON c.table_schema = 'public'
 AND c.table_name = 'HostingOrderCheckout'
 AND c.column_name = e.column_name
ORDER BY e.column_name;

-- B10c: HostingOrderCheckout constraints (migration 20261018010000)
SELECT e.conname,
       (pc.conname IS NOT NULL) AS present
FROM (
  VALUES
    ('HostingOrderCheckout_pkey'),
    ('HostingOrderCheckout_hostingOrderId_fkey'),
    ('HostingOrderCheckout_userId_fkey')
) AS e(conname)
LEFT JOIN pg_constraint pc
  ON pc.conname = e.conname
ORDER BY e.conname;

-- B10d: Invoice core columns + restrict FK (migrations 20261017163000 / 20261017194500)
SELECT e.column_name,
       (c.column_name IS NOT NULL) AS present
FROM (
  VALUES
    ('id'),
    ('publicId'),
    ('invoiceNumber'),
    ('userId'),
    ('status'),
    ('pdfStorageKey'),
    ('pdfSha256')
) AS e(column_name)
LEFT JOIN information_schema.columns c
  ON c.table_schema = 'public'
 AND c.table_name = 'Invoice'
 AND c.column_name = e.column_name
ORDER BY e.column_name;

SELECT e.conname,
       (pc.conname IS NOT NULL) AS present
FROM (
  VALUES
    ('Invoice_pkey'),
    ('Invoice_userId_fkey')
) AS e(conname)
LEFT JOIN pg_constraint pc
  ON pc.conname = e.conname
ORDER BY e.conname;

-- B11: Duplicate migration_name rows (must be 0 duplicates)
SELECT migration_name,
       COUNT(*) AS row_count
FROM "_prisma_migrations"
GROUP BY migration_name
HAVING COUNT(*) > 1;

-- B10e: Phase 2 NameSilo / transfer columns (existence only — no row data)
SELECT e.column_name,
       (c.column_name IS NOT NULL) AS present
FROM (
  VALUES
    ('namesiloRegister'),
    ('namesiloRenew'),
    ('namesiloTransfer'),
    ('namesiloSyncedAt'),
    ('namesiloPriceStatus'),
    ('lifecycleProvider'),
    ('retailPriceLocked')
) AS e(column_name)
LEFT JOIN information_schema.columns c
  ON c.table_schema = 'public'
 AND c.table_name = 'DomainTldPrice'
 AND c.column_name = e.column_name
ORDER BY e.column_name;

SELECT e.column_name,
       (c.column_name IS NOT NULL) AS present
FROM (
  VALUES
    ('registrarProvider')
) AS e(column_name)
LEFT JOIN information_schema.columns c
  ON c.table_schema = 'public'
 AND c.table_name = 'DomainRegistration'
 AND c.column_name = e.column_name
ORDER BY e.column_name;

SELECT e.column_name,
       (c.column_name IS NOT NULL) AS present
FROM (
  VALUES
    ('registrarProvider'),
    ('walletTransactionId')
) AS e(column_name)
LEFT JOIN information_schema.columns c
  ON c.table_schema = 'public'
 AND c.table_name = 'DomainTransferRecord'
 AND c.column_name = e.column_name
ORDER BY e.column_name;

SELECT migration_name,
       (finished_at IS NOT NULL) AS finished,
       (rolled_back_at IS NOT NULL) AS rolled_back
FROM "_prisma_migrations"
WHERE migration_name IN (
  '20261025120000_namesilo_pricing_provider',
  '20261025130000_transfer_registrar_wallet'
)
ORDER BY migration_name;
```

**Run (only after Section 3 PASS):**

```bash
# NOT EXECUTED — owner, when authorized
psql -v ON_ERROR_STOP=1 -f /tmp/hb-preflight-readonly.sql \
  | tee "/tmp/hb-preflight-$(date -u +%Y%m%dT%H%MZ).log"
```

`ON_ERROR_STOP` aborts the script on any SQL error. Do not add `BEGIN`/`COMMIT`, DML, or DDL.

---

## 5. PASS / STOP scoring

**Scope:** A read-only preflight **PASS** means it is safe to _proceed to owner decisions_ (backup, repair window, push, migrate secret). It does **not** authorize `migrate deploy`, `_prisma_migrations` repair, DNS changes, or setting `HOSTINGBEYOND_PRODUCTION_MIGRATE_APPROVED` by itself (see Sections 6–7).

| Check                     | PASS                                                                                                                                                                                                           | STOP                                                                                                                                                                                                             |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Target (Section 3)**    | `PGDATABASE` and `current_database()` equal `EXPECTED_DB_NAME`                                                                                                                                                 | Placeholder `EXPECTED_DB_NAME`; parse/connect failure; either mismatch                                                                                                                                           |
| **B1 + B2 beyond_ai**     | `(1,0)` with B1 `finished=t`, `rolled_back=f`, checksum `MATCH` → repair path later; `(0,1)` with same flags on new row → skip repair; `(0,0)` only on **confirmed greenfield** DB (no production data — rare) | `(old≥1 AND new≥1)`; `old>1` or `new>1`; **production** `(0,0)` when Beyond AI should exist (`docs/MIGRATION-HISTORY-REPAIR.md`); B1 `finished=f` or `rolled_back=t`; checksum `MISMATCH` on the row you rely on |
| **B3 tables**             | If B1 implies applied (`finished=t`): both `table_exists` ≥ 1                                                                                                                                                  | Applied history but missing tables                                                                                                                                                                               |
| **B4 / B5**               | Counts = **0**                                                                                                                                                                                                 | Count **> 0**                                                                                                                                                                                                    |
| **B6–B7**                 | Consistent with baseline (indexes absent before migrate is OK)                                                                                                                                                 | B6 `finished=t` but B7 `present=f` for that migration’s index; duplicate B6 rows per name                                                                                                                        |
| **B9 vs repo inventory**  | Diff B9 names against `node scripts/verify-migration-inventory.mjs --print`. Every inventory name is finished **or** owner documents the pending set (Phase 2 names pending is expected before migrate)        | Missing finished rows for migrations already required by the **running** app; unexpected extra names; duplicate B11 rows                                                                                         |
| **B10e Phase 2 columns**  | If Phase 2 migrations finished: every listed `present` = true. If not finished: columns may be absent — do not deploy Phase 2 app code until migrate approval                                                  | Migration `finished=t` but column `present=f`; columns present with no matching migration row (history drift)                                                                                                    |
| **B10 checkout/invoices** | If app at `78a30a7+` and checkout enabled: migration rows finished **and** `HostingOrderCheckout` table_exists = 1 **and** partial unique index present                                                        | Migration row missing but table exists (history drift); migration finished but table/index absent; enum missing                                                                                                  |
| **B10b–B10d columns/FKs** | Every `present` = true for expected checkout/invoice objects when those migrations are finished                                                                                                                | Any `present` = false while migration row shows `finished=t`                                                                                                                                                     |
| **B11 duplicates**        | **No rows** returned (empty result)                                                                                                                                                                            | Any `row_count` > 1 for a migration_name                                                                                                                                                                         |

**beyond_ai repair** (if `old=1`, `new=0`, checksum `MATCH`, finished, not rolled back): read-only preflight may **PASS**; **transactional repair** remains a **separate** owner-approved step (`docs/MIGRATION-HISTORY-REPAIR.md`) before deploy of the renamed migration.

---

## 6. Production backup / restore verification (document only — not executed)

Repo `ops/backup/*` **refuses** `/srv/apps/hostingbeyond/.env` — production backups are **out of band**:

1. Logical `pg_dump -Fc` or provider snapshot before repair/migrate.
2. Encrypted off-site storage; no dumps in git/tickets.
3. Restore drill to an **isolated** database; re-run Section 4 counts (B8–B9, B4–B5); optional aggregate row counts per `hostingbeyond-backup-verify.sh` pattern — **no customer fields**.

Required before setting `HOSTINGBEYOND_PRODUCTION_MIGRATE_APPROVED=true`.

---

## 7. Deploy workflow — migrations fail closed (code review)

From `.github/workflows/deploy.yml`:

- `RUN_PRISMA_MIGRATE_DEPLOY=1` **only** if repository secret `HOSTINGBEYOND_PRODUCTION_MIGRATE_APPROVED` equals **`true`**.
- `workflow_dispatch` inputs do **not** enable migrations.
- Remote script always runs `npx prisma migrate status`. Pending migrations **without** approval **block** `npm run build` and PM2 restart (`PENDING_MIGRATIONS_BLOCK`).
- `npx prisma migrate deploy` runs only when approved **and** status reports pending names.
- There is **no automatic schema rollback** if migrate succeeds and a later build/restart/verify step fails.
- Unrelated releases whose production schema is already up to date may still deploy code without the migrate secret.

---

## 8. Sanitized ticket template

```
Date (UTC):
Operator:
Host confirmed: YES/NO
EXPECTED_DB_NAME:
TARGET: PASS/STOP
beyond_ai old_rows / new_rows:
checksum_vs_repo: MATCH/MISMATCH/N/A
BeyondAi tables: PASS/STOP
duplicate_register_inflight_groups:
duplicate_renew_inflight_groups:
20261016140000 finished:
20261016180000 finished:
index renew present / register present:
migration finished_rows / total_rows:
20261018010000_hosting_order_checkout finished:
HostingOrderCheckout table_exists:
HostingOrderCheckout_one_open_per_order_key present:
B10b checkout columns all present: YES/NO/N/A
B10c checkout FKs present: YES/NO/N/A
B10d invoice columns/FK present: YES/NO/N/A
B11 duplicate migration rows: NONE / LIST
Deploy at SHA (does not prove migrate ran):
Overall: PASS/STOP
Backup plan acknowledged (executed separately): YES/NO
Migrate secret off: YES/NO
```

---

## 9. Revision notes (runbook fixes)

| Issue                                                    | Fix                                                                                                                              |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Node used `process.env.DATABASE_URL` before shell export | Single Node process reads **`ENV_FILE`** only; emits PG\* exports                                                                |
| `psql -d "$DATABASE_URL"` on argv                        | **`psql`** with libpq env vars only (`PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`)                                   |
| URL encoding / `?schema=`                                | `decodeURIComponent` on path/user/password; strip IPv6 `PGHOST` brackets; Prisma-only query keys dropped; libpq keys → `PG*` env |
| Target confirmation                                      | **`EXPECTED_DB_NAME`** vs **`PGDATABASE`** and **`current_database()`** before `-f` SQL                                          |
| Index check                                              | **LEFT JOIN** expected index names vs `pg_indexes`                                                                               |
