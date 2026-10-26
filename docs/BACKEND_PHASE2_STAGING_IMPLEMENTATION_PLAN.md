# Orbit Admin Phase 2 — Staging implementation plan (non-production)

**Status:** Planning and documentation only. No staging VPS, database, or secrets are defined in this repository.  
**Scope:** Orbit admin domain pricing, NameSilo supplier sync, registrar routing, and transfer-wallet reconciliation — not a public frontend project.

**PR:** #10 (`backend/phase2-domain-registrar` @ `dcfe928` and later).  
**Policy:** Do not use production host `51.15.21.166`, path `/srv/apps/hostingbeyond`, database `hostingbeyond_db`, or `hosting.theglobalorbit.com` as staging unless the owner documents formal isolation and approval.

---

## 1. Existing infrastructure evidence (repository)

| Evidence                                | Finding                                                                                                                                            |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/STAGING-READINESS.md`             | Owner policy: **no staging VPS** (2026-10-16); local `hostingbeyond_integration_test` for CI/integration                                           |
| `.github/workflows/deploy.yml`          | **Production only** — `VPS_HOST` must be `51.15.21.166`, user `hostingbeyond`, path `/srv/apps/hostingbeyond`, verify `hosting.theglobalorbit.com` |
| `.github/workflows/ci.yml`              | Display name **HostingBeyond CI — Orbit Admin and domain services**; lint, typecheck, test, build on PR; Postgres `hostingbeyond_integration_test` |
| `config/staging.env.example`            | **Template placeholders** (`staging.example.test`, `hostingbeyond_staging_db`) — not a live environment                                            |
| `scripts/staging-release-preflight.mjs` | Read-only; fails closed without owner spec + staging deploy workflow                                                                               |
| `ops/backup/*`                          | Refuses production `.env`; staging/local backup patterns documented                                                                                |
| Phase 2 migrations                      | Present in repo; **not applied** to any remote DB by this plan                                                                                     |

**Local validation already performed:** 418 unit + 83 integration tests, CI green on PR #10.

---

## 2. Missing prerequisites (owner must decide / provision)

| #   | Prerequisite                                                                                                                                                          | Status                |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| 1   | **Staging host** (VM or isolated instance) — not `51.15.21.166` unless formally approved as dual-role with isolation                                                  | **MISSING**           |
| 2   | **Deployment path** on host (e.g. `<STAGING_APP_PATH>` — not `/srv/apps/hostingbeyond` without approval)                                                              | **MISSING**           |
| 3   | **Isolated PostgreSQL** — dedicated DB name (e.g. `hostingbeyond_staging_db`), not `hostingbeyond_db` on production                                                   | **MISSING**           |
| 4   | **Staging hostname + TLS** (`<STAGING_PUBLIC_HOST>` HTTPS URL)                                                                                                        | **MISSING**           |
| 5   | **Environment file** on staging server from `config/staging.env.example` — secrets in vault, not git                                                                  | **MISSING**           |
| 6   | **GitHub Actions staging workflow** — copy from `docs/deploy-staging-workflow.example.yml` → `.github/workflows/deploy-staging.yml` after secrets exist               | **MISSING**           |
| 7   | **GitHub secrets** (names only): `STAGING_VPS_HOST`, `STAGING_VPS_USER`, `STAGING_VPS_SSH_KEY`, optional `STAGING_VPS_PORT`, `HOSTINGBEYOND_STAGING_MIGRATE_APPROVED` | **MISSING**           |
| 8   | **Backup / recovery** for staging DB before migrate (operator `pg_dump` policy)                                                                                       | **MISSING**           |
| 9   | **External test credentials:** Stripe test mode, DNA **OTE** (`DOMAIN_API_ENV=test`), NameSilo key scope (sandbox vs prod) — owner confirmation                       | **MISSING**           |
| 10  | **`NAMESILO_STAGING_ENVIRONMENT_SPEC.md`** at repo root — copy from `docs/NAMESILO_STAGING_ENVIRONMENT_SPEC.template.md` when filled with **verified** values         | **MISSING**           |
| 11  | **Owner policy update** if NameSilo Phase 2 requires staging VPS despite “no staging VPS” in `STAGING-READINESS.md`                                                   | **DECISION REQUIRED** |

---

## 3. Proposed staging architecture (logical)

```
[Operator] → workflow_dispatch → GitHub Actions deploy-staging.yml
              ↓ (SSH, STAGING_VPS_* secrets only)
         <STAGING_HOST> : <STAGING_APP_PATH>
              ↓ DATABASE_URL → <STAGING_PG_HOST>/<STAGING_DB_NAME>
         Node app :<STAGING_LISTEN_PORT> (≠ 3030 if co-located with prod)
              ↓
         Nginx TLS → https://<STAGING_PUBLIC_HOST>
```

- **No shared** `DATABASE_URL`, PM2 process name, or upload dir with production unless explicitly documented.
- **NameSilo lifecycle:** `NAMESILO_LIFECYCLE_ENABLED` unset or `false`; `NAMESILO_ALLOW_BILLABLE` unset or `false`.
- **NameSilo public search:** only when **both** `DOMAIN_PUBLIC_SEARCH_AVAILABILITY_PROVIDER=namesilo` and `NAMESILO_API_KEY` are set on staging `.env` (never key-only).

---

## 4. Staging deployment workflow (proposal)

- **Source:** `docs/deploy-staging-workflow.example.yml` (documentation + copy template).
- **Trigger:** `workflow_dispatch` only (no automatic deploy on `main`).
- **Fail-closed:** Job step rejects `STAGING_VPS_HOST` equal to `51.15.21.166`; rejects `hostingbeyond` production app path in documented guards.
- **Secrets:** Staging-only names; production `VPS_*` secrets must not be reused in the staging workflow file.
- **Migrations:** Gated by `HOSTINGBEYOND_STAGING_MIGRATE_APPROVED=true` (analogous to production migrate gate).

Owner action: after provisioning host and secrets, copy example to `.github/workflows/deploy-staging.yml` and commit (separate PR or append to Phase 2 follow-up).

---

## 5. Staging migration sequence (Phase 2 only)

**Target:** Staging `DATABASE_URL` only. **Never** production `hostingbeyond_db` on `51.15.21.166` without explicit migrate approval.

| Order | Migration                                  | Effect                                                                                                                            |
| ----- | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| 1     | `20261025120000_namesilo_pricing_provider` | NameSilo cost columns, `lifecycleProvider`, `retailPriceLocked`; `DomainRegistration.registrarProvider` default `domain-name-api` |
| 2     | `20261025130000_transfer_registrar_wallet` | `DomainTransferRecord.registrarProvider`, `walletTransactionId`                                                                   |

**Order rule:** Apply **both** migrations **before** deploying application code that reads these columns.

### Owner commands (run on staging server as deploy user)

Replace placeholders after verification. **Do not run from this document without confirming targets.**

```bash
# 1) Verify DATABASE_URL (no secrets printed — check host + db name only)
node -e "
const u=new URL(process.env.DATABASE_URL);
const db=u.pathname.replace(/^\\//,'').split('?')[0];
if (db==='hostingbeyond_db' && u.hostname==='51.15.21.166') process.exit(2);
if (!db.includes('staging') && db!=='hostingbeyond_staging_db') console.warn('WARN: db name does not look like staging');
console.log('OK host='+u.hostname+' db='+db);
"

# 2) Backup (operator policy)
# pg_dump … > encrypted-backup-file

# 3) Migrate (staging checkout at approved SHA)
cd "<STAGING_APP_PATH>"
git fetch && git checkout <APPROVED_SHA>
npx prisma migrate status
npx prisma migrate deploy
npx prisma migrate status   # must be up to date

# 4) Deploy app build AFTER migrations succeed
npm ci && npx prisma generate && npm run build
# restart staging PM2/process
```

---

## 6. Staging smoke tests (no billable lifecycle)

| Area                   | Test                                            | Pass criteria                                                       |
| ---------------------- | ----------------------------------------------- | ------------------------------------------------------------------- |
| Orbit auth             | Sign in to `/orbit`                             | Admin session required                                              |
| Domain pricing metrics | `/orbit/domain-pricing`                         | Supplier vs retail columns; `metrics` gross profit/margin; USD note |
| NameSilo sync          | Preview via API/UI                              | No DB apply without confirm; retail unchanged                       |
| NameSilo apply         | Apply with `{ confirm: true }` after preview    | Supplier columns update; audit log; retail unchanged                |
| Retail lock            | Lock TLD; attempt PUT/bulk                      | 403 until unlock                                                    |
| Bulk retail            | Preview → apply with confirm + `rowUpdatedAt`   | Stale preview → 409                                                 |
| Registrar gates        | Checkout paths (test accounts)                  | DNA default; NameSilo lifecycle blocked without env                 |
| Transfer wallet        | Integration-style manual test on staging DB     | Idempotent reserve; no duplicate debit                              |
| Reconciliation         | `/orbit/domain-reconciliation`                  | Admin-only; no cross-customer leakage                               |
| Public search          | `/domain-name-search`                           | NameSilo only if flag + key; bulk limit 10                          |
| Preflight              | `npm run staging:preflight` on operator machine | Passes only when spec + `deploy-staging.yml` exist and are valid    |

**Forbidden on staging smoke:** real registration/transfer/renewal that bills NameSilo or DNA live APIs unless owner explicitly enables sandbox and approves.

---

## 7. `npm run staging:preflight` behavior

Fails closed until:

1. `NAMESILO_STAGING_ENVIRONMENT_SPEC.md` exists at repo root (owner-filled from template).
2. `.github/workflows/deploy-staging.yml` exists and references `STAGING_*` (not shipped until owner copies example).

Production-only `deploy.yml` may still produce **warnings**; it must not be treated as staging.

---

## 8. Related documents

| Document                                             | Role                                                                 |
| ---------------------------------------------------- | -------------------------------------------------------------------- |
| `docs/BACKEND_PHASE2_STAGING_RUNBOOK.md`             | Operator steps after infrastructure exists                           |
| `docs/NAMESILO_STAGING_ENVIRONMENT_SPEC.template.md` | Blank spec template — **not** used by preflight until copied to root |
| `docs/deploy-staging-workflow.example.yml`           | Staging GHA template                                                 |
| `docs/BACKEND_PHASE2_PR.md`                          | PR #10 summary and test evidence                                     |

---

## 9. Production unchanged

This plan does not authorize production deploy, production migrate, DNS changes, or enabling NameSilo lifecycle on production.
