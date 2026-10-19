# Production pull bundle (VPS-side)

**Owner approval required** before running on production. This does not replace provider-level DB snapshots.

**Production backup execution:** **PENDING** (owner approval).

**Bundle inventory:** `BUNDLE-CONTENTS.md` (included/excluded paths, encryption, verification, failure behavior).

## What it does

`create-pull-bundle.sh` (as `hostingbeyond`):

- `pg_dump -Fc` using libpq env from `/srv/apps/hostingbeyond/.env` (never logs secrets)
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
