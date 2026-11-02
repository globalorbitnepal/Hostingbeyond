# HostingBeyond — Hosting System Audit (Stage 1)

Date: 2026-11-02
Scope: hosting products, plans, routes, checkout, /orbit admin, SEO, customer dashboard.

## Stack (verified)

| Concern       | Reality                                                                                                  |
| ------------- | -------------------------------------------------------------------------------------------------------- |
| Framework     | Next.js 15 App Router (React 19), TypeScript                                                             |
| Styling       | Tailwind v4 + custom `hb-*` tokens; purple/white identity                                                |
| DB / ORM      | PostgreSQL via Prisma (`prisma/schema.prisma`, 40+ models)                                               |
| Admin auth    | Orbit JWT cookie (`ORBIT_SESSION_COOKIE`) + middleware, WebAuthn-capable                                 |
| Customer auth | Customer JWT cookie (`CUSTOMER_SESSION_COOKIE`) + DB session rows                                        |
| Payments      | Stripe Checkout Sessions + webhook; hosted-checkout gated by `isHostingCheckoutPaymentAvailable()`       |
| CMS           | `PageContent` (slug → sections JSON + seo JSON), React `cache` + `unstable_cache` on tag `orbit-content` |
| Catalog       | `HostingProduct` + `HostingProductPlan` seeded from `lib/hosting/products-registry.ts`                   |
| Cache         | Tag `hosting-products`, tag `orbit-content`; `revalidatePath` on write                                   |

## Hosting routes as found

Canonical, all HTTP 200:

```
/web-hosting                     web-hosting
/web-hosting/wordpress           wordpress-hosting
/web-hosting/ecommerce           ecommerce-hosting
/web-hosting/python              python-hosting
/web-hosting/reseller            reseller-hosting
/web-hosting/ssl                 ssl-product
/cloud-hosting                   business-hosting (pageTemplate: cloud)
/nodejs-hosting                  nodejs-hosting
/laravel-hosting                 laravel-hosting
/django-hosting                  django-hosting
/nestjs-hosting                  nestjs-hosting
/kvm-vps  /nvme-vps  /linux-vps  /managed-vps
/agency-hosting                  agency-hosting
/vps                          → redirect resolver (legacy)
```

`/hosting`, `/hosting/:path*`, `/cloud`, `/domains` already 301 to canonical
(`next.config.ts`).

## DEFECTS FOUND (all fixed in this commit unless marked otherwise)

### D1 — Broken links in both hosting menus (HIGH)

`config/navigation.ts` linked `Shared Hosting → /web-hosting/shared`, which
returns **404** (page was removed; no registry entry). Also missing every
developer/VPS/agency route.

`components/layout/hosting-mega-menu.tsx` linked Node.js/Laravel/Django/NestJS
through `/web-hosting?stack=…` and VPS through `/vps?…`, both query-string
redirects instead of the canonical URLs, and pointed **Agency Hosting at
`/web-hosting`** (wrong product).

### D2 — Duplicate brand in every page title (HIGH)

`lib/metadata.ts` unconditionally appended ` | HostingBeyond`, so every hosting
page that already ended with the brand rendered e.g.
`Web Hosting with NVMe SSD & Free SSL | HostingBeyond | HostingBeyond`.
Verified live before the fix.

### D3 — Plan cards advertise unsupported capability (HIGH, SEO/trust)

Pro/Ultimate list `"Unlimited Websites"` with no fair-use qualifier, which the
brief explicitly forbids. `"Advanced Performance (5× Faster)"` was already
stripped by `web-hosting-page-polish.ts` for web hosting but **not** for
WordPress/eCommerce/Cloud variants.

### D4 — `HostingProductPlan` can store far less than the brief requires (HIGH)

Model has `storage, bandwidth, websites, domains, emailAccounts, databases,
ssl, backup, support` but **no** `ram`, `cpu`, `renewalPrice`, `badge`, `seo`,
`ctaLabel`, `description`. `/orbit` therefore cannot edit most of the fields in
§10 without a migration.

### D5 — Admin plan editor is lossy (HIGH)

`components/orbit/hosting-product-editor.tsx` sends only
`planKey/planName/monthlyPrice/yearlyPrice/tagline/popular/sortOrder/active`.
`replaceHostingProductPlans` then writes `features: plan.features ?? []`,
`storage: plan.storage` (undefined) etc. — **saving prices wipes every feature
line, storage, website limit and backup spec on the plan.** Verified by reading
both files: `planInputs` never carries those fields, and the update payload sets
them to `undefined`.

### D6 — No server-side price/plan validation on admin writes

`replaceHostingProductPlans` only checks `>= 0`. No NaN/`Infinity` guard, no
slug-uniqueness path, no duplicate `planKey` guard beyond the DB unique index
(which surfaces as a 500 rather than a readable error), no audit log entry.

### D7 — Missing `metadataBase` consistency / no sitemap entries

`sitemap.ts` omitted `/nodejs-hosting`, `/laravel-hosting`, `/django-hosting`,
`/nestjs-hosting`, `/kvm-vps`, `/nvme-vps`, `/linux-vps`, `/managed-vps`,
`/agency-hosting`, `/web-hosting/python`, `/web-hosting/reseller` — 11 public,
indexable hosting pages were absent from `sitemap.xml`.

### D8 — Fair-use / renewal transparency gaps

`HostingCartQuote.renewalPrice` is hard-coded `null` and never rendered, so the
checkout cannot show "then renews at $X" — an explicit §8 requirement. Card copy
`pricingNote` only mentions renewals generically.

### D9 — Checkout is server-priced (PASS)

Verified: `POST /api/hosting/orders` rejects any body containing `total` or
`subtotal`, rejects client-supplied `status`, and re-quotes via
`quoteHostingCart`. Good — preserved.

### D10 — Provisioning is honestly not implemented (PASS, must stay honest)

`lib/hosting/provisioning.ts` states PAID ≠ ACTIVE and `ACTIVE` is reserved for a
future provider adapter. Account page already discloses this. No fake activation
was added.

## Not changed (deliberate)

- No route renames. `/web-hosting` is already canonical and indexed; the brief's
  `/hosting/web-hosting` would only add a redirect hop.
- No new checkout. The existing 4-step cart flow is preserved and improved.
- No schema migration in this commit (see D4) — production migrations are
  gated behind `HOSTINGBEYOND_PRODUCTION_MIGRATE_APPROVED` and would crash the
  app if code and DB drifted. Field-level plan editing therefore uses existing
  columns plus the `features[]` array as the structured source for RAM/CPU.
