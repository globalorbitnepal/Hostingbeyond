# Pull request draft — Orbit Admin Phase 2 (domain pricing, NameSilo, registrar routing)

**Scope:** Internal **Orbit admin** (`.orbit` dashboard) and its backend APIs — not a public website redesign.

**Branch:** `backend/phase2-domain-registrar` (worktree `/home/sysadmin/dev/Hostingbeyond-backend-phase2`; branch name unchanged).

**Base:** `d68f5b3a2fa4ef80e15e186c139d02ed5bd9a91a` (production `main` after PR #9 public domain pages; that public work is out of scope here).

---

## Title

`feat(orbit): Orbit Admin domain pricing, NameSilo supplier sync, registrar routing, transfer wallet`

---

## Summary

- **Orbit `/orbit/domain-pricing`:** NameSilo supplier sync (preview / apply with confirm), bulk retail preview/apply, retail price locks, margin-aware supplier previews, and expanded admin UI.
- **Registrar routing:** DNA remains default lifecycle provider; NameSilo lifecycle is opt-in via `NAMESILO_LIFECYCLE_ENABLED=true` and per-TLD verified NameSilo costs.
- **Public search:** NameSilo availability requires `DOMAIN_PUBLIC_SEARCH_AVAILABILITY_PROVIDER=namesilo` **and** `NAMESILO_API_KEY` (API key alone does not enable search).
- **Transfers:** Persist `registrarProvider` and `walletTransactionId`; wallet reserve/finalize/rollback with idempotency keys.
- **Customer APIs:** `/api/auth/me` and `POST /api/hosting/orders` use `requireCustomerSession()` (same production cookie validation; test overrides only outside production).
- **Prisma:** Two migrations; **apply migrations before deploying** app code that reads new columns (avoid P2022 on Orbit pricing GET).
- **Docs:** `docs/BACKEND_PHASE2_STAGING_RUNBOOK.md`; read-only `npm run staging:preflight` checks migrations and staging readiness (no DB/deploy/registrar side effects).
- **GitHub Actions labels:** PR CI display name is **HostingBeyond CI — Orbit Admin and domain services**. Production **Deploy HostingBeyond** is unchanged (full app, including public homepage).

**Not verified in this branch:** NameSilo production lifecycle, live billable registrar calls, production deployment, production migrations, or GitHub Actions CI (local tests only).

---

## `/orbit` and APIs

| Area                                | Behavior                                                                                           |
| ----------------------------------- | -------------------------------------------------------------------------------------------------- |
| UI                                  | `domain-pricing-admin.tsx` — NameSilo sync, bulk retail, lock indicators                           |
| `GET/PUT /api/orbit/domain-pricing` | Admin auth; PUT blocks legacy `bulk` array; retail lock enforcement                                |
| `GET/POST .../namesilo`             | Preview sync (no apply without confirm); apply updates **supplier** NameSilo costs only            |
| `POST .../bulk-retail`              | Preview vs apply; apply requires `{ confirm: true }`, respects locks, rejects stale `rowUpdatedAt` |
| Reconciliation                      | Existing `/orbit/domain-reconciliation` unchanged; admin-guarded                                   |

Supplier sync does **not** overwrite retail prices. Retail changes go through PUT or bulk-retail apply with guards.

### Pricing transparency (Orbit Admin — Domain Pricing)

- **Authoritative supplier costs:** verified, fresh NameSilo `namesilo*` fields (`namesiloPriceStatus`, `namesiloSyncedAt`). DNA `supplier*` fields are legacy catalogue only and must not feed NameSilo profit/margin.
- **Retail prices:** `retailRegister`, `retailRenew`, `retailTransfer` (USD catalogue; `retailCurrency` / `supplierCurrency` on row).
- **Gross metrics (server-side):** `lib/orbit/pricing-financial-metrics.ts` — gross profit = retail − verified NameSilo cost; gross margin % = profit / retail; markup % = profit / supplier cost. No FX conversion; **N/A** when NameSilo cost is missing, stale, unverified, or invalid.
- **UI:** NameSilo columns and metrics first; DNA labelled legacy. Not net profit (taxes/fees excluded).

---

## Database

1. `20261025120000_namesilo_pricing_provider` — NameSilo cost columns, `lifecycleProvider`, `retailPriceLocked`, `DomainRegistration.registrarProvider`
2. `20261025130000_transfer_registrar_wallet` — `DomainTransferRecord.registrarProvider`, `walletTransactionId`

Deploy **migrations first**, then application build (see staging runbook).

---

## Security & payments

- Server-side pricing authoritative for checkout; client totals rejected on hosting orders.
- Stripe wallet webhook: signature verification and idempotency keys.
- Transfer auth codes: hint-only in stored/display paths; full code used only for provider submission.
- Orbit pricing routes: `authorizeDomainPricingAdmin()`.

---

## Local verification (worktree, latest)

| Check                                          | Result                                                                             |
| ---------------------------------------------- | ---------------------------------------------------------------------------------- |
| Route auth tests (`auth/me`, `hosting/orders`) | **3 pass**                                                                         |
| `npm run typecheck`                            | **PASS** (exit 0)                                                                  |
| `npm run lint`                                 | **PASS** — 0 errors, **47 warnings**                                               |
| `npm run test:unit`                            | **PASS** — 410 tests (exit 0)                                                      |
| `INTEGRATION_TESTS=required npm run test`      | **PASS** — 83/83 on local `hostingbeyond_integration_test` @ 127.0.0.1 (exit 0)    |
| `npm run build`                                | **PASS** (exit 0)                                                                  |
| `npm run staging:preflight`                    | **Exit 1** (expected fail-closed — no staging spec / no `STAGING_*` deploy target) |

Integration DB URL loaded from dev `.env.integration.local` (not committed). **GitHub CI not run** for this audit.

---

## Staging acceptance (post-merge)

- [ ] Migrations on staging DB only, then deploy.
- [ ] Orbit pricing preview/apply and bulk retail locks verified.
- [ ] Bulk domain search limit **10** unchanged.
- [ ] `NAMESILO_LIFECYCLE_ENABLED` remains false until owner approval.

**Runbook:** `docs/BACKEND_PHASE2_STAGING_RUNBOOK.md`  
**Staging implementation plan:** `docs/BACKEND_PHASE2_STAGING_IMPLEMENTATION_PLAN.md` (infrastructure not provisioned; preflight remains fail-closed)

---

## Explicit exclusions

- Production NameSilo lifecycle or billable registration/transfer.
- DNS changes, production migration without approval, replacing DNA as default registrar.

---

## Risks

- P2022 if code deploys before migrations.
- `npm run staging:preflight` fails closed if `NAMESILO_STAGING_ENVIRONMENT_SPEC.md` is absent (optional staging doc; not required for app runtime).
- 47 ESLint warnings unchanged.

---

## Reviewer checklist

1. Registrar gating and payment/wallet paths.
2. Migration ordering on staging.
3. CI green on PR (not pre-verified locally via Actions).
