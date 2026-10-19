# Backup artifact integrity (operator reference)

## Layer 1 — PostgreSQL dump (VPS, transient)

| Step                  | Format                    | On disk                                                 |
| --------------------- | ------------------------- | ------------------------------------------------------- |
| `pg_dump -Fc`         | PostgreSQL custom archive | `database/hostingbeyond.dump` (**plaintext**, VPS only) |
| `encrypt-artifact.sh` | age ciphertext            | `database/hostingbeyond.dump.age`                       |
| Plaintext removal     | `shred` or `rm`           | dump file must not remain                               |

**Exposure window:** plaintext exists on VPS from end of `pg_dump` until `encrypt-artifact.sh` completes. Mitigate with `hostingbeyond`-only permissions on `~/backup-export` and `umask`; not eliminated.

## Layer 2 — Inner bundle directory (`$TS/`)

| Path                              | Contents                                                                                 |
| --------------------------------- | ---------------------------------------------------------------------------------------- |
| `database/hostingbeyond.dump.age` | Encrypted pg_dump (age, public recipient)                                                |
| `files/*.tar.gz`                  | Upload trees                                                                             |
| `metadata/*`                      | server-facts, env-inventory (names only), prisma tar, aggregates                         |
| `manifest.json`                   | `schemaVersion: 2`, `components[]` (**excludes** `manifest.json`)                        |
| `checksums/SHA256SUMS`            | SHA-256 of every file under `database/`, `files/`, `metadata/`, plus **`manifest.json`** |

### `components[]` checksums (manifest)

Each entry: `{ path, bytes, sha256 }` where `sha256` is the **full file bytes** of `path` relative to bundle root.

**Does not include:** `manifest.json` (see `manifestNote`).

### `checksums/SHA256SUMS` (inner)

GNU `sha256sum` lines: `<hash>  <relative-path>` for:

- All files in `database/`, `files/`, `metadata/`
- `manifest.json` (appended after manifest generation)

Verify with `verify-backup-set.mjs` after decrypting outer bundle (optional pull path).

## Layer 3 — Outer transfer artifact (VPS → Windows)

| File                                    | Description                                                     |
| --------------------------------------- | --------------------------------------------------------------- |
| `~/backup-export/<TS>.bundle.tar`       | **Transient** uncompressed tar of inner bundle dir              |
| `~/backup-export/<TS>.bundle.tar.age`   | **age** ciphertext of tar (only this + meta persist)            |
| `~/backup-export/<TS>.bundle.meta.json` | `{ backupSetId, ciphertextPath, ciphertextSha256, encryption }` |
| `LATEST.bundle.tar.age`                 | Symlink to newest `.tar.age`                                    |

### External checksum (Windows pull)

`ciphertextSha256` in `.bundle.meta.json` and stderr lines:

- `HB_ARTIFACT_SHA256=<hex>`
- `HB_BACKUP_SET_ID=<TS>`

Covers **entire** `*.bundle.tar.age` file bytes on disk.

Verify on Windows (before promote):

```text
node ops/backup/dr/verify-encrypted-artifact.mjs <path-to-ciphertext.bundle.tar.age> <expectedSha256>
```

Optional decrypt test (`HB_DECRYPT_TEST=1`, `HB_AGE_IDENTITY_FILE`):

- Decrypt outer → `bundle.tar` → extract inner tree → decrypt `hostingbeyond.dump.age` → `pg_restore -l`

## Windows completed set layout

`backups\<TS>\`

- `ciphertext.bundle.tar.age` — stored ciphertext (no plaintext DB)
- `ciphertext.meta.stderr` — copy of FETCH stderr (checksum lines)

## Dev test prerequisites

Install `age` from the OS package manager (Ubuntu: `sudo apt-get install age`). Tests use synthetic `age-keygen` keys in temp dirs only — never production keys.

## Fail-closed

| Failure                          | Result                                        |
| -------------------------------- | --------------------------------------------- |
| Wrong/missing `ciphertextSha256` | `verify-encrypted-artifact.mjs` exit 1        |
| Truncated `.age`                 | SHA mismatch or age decrypt fail              |
| Wrong age identity               | Decrypt test fail                             |
| Plaintext dump in inner bundle   | `verify-backup-set.mjs` fail                  |
| Missing `dump.age`               | build-manifest / verify fail                  |
| Missing recipient on VPS         | `encrypt-artifact.sh` exit 4–6; create aborts |
