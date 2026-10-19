# Owner procedure — PC copy, external HDD, and offline protection

**HostingBeyond only.** This does not run on the VPS. Owner executes on a trusted workstation.

## 1. Choose destinations (owner-defined paths)

Do **not** use a path suggested by automation unless you created it:

| Copy role            | Example pattern                                                                                       | Independence             |
| -------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------ |
| Primary working copy | e.g. `D:\GLOBAL-ORBIT-BACKUPS\HostingBeyond\` (Windows) or `~/Backups/hostingbeyond/` (Linux desktop) | One device               |
| External HDD         | Dedicated folder on removable drive, e.g. `E:\HostingBeyond-Archive\`                                 | Separate physical device |
| Offline vault        | HDD disconnected when not copying; optional second site (cloud vault with encryption)                 | Air gap / offsite        |

Two folders on the **same internal SSD** are **not** independent backups.

## 2. Obtain bundle from VPS (approved)

1. SSH as `hostingbeyond` on the production app server (owner credentials).
2. Run `ops/backup/production/create-pull-bundle.sh` per `ops/backup/production/README.md`.
3. Transfer the **outer encrypted artifact** (or approved directory) via `scp`/rsync to the PC — not into a public cloud without encryption.

## 3. Verify after copy

For each file copied, record in a local log (no secrets):

- Source bundle timestamp (from path name).
- File size on VPS vs PC (must match).
- SHA-256: use `sha256sum` / `Get-FileHash -Algorithm SHA256` and compare to `checksums/SHA256SUMS` inside the bundle when available.
- `node ops/backup/dr/verify-backup-set.mjs <bundle-dir>` when the bundle is extracted on the PC (repo checkout required).

**FAIL** verification → do not delete the only VPS copy; investigate before retention.

## 4. Encrypt sensitive archives

Bundles contain **customer, billing, and auth-related** data.

- Prefer **age** (same as VPS `hostingbeyond.dump.age`) or GPG for copies kept on PC/HDD.
- Store **decryption identity** in a password manager and a separate offline backup of the identity — not beside the only data copy.
- Never commit keys, `.env`, or dumps to Git.

## 5. External HDD hygiene

1. Connect drive only for copy/verify windows.
2. Copy verified bundle + `README-RECOVERY.md` + age identity **backup** (if policy allows encrypted key backup).
3. Eject safely; store offline (fire/water/theft plan).
4. Rotate media periodically; test read on a second machine annually.

## 6. Restore test without overwriting production

- Use **lab database** `hostingbeyond_restore_test` only (`ops/backup/dr/ISOLATED-RESTORE-SETUP.md`).
- Decrypt dump on PC if needed; transfer dump to lab host; run `restore-test-isolated.mjs`.
- **Never** point `DATABASE_URL` at production for experiments.

## 7. Documentation per backup generation

| Field                                         | Record       |
| --------------------------------------------- | ------------ |
| UTC date/time                                 |              |
| Bundle ID / folder name                       |              |
| `gitCommit` from `metadata/server-facts.json` |              |
| SHA-256 verified                              | YES/NO       |
| PC copy path                                  | (no secrets) |
| HDD copy path                                 |              |
| Restore drill PASS date                       | or PENDING   |

## 8. Automation reference

Windows pull scripts: `ops/windows-backup/`. Recovery narrative: `ops/windows-backup/templates/README-RECOVERY.md`.
