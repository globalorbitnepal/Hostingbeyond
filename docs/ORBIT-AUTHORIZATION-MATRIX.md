# Orbit authorization matrix

**Branch:** `feature/ai-agent-scoped`  
**Policy source:** `lib/orbit/staff-access.ts`, `lib/orbit/api.ts`  
**Production:** fail closed. Do not set `ORBIT_LEGACY_OPEN_ORBIT`.

Helpers:

| Helper                            | Who passes                                          |
| --------------------------------- | --------------------------------------------------- |
| _(none / public)_                 | Unauthenticated login, register, access-key, logout |
| `requireOrbitAdmin`               | Full **or** support-only (session + listed id)      |
| `requireOrbitBeyondMasterSupport` | Full **or** support-only                            |
| `requireOrbitFullAdmin`           | Full only                                           |
| `authorizeDomainPricingAdmin`     | Full only (wraps `requireOrbitFullAdmin`)           |

Support-only staff **must** reach the Beyond Master support queue. They **must
not** reach CMS, wallets, billing administration, provider credentials, or
global customer administration.

Client-supplied `role` fields are ignored. Customer JWTs (`kind=customer`) are
rejected by `verifyOrbitJwt`. Orbit JWTs are rejected by `verifyCustomerJwt`.

---

## 1. Public / session lifecycle

| Route                              | Role       | Helper                | Reason                                        | Tests                                                                                                                |
| ---------------------------------- | ---------- | --------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `/api/orbit/auth/login/options`    | Public     | none                  | WebAuthn challenge                            | existing login tests                                                                                                 |
| `/api/orbit/auth/login/verify`     | Public     | none                  | Creates Orbit session after passkey           | existing login tests                                                                                                 |
| `/api/orbit/auth/register/options` | Public     | none                  | Enrollment challenge                          | existing register tests                                                                                              |
| `/api/orbit/auth/register/verify`  | Public     | none                  | Enrollment                                    | existing register tests                                                                                              |
| `/api/orbit/auth/access`           | Public     | enrollment secret     | Access-key bootstrap; still not a role grant  | existing access tests                                                                                                |
| `/api/orbit/auth/logout`           | Any cookie | `destroyAdminSession` | Must clear session even if the id is unlisted | `lib/beyond-master/staging.integration.test.ts` logout; JWT expiry in `lib/orbit/jwt.session-isolation.unit.test.ts` |

A successful login does **not** grant Orbit APIs. `orbitAccessForAdmin` runs
after the session is loaded.

---

## 2. Shared authenticated Orbit access

| Route           | Role                 | Helper              | Reason                                                                   | Tests                                      |
| --------------- | -------------------- | ------------------- | ------------------------------------------------------------------------ | ------------------------------------------ |
| `/api/orbit/me` | Full or support-only | `requireOrbitAdmin` | Session probe. Support-only gets redacted stats (no customer directory). | `lib/orbit/api.authorization.unit.test.ts` |

---

## 3. Support-specific (limited release)

| Route                                    | Role                 | Helper                            | Reason                                                                                               | Tests                                                                                                                      |
| ---------------------------------------- | -------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `/api/orbit/beyond-master/support-queue` | Full or support-only | `requireOrbitBeyondMasterSupport` | Human-support assign / reply / queue. Support-only viewers are restricted to their assigned threads. | `app/api/orbit/beyond-master/support-queue/route.auth.test.ts`; `lib/beyond-master/human-support-flow.integration.test.ts` |
| `/api/orbit/beyond-master/conversations` | Full or support-only | `requireOrbitBeyondMasterSupport` | Scoped thread + attachment read                                                                      | `app/api/orbit/beyond-master/conversations/conversations-attachments.integration.test.ts`; helper tests                    |

These are the only Orbit product routes that support-only staff may call.

---

## 4. Full-admin only — CMS, SEO, media, blog, languages

| Route                                  | Role | Helper                  | Reason        | Tests                                           |
| -------------------------------------- | ---- | ----------------------- | ------------- | ----------------------------------------------- |
| `/api/orbit/content/home`              | Full | `requireOrbitFullAdmin` | CMS home      | `app/api/orbit/content/home/route.auth.test.ts` |
| `/api/orbit/content/about`             | Full | `requireOrbitFullAdmin` | CMS           | matrix + helper                                 |
| `/api/orbit/content/contact`           | Full | `requireOrbitFullAdmin` | CMS           | matrix + helper                                 |
| `/api/orbit/content/login`             | Full | `requireOrbitFullAdmin` | CMS           | matrix + helper                                 |
| `/api/orbit/content/hosting`           | Full | `requireOrbitFullAdmin` | CMS           | matrix + helper                                 |
| `/api/orbit/content/pricing`           | Full | `requireOrbitFullAdmin` | CMS           | matrix + helper                                 |
| `/api/orbit/content/domains`           | Full | `requireOrbitFullAdmin` | CMS           | matrix + helper                                 |
| `/api/orbit/content/domain-transfer`   | Full | `requireOrbitFullAdmin` | CMS           | matrix + helper                                 |
| `/api/orbit/content/cloud`             | Full | `requireOrbitFullAdmin` | CMS           | matrix + helper                                 |
| `/api/orbit/content/ssl`               | Full | `requireOrbitFullAdmin` | CMS           | matrix + helper                                 |
| `/api/orbit/content/business-email`    | Full | `requireOrbitFullAdmin` | CMS           | matrix + helper                                 |
| `/api/orbit/content/beyond-ai`         | Full | `requireOrbitFullAdmin` | CMS           | matrix + helper                                 |
| `/api/orbit/content/website-migration` | Full | `requireOrbitFullAdmin` | CMS           | matrix + helper                                 |
| `/api/orbit/content/docs-hub`          | Full | `requireOrbitFullAdmin` | CMS           | matrix + helper                                 |
| `/api/orbit/content/tips-hub`          | Full | `requireOrbitFullAdmin` | CMS           | matrix + helper                                 |
| `/api/orbit/content/updates-hub`       | Full | `requireOrbitFullAdmin` | CMS           | matrix + helper                                 |
| `/api/orbit/content/case-studies-hub`  | Full | `requireOrbitFullAdmin` | CMS           | matrix + helper                                 |
| `/api/orbit/content/growth-hub`        | Full | `requireOrbitFullAdmin` | CMS           | matrix + helper                                 |
| `/api/orbit/pages`                     | Full | `requireOrbitFullAdmin` | CMS pages     | matrix + helper                                 |
| `/api/orbit/page-seo`                  | Full | `requireOrbitFullAdmin` | SEO           | matrix + helper                                 |
| `/api/orbit/media`                     | Full | `requireOrbitFullAdmin` | Media library | matrix + helper                                 |
| `/api/orbit/languages`                 | Full | `requireOrbitFullAdmin` | Locale admin  | matrix + helper                                 |
| `/api/orbit/blog/posts`                | Full | `requireOrbitFullAdmin` | Blog CMS      | matrix + helper                                 |
| `/api/orbit/blog/posts/[id]`           | Full | `requireOrbitFullAdmin` | Blog CMS      | matrix + helper                                 |
| `/api/orbit/blog/authors`              | Full | `requireOrbitFullAdmin` | Blog CMS      | matrix + helper                                 |
| `/api/orbit/blog/categories`           | Full | `requireOrbitFullAdmin` | Blog CMS      | matrix + helper                                 |
| `/api/orbit/blog/tags`                 | Full | `requireOrbitFullAdmin` | Blog CMS      | matrix + helper                                 |
| `/api/orbit/blog/internal-links`       | Full | `requireOrbitFullAdmin` | Blog CMS      | matrix + helper                                 |

Support-only staff receive `401` via `requireOrbitFullAdmin`. Sampled on
`content/home`.

---

## 5. Full-admin only — customers, wallets, billing, settings, credentials

| Route                                          | Role | Helper                  | Reason                      | Tests                                             |
| ---------------------------------------------- | ---- | ----------------------- | --------------------------- | ------------------------------------------------- |
| `/api/orbit/customers`                         | Full | `requireOrbitFullAdmin` | Global customer admin       | helper                                            |
| `/api/orbit/customers/[userId]`                | Full | `requireOrbitFullAdmin` | Global customer admin       | helper                                            |
| `/api/orbit/customers/[userId]/reset-password` | Full | `requireOrbitFullAdmin` | Account takeover surface    | helper                                            |
| `/api/orbit/wallets`                           | Full | `requireOrbitFullAdmin` | Wallet administration       | `app/api/orbit/wallets/route.auth.test.ts`        |
| `/api/orbit/wallets/adjust`                    | Full | `requireOrbitFullAdmin` | Wallet credit/debit         | `app/api/orbit/wallets/adjust/route.auth.test.ts` |
| `/api/orbit/invoices`                          | Full | `requireOrbitFullAdmin` | Full billing administration | `app/api/orbit/invoices/route.auth.test.ts`       |
| `/api/orbit/invoices/[invoiceId]/void`         | Full | `requireOrbitFullAdmin` | Billing mutation            | helper                                            |
| `/api/orbit/settings`                          | Full | `requireOrbitFullAdmin` | Provider / site settings    | helper                                            |
| `/api/orbit/activity`                          | Full | `requireOrbitFullAdmin` | Audit log                   | helper                                            |
| `/api/orbit/contact-inquiries`                 | Full | `requireOrbitFullAdmin` | Lead PII                    | helper                                            |
| `/api/orbit/migration-requests`                | Full | `requireOrbitFullAdmin` | Customer migrations         | helper                                            |

---

## 6. Full-admin only — catalog, domains, hosting products, pricing

| Route                                    | Role | Helper                        | Reason                      | Tests                                                      |
| ---------------------------------------- | ---- | ----------------------------- | --------------------------- | ---------------------------------------------------------- |
| `/api/orbit/domain-pricing`              | Full | `authorizeDomainPricingAdmin` | Retail/supplier pricing     | `app/api/orbit/domain-pricing/namesilo/route.auth.test.ts` |
| `/api/orbit/domain-pricing/namesilo`     | Full | `authorizeDomainPricingAdmin` | Provider credentials / sync | same                                                       |
| `/api/orbit/domain-pricing/bulk-retail`  | Full | `authorizeDomainPricingAdmin` | Pricing write               | helper                                                     |
| `/api/orbit/domain-extras`               | Full | `authorizeDomainPricingAdmin` | Pricing extras              | helper                                                     |
| `/api/orbit/currency-rates`              | Full | `requireOrbitFullAdmin`       | FX admin                    | helper                                                     |
| `/api/orbit/domain-orders`               | Full | `requireOrbitFullAdmin`       | Order admin                 | helper                                                     |
| `/api/orbit/domain-dashboard`            | Full | `requireOrbitFullAdmin`       | Domain ops dashboard        | helper                                                     |
| `/api/orbit/domain-reconciliation`       | Full | `requireOrbitFullAdmin`       | Registrar reconciliation    | helper                                                     |
| `/api/orbit/hosting-products`            | Full | `requireOrbitFullAdmin`       | Product catalog             | helper                                                     |
| `/api/orbit/hosting-products/[id]`       | Full | `requireOrbitFullAdmin`       | Product catalog             | helper                                                     |
| `/api/orbit/hosting-products/[id]/plans` | Full | `requireOrbitFullAdmin`       | Product catalog             | helper                                                     |
| `/api/orbit/hosting-addons`              | Full | `requireOrbitFullAdmin`       | Product catalog             | helper                                                     |
| `/api/orbit/developer-hosting`           | Full | `requireOrbitFullAdmin`       | Product catalog             | helper                                                     |

---

## 7. Full-admin only — Beyond Master operator tools (not the support queue)

These are operator / knowledge / DNS / ticket-admin surfaces. They are **not**
the limited-release support queue. Support-only staff stay on
`/beyond-master/support-queue` and `/beyond-master/conversations`.

| Route                                                  | Role | Helper                  | Reason                           | Tests                                                      |
| ------------------------------------------------------ | ---- | ----------------------- | -------------------------------- | ---------------------------------------------------------- |
| `/api/orbit/beyond-master/overview`                    | Full | `requireOrbitFullAdmin` | Operator dashboard               | helper                                                     |
| `/api/orbit/beyond-master/status`                      | Full | `requireOrbitFullAdmin` | Operator status                  | helper                                                     |
| `/api/orbit/beyond-master/security`                    | Full | `requireOrbitFullAdmin` | Security panel                   | helper                                                     |
| `/api/orbit/beyond-master/usage`                       | Full | `requireOrbitFullAdmin` | Usage                            | helper                                                     |
| `/api/orbit/beyond-master/ai-budget`                   | Full | `requireOrbitFullAdmin` | Budget admin                     | `app/api/orbit/beyond-master/ai-budget/route.auth.test.ts` |
| `/api/orbit/beyond-master/knowledge`                   | Full | `requireOrbitFullAdmin` | Knowledge CMS                    | helper                                                     |
| `/api/orbit/beyond-master/knowledge/[id]`              | Full | `requireOrbitFullAdmin` | Knowledge CMS                    | helper                                                     |
| `/api/orbit/beyond-master/dns`                         | Full | `requireOrbitFullAdmin` | DNS operator                     | helper                                                     |
| `/api/orbit/beyond-master/dns/[id]`                    | Full | `requireOrbitFullAdmin` | DNS operator                     | helper                                                     |
| `/api/orbit/beyond-master/dns/audit`                   | Full | `requireOrbitFullAdmin` | DNS audit                        | helper                                                     |
| `/api/orbit/beyond-master/tickets`                     | Full | `requireOrbitFullAdmin` | BM ticket admin (not chat queue) | staging integration                                        |
| `/api/orbit/beyond-master/tickets/[reference]`         | Full | `requireOrbitFullAdmin` | BM ticket admin                  | staging integration                                        |
| `/api/orbit/beyond-master/tickets/[reference]/notes`   | Full | `requireOrbitFullAdmin` | Operator notes                   | staging integration                                        |
| `/api/orbit/beyond-master/tickets/[reference]/replies` | Full | `requireOrbitFullAdmin` | Operator replies                 | staging integration                                        |

---

## 8. Unimplemented hosting support tickets — kept full-admin

`/api/orbit/support/tickets*` currently returns `503 support_not_implemented`.
They are **not** the Beyond Master support queue. They stay full-admin so a
later implementation cannot silently open global customer tickets to
support-only staff.

| Route                                            | Role | Helper                  | Reason                                 | Tests  |
| ------------------------------------------------ | ---- | ----------------------- | -------------------------------------- | ------ |
| `/api/orbit/support/tickets`                     | Full | `requireOrbitFullAdmin` | Unimplemented; would be global tickets | helper |
| `/api/orbit/support/tickets/[publicId]`          | Full | `requireOrbitFullAdmin` | Unimplemented                          | helper |
| `/api/orbit/support/tickets/[publicId]/messages` | Full | `requireOrbitFullAdmin` | Unimplemented                          | helper |

---

## 9. Policy tests (cross-cutting)

Covered in `lib/orbit/staff-access.unit.test.ts` and
`lib/orbit/api.authorization.unit.test.ts`:

1. Approved full admin can use full-admin and support helpers.
2. Support-only can use the support helper.
3. Support-only cannot pass `requireOrbitFullAdmin` (CMS / wallets / billing).
4. Unknown users denied.
5. Missing env fails closed.
6. Invalid env fails closed.
7. Client-supplied role ignored.
8. Customer JWT ≠ Orbit session (`lib/orbit/jwt.session-isolation.unit.test.ts`).
9. Orbit JWT ≠ customer session (same file).
10. Logout / expiry (staging integration + expired JWT unit test).

---

## 10. Review note on the 166 `requireOrbitAdmin` → `requireOrbitFullAdmin` edits

Almost every previously authenticated Orbit route is a CMS, billing, catalog,
customer, or operator tool. Reclassifying them as full-admin is correct for
the limited support release.

The exceptions that must **not** be full-admin-only:

- Public auth routes (never used `requireOrbitAdmin`).
- `/api/orbit/me` — shared authenticated.
- `/api/orbit/beyond-master/support-queue` — support helper.
- `/api/orbit/beyond-master/conversations` — support helper.

No support-queue route was left on `requireOrbitFullAdmin`.
