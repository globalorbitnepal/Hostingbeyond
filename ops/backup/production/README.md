# Production pull bundle (VPS-side)

**Owner approval required** before running on production. This does not replace provider-level DB snapshots.

**Production backup execution:** **PENDING** (owner approval).

**Bundle inventory:** `BUNDLE-CONTENTS.md` (included/excluded paths, encryption, verification, failure behavior).

## Export approval gate (fail closed)

Before any `pg_dump` or file archive, `create-pull-bundle.sh` runs `export-preflight.sh`, which requires:

1. `HOSTINGBEYOND_PRODUCTION_BACKUP_EXPORT_APPROVED=true` in `/srv/apps/hostingbeyond/.env` (owner sets this only for an approved backup window; **never** commit to Git).
2. Required tools (`pg_dump`, `age`, …), age **public** recipient file, safe destination under `~/backup-export`, minimum free disk, and a successful `psql` connectivity check.

Missing or false approval exits **11** with `EXPORT_BLOCKED` — no database dump is started.

Dry-run preflight only (no dump):

```bash
sudo -u hostingbeyond -H /srv/apps/hostingbeyond/ops/backup/production/export-preflight.sh \
  --env-file /srv/apps/hostingbeyond/.env
```

## What it does

`create-pull-bundle.sh` (as `hostingbeyond`):

- Runs `export-preflight.sh` first (approval + environment checks)
- `pg_dump -Fc` via `run-with-pg-env.mjs` (parses `/srv/apps/hostingbeyond/.env` in Node; **no shell `eval`**; never logs secrets)
- Asserts database name is exactly **`hostingbeyond_db`** (`assert-production-database.mjs`)
- Verifies dump with `pg_restore -l`
- Encrypts on server; plaintext dump is shredded after `encrypt-artifact.sh`
- Archives upload trees: `ORBIT_UPLOAD_DIR`, `public/uploads`, `data/uploads`, `data/hostingbeyond`
- Writes metadata: git commit, Prisma migrations tar, sanitized env inventory, aggregate table counts
- Builds inner bundle, then **outer** ciphertext for Windows fetch

Does **not** delete or modify production source files.

## Encrypted artifact layout (VPS `~/backup-export`)

| Path                                   | Purpose                                           |
| -------------------------------------- | ------------------------------------------------- |
| `YYYY-MM-DD_HH-MM-SS.bundle.tar.age`   | Outer encrypted tarball (inner bundle tree)       |
| `YYYY-MM-DD_HH-MM-SS.bundle.meta.json` | Ciphertext SHA-256 and backup set id (no secrets) |
| `LATEST.bundle.tar.age`                | Symlink → newest successful outer `.tar.age`      |
| `LATEST.bundle.meta.json`              | Symlink → matching `.meta.json`                   |

Stdout on success: absolute path to the **outer** `*.bundle.tar.age` file (not a plaintext directory).

The fetch SSH key streams only `LATEST.bundle.tar.age` via `ssh-forced-fetch.sh`.

## SSH key for Windows pull (least privilege)

1. Create dedicated keys on Windows (separate **create** and **fetch** keys — see `ops/windows-backup/`).

2. Add to `/home/hostingbeyond/.ssh/authorized_keys` **forced commands** (adjust paths after deploy):

   - Create: `command=".../ssh-forced-backup.sh",no-port-forwarding,...`
   - Fetch: `command=".../ssh-forced-fetch.sh",no-port-forwarding,...`

3. `ssh-forced-backup.sh` runs `create-pull-bundle.sh` only and **rejects** non-empty `SSH_ORIGINAL_COMMAND`.

4. **Windows client** must run `ssh -i ... hostingbeyond@host` with **no remote command**.

5. **Do not** grant write access to `.env` or PM2 via these keys.

## Manual test (owner on VPS)

```bash
sudo -u hostingbeyond -H /srv/apps/hostingbeyond/ops/backup/production/create-pull-bundle.sh
```

Stdout: path to `~/backup-export/<timestamp>.bundle.tar.age`.

After Windows pull, owner may remove old export files under `~/backup-export/` (not production app data). Failed runs do not update `LATEST` until the script completes successfully.

## Plaintext exposure and cleanup

- Inner `hostingbeyond.dump` and outer `*.bundle.tar` exist only briefly on the VPS during the run.
- `encrypt-artifact.sh` shreds the inner dump and outer tar after successful **age** encryption.
- If encryption fails, `encrypt-artifact.sh` deletes the plaintext input and any partial output, then exits 8 if a path remains. `shred` does not prove the old bytes are unrecoverable on SSD, snapshot, or copy-on-write storage.
- If outer encryption or publication fails, the exit trap removes any **unpublished** plaintext outer tar and partial ciphertext/meta for that timestamp only. Prior `LATEST.json` and older export files are untouched.

## Publication (`LATEST` symlinks)

- `publish-export.mjs` writes `*.bundle.meta.json` only after outer ciphertext exists, then updates `LATEST.bundle.tar.age` and `LATEST.bundle.meta.json` via staging symlinks.
- If the meta symlink step fails, the age symlink is rolled back to the previous target when possible.
- Fetch reads one atomic pointer, `LATEST.json`, written only after both symlinks succeed. The fetch command does not follow the two symlinks independently.
- Retention on the Windows copy keeps 8 newest verified weekly sets and 12 verified monthly sets. A set is eligible only when `reports/verify-<folder>.json` has `status` `PASS` and `backupSetFinalized` true. The newest verified set is never deleted. Do not run `retention.mjs --apply` until that report exists.

## Database target guard

`assert-production-database.mjs` accepts only host `127.0.0.1`, port `5432`, database `hostingbeyond_db`, role `hostingbeyond_user`, and a non-empty password. It prints the failed field name and never prints the connection string or password.

## Checksums and retention

- Ciphertext check: `node ops/backup/dr/verify-encrypted-artifact.mjs <file.bundle.tar.age> <expectedSha256>`
- Inner bundle check, after an owner decrypt: `node ops/backup/dr/verify-backup-set.mjs <extracted-bundle-dir>`
- Retention plan, without deletion: `node ops/backup/dr/retention.mjs <windows-backup-root>`
- Those scripts live under `ops/backup/dr/`, not `ops/backup/production/`.

## Isolated restore lab

- Decrypted dumps must be restored only with `ops/backup/dr/restore-test-isolated.mjs` into **`hostingbeyond_restore_test`** on **`127.0.0.1:55433`** (see `ops/backup/dr/ISOLATED-RESTORE-SETUP.md`).
- The copy of that script currently on the production checkout still accepts port `5432`. Do not run it. The safe script is in this development release and reaches `/srv/apps/hostingbeyond` only when that release is deployed. Do not push this release only to update the restore script.
- A matching outer ciphertext SHA-256 proves file integrity on disk, **not** recoverability. An isolated restore drill is still required.

## Owner approval on production VPS

- First-time age recipient install, `authorized_keys` forced commands, and running `create-pull-bundle.sh` remain **owner-operated** steps (this repo does not execute them in CI).
- Owner sequence for the first export: confirm the public age recipient, keep the private identity offline, set `HOSTINGBEYOND_PRODUCTION_BACKUP_EXPORT_APPROVED=true` only for the window, run `export-preflight.sh` and then `create-pull-bundle.sh` as user `hostingbeyond`, clear the flag, confirm the plaintext dump and `.bundle.tar` are gone, copy the `.bundle.tar.age` off-site, and match its SHA-256 with `verify-encrypted-artifact.mjs`.
