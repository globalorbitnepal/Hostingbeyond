# HostingBeyond — disaster recovery runbook (index)

**Purpose:** Single entry point for recovery after failure. **Owner executes** production steps; developers maintain scripts in-repo.

## 1. Stop and preserve evidence

1. **Stop unsafe actions:** no `pg_restore` into production, no `migrate reset`, no mass file deletes, no DNS cutover until backup eligibility is confirmed.
2. Capture: deploy workflow run ID, PM2 logs (`hostingbeyond-ctl logs` — owner), Nginx error log tail, last known `git rev-parse HEAD` on VPS.
3. Note incident time (UTC) for RPO assessment.

## 2. Identify last known-good release

| Source                                                     | Use                              |
| ---------------------------------------------------------- | -------------------------------- |
| `metadata/server-facts.json` in latest **verified** backup | `gitCommit` at backup time       |
| GitHub Actions deploy log                                  | `HEAD is now at <sha>`           |
| Local dev                                                  | `main` at recovery decision time |

Test-only commits do not change runtime behavior but may still be deployed; **schema** follows `_prisma_migrations`, not Git alone.

## 3. Verify backup eligibility

1. `docs/OWNER-OFFLINE-BACKUP-COPY.md` — PC/HDD copy integrity.
2. `node ops/backup/dr/verify-backup-set.mjs <bundle>` — manifest + checksums.
3. Decrypt `hostingbeyond.dump.age` with owner **age** identity (see `ops/windows-backup/templates/README-RECOVERY.md`).

**No verified backup →** recovery is **BLOCKED** until a new export succeeds.

## 4. Restore order (production — separate approval)

**Warning:** Restoring a database **overwrites** newer transactions. Requires maintenance window and explicit owner approval.

1. **Isolated rehearsal first:** `ops/backup/dr/RESTORE-DRILL-LAB.md` on `hostingbeyond_restore_test` (never production).
2. Provision or repair VPS per recovery template.
3. Restore code at chosen commit (`git clone` / deploy workflow).
4. Restore `.env` from vault (names: `ops/backup/production/env-inventory.mjs`).
5. `pg_restore` into **empty** production database only after approval.
6. Restore file tars to documented paths (`ORBIT_UPLOAD_DIR`, `public/uploads`, `data/*`).
7. `npx prisma migrate status` — **read-only** assessment; migrate only per `docs/RELEASE-GATE.md`.
8. `hostingbeyond-ctl restart`; verify `127.0.0.1:3030` and public HTTPS smoke.
9. Validate: login, wallet read-only spot check, invoice PDF auth route, hosting checkout **only after schema verified**.

## 5. Configuration without exposing secrets

- Inventory variable **names** from `env-inventory.json` / `.env.example`.
- Recover values from password manager only.
- Rotate Stripe webhook secret and session secrets if breach suspected (out of scope for automated Day 2).

## 6. Data consistency checks (post-restore)

- Row counts / aggregates: `ops/backup/production/source-aggregates.mjs` pattern (sanitized) vs restored DB.
- Invoice PDFs: DB `pdfStorageKey` must exist under `invoices-private` on disk (`lib/billing/invoice-storage.ts`).
- Upload paths must match `ORBIT_UPLOAD_DIR` on new server.

## 7. Proposed recovery targets (not commitments)

| Metric  | Proposed discussion baseline                            | Depends on                                        |
| ------- | ------------------------------------------------------- | ------------------------------------------------- |
| **RPO** | 24 hours (daily backup) or less if cron + pull succeeds | Backup frequency, transaction volume              |
| **RTO** | 4–8 hours (single VPS rebuild + restore)                | DB size, file volume, DNS TTL, owner availability |

Achieve targets only after measured restore drills and documented backup schedule.

## 8. Document map

| Topic                    | Path                                          |
| ------------------------ | --------------------------------------------- |
| Backup audit matrix      | `docs/BACKUP-DR-AUDIT.md`                     |
| Production preflight SQL | `docs/PRODUCTION-PREFLIGHT-RUNBOOK.md`        |
| Migration history repair | `docs/MIGRATION-HISTORY-REPAIR.md`            |
| Release / migrate gate   | `docs/RELEASE-GATE.md`                        |
| Day 2 checklist          | `docs/DAY2-PRODUCTION-PREFLIGHT-CHECKLIST.md` |
| VPS bundle export        | `ops/backup/production/create-pull-bundle.sh` |
| Windows pull             | `ops/windows-backup/`                         |
| Desktop daily backup     | `docs/DESKTOP-DAILY-BACKUP-OWNER.md`          |
| VPS bootstrap (DR)       | `ops/restore/bootstrap-vps.sh`                |
| Lab restore drill        | `ops/backup/dr/RESTORE-DRILL-LAB.md`          |
| Staging/local scripts    | `ops/backup/README.md`                        |
