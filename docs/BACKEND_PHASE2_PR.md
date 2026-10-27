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
- **Public search:** NameSilo availability requires `DOMAIN_PUBLIC_SEARCH_AVAILABILITY_PROVIDER=namesilo` **and** `NAMESILO_API_KEY`. Production **Deploy HostingBeyond** syncs the API key when the GitHub secret is set, but **does not** auto-set the search provider flag from the key alone.
- **Transfers:** Persist `registrarProvider` and `walletTransactionId`; wallet reserve/finalize/rollback with idempotency keys.
- **Customer APIs:** `/api/auth/me` and `POST /api/hosting/orders` use `requireCustomerSession()` (same production cookie validation; test overrides only outside production).
- **Prisma:** Two migrations plus committed `prisma/migrations/INVENTORY.txt` (21 folders). Production deploy **blocks build/PM2 restart** when `prisma migrate status` reports pending migrations unless `HOSTINGBEYOND_PRODUCTION_MIGRATE_APPROVED=true`.
- **Docs:** `docs/BACKEND_PHASE2_STAGING_RUNBOOK.md`; read-only `npm run staging:preflight` checks migrations and staging readiness (no DB/deploy/registrar side effects).
- **GitHub Actions labels:** PR CI display name is **HostingBeyond CI — Orbit Admin and domain services**. Production **Deploy HostingBeyond** is the full app, including public homepage.

**Not claimed:** production schema correctness, production backup/restore, live NameSilo lifecycle, or production readiness. Those require owner-operated evidence.

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

- **Authoritative supplier costs:** verified, fresh NameSilo `namesiloRegister` / `namesiloRenew` / `namesiloTransfer` / `namesiloCurrency` / `namesiloSyncedAt` / `namesiloPriceStatus`. DNA `supplier*` fields are legacy catalogue only and must not feed NameSilo profit/margin.
- **Retail prices:** catalogue `registerPrice` / `renewPrice` / `transferPrice` (API maps these to `retailRegister` / `retailRenew` / `retailTransfer`). USD only.
- **Gross metrics (server-side):** `lib/orbit/pricing-financial-metrics.ts` — gross profit = retail − verified NameSilo cost; gross margin % = profit / retail; markup % = profit / supplier cost. No FX conversion; **N/A** when NameSilo cost is missing, stale (>30 days), unverified, invalid, zero denominators, or when supplier/retail currencies are not both USD.
- **UI:** NameSilo columns and metrics first; DNA labelled legacy. Not net profit (taxes/fees excluded).

---

## Database

1. `20261025120000_namesilo_pricing_provider` — NameSilo cost columns, `lifecycleProvider`, `retailPriceLocked`, `DomainRegistration.registrarProvider`
2. `20261025130000_transfer_registrar_wallet` — `DomainTransferRecord.registrarProvider`, `walletTransactionId`

Inventory check: `node scripts/verify-migration-inventory.mjs`

---

## Security & payments

- Server-side pricing authoritative for checkout; client totals rejected on hosting orders.
- Stripe wallet webhook: signature verification and idempotency keys.
- Transfer auth codes: hint-only in stored/display paths; full code used only for provider submission.
- Orbit pricing routes: `authorizeDomainPricingAdmin()`.
- Orbit domain-orders GET omits internal error text, payment references, and idempotency keys.

---

## Release evidence layers

Do not treat local tests as production readiness.

1. **Repository verification** — Prisma validate (placeholder URL), typecheck, lint, unit tests, required integration tests on `hostingbeyond_integration_test` @ 127.0.0.1, deploy-workflow tests, migration inventory tests, backup-script tests, production build.
2. **Owner-operated production preflight** — `docs/PRODUCTION-PREFLIGHT-RUNBOOK.md` (SELECT-only) on the confirmed production host/database. Not run in this environment.
3. **Backup and restore evidence** — approved `create-pull-bundle.sh` export plus isolated restore to `hostingbeyond_restore_test`. Not performed here.
4. **Migration approval** — `HOSTINGBEYOND_PRODUCTION_MIGRATE_APPROVED=true` only after 2–3 and a maintenance window.
5. **Deployment** — pending Prisma migrations block build/restart until migrate is approved and succeeds. No automatic schema rollback if migrate succeeds and build/restart/verify later fails.
6. **Post-deployment verification** — migrate status, HTTPS, Orbit pricing/auth, wallets/reconciliation, DNA lifecycle unchanged.
7. **NameSilo live operations** — remain disabled until separately approved. Deploy never sets `NAMESILO_LIFECYCLE_ENABLED`.

---

## Local verification (worktree)

| Check                                     | Result                                                                                               |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `npx prisma validate`                     | **PASS** (exit 0; placeholder local URL, not production)                                             |
| `npm run typecheck`                       | **PASS** (exit 0)                                                                                    |
| `npm run lint`                            | **PASS** — 0 errors, **47 warnings** (pre-existing)                                                  |
| `npm run test:unit`                       | **PASS** — **465** tests (exit 0)                                                                    |
| `INTEGRATION_TESTS=required npm run test` | **PASS** — unit 465 + integration **83/83** on `hostingbeyond_integration_test` @ 127.0.0.1 (exit 0) |
| `npm run build`                           | **PASS** (exit 0)                                                                                    |
| `npm run staging:preflight`               | **Exit 1** (expected fail-closed — missing staging spec and staging deploy workflow)                 |

GitHub CI for commit `992b110` on PR #10 **passed** (Actions run `40556891369`). CI for the commit after this documentation is **unverified until Actions completes**.

---

## Staging acceptance (post-merge)

- [ ] Migrations on a real staging DB only, then deploy (staging is **not** provisioned).
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

- Production schema is unknown until owner preflight. Deploy now **fails closed** on pending migrations without migrate approval (working tree is already `git reset --hard origin/main` before that check; PM2 is not restarted).
- Migrate-then-build failure does **not** roll back schema.
- `npm run staging:preflight` fails closed if `NAMESILO_STAGING_ENVIRONMENT_SPEC.md` is absent.
- ESLint warnings may remain (pre-existing).

---

## Reviewer checklist

1. Registrar gating and payment/wallet paths.
2. Deploy pending-migration gate and `NO_SCHEMA_ROLLBACK` documentation.
3. Migration inventory vs `INVENTORY.txt`.
4. CI green on the **final** SHA (not only `992b110`).
