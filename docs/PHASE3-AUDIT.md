# HostingBeyond — Phase 3 pre-development audit

> Internal engineering reference. **No secrets.** Baseline: deployed `main` at `e1c1fb2` (Phase 1 dashboard + Phase 2 OAuth/checkout). Live site: `https://hosting.theglobalorbit.com`. Google OAuth manually verified to reach `/account`.

**Scope of this document:** Pre-development audit plus **Phase 3a implementation notes** (customer orders, billing ledger, renewal safety).

### Phase 3a — completed (dev checkout, not deployed)

| Deliverable                                                                           | Status             |
| ------------------------------------------------------------------------------------- | ------------------ |
| Customer domain order list + detail (`/account/orders`, `/account/orders/[publicId]`) | Done               |
| APIs `GET /api/domains/orders`, `GET /api/domains/orders/[publicId]` (user-scoped)    | Done               |
| Billing ledger (`/account/billing`, `GET /api/domains/wallet/ledger`)                 | Done               |
| Renewal inflight guard (per user + domain + `orderType: renew`)                       | Done               |
| Renewal timeout reconciliation `walletTransactionId` + early persist after reserve    | Done               |
| Idempotency key reuse cross-user rejected (register + renew)                          | Done               |
| PDF invoices / auto-renew jobs                                                        | Still out of scope |

**Remaining gaps after 3a:** formal `Invoice` model, hosting order payment, provisioning, auto-renew toggle/jobs, customer hosting order detail, browser E2E.

---

## 1. Executive summary

| Area                                              | Maturity                 | Notes                                                                                           |
| ------------------------------------------------- | ------------------------ | ----------------------------------------------------------------------------------------------- |
| Domain search → cart → wallet checkout (register) | **Implemented**          | Domain Name API (DNA) lifecycle + availability; wallet reserve/finalize/rollback                |
| Domain manage (NS, lock, auth code)               | **Implemented**          | Customer APIs scoped by `userId` + registration id                                              |
| Domain renew (wallet)                             | **Partial**              | API + manage UI button; gaps on reconciliation wallet linkage, inflight dedupe, auto-renew jobs |
| Domain transfer                                   | **Implemented**          | Checkout service + API; staff/orbit tooling                                                     |
| Customer domain **order history** API/UI          | **Missing**              | `DomainOrder` exists; only Orbit lists orders                                                   |
| Invoices (PDF/model)                              | **Not implemented**      | Wallet transactions + order snapshots only                                                      |
| Stripe wallet top-up                              | **Implemented**          | Webhook credits wallet when configured                                                          |
| Hosting orders (quote/draft)                      | **Partial**              | `POST /api/hosting/orders`; dashboard lists rows; **no payment or provisioning**                |
| Hosting / email / VPS **instances**               | **Not implemented**      | Catalog, CMS, cart quotes; no customer service model                                            |
| Automated tests                                   | **Strong unit coverage** | Many integration tests require local PostgreSQL + provider env                                  |

**Recommended first milestone (Phase 3a):** Ship a **customer billing & orders ledger** (domain orders + wallet activity, unified in the panel) and **harden domain renewal reconciliation** (persist `walletTransactionId` on renewal orders, inflight renewal guard, customer-visible order status). Defer formal invoices, hosting provisioning, and email/VPS until ledger + domain lifecycle are trustworthy.

---

## 2. Database models and migrations

### 2.1 Customer auth and wallet

| Model                  | Schema                         | Migration                                                 |
| ---------------------- | ------------------------------ | --------------------------------------------------------- |
| `CustomerUser`         | `prisma/schema.prisma` (~L205) | `20260912120000_customer_auth`                            |
| `CustomerSession`      | same                           | same                                                      |
| `CustomerOAuthAccount` | same                           | same                                                      |
| `CustomerWallet`       | ~L603                          | `20261006150000_domain_services` (wallet block)           |
| `WalletTransaction`    | ~L613                          | same; types `CREDIT`/`DEBIT`/`RESERVE`/`RELEASE`/`REFUND` |
| `WalletPayment`        | ~L633                          | `20261006153000_wallet_payments`                          |

**Findings:**

- Wallet balance mutations use Prisma transactions and optional `idempotencyKey` (unique on `WalletTransaction` and `WalletPayment`).
- No separate billing database; single PostgreSQL schema for Orbit + customer data (preserve ownership — do not mix DBs).

### 2.2 Domain commerce

| Model                           | Purpose                                                                      |
| ------------------------------- | ---------------------------------------------------------------------------- |
| `DomainTldPrice`                | Retail/supplier pricing, multiyear JSON (`20261006200000`, `20261015120000`) |
| `DomainOrder`                   | All register/renew/transfer-related orders; `idempotencyKey` unique          |
| `DomainRegistration`            | One row per FQDN (`domain` unique); `expiresAt`, `autoRenew`, `orderId`      |
| `DomainTransferRecord`          | Transfer pipeline separate from `DomainOrder` in places                      |
| `DomainCart` / `DomainCartItem` | `20261006160000_domain_cart`                                                 |
| `DomainProviderLog`             | Provider call telemetry (no customer FK)                                     |
| `DomainAuditLog`                | Staff + customer domain actions (`adminUserId` optional)                     |

**Enums:** `DomainOrderStatus`, `DomainServiceStatus`, `DomainTransferStatus` — see `prisma/schema.prisma` (~L33–64).

**Not present:** `Invoice`, `HostingService`, `VpsInstance`, `Mailbox`, `SupportTicket`.

### 2.3 Hosting catalog and orders

| Model                                  | Migration                                |
| -------------------------------------- | ---------------------------------------- |
| `HostingProduct`, `HostingProductPlan` | `20261004120000_hosting_products`        |
| `HostingAddon`                         | `20261005010000_hosting_addons_snapshot` |
| `HostingOrder`                         | `20261004230000_hosting_orders`          |

`HostingOrder.lineItemsSnapshot` is documented in schema as the immutable quote for future invoices (~L248). Status enum includes `PROVISIONING` and `ACTIVE` but nothing in code advances orders into those states from a provisioner.

### 2.4 Other customer-linked models

- `MigrationRequest` — website migration intake (`userId` optional).
- `BeyondAiProject` / `BeyondAiSubscription` — separate product line; not part of hosting panel provisioning.

### 2.5 Migration inventory (customer-relevant)

All under `prisma/migrations/`:

1. `20260912120000_customer_auth`
2. `20261004120000_hosting_products`
3. `20261004230000_hosting_orders`
4. `20261005010000_hosting_addons_snapshot`
5. `20261006150000_domain_services`
6. `20261006153000_wallet_payments`
7. `20261006160000_domain_cart`
8. `20261006200000_domain_pricing_multiyear`
9. `20261015120000_domain_term_aware_pricing`
10. `20261015220000_transfer_inflight_unique`

---

## 3. Domain lifecycle (code trace)

### 3.1 Search and availability

| Step                  | Implementation                                                                                                                                                                    |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public search API     | `app/api/domains/search/route.ts` — orchestration via `lib/domains/search-orchestrator.ts`, `fast-domain-search.ts`, `bulk-search.ts`, rate limits in `lib/domains/rate-limit.ts` |
| Availability provider | `lib/domains/providers/index.ts` → `resolveAvailabilityProvider()` (DNA availability or `DOMAIN_LOOKUP_URL`)                                                                      |
| Validation            | `app/api/domains/validate/route.ts`, `lib/domains/validate-registration.ts`                                                                                                       |
| Pricing display       | `lib/domains/pricing-engine.ts`, `DomainTldPrice`                                                                                                                                 |

### 3.2 Cart

| Step                   | Implementation                                                                                  |
| ---------------------- | ----------------------------------------------------------------------------------------------- |
| Authenticated cart API | `app/api/domains/cart/route.ts`, `app/api/domains/cart/bulk/route.ts`                           |
| Service layer          | `lib/domains/domain-cart-service.ts` (max 50 items, revalidate pricing)                         |
| Guest cart             | `lib/domains/guest-domain-cart.ts` (client/local; merged post-login in checkout UI per Phase 2) |
| Checkout UI            | `components/domains/domain-checkout-view.tsx`                                                   |

### 3.3 Checkout → payment → registration

```
Customer session → POST /api/domains/checkout/register
  → processDomainRegistrationCheckout (lib/domains/registration-service.ts)
    → quoteRegistration / assertAvailableForRegistration
    → DomainOrder (idempotencyKey)
    → reserveWalletFunds (lib/domains/wallet.ts)
    → provider.registerDomain (resolveLifecycleProvider → DNA)
    → finalizeReserve OR rollbackReserve
    → DomainRegistration upsert (ACTIVE)
```

**Idempotency:** `DomainOrder.idempotencyKey` unique; duplicate key returns existing order. Wallet reserve uses `register:{idempotencyKey}`.

**Inflight protection (register):** Blocks second order if same domain in `REGISTERING` | `RECONCILIATION_REQUIRED` | `PROCESSING` (`registration-service.ts` ~L79–93).

**Reconciliation:** Provider timeout → `RECONCILIATION_REQUIRED`, wallet hold kept, `walletTransactionId` stored on order. Staff: `app/api/orbit/domain-reconciliation/route.ts` + `lib/domains/reconciliation-service.ts`.

**Notifications:** `lib/domains/notifications.ts` → `lib/domains/email-hooks.ts`.

### 3.4 Customer dashboard and manage

| Surface               | Implementation                                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| List domains (SSR)    | `app/account/my-domains/page.tsx` → `listCustomerDomains`                                                                 |
| List domains (API)    | `app/api/domains/my/route.ts`                                                                                             |
| Manage page           | `app/account/my-domains/[domain]/page.tsx` — `userId` + `domain` + `ACTIVE`                                               |
| Manage API            | `app/api/domains/[registrationId]/route.ts` — **registration id + userId**                                                |
| NS / lock / auth code | `app/api/domains/[registrationId]/nameservers                                                                             | lock | auth-code/route.ts` |
| Management logic      | `lib/domains/domain-management-service.ts`, `requireActiveDomainRegistration` (`lib/domains/require-domain-ownership.ts`) |

### 3.5 Renewal

| Step        | Implementation                                                                                                |
| ----------- | ------------------------------------------------------------------------------------------------------------- |
| API         | `app/api/domains/checkout/renew/route.ts` → `processDomainRenewalCheckout` (`lib/domains/renewal-service.ts`) |
| UI          | `components/domains/domain-renew-button.tsx` on manage panel only                                             |
| Pricing     | Retail renew from `getRetailQuoteForTld`; default `periodYears` = 1                                           |
| Ownership   | `DomainRegistration` where `userId` + domain + `ACTIVE`                                                       |
| Provider    | `provider.renewDomain(domain, period)`                                                                        |
| Idempotency | Same pattern as register on `DomainOrder.idempotencyKey`; wallet `renew:{key}`                                |

**Gaps:**

- **No inflight renewal guard** (unlike register) — parallel renew requests can create multiple orders.
- **Renewal timeout → `RECONCILIATION_REQUIRED` does not set `DomainOrder.walletTransactionId`** (`renewal-service.ts` ~L103–111). Staff `finalizeReconciliationOrder` requires `walletTransactionId` (`reconciliation-service.ts` ~L102–104) — **renewal reconciliation is broken for timeout path**.
- **`autoRenew` is display-only** — no API to toggle, no scheduled job, no provider auto-renew sync.
- **No renewal eligibility rules** (e.g. max term, expiry window, restore pricing) beyond ACTIVE check.
- **Duplicate renewal prevention** relies only on client-generated idempotency keys per click, not server-side domain lock.

### 3.6 Transfer

| Step      | Implementation                                                                            |
| --------- | ----------------------------------------------------------------------------------------- |
| Check     | `app/api/domains/transfer-check/route.ts`                                                 |
| Checkout  | `app/api/domains/checkout/transfer/route.ts` → `lib/domains/transfer-checkout-service.ts` |
| Records   | `DomainTransferRecord`, `lib/domains/transfer-service.ts`                                 |
| Migration | `20261015220000_transfer_inflight_unique`                                                 |

---

## 4. Orders, payments, invoices, audit

### 4.1 Domain orders

**Fields (high signal):** `publicId`, `orderType` (`register` | `renew` | transfer-related), `status`, `provider`, `providerOrderId`, `supplierCost`, `retailPrice`, `total`, `paymentProvider`, `paymentReference`, `walletTransactionId`, `idempotencyKey`, error fields, `completedAt`.

**Customer-facing:** Checkout responses return sanitized order payload (`app/api/domains/checkout/register/route.ts`). **No** `GET /api/domains/orders` for customers.

**Staff-facing:** `app/api/orbit/domain-orders/route.ts`, `app/orbit/(protected)/domain-orders/page.tsx`, domain dashboard metrics `app/api/orbit/domain-dashboard/route.ts`.

### 4.2 Wallet and Stripe

| Flow                       | Files                                                                             |
| -------------------------- | --------------------------------------------------------------------------------- |
| Balance / transactions API | `app/api/domains/wallet/route.ts`, `app/api/domains/wallet/transactions/route.ts` |
| Top-up session             | `app/api/domains/wallet/top-up/route.ts`                                          |
| Stripe webhook             | `app/api/webhooks/stripe/route.ts`, `lib/payments/wallet-payment-service.ts`      |
| Config                     | `lib/payments/stripe-config.ts`, `.env.example` (wallet webhook URL)              |

Wallet debits for domains use **reserve → finalize** or **rollback**; Stripe credits wallet only after verified webhook (not from redirect).

### 4.3 Hosting orders

| Flow                | Files                                                                                         |
| ------------------- | --------------------------------------------------------------------------------------------- |
| Create/update draft | `app/api/hosting/orders/route.ts` — requires customer session; rejects client-supplied totals |
| Persistence         | `lib/hosting/hosting-orders.ts` — `upsertHostingDraftOrder`, `listHostingOrdersForUser`       |
| Dashboard           | `lib/panel/load-dashboard-overview.ts`                                                        |

**Unused helpers:** `attachPaymentToOrder`, `setHostingOrderStatus` — no production caller wires hosting checkout to Stripe or provisioning.

### 4.4 Invoices

- **No** Prisma model, PDF generator, or customer `/account/invoices` route.
- Panel nav: Invoices marked **Soon** (`lib/panel/navigation.ts`).
- Dashboard copy acknowledges wallet history only (`components/panel/dashboard-overview.tsx`).
- Legal/marketing references to invoices are aspirational (`lib/legal/refund-policy-content.ts`, Orbit contact copy).

**Practical billing artifact today:** `WalletTransaction` (+ `referenceType` / `referenceId`) and `HostingOrder.lineItemsSnapshot` / `DomainOrder` row as source of truth for a future invoice generator.

### 4.5 Audit trails

| Mechanism                   | Scope                                                                                      |
| --------------------------- | ------------------------------------------------------------------------------------------ |
| `DomainAuditLog`            | Domain order reconciliation, customer NS/lock actions (via `domain-management-service.ts`) |
| `DomainProviderLog`         | Provider operations                                                                        |
| `ActivityLog`               | Orbit **admin** actions only                                                               |
| Customer wallet adjustments | Orbit `app/api/orbit/wallets/adjust/route.ts`                                              |

**Gap:** No unified customer-visible activity feed; domain orders not listed in panel.

---

## 5. Security and customer ownership

### 5.1 Session model

- Cookie `hb_customer_session` (see `lib/customer/session.ts`).
- APIs use `requireCustomerSession()` (`lib/domains/require-customer.ts`) or page-level `getCustomerFromToken`.
- Orbit remains separate: `requireOrbitAdmin()` on domain reconciliation and order APIs.

### 5.2 IDOR review (customer APIs)

| Resource                    | Enforcement                                                                           | Verdict                                   |
| --------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------- |
| Domain registration by id   | `findFirst({ id: registrationId, userId: user.id })` on all `[registrationId]` routes | **Pass**                                  |
| Domain by name (SSR manage) | `userId` + `domain` + `ACTIVE`                                                        | **Pass**                                  |
| Domain list                 | `where: { userId }`                                                                   | **Pass**                                  |
| Wallet / transactions       | `user.id` on all queries                                                              | **Pass**                                  |
| Domain cart                 | `userId` on cart row                                                                  | **Pass**                                  |
| Hosting order POST          | Draft upsert scoped to `user.id`                                                      | **Pass**                                  |
| Hosting order GET by id     | **No customer GET endpoint**                                                          | N/A (IDs only on dashboard server render) |

**Residual risks:**

- `setHostingOrderStatus(orderId, status, userId?)` — if called without `userId`, no ownership check (`lib/hosting/hosting-orders.ts` ~L75–79). Currently internal-only; **do not expose via API without mandatory `userId`**.
- `readIdempotencyKey` falls back to `crypto.randomUUID()` when header/body missing — retries are not idempotent unless client sends a stable key (document for API clients).
- `/account` routes not in Next middleware (noted in Phase 1); layout/pages enforce auth — acceptable if all new routes follow same pattern.

### 5.3 Price tampering

Register/renew/hosting order routes reject client-supplied prices/totals (e.g. `checkout/register/route.ts` ~L29–36, `hosting/orders/route.ts` ~L31–38).

---

## 6. Provider capabilities

**Registrar:** Domain Name API (`lib/domains/providers/domain-name-api.ts`), split availability vs lifecycle config (`domain-name-api-config.ts`).

`DomainRegistrarProvider` (`lib/domains/providers/provider.ts`) implements:

- `checkAvailability`, `getPricing`, `registerDomain`, `renewDomain`, `transferDomain`, `getDomainDetails`, `updateNameservers`, transfer lock / auth code helpers (see interface ~L48+).

**Environment:** Lifecycle registration/renewal requires DNA lifecycle credentials; local dev without DB/env cannot run OTE integration tests.

**Phase 1 audit note:** Older doc mentioned NameSilo; **current code path is DNA**, not NameSilo.

---

## 7. Hosting, business email, and VPS

### 7.1 Web hosting

| Layer                   | Status                                                                  |
| ----------------------- | ----------------------------------------------------------------------- |
| Marketing / pricing CMS | Orbit + `lib/hosting/*` product plans                                   |
| Cart quote              | `lib/hosting/cart/pricing.ts`, `quoteHostingCart`                       |
| Order record            | `HostingOrder` DRAFT / PENDING_PAYMENT                                  |
| Payment                 | **Not wired** — `attachPaymentToOrder` unused                           |
| Provisioning            | **No adapter** — statuses `PROVISIONING`/`ACTIVE` never set by a worker |
| Customer UI             | Panel "Manage Hosting" **Soon**; dashboard shows order rows only        |

### 7.2 Business email

- Storefront and addons: `HostingAddonType.BUSINESS_EMAIL`, `lib/hosting/business-email-term-pricing.test.ts`, checkout offers `lib/domains/domain-checkout-offers.ts`.
- Panel: My Email / Mailboxes **Soon** (`lib/panel/navigation.ts`).
- **No** API to create mailboxes or link to a provider.

### 7.3 VPS

- Marketing pages (`app` routes for VPS/cloud), plan chips (`lib/hosting/product-plans-trust-chips.ts`).
- Panel VPS entries **Soon**.
- **No** `VpsInstance` model or provisioning API.

### 7.4 Beyond AI

Separate subscription/project models; dashboard counts projects. Out of Phase 3 core unless explicitly scoped.

---

## 8. Customer panel vs Phase 3 scope

**Implemented account routes:** `/account`, `/account/wallet`, `/account/my-domains`, `/account/my-domains/[domain]` (`app/account/*`).

**Navigation map:** `lib/panel/navigation.ts` — billing section has Wallet linked; Orders, Invoices, Payment methods **Soon**.

**Data loader:** `lib/panel/load-dashboard-overview.ts` — wallet, hosting orders, domains, wallet tx sample; **does not load `DomainOrder`**.

---

## 9. Tests and local verification

### 9.1 Test inventory

`package.json` `test` script runs `lib/domains/**/*.test.ts`, `lib/orbit/**/*.test.ts`, `lib/payments/**/*.test.ts`, `lib/blog/**/*.test.ts` (~48 files).

**Categories:**

- **Unit / no DB:** e.g. `lib/panel/navigation.test.ts`, `lib/customer/safe-redirect.test.ts`, `lib/domains/domain-cart.unit.test.ts`, `lib/domains/transfer-security.test.ts`, `lib/domains/phase2.unit.test.ts`, provider config unit tests.
- **Integration (PostgreSQL):** `lib/payments/wallet-payment.test.ts`, `lib/domains/domain-cart.integration.test.ts`, `lib/domains/transfer-checkout.integration.test.ts`, `lib/domains/transfer-wallet.integration.test.ts`, `lib/domains/ote.integration.test.ts`, `lib/payments/stripe-webhook.integration.test.ts`, `lib/orbit/domain-pricing.integration.test.ts`, others.
- **Provider OTE:** `lib/domains/ote.integration.test.ts` — needs DB + DNA OTE env.

**Missing:**

- No Playwright/Cypress (or similar) browser E2E in repo.
- No automated Google OAuth E2E (manual production verification only).
- No customer API tests for `[registrationId]` IDOR (would be valuable integration tests).

### 9.2 Runs performed (audit environment)

| Command                                                                         | Result                                                                                                                                                                        |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run test` (full script)                                                    | **148 tests:** 120 pass, **26 fail**, 2 skipped (~31s). Failures align with **PostgreSQL unavailable** on `127.0.0.1:5432` (e.g. `wallet-payment.test.ts` Prisma connection). |
| Curated unit subset (panel, customer OAuth, cart unit, transfer-security, etc.) | **38/38 pass**                                                                                                                                                                |

**Blockers for full green locally:** Running PostgreSQL with migrated schema; optional DNA OTE / Stripe test keys for integration and OTE suites.

**Safe without DB:** `npm run typecheck`, `npm run build` (per workspace rules) — not re-run in this audit session after test run.

---

## 10. Prioritized implementation plan

### Phase 3a — Billing ledger and domain order visibility (first milestone)

**Goal:** Customers see **all domain orders** and wallet activity in one place; staff reconciliation works for renewals.

| #   | Work item                                                           | Acceptance criteria                                                                                                |
| --- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 1   | Customer API `GET /api/domains/orders` (paginated, `userId` scoped) | Returns `publicId`, domain, `orderType`, status, total, dates; 401 without session; 404/empty for other users’ ids |
| 2   | Panel page or section **Orders & billing** (link nav item)          | Lists domain orders + links to wallet; uses server-side session                                                    |
| 3   | Fix renewal reconciliation wallet linkage                           | On renewal timeout, persist `walletTransactionId` on `DomainOrder`; staff finalize/rollback succeeds               |
| 4   | Inflight renewal guard                                              | Second concurrent renew for same domain returns 409 or returns single inflight order                               |
| 5   | Document idempotency for renew button                               | Stable key per user action (e.g. hash domain+day) or server-generated inflight key                                 |

**Out of scope for 3a:** PDF invoices, hosting payment, provisioning.

### Phase 3b — Domain renewals product polish

| #   | Work item                             | Acceptance criteria                                                            |
| --- | ------------------------------------- | ------------------------------------------------------------------------------ |
| 1   | Expiry UX on my-domains               | Sort by expiry, warn &lt; 30 days, show renewal price                          |
| 2   | `PATCH` auto-renew preference         | Updates `DomainRegistration.autoRenew`; optional provider sync if API supports |
| 3   | Renewal term selection                | Match register multiyear where `DomainTldPrice` allows                         |
| 4   | Customer-visible reconciliation state | Message + order status when `RECONCILIATION_REQUIRED`                          |

### Phase 3c — Unified billing (pre-invoice)

| #   | Work item                    | Acceptance criteria                                                           |
| --- | ---------------------------- | ----------------------------------------------------------------------------- |
| 1   | `BillingLineItem` view model | Map `WalletTransaction` + `DomainOrder` + `WalletPayment` to one timeline     |
| 2   | Export CSV                   | Customer can download ledger                                                  |
| 3   | Design `Invoice` model       | Numbering, tax fields, link to orders — migration only after product sign-off |

### Phase 3d — Hosting checkout payment (no provisioning yet)

| #   | Work item                                 | Acceptance criteria                        |
| --- | ----------------------------------------- | ------------------------------------------ |
| 1   | Stripe (or wallet) pay for `HostingOrder` | Order → `PAID`; `lineItemsSnapshot` frozen |
| 2   | Customer order detail page                | By id, ownership checked                   |
| 3   | Honest status copy                        | No `ACTIVE` until provisioner exists       |

### Phase 3e — Provisioning (later)

- `HostingService` (or equivalent) model, state machine, staff queue, adapter interface.
- Business email and VPS **after** web hosting instance pattern exists.

---

## 11. File and API quick reference

### Customer domain APIs (`app/api/domains/`)

- `search`, `validate`, `details`
- `cart`, `cart/bulk`
- `checkout/quote`, `checkout/register`, `checkout/renew`, `checkout/transfer`, `checkout/offers`
- `my`, `[registrationId]`, `[registrationId]/nameservers`, `lock`, `auth-code`
- `wallet`, `wallet/top-up`, `wallet/transactions`
- `transfer-check`

### Core libraries

- Registration: `lib/domains/registration-service.ts`
- Renewal: `lib/domains/renewal-service.ts`
- Wallet: `lib/domains/wallet.ts`
- Reconciliation: `lib/domains/reconciliation-service.ts`
- Cart: `lib/domains/domain-cart-service.ts`
- Management: `lib/domains/domain-management-service.ts`
- Providers: `lib/domains/providers/index.ts`, `domain-name-api.ts`

### Staff (Orbit)

- `app/api/orbit/domain-orders/route.ts`
- `app/api/orbit/domain-reconciliation/route.ts`
- `app/api/orbit/domain-dashboard/route.ts`

### Hosting

- `app/api/hosting/orders/route.ts`
- `lib/hosting/hosting-orders.ts`, `lib/hosting/cart/pricing.ts`

---

## 12. Concise summary

HostingBeyond already implements a **full wallet-funded domain registration pipeline** with cart, idempotent orders, provider integration, reconciliation for registration timeouts, and **ownership-safe** domain management APIs. **Renewals work in the happy path** but have **operational gaps** (reconciliation wallet id, inflight dedupe, auto-renew). **Customer billing is incomplete:** no domain order history in the panel, no invoices, and hosting orders stop at draft/quote. **Hosting, business email, and VPS provisioning are catalog and marketing plus DB order shells** — not customer-manageable services yet.

**Start Phase 3 with milestone 3a:** customer order ledger, renewal reconciliation fix, and renewal concurrency controls — then iterate on renewal UX and a unified wallet/order timeline before tackling invoices or hosting payment/provisioning.
