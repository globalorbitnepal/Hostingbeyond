# Owner execution checklist — Day 2 closure (manual, ordered)

**None of these steps are assumed complete.** Execute in order. Keep `HOSTINGBEYOND_PRODUCTION_MIGRATE_APPROVED` **disabled** until step 8 explicitly passes and a **separate** migrate approval is granted.

| Step  | Action                                                                         | Evidence to keep                                                                                                                      | Status      |
| ----- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| **1** | Read-only production DB preflight                                              | `docs/PRODUCTION-PREFLIGHT-RUNBOOK.md` §3–4; log `/tmp/hb-preflight-*.log` (sanitized — no secrets)                                   | **PENDING** |
| **2** | Approve + deploy backup tooling                                                | `docs/BACKUP-TOOLING-DEPLOY-APPROVAL.md`; CI + deploy run ID; `git rev-parse` on VPS                                                  | **PENDING** |
| **3** | One controlled production backup                                               | VPS: `create-pull-bundle.sh` **or** approved equivalent; note outer `.bundle.tar.age` path                                            | **PENDING** |
| **4** | Verify artifact + file coverage                                                | `verify-encrypted-artifact.mjs`; optional inner `verify-backup-set.mjs`; confirm `orbit_uploads` tar lists `invoices-private` if used | **PENDING** |
| **5** | Store verified copy on **Windows PC** (`%USERPROFILE%\HostingBeyond-Backups\`) | `docs/WINDOWS-PC-BACKUP.md`; SHA-256 vs server `HB_ARTIFACT_SHA256` / inner `SHA256SUMS` after decrypt test                           | **PENDING** |
| **6** | Isolated restore drill                                                         | `ops/backup/dr/RESTORE-DRILL-LAB.md`; DB **`hostingbeyond_restore_test` only**; `restore-test-isolated.mjs` exit 0 + JSON PASS        | **PENDING** |
| **7** | PASS/STOP decision                                                             | File ticket from runbook §8; attach drill result; update `docs/DAY2-PRODUCTION-PREFLIGHT-CHECKLIST.md` rows                           | **PENDING** |
| **8** | Migration gate                                                                 | Confirm migrate secret still **off** until PASS on 1+3–7; then separate approval for maintenance window                               | **PENDING** |

## Step 1 quick reference

1. Set `EXPECTED_DB_NAME` (confirmed name only, typically `hostingbeyond_db`).
2. Run connection bootstrap → must print `PASS: database target confirmed`.
3. Run `/tmp/hb-preflight-readonly.sql` (B1–B11).
4. **STOP** if B4/B5 > 0, B11 returns rows, B10 objects missing while app expects checkout, or beyond_ai STOP rules in runbook §5.

**Warning:** Green deploy / HTTP 200 / `MIGRATE_SKIPPED` does **not** prove `20261018010000_hosting_order_checkout` ran.

## Step 6 quick reference

- Unset `DATABASE_URL` in shell before `restore-test-isolated.mjs`.
- No SSH `-L 5432:...` during drill.
- Production restore into `hostingbeyond_db` requires **separate** disaster approval — not this checklist.

## Related docs

- `docs/DAY2-PRODUCTION-PREFLIGHT-CHECKLIST.md` — PASS/FAIL table
- `docs/DISASTER-RECOVERY-RUNBOOK.md` — full DR index
- `ops/backup/production/BUNDLE-CONTENTS.md` — what is in the bundle
