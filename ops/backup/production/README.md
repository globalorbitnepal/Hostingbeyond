# Production pull bundle (VPS-side)

**Owner approval required** before running on production. This does not replace provider-level DB snapshots.

**Production backup execution:** **PENDING** (owner approval).

**Bundle inventory:** `BUNDLE-CONTENTS.md` (included/excluded paths, encryption, verification, failure behavior).

## What it does

`create-pull-bundle.sh` (as `hostingbeyond`):

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
- If outer encryption or publication fails, the exit trap removes any **unpublished** plaintext outer tar and partial ciphertext/meta for that timestamp only. Prior `LATEST` targets and older export files are untouched.

## Publication (`LATEST` symlinks)

- `publish-export.mjs` writes `*.bundle.meta.json` only after outer ciphertext exists, then updates `LATEST.bundle.tar.age` and `LATEST.bundle.meta.json` via staging symlinks.
- If the meta symlink step fails, the age symlink is rolled back to the previous target when possible.
- **Limitation:** the two `LATEST` links are updated sequentially, not as a single atomic pair. A crash between steps could leave fetch and meta pointing at different sets until the next successful run.

## Database target guard

- **Name:** `assert-production-database.mjs` requires `PGDATABASE` = `hostingbeyond_db` and blocks restore/lab name patterns.
- **Host:** the repository does not record the production PostgreSQL hostname. Connection target is taken from deployment `.env` without echoing it. Operators must confirm host/database via owner preflight (`docs/PRODUCTION-PREFLIGHT-RUNBOOK.md`) before approving exports.

## Isolated restore lab

- Decrypted dumps must be restored only with `ops/backup/dr/restore-test-isolated.mjs` into **`hostingbeyond_restore_test`** (see `ops/backup/dr/ISOLATED-RESTORE-SETUP.md`).
- A matching outer ciphertext SHA-256 (see `.bundle.meta.json`) proves file integrity on disk, **not** recoverability — run decrypt smoke + `verify-backup-set.mjs` and an isolated restore drill before trusting a set.

## Owner approval on production VPS

- First-time age recipient install, `authorized_keys` forced commands, and running `create-pull-bundle.sh` remain **owner-operated** steps (this repo does not execute them in CI).
