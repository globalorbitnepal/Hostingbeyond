# HostingBeyond — backup and restore validation

**Purpose:** Repeatable checks after backup creation or before trusting a bundle for DR.  
**Never** log secret values, `.env` contents, or age private keys.

## Status legend

- **PASS** — verified with command output or artifact on disk
- **FAIL** — attempted and failed
- **BLOCKED** — needs approval, credentials, or environment
- **NOT RUN** — not executed in this environment

## A. Production pull bundle (VPS export)

| Step | Command / action                                                    | Pass criteria                                                  | Status (2026-10-21)                          |
| ---- | ------------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------- |
| A0   | `export-preflight.sh --env-file /srv/apps/hostingbeyond/.env`       | Exit 0 only when approval + tools + recipient + disk + DB ping | **BLOCKED** — approval not set on production |
| A1   | Run as `hostingbeyond`: `create-pull-bundle.sh`                     | Exit 0; stdout = path to `*.bundle.tar.age`                    | **NOT RUN**                                  |
| A2   | Inspect `~/backup-export/`                                          | Timestamp dir or `LATEST.bundle.tar.age` symlink               | **FAIL** — directory missing                 |
| A3   | `pg_restore -l` on dump inside bundle (after decrypt in lab)        | Lists TOC                                                      | **NOT RUN**                                  |
| A4   | `node ops/backup/dr/verify-backup-set.mjs <bundle>`                 | Manifest + `SHA256SUMS` match                                  | **NOT RUN**                                  |
| A5   | Compare `metadata/server-facts.json` `gitCommit` to expected deploy | Matches intentional pin                                        | **NOT RUN**                                  |

Regression tests in repo (dev host): `node --test ops/backup/production/*.test.mjs` — **PASS** (26 tests, 2026-10-21).

## B. Windows offline copy

| Step | Action                                       | Pass criteria                                        | Status (2026-10-21)                                                     |
| ---- | -------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------- |
| B1   | Desktop manifest verify                      | Report `verification.pass === true`                  | **PASS** — `dev-desktop-recovery-20261021-171121.json`                  |
| B2   | Project snapshot                             | `SNAPSHOT_OK.json` in snapshot folder                | **PASS** — `project-snapshots/2026-10-21_171607` (52,858 files)         |
| B3   | Scheduled `HostingBeyond-DevProjectSnapshot` | First run after 03:30 local with new snapshot        | **NOT RUN** — next run 2026-10-22 03:30 (not yet elapsed at inspection) |
| B4   | Retention (14)                               | Older verified snapshots pruned only when count > 14 | **NOT RUN** — insufficient automatic history                            |

## C. Isolated restore drill (lab)

Follow `ops/backup/dr/RESTORE-DRILL-LAB.md` only on database **`hostingbeyond_restore_test`**.

| Step | Pass criteria                      | Status                                 |
| ---- | ---------------------------------- | -------------------------------------- |
| C0   | No SSH tunnel on local 5432        | Owner attestation                      | **BLOCKED** |
| C1   | `restore-test-isolated.mjs`        | JSON `status: "PASS"`                  | **NOT RUN** |
| C2   | App smoke in isolation             | Read-only routes; no live Stripe/email | **NOT RUN** |
| C3   | Record wall-clock restore duration | Compare to proposed RTO                | **NOT RUN** |

**Do not** restore production `hostingbeyond_db` as a substitute for lab drill.

## D. Post-restore production cutover (separate approval)

Only after owner sign-off and maintenance window:

1. `docs/RELEASE-GATE.md` migration assessment
2. Pause Stripe webhooks during DB swap
3. `hostingbeyond-ctl restart` after file + DB restore
4. Spot-check wallet (read-only), invoice PDF auth route, hosting checkout schema

## Evidence archive (paths only)

| Artifact          | Path                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------ |
| Desktop verify    | `C:\Users\User\HostingBeyond-Backups\reports\dev-desktop-recovery-20261021-171121.json`    |
| Manual snapshot   | `C:\Users\User\HostingBeyond-Backups\project-snapshots\2026-10-21_171607\SNAPSHOT_OK.json` |
| Production export | _(none yet)_                                                                               |

Update this table after each verified backup or drill.
