# Isolated restore drill — manual lab procedure (owner execution)

**Status:** **Restore drill PENDING** until an owner completes every phase below on a verified lab host and archives evidence.  
**This document does not execute anything** — it is the approved runbook for a future drill.

**Production backup:** **PENDING** (separate from this lab).

---

## Scope and isolation

| Allowed                                                 | Forbidden                                                                      |
| ------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Database **`hostingbeyond_restore_test` only**          | `hostingbeyond_db`, `hostingbeyond_integration_test`, any remote/production DB |
| Local socket **`127.0.0.1:5432`** (documented lab port) | Other ports (script exits **9** / **10**)                                      |
| Synthetic / migration metadata only                     | Real customer rows, production dumps, Windows ciphertext bundles               |
| Restore via **`restore-test-isolated.mjs` only**        | Manual `pg_restore` to non-lab DB names, production recovery runbook           |

### SSH tunnel warning

Connecting to `127.0.0.1:5432` does **not** prove PostgreSQL is on the same machine. A local forward such as `ssh -L 5432:db.internal:5432` can expose a **remote** server on that address. The restore script **cannot detect** tunnels. Before any drill:

1. Owner confirms **no** SSH `-L` / `-R` forwards bound to local **5432** (or stop them).
2. Owner confirms `psql` reports database **`hostingbeyond_restore_test`** and expected server version (see Phase 0).

---

## Minimum synthetic data (Prisma / restore script)

`restore-test-isolated.mjs` verifies restore success with:

```sql
SELECT COUNT(*) FROM "_prisma_migrations";
```

**Minimum for PASS:** count **> 0** after restore (JSON `status: "PASS"`).

**Recommended lab setup (no customer data):**

1. Owner creates empty database **`hostingbeyond_restore_test`** and role **`hostingbeyond_restore_test_owner`** (phased SQL — see Phase 1).
2. Owner runs **`npx prisma migrate deploy`** once with `DATABASE_URL` pointing **only** at the lab database (temporary shell export — never commit; do not use production `.env`).
3. That applies the full application schema and populates **`_prisma_migrations`** from repository migrations — **synthetic lab state**, not a copy of production.

Optional human check after restore (no PII expected):

```sql
SELECT migration_name, finished_at FROM "_prisma_migrations" ORDER BY finished_at DESC LIMIT 5;
```

Do **not** import production dumps or seed scripts that contain customer emails, orders, or wallets.

---

## Prerequisites (owner-verified before Phase 0)

- PostgreSQL **16.x** (match production major version when possible).
- Client tools: `psql`, `pg_dump`, `pg_restore` (same major as server).
- Node.js from dev checkout; `npm ci` already done in `/home/sysadmin/dev/Hostingbeyond` (or equivalent path).
- Lab role can `CONNECT` + `CREATE` on **`hostingbeyond_restore_test`** only (owner defines grants).
- **No** `DATABASE_URL` in the shell when using `restore-test-isolated.mjs` (script refuses it).

---

## Phase 0 — Owner verification (mandatory)

```bash
unset DATABASE_URL
unset PGSERVICE PGSERVICEFILE PGHOSTADDR PGOPTIONS
export PGHOST=127.0.0.1
export PGPORT=5432
export PGUSER=hostingbeyond_restore_test_owner
export PGDATABASE=hostingbeyond_restore_test
# PGPASSWORD: interactive or ~/.pgpass mode 600 — never commit

psql -h 127.0.0.1 -p 5432 -d hostingbeyond_restore_test -v ON_ERROR_STOP=1 \
  -c "SELECT current_database(), inet_server_addr(), version();"
```

**Record in drill log:**

| Check              | Expected                                                                  |
| ------------------ | ------------------------------------------------------------------------- |
| `current_database` | `hostingbeyond_restore_test`                                              |
| Server address     | Owner documents (null on Unix socket is OK; distrust if tunnel suspected) |
| No tunnel          | Owner attestation: no local forward to 5432                               |

**STOP** if database name, role, or port differ from the table above.

---

## Phase 1 — Lab database and role (owner SQL; run once)

Use owner-approved SQL (example shape only — adjust passwords/paths):

```sql
-- Run as PostgreSQL superuser on the lab instance only. Do not alter hostingbeyond_db or other production databases.
CREATE ROLE hostingbeyond_restore_test_owner LOGIN PASSWORD '…owner-chosen…';
CREATE DATABASE hostingbeyond_restore_test OWNER hostingbeyond_restore_test_owner;
```

Grant only what the lab role needs on **`hostingbeyond_restore_test`**. Do not create or modify production databases.

---

## Phase 2 — Schema via migrations (synthetic)

From dev checkout, **temporary** lab URL only:

```bash
cd /path/to/Hostingbeyond
export DATABASE_URL='postgresql://hostingbeyond_restore_test_owner:…@127.0.0.1:5432/hostingbeyond_restore_test?schema=public'
npx prisma migrate deploy
unset DATABASE_URL
```

Confirm:

```bash
psql … -c 'SELECT COUNT(*) FROM "_prisma_migrations";'
```

Count must be **≥ 1** before dump.

---

## Phase 3 — Custom-format dump (temporary artifact)

Use a **unique** test-owned directory:

```bash
DRILL_DIR="$(mktemp -d /tmp/hostingbeyond-restore-drill.XXXXXX)"
export PGHOST=127.0.0.1 PGPORT=5432 PGUSER=hostingbeyond_restore_test_owner
export PGDATABASE=hostingbeyond_restore_test

pg_dump -h 127.0.0.1 -p 5432 -Fc -f "$DRILL_DIR/lab-pre-restore.dump" hostingbeyond_restore_test
```

**Verify archive listing (no restore yet):**

```bash
pg_restore -l "$DRILL_DIR/lab-pre-restore.dump" | head -20
```

Save `pg_restore -l` output in the drill evidence folder.

---

## Phase 4 — Restore only through `restore-test-isolated.mjs`

```bash
cd /path/to/Hostingbeyond
unset DATABASE_URL PGSERVICE PGSERVICEFILE PGHOSTADDR PGOPTIONS
export PGHOST=127.0.0.1 PGPORT=5432 PGUSER=hostingbeyond_restore_test_owner
export PGDATABASE=hostingbeyond_restore_test

node ops/backup/dr/restore-test-isolated.mjs \
  "$DRILL_DIR/lab-pre-restore.dump" \
  hostingbeyond_restore_test \
  | tee "$DRILL_DIR/restore-result.json"
```

**Exit codes:** `0` = PASS JSON; `1` = FAIL JSON or zero migrations; `2` usage; `3` wrong DB name; `4` `current_database` mismatch; `5` missing dump; `6` `pg_restore` failed; `8` bad host; `9`/`10` env/port guards.

**PASS criteria:**

- Process exit code **0**
- JSON contains `"status": "PASS"` and `"migrationRows"` > 0

**FAIL:** any other exit code or `"status": "FAIL"` — do not mark drill complete.

---

## Phase 5 — Optional row verification (synthetic)

```bash
psql … -c 'SELECT COUNT(*) FROM "_prisma_migrations";'
psql … -c 'SELECT COUNT(*) FROM "CustomerUser";'   -- expect 0 in lab-only drill
```

Document counts in the drill log. Non-zero `CustomerUser` means production-like data was introduced — treat as drill contamination.

---

## Cleanup (test-owned artifacts only)

Only remove the directory created in Phase 3 (`mktemp -d /tmp/hostingbeyond-restore-drill.XXXXXX`). **Never** run `rm -rf` on an unset, empty, or non-drill path.

```bash
# Confirm variable is set and matches the drill temp pattern before deleting anything.
test -n "$DRILL_DIR" || { echo "REFUSE: DRILL_DIR unset"; exit 1; }
case "$DRILL_DIR" in
  /tmp/hostingbeyond-restore-drill.*) ;;
  *) echo "REFUSE: DRILL_DIR is not a drill temp path: $DRILL_DIR"; exit 1 ;;
esac
test -d "$DRILL_DIR" || { echo "REFUSE: not a directory"; exit 1; }
echo "Removing drill temp only: $DRILL_DIR"
rm -rf -- "$DRILL_DIR"
```

- Do **not** drop **`hostingbeyond_restore_test`** unless owner explicitly decommissions the lab.
- Do **not** delete production backups, `D:\` archives, `/srv/apps` data, or any path outside `$DRILL_DIR` above.

---

## Evidence required before marking restore drill complete

Owner archives (ticket / secure storage):

1. Phase 0 `psql` output (database name + version).
2. Tunnel attestation (signed statement or checklist).
3. `pg_restore -l` excerpt for the lab dump.
4. Full stdout of `restore-test-isolated.mjs` (`restore-result.json`).
5. Post-restore `COUNT(*)` on `_prisma_migrations` (and optional `CustomerUser` = 0).

Until all items exist: **Restore drill: PENDING**.

---

## Related docs and tests

- Connection profile and tunnel note: `ISOLATED-RESTORE-SETUP.md`
- Production recovery (not this drill): `ops/windows-backup/templates/README-RECOVERY.md`
- Non-destructive guards: `restore-test-isolated.test.mjs`, `restore-test-isolated.port.test.mjs`, `restore-test-isolated.command.test.mjs`, `restore-test-isolated.preflight.test.mjs`
