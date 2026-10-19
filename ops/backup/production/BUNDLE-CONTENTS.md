# Production pull bundle — contents, exclusions, verification

**Script:** `create-pull-bundle.sh` (run as `hostingbeyond` on VPS after tooling is deployed).  
**This document does not execute backups.**

## Included

| Component        | Path / artifact                                                | Notes                                                                                          |
| ---------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Database         | `database/hostingbeyond.dump.age`                              | `pg_dump -Fc`, then encrypted; **no plaintext** in final inner bundle                          |
| Upload tree      | `files/orbit_uploads.tar.gz`                                   | From `ORBIT_UPLOAD_DIR` in `.env` (includes `invoices-private/` when stored under upload root) |
| Legacy uploads   | `files/public_uploads.tar.gz`                                  | `$APP_ROOT/public/uploads` if directory exists                                                 |
| App data         | `files/data_uploads.tar.gz`, `files/data_hostingbeyond.tar.gz` | If present under app root                                                                      |
| Schema reference | `metadata/prisma-migrations.tar.gz`                            | `prisma/schema.prisma` + `prisma/migrations/` at export time                                   |
| Env inventory    | `metadata/env-inventory.json`                                  | Variable **names** and presence only — **no values**                                           |
| Server facts     | `metadata/server-facts.json`                                   | `gitCommit`, `databaseName`, versions — no secrets                                             |
| Aggregates       | `metadata/source-aggregates.json`                              | Sanitized table counts when query succeeds                                                     |
| Integrity        | `checksums/SHA256SUMS`, `manifest.json`                        | Per-file SHA-256; manifest rejects plaintext dumps                                             |

**Outer transfer artifact:** `~/backup-export/<timestamp>.bundle.tar.age` + `.bundle.meta.json` (ciphertext SHA-256). Symlink `LATEST.bundle.tar.age` updates **only** after full success.

## Excluded (by design)

| Item                           | Reason                                                          |
| ------------------------------ | --------------------------------------------------------------- |
| `/srv/apps/hostingbeyond/.env` | Secrets — recover from password manager                         |
| `.env` / `.env.*` inside tar   | Explicit `--exclude` on `pack_dir`                              |
| Plaintext `hostingbeyond.dump` | Removed after encryption; `build-manifest.mjs` fails if present |
| `node_modules`, `.next`        | Rebuilt on restore from git                                     |
| Nginx / TLS / systemd          | Out of repo — document separately                               |
| PM2 state                      | Recreated via `hostingbeyond-ctl`                               |

## Encryption

- Server-side **age** via `encrypt-artifact.sh` (public recipient on VPS; owner holds identity for decrypt).
- Inner DB dump encrypted first; outer tar of bundle directory encrypted for Windows fetch.
- See `ops/backup/dr/ARTIFACT-INTEGRITY.md`.

## Verify before transfer

On VPS (inner tree, before outer tar — automated in script):

1. `pg_restore -l` on dump (pre-encrypt).
2. `node ops/backup/dr/build-manifest.mjs` — no plaintext dump.
3. `sha256sum` → `checksums/SHA256SUMS`.

On Windows after pull (optional phases):

1. `verify-encrypted-artifact.mjs` — outer ciphertext SHA vs server meta.
2. With `HB_DECRYPT_TEST=1` + identity: decrypt smoke + `verify-backup-set.mjs` on extracted inner bundle.

**Ciphertext SHA match alone is not a restore PASS.**

## Restore to lab database only

1. Decrypt outer + inner per `ops/windows-backup/templates/README-RECOVERY.md`.
2. Decrypt `hostingbeyond.dump.age` to a **temp** file on lab host.
3. `node ops/backup/dr/restore-test-isolated.mjs <dump>` → **`hostingbeyond_restore_test` only**.
4. Re-run preflight SQL sections B8–B11 against lab DB (sanitized) to compare shape.

## Failure behavior

- `set -euo pipefail`; non-zero exit on dump/encrypt/manifest/checksum failure.
- Failed run: `trap` removes incomplete inner bundle directory; **does not** update `LATEST` symlinks.
- Windows pull: staging under `backups\_staging\` removed on failure; prior `backups\<timestamp>\` untouched.
- Retention: never deletes without finalized `verify-*.json`; never deletes newest verified set (`retention.mjs`).

## Database name gate

Export runs only when `PGDATABASE` is exactly **`hostingbeyond_db`** (`assert-production-database.mjs`).
