# Day 2 — production migration & DR preflight checklist (owner-operated)

**Repository:** `globalorbitnepal/Hostingbeyond`  
**Deployed app commit (known):** `78a30a79cf3ff318f548653bc56e754fd00a2ab1`  
**Production migration authorization:** **NOT GRANTED** in this document. Do not set `HOSTINGBEYOND_PRODUCTION_MIGRATE_APPROVED` here.

Mark each item **PASS**, **FAIL**, **PENDING**, or **BLOCKED** only with explicit evidence. HTTP 200, green CI, or `MIGRATE_SKIPPED` alone are **not** PASS for schema or backup items.

| ID  | Requirement                                                                                                        | Status             | Evidence                                      | Next action                                                                     |
| --- | ------------------------------------------------------------------------------------------------------------------ | ------------------ | --------------------------------------------- | ------------------------------------------------------------------------------- |
| A   | Read-only production DB target confirmed (`EXPECTED_DB_NAME`, Section 3 of `docs/PRODUCTION-PREFLIGHT-RUNBOOK.md`) | **PENDING**        | No sanitized preflight log in repo            | Owner runs connection bootstrap + `PASS: database target confirmed`             |
| B   | Migration history B1–B9 + B10 SQL executed; ticket filed                                                           | **PENDING**        | Production not queried from dev               | Owner runs `/tmp/hb-preflight-readonly.sql` (includes B10 checkout/invoice)     |
| C   | Repo vs `_prisma_migrations` diff (19 folders) consistent with deploy intent                                       | **PENDING**        | Local integration DB only in CI               | Compare B9 output to runbook list; flag `20261018010000_hosting_order_checkout` |
| D   | `HostingOrderCheckout` table + indexes + enum (B10) if checkout code deployed                                      | **PENDING**        | Last deploy skipped migrate                   | B10 queries; STOP if app expects checkout rows but objects missing              |
| E   | Fresh verified production `pg_dump` (or provider snapshot) + manifest                                              | **PENDING**        | No production bundle hash in repo             | Owner runs `ops/backup/production/create-pull-bundle.sh` on VPS                 |
| F   | Upload/invoice files in bundle (`orbit_uploads` includes `invoices-private` under `ORBIT_UPLOAD_DIR`)              | **PENDING**        | Path on VPS unverified                        | Confirm `ORBIT_UPLOAD_DIR` on server; verify tar contains `invoices-private`    |
| G   | Isolated restore drill **PASS** (`restore-test-isolated.mjs` on lab DB only)                                       | **PENDING**        | `RESTORE-DRILL-LAB.md` not completed          | Lab drill with synthetic or decrypted **non-prod** dump                         |
| H   | Maintenance window + rollback decision documented                                                                  | **PENDING**        | —                                             | Owner sign-off before migrate                                                   |
| I   | Intended release commit + CI success for that SHA                                                                  | **PASS**           | CI run `39150837863` on `78a30a7`             | Re-check if newer commits pushed                                                |
| J   | `HOSTINGBEYOND_PRODUCTION_MIGRATE_APPROVED` unchanged until H+A–G PASS                                             | **PASS** (assumed) | Deploy `39151028958` logged `MIGRATE_SKIPPED` | Owner confirms secret still unset/false before any migrate window               |

**Owner ordered steps:** `docs/OWNER-DAY2-EXECUTION-CHECKLIST.md`  
**Deploy backup scripts:** `docs/BACKUP-TOOLING-DEPLOY-APPROVAL.md`  
**Evidence format:** `docs/PREFLIGHT-EVIDENCE-EXAMPLE.md`  
**Related:** `docs/MIGRATION-HISTORY-REPAIR.md`, `docs/RELEASE-GATE.md`, `docs/BACKUP-DR-AUDIT.md`, `ops/backup/dr/RESTORE-DRILL-LAB.md`.
