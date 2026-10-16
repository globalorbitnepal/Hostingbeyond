# HostingBeyond — Pre-production validation (no staging VPS)

> **Last updated:** 2026-10-16 — §11 Phase 3a hardening (migration reorder + renewal HTTP/DB tests).
> **Production:** `https://hosting.theglobalorbit.com` at `e1c1fb2`.
> **Local Phase 3a:** `e79d59d` (not pushed).
> **Owner policy:** Do **not** purchase or provision a **staging VPS**. Use **local isolated PostgreSQL** for integration tests until a **future dedicated server** is bought; run full environment validation on that server **before** DNS cutover (see `DEDICATED-SERVER-REQUIREMENTS.md`).

---

## 1. Verification summary (Phase 1 inspect)

| Check                                     | Result           | Evidence (2026-10-16)                                 |
| ----------------------------------------- | ---------------- | ----------------------------------------------------- |
| Staging app directory                     | **Not present**  | No `/srv/apps/hostingbeyond-staging`                  |
| Production app                            | **Present**      | `/srv/apps/hostingbeyond` (not used for staging work) |
| Staging GitHub Actions workflow           | **Missing**      | Only `.github/workflows/deploy.yml` → production      |
| Staging PostgreSQL                        | **Not verified** | No staging `DATABASE_URL` in repo                     |
| `pg_dump` / `pg_restore` on dev host      | **Available**    | `/usr/bin/pg_dump`, `/usr/bin/pg_restore`             |
| systemd/cron backup timers                | **Not found**    | No matching timers visible to audit user              |
| In-repo backup scripts (before this task) | **Missing**      | Now added under `ops/backup/` (staging/local only)    |
| Live backup/restore drill                 | **Blocked**      | No `hostingbeyond_integration_test` DB (see §11)      |

**Policy:** No staging VPS will be provisioned. Validation path = **local Postgres** now, **new dedicated server dry-run** before cutover.

---

## 2. Pre-production goals

| Goal      | Requirement                                                        |
| --------- | ------------------------------------------------------------------ |
| Isolation | Separate VM **recommended**; same-VPS second user is weaker        |
| Data      | **Synthetic users only** — never `pg_dump` production into staging |
| Payments  | Stripe **test** keys (`sk_test_…`)                                 |
| Domains   | DNA **OTE** (`DOMAIN_API_ENV=test`) — no live registrations        |
| Email     | Log-only / Mailhog — no delivery to real inboxes                   |
| Access    | IP allowlist, VPN, or basic auth; `robots` noindex                 |
| Banner    | Clear “Staging” labeling in UI                                     |

---

## 3. Validation environments (approved approach)

### 3.1 Local isolated PostgreSQL (use now)

| Component          | Guidance                                                                                                    |
| ------------------ | ----------------------------------------------------------------------------------------------------------- |
| Database           | Dedicated `hostingbeyond_integration_test` on **127.0.0.1** (not `hostingbeyond_db` — holds local dev rows) |
| `.env`             | Dev checkout `.env` — **never** `/srv/apps/hostingbeyond/.env`                                              |
| Data               | Synthetic users only; `prisma migrate deploy` + manual seeds                                                |
| Stripe             | Test keys + Stripe CLI webhook forward to `localhost`                                                       |
| DNA                | `DOMAIN_API_ENV=test` / OTE only                                                                            |
| Phase 3a migration | Apply `20261016140000_domain_renew_inflight_unique` here first                                              |

**Blocked until:** one-time superuser `CREATE DATABASE` (§11). PostgreSQL **is** running locally; only the empty integration DB is missing.

### 3.2 Future dedicated server (pre-cutover dry run)

After server purchase, before DNS switch:

- Install Tier A stack per `DEDICATED-SERVER-REQUIREMENTS.md`
- Deploy from Git at release commit; **test** OAuth, Stripe test, DNA OTE
- Optional: restore **encrypted backup** of production (ops-approved procedure only) into a **private** DB on the new box for smoke tests — **not** required for day-one dev validation

### 3.3 Explicitly out of scope

| Item                                         | Status                           |
| -------------------------------------------- | -------------------------------- |
| Staging VPS purchase                         | **Declined by owner**            |
| Copying production customer rows to dev      | **Forbidden**                    |
| Production backup scripts via `ops/backup/*` | **Refused** for prod `.env` path |

### Template files

| File                         | Purpose                                                      |
| ---------------------------- | ------------------------------------------------------------ |
| `config/staging.env.example` | Env **names** for any non-prod host (local or future server) |
| `ops/backup/*`               | Logical backup for **non-production** `.env` only            |

---

## 4. Staging setup procedure (after owner approval)

| Step | Action                                                 | Verification                          |
| ---- | ------------------------------------------------------ | ------------------------------------- |
| 1    | Provision VPS + firewall (443, 22 restricted)          | SSH as deploy user                    |
| 2    | Create PostgreSQL DB + user                            | `\l` shows `hostingbeyond_staging_db` |
| 3    | Clone repo; copy `config/staging.env.example` → `.env` | No production URLs                    |
| 4    | `npm ci` && `npx prisma migrate deploy`                | Migrations applied                    |
| 5    | Seed **synthetic** customer + Orbit enroll             | Login only test accounts              |
| 6    | PM2 `hostingbeyond-staging` on 3031                    | Local curl 200                        |
| 7    | Nginx + TLS                                            | HTTPS staging URL                     |
| 8    | Stripe test webhook → staging                          | One wallet top-up                     |
| 9    | DNA OTE keys only                                      | Register test domain in sandbox       |
| 10   | Deploy commit `e79d59d` for Phase 3a tests             | See §7 matrix                         |

---

## 5. Phase 3a staging validation matrix

| Test                           | Status                          | Notes                               |
| ------------------------------ | ------------------------------- | ----------------------------------- |
| API 401 without session        | **Blocked** — no staging URL    |                                     |
| Order IDOR                     | **Blocked**                     |                                     |
| Ledger scope / dedupe          | Unit **pass**; live **blocked** | `billing-ledger.unit.test.ts`       |
| Renew migration + concurrency  | **Blocked**                     | Needs staging DB + `migrate deploy` |
| Stripe test top-up             | **Blocked**                     |                                     |
| Registration inflight (legacy) | Documented separately           | Not in 3a scope                     |

**Do not deploy Phase 3a to production** until this matrix is **pass** on staging and **explicit deploy approval** is given.

---

## 6. Backup tooling (repo — staging/local)

| Script                                      | Purpose                                                  |
| ------------------------------------------- | -------------------------------------------------------- |
| `ops/backup/hostingbeyond-backup.sh`        | `pg_dump -Fc` + optional uploads tar + manifest + SHA256 |
| `ops/backup/hostingbeyond-restore.sh`       | `pg_restore --clean` (requires `--yes`)                  |
| `ops/backup/hostingbeyond-backup-verify.sh` | Connectivity + migration count + aggregate row counts    |
| `ops/backup/README.md`                      | Usage, cron example, encryption note                     |

**Safety:** Scripts **refuse** `--env-file /srv/apps/hostingbeyond/.env` (verified: exits with refusal message). Production backups must use a **separate approved ops runbook** (provider snapshots or server-side cron not committed here).

**Validation this pass:**

| Check                              | Result                                                     |
| ---------------------------------- | ---------------------------------------------------------- |
| `bash -n` on all `ops/backup/*.sh` | **Pass**                                                   |
| `--help` runs                      | **Pass**                                                   |
| Production `.env` refusal          | **Pass**                                                   |
| End-to-end backup+restore          | **Blocked** — no `.env.integration.local` / integration DB |

Output directory default: `./data/backups/` (gitignored).

---

## 7. Daily backup plan (before dedicated server migration)

| Item                | Recommendation                                                   | Owner approval         |
| ------------------- | ---------------------------------------------------------------- | ---------------------- |
| Schedule            | Daily 02:00–03:00 UTC on **production** (after runbook approved) | **Required**           |
| Retention           | **7 days** initial (proposal)                                    | **Required**           |
| Encryption          | `age` or GPG before off-server copy                              | **Required**           |
| Off-server copy     | Separate credentials from server admin                           | **Required**           |
| Manifest + checksum | `ops/backup` manifest + `SHA256SUMS`                             | Implemented in scripts |
| Failure alert       | If no new backup in 26h                                          | **Required**           |
| Restore drill       | Quarterly on **isolated** DB (local or new server)               | **Required**           |

**RPO / RTO (proposal, pending test):** RPO **24h**, RTO **4h** — **not approved** until a restore drill succeeds with evidence.

**This task:** No backup or restore was executed against production. Live drill **blocked** without isolated PostgreSQL.

---

## 8. Phase 3a release gates (no staging VPS)

| Gate                                | Environment                                             | Status                                                                                     |
| ----------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Apply renew unique-index migration  | `hostingbeyond_integration_test`                        | **Pass**                                                                                   |
| API ownership / 401 tests           | Integration HTTP                                        | **Pass** (§11.2)                                                                           |
| Concurrent renewal test             | Integration DB                                          | **Pass** (`renewal-checkout.integration.test.ts`)                                          |
| Wallet reserve / rollback / timeout | Integration DB                                          | **Pass** (reserve/rollback in phase3a; renewal timeout in renewal-checkout)                |
| Duplicate-charge / P2002 / HTTP 409 | Integration DB                                          | **Pass** (service P2002 + HTTP 409; §11.2)                                                 |
| Fresh `migrate deploy` (greenfield) | After rename                                            | **Pass** on integration DB                                                                 |
| Unit + integration tests            | Dev machine                                             | **Pass** (176 tests, §11.3)                                                                |
| `typecheck` / `lint` / `build`      | Dev machine                                             | **Pass**                                                                                   |
| Verified backup + restore           | `.env.integration.local`                                | **Pass** (§11.4)                                                                           |
| Production migration repair         | Same window as code deploy, **before** `migrate deploy` | **Required** — hardened runbook in `MIGRATION-HISTORY-REPAIR.md` (owner approval + backup) |
| Production deploy                   | Current VPS                                             | **Forbidden** until gates + **owner approval**                                             |

---

## 9. Owner approvals required

| #   | Decision                                                                       |
| --- | ------------------------------------------------------------------------------ |
| 1   | **7-day** backup retention and off-site storage                                |
| 2   | **RPO 24h / RTO 4h** after first successful drill                              |
| 3   | Production backup runbook (separate from blocked prod `.env` in repo scripts)  |
| 4   | Local Postgres setup for integration tests (developer machine)                 |
| 5   | **Phase 3a** production deploy (separate from this audit)                      |
| 6   | Future **dedicated server** purchase spec (`DEDICATED-SERVER-REQUIREMENTS.md`) |
| 7   | Future **DNS** / `hostingbeyond.com` (no change now)                           |

---

## 10. Phase 3a validation status and next actions

### Completed (local — `hostingbeyond_integration_test` @ `127.0.0.1` only)

| Item                                                          | Status                                              |
| ------------------------------------------------------------- | --------------------------------------------------- |
| Integration PostgreSQL + `.env.integration.local`             | **Done** (see §11.1)                                |
| `prisma migrate deploy` (greenfield after `beyond_ai` rename) | **Done** on integration DB                          |
| Phase 3a + hardening integration tests                        | **Done** — §11.2 (`176` tests with integration env) |
| Backup script unit tests + integration backup drill           | **Done** — §11.4                                    |
| Migration rename + `MIGRATION-HISTORY-REPAIR.md` runbook      | **In repo** (commit pending)                        |
| `typecheck` / `lint` / `build`                                | **Pass** — §11.3                                    |

### Not done (production / dev DB — separate approval)

| Item                                                        | Status                                                          |
| ----------------------------------------------------------- | --------------------------------------------------------------- |
| Migration-history repair on production                      | **Required** before deploy — `docs/MIGRATION-HISTORY-REPAIR.md` |
| `20261016140000_domain_renew_inflight_unique` on production | **Not applied** (expected @ `e1c1fb2`)                          |
| `hostingbeyond_db` repair / migrate                         | **Not done** — owner approval required                          |
| Phase 3a production deploy                                  | **Forbidden** until §8 gates + owner approval (§9)              |

### Recommended next steps

1. **Commit** Phase 3a hardening + rename + docs (local; not pushed until reviewed).
2. **Push** and run CI when approved.
3. **Production window:** backup → deploy code → transactional repair → duplicate-renew pre-check → `migrate deploy` → smoke tests.
4. Longer term: dedicated server dry-run per `SERVER-MIGRATION-PLAN.md` (optional planning docs in repo).

---

_Do not copy production customer data into staging. Do not run backup scripts against production `.env`._

---

## 11. Local PostgreSQL integration validation (Phase 3a)

**Last run:** 2026-10-16 (hardening pass). **Commit under test:** `e79d59d` + local hardening (not pushed). **Database:** `hostingbeyond_integration_test` @ `127.0.0.1` only. **`hostingbeyond_db` / production not modified.**

```bash
set -a && source .env.integration.local && set +a
```

### 11.1 Migration history fix (`beyond_ai` ordering)

| Item                                                  | Result                                                                                                                      |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Root cause                                            | `20250924190000_beyond_ai` sorted before `customer_auth` but FK-references `"CustomerUser"`                                 |
| Durable repo fix                                      | Renamed folder to **`20260913120000_beyond_ai`** (`migration.sql` **unchanged** — schema-equivalent)                        |
| Fresh `migrate deploy` (integration DB, empty schema) | **Pass** — all **15** migrations including `20261016140000_domain_renew_inflight_unique`                                    |
| Existing DBs with old migration name                  | **Require one-time repair** in same window as code deploy, **before** `migrate deploy` — `docs/MIGRATION-HISTORY-REPAIR.md` |
| `hostingbeyond_db`                                    | **Not migrated** without **separate owner approval**; repair/deploy require backup + target confirmation per repair doc     |

### 11.2 Integration test matrix (with `source .env.integration.local`)

| Suite                                   | Tests      | Result                                                                                            |
| --------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------- |
| `phase3a.integration.test.ts`           | 10         | **Pass**                                                                                          |
| `renewal-checkout.integration.test.ts`  | 4          | **Pass** (concurrency 409, timeout/reconciliation, **P2002→409** service)                         |
| `route.integration.test.ts` (orders)    | 2          | **Pass** (401 unauthenticated; **200** with real `createCustomerSession` token)                   |
| `route.integration.test.ts` (renew)     | 1          | **Pass** (HTTP **409** in-flight body; uses test override wired to same messages as `P2002` path) |
| `transfer-checkout.integration.test.ts` | (existing) | **Pass** on integration URL                                                                       |
| `ops/backup/lib.test.mjs`               | 3          | **Pass** (prod path block, env parse, `?schema=` strip)                                           |

**Skipped:** none when integration env is loaded; suites self-skip if `DATABASE_URL` is not `hostingbeyond_integration_test`.

| Scenario                                           | Evidence                                                                             |
| -------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Ownership / IDOR / ledger                          | `phase3a.integration.test.ts`                                                        |
| Renew concurrency + single provider call           | `renewal-checkout.integration.test.ts`                                               |
| Timeout → `RECONCILIATION_REQUIRED` + reserve held | `renewal-checkout.integration.test.ts`                                               |
| `P2002` → 409                                      | `renewal-checkout.integration.test.ts` (`createDomainOrder` inject)                  |
| HTTP 409 renew conflict                            | `app/api/domains/checkout/renew/route.integration.test.ts`                           |
| Session 401 / authenticated 200                    | `app/api/domains/orders/route.integration.test.ts` + `customer-session-test-control` |

### 11.3 Quality gates (`source .env.integration.local`)

| Command             | Result                           |
| ------------------- | -------------------------------- |
| `npm run test`      | **176/176 pass** (62 suites)     |
| `npm run typecheck` | **Pass**                         |
| `npm run lint`      | **Pass** (0 errors, 40 warnings) |
| `npm run build`     | **Pass**                         |

### 11.4 Backup tooling (integration only)

| Check                                | Result                                                                                                                           |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| `ops/backup/lib.test.mjs`            | **Pass**                                                                                                                         |
| Allowlist on backup/restore/verify   | Rejects DB names outside `hostingbeyond_integration_test`, `hostingbeyond_staging_db`, `hostingbeyond_test`, `hostingbeyond_dev` |
| Production `.env` path               | **Refused**                                                                                                                      |
| End-to-end backup → restore → verify | **Pass** (prior session; re-run after schema reset as needed)                                                                    |

### 11.5 Remaining risks

1. **Production** and **`hostingbeyond_db`** each need **separate owner approval**, **restorable backup**, **target confirmation**, and a **maintenance window**. Deploy code with the rename first; run **transactional history repair** from `docs/MIGRATION-HISTORY-REPAIR.md`; only then `npx prisma migrate deploy` (never deploy migrations before repair on DBs that still record `20250924190000_beyond_ai`).
2. **`hostingbeyond_db`** still pending `20261016140000_*` until owner applies migrations there deliberately.
3. **Renew HTTP 409 test** uses `renewal-checkout-test-control` override (not a live `P2002` through full HTTP stack); service-layer **P2002** test covers mapping.
4. **Registration inflight TOCTOU** — pre-existing.
5. **Production** at `e1c1fb2`; Phase 3a **not** deployed.

### 11.6 Key artifacts (local)

| Path                                               | Purpose                                 |
| -------------------------------------------------- | --------------------------------------- |
| `docs/MIGRATION-HISTORY-REPAIR.md`                 | Production/dev DB migration name repair |
| `prisma/migrations/20260913120000_beyond_ai/`      | Renamed migration (SQL unchanged)       |
| `lib/domains/renewal-checkout.integration.test.ts` | Renewal concurrency / timeout / P2002   |
| `lib/test/customer-session-test-control.ts`        | Session override for HTTP route tests   |
| `lib/test/renewal-checkout-test-control.ts`        | Renew route HTTP 409 test hook          |
| `ops/backup/lib.test.mjs`                          | Backup helper safety tests              |
