# Isolated PostgreSQL restore test (lab only)

**Not production.** Do not use `hostingbeyond_db`, `hostingbeyond_integration_test`, or remote hosts.

**Restore drill status:** **PENDING** until owner runs the lab pipeline end-to-end and archives evidence (`RESTORE-DRILL-LAB.md`).

## Prerequisites

1. Local PostgreSQL **16.x** listening on `127.0.0.1:5432` (owner-verified on dev host).
2. `age` for encrypt/decrypt exercises in the lab pipeline.
3. Disposable lab database **`hostingbeyond_restore_test`** and role **`hostingbeyond_restore_test_owner`** (create with owner-approved phased SQL — no `createuser || true` shortcuts).

## Safe connection profile (lab only)

Before any `psql`, `pg_dump`, or `restore-test-isolated.mjs` run:

```bash
unset DATABASE_URL
unset PGSERVICE PGSERVICEFILE PGHOSTADDR PGOPTIONS
export PGHOST=127.0.0.1
export PGPORT=5432
export PGUSER=hostingbeyond_restore_test_owner
export PGDATABASE=hostingbeyond_restore_test
# PGPASSWORD via interactive \password and ~/.pgpass (mode 600) — never commit

psql -h 127.0.0.1 -p 5432 -d hostingbeyond_restore_test -v ON_ERROR_STOP=1 \
  -c "SELECT current_database();"
# Must print: hostingbeyond_restore_test
```

`restore-test-isolated.mjs` **refuses** `DATABASE_URL`, service-file and SSL-related libpq overrides, disallowed `PGSSLMODE`, unapproved `PGPORT` (only **5432**), non-local `PGHOST`, and `PGDATABASE` values that do not match the lab database. It exits **5** if the dump file is missing **before** any `psql` / `pg_restore` call.

### SSH tunnels and “localhost”

The script connects to `127.0.0.1:5432` (or `::1` with the same port). That **does not guarantee** the PostgreSQL instance is on the same machine: an SSH local forward (`ssh -L 5432:remote:5432`) can expose a **remote** server on that socket. The script **cannot detect** tunnels. For stronger isolation, use a dedicated lab host, firewall rules, or OS policy — not application checks alone.

## Lab pipeline (synthetic data only)

**Step-by-step owner runbook:** `RESTORE-DRILL-LAB.md` (phases 0–5, evidence checklist, cleanup).

Summary:

1. Owner-verified lab profile on **`hostingbeyond_restore_test`** @ **`127.0.0.1:5432`** (tunnel check required).
2. Apply schema with **`npx prisma migrate deploy`** to the lab DB only (populates `_prisma_migrations` — minimum data for script PASS).
3. `pg_dump -Fc` → verify with `pg_restore -l` (temporary file under `/tmp/hostingbeyond-restore-drill.*`).
4. Restore **only** via:

   ```bash
   node ops/backup/dr/restore-test-isolated.mjs /path/to/lab.dump hostingbeyond_restore_test
   ```

   The script checks the dump exists **before** connecting, then uses `pg_restore --clean` **only** against `hostingbeyond_restore_test` after `current_database()` checks.

Optional encrypted-artifact exercise (test age keys): encrypt dump → `verify-encrypted-artifact.mjs` → decrypt before step 4. Not required for the core DB restore drill.

## Production recovery

Production recovery is **not** this script. Use `ops/windows-backup/templates/README-RECOVERY.md` only with owner approval. Never point `restore-test-isolated.mjs` at `hostingbeyond_db`.
