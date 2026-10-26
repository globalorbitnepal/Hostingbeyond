# Orbit Admin Phase 2 — Staging release runbook (NameSilo pricing, registrar routing, transfer wallet)

**Scope:** Staging only for **Orbit Admin domain pricing** and related backend services. Do not run production migrations or deploy without owner approval. This is not a public website release runbook.

**Branch:** `backend/phase2-domain-registrar` (worktree: `/home/sysadmin/dev/Hostingbeyond-backend-phase2`).  
**Migrations:** `20261025120000_namesilo_pricing_provider`, `20261025130000_transfer_registrar_wallet`.  
**Implementation plan (prerequisites):** `docs/BACKEND_PHASE2_STAGING_IMPLEMENTATION_PLAN.md`

Legend: **[AUTO]** safe automation | **[CONFIRM]** operator must verify target and approve | **[SECRET]** set in vault / `.env`, never commit.

---

## 1. Environment variables (purpose only)

| Variable                                                                                  | Purpose                                                                                           |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                                                                            | PostgreSQL connection for the app (staging DB only for this runbook).                             |
| `DOMAIN_API_RESELLER_ID`, `DOMAIN_API_TEST_KEY` / `DOMAIN_API_LIVE_KEY`, `DOMAIN_API_ENV` | DNA lifecycle + availability (default registrar).                                                 |
| `DOMAIN_PUBLIC_SEARCH_AVAILABILITY_PROVIDER`                                              | Set to `namesilo` only when staging should use NameSilo for **search**; otherwise omit or `dna`.  |
| `NAMESILO_API_KEY`                                                                        | NameSilo API (supplier price sync + optional search).                                             |
| `NAMESILO_LIFECYCLE_ENABLED`                                                              | Must remain **`false`** on staging until explicit owner approval for billable NameSilo lifecycle. |
| `NAMESILO_ALLOW_BILLABLE`                                                                 | Must remain unset/`false` unless approved for real registrar billable calls.                      |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`                                              | Wallet top-up webhook verification (unchanged).                                                   |
| `ORBIT_*`                                                                                 | Orbit admin session / WebAuthn (unchanged).                                                       |

See `.env.example` for the full list. **[SECRET]** values live only on the server.

---

## 2. Database backup and recovery

1. **[CONFIRM]** Staging database name and host (not production).
2. **[CONFIRM]** Take a logical backup before migration, e.g. `pg_dump` to encrypted storage (operator command; do not store dumps in git).
3. Record backup timestamp and restore procedure (restore dump → `prisma migrate resolve` only if directed by DBA).

---

## 3. Pre-migration checks

- **[CONFIRM]** Application revision matches approved commit on `backend/phase2-domain-registrar`.
- **[CONFIRM]** `prisma migrate status` shows pending migrations exactly: `20261025120000_*`, `20261025130000_*`.
- **[CONFIRM]** No other environment has a **failed** partial migration for these names.
- **[AUTO]** `npm run typecheck` and `npm run build` on the release commit.

**Deploy order:** Apply **database migrations before** deploying application code that reads new columns (`namesilo*`, `lifecycleProvider`, `retailPriceLocked`, `registrarProvider`, `walletTransactionId`). Deploying code first can cause Prisma **P2022** on `/orbit/domain-pricing` GET.

---

## 4. Migration ordering

1. `20261025120000_namesilo_pricing_provider` — `DomainTldPrice` NameSilo cost fields, `lifecycleProvider`, `retailPriceLocked`; `DomainRegistration.registrarProvider` default `domain-name-api`.
2. `20261025130000_transfer_registrar_wallet` — `DomainTransferRecord.registrarProvider`, `walletTransactionId`.

Both use `ADD COLUMN IF NOT EXISTS` for safer re-runs on staging.

---

## 5. Staging migration commands

**[CONFIRM]** `DATABASE_URL` points at **staging** PostgreSQL.

```bash
# <STAGING_APP_PATH> — owner-defined; NOT /srv/apps/hostingbeyond unless formally isolated
cd "<STAGING_APP_PATH>"
# Verify DATABASE_URL host + database name before migrate (see implementation plan §5)
npx prisma migrate deploy
npx prisma migrate status    # must report "up to date"
```

Do **not** use `migrate dev` or `db push` on shared staging.

---

## 6. Application deployment sequence

**Important:** The repository’s `.github/workflows/deploy.yml` targets **production only** (`51.15.21.166`, `/srv/apps/hostingbeyond`, `hosting.theglobalorbit.com`). Do **not** use that workflow or those paths for Phase 2 validation until a **separate staging target** is defined by the owner.

When a real staging environment exists:

1. **[CONFIRM]** Migrations applied on the **staging database only** (section 5).
2. **[CONFIRM]** Deploy application code to the **staging** host/checkout (not production).
3. **[CONFIRM]** PM2/process name matches staging configuration (not production `hostingbeyond` on port 3030 unless explicitly isolated).
4. **[CONFIRM]** Health check against the **staging HTTPS URL** (not `hosting.theglobalorbit.com` unless that host is formally designated staging).

---

## 7. `/orbit` admin smoke tests

Sign in as Orbit admin on staging:

| Check                 | Action                                                               | Expected                                                |
| --------------------- | -------------------------------------------------------------------- | ------------------------------------------------------- |
| Domain pricing page   | Open `/orbit/domain-pricing`                                         | Table loads; NameSilo sync meta visible                 |
| Auth                  | Call APIs without session                                            | `401`                                                   |
| Supplier sync preview | `GET /api/orbit/domain-pricing/namesilo?action=preview-sync`         | JSON preview; **no** DB cost writes                     |
| Supplier sync apply   | `POST` with `{ "confirm": true }` only after preview                 | Costs update; audit log `DOMAIN_NAMESILO_SUPPLIER_SYNC` |
| Bulk retail           | `POST .../bulk-retail?action=preview` then `apply` + `confirm: true` | Locked rows skipped / 403                               |
| Reconciliation        | `/orbit/domain-reconciliation`                                       | Loads; admin-only                                       |

---

## 8. NameSilo availability (read-only)

- **[CONFIRM]** `DOMAIN_PUBLIC_SEARCH_AVAILABILITY_PROVIDER=namesilo` and `NAMESILO_API_KEY` set **only** if staging should mirror NameSilo search.
- **[AUTO]** Hit `/domain-name-search` and `/bulk-domain-search` with a test query — no registration.
- **[CONFIRM]** `NAMESILO_LIFECYCLE_ENABLED` is **not** `true`.

---

## 9. Supplier sync preview verification

1. Preview via Orbit UI or GET `preview-sync`.
2. Confirm rows show `namesiloPriceStatus` (verified / unverified / missing / partial) and **proposedRetail** does not auto-apply.
3. Induce API failure (invalid key on a throwaway env) — preview errors; existing DB costs unchanged.

---

## 10. Price apply (controlled data)

1. Pick one test TLD; lock retail via Orbit; confirm PUT/bulk apply cannot change retail until unlock.
2. Run bulk preview → apply with `confirm: true` and matching `rowUpdatedAt`.
3. Stale `rowUpdatedAt` → `409 stale_preview`.

---

## 11. Registration and transfer lifecycle

- **[CONFIRM]** Default DNA lifecycle only; no NameSilo registration/transfer in staging unless `NAMESILO_LIFECYCLE_ENABLED=true` **and** owner sign-off.
- Transfer checkout should persist `registrarProvider` and `walletTransactionId` on new records after migration.

---

## 12. Rollback criteria

Rollback if:

- Migration fails or leaves schema inconsistent with `schema.prisma`.
- `/orbit/domain-pricing` returns 500/P2022 after deploy.
- Wallet reserve/finalize errors spike on transfer checkout.
- Unauthorized access to Orbit pricing APIs.

**Recovery:** Restore DB backup → redeploy previous app revision → invalidate CDN/cache if needed.

---

## 13. Post-deployment validation

- **[AUTO]** Customer routes: `/domain-name-search`, `/bulk-domain-search` (10-domain limit), `/website-migration`, `/domain-transfer` return 200.
- **[CONFIRM]** Stripe webhook test event (dashboard) credits wallet once (idempotency).
- **[CONFIRM]** No auth codes in application logs.

---

## 14. Required operator approvals

- Staging DB backup completed.
- Migration apply on staging.
- Merge PR to `main` and deploy.
- Enabling NameSilo public search and/or lifecycle (separate approvals).
- Any `NAMESILO_ALLOW_BILLABLE=true` on non-production.

---

## Local integration test database (developers)

**[CONFIRM]** Database name must be `hostingbeyond_integration_test` on `127.0.0.1`.

```bash
# After .env with local Postgres credentials:
node scripts/setup-integration-db.mjs --confirm
npx prisma migrate deploy
INTEGRATION_TESTS=required npm run test
```

Do not point integration tests at staging or production `DATABASE_URL`.
