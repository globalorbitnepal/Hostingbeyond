# HostingBeyond — Phase 1 audit (codebase snapshot)

> Internal engineering reference. No secrets. Production domain migration steps are documented in § Domain configuration.

## A. Architecture and route inventory

**Stack (from `package.json`):** Next.js 15.5.x, React 19, TypeScript, Tailwind CSS 4, Prisma 6.x, PostgreSQL, Jose (JWT), Stripe (wallet top-up when configured), Lucide icons.

**App structure:** App Router under `app/`. Public marketing, product, and checkout pages; `app/api/*` REST handlers; `app/orbit/*` staff CMS (separate Orbit session middleware); `app/account/*` customer client area (customer session cookie, per-page auth + new shared layout).

**Key public routes:** `/`, `/domain-name-search`, `/cart`, `/get-started`, `/web-hosting`, `/business-email`, `/vps`, `/pricing`, `/login`, `/signup`, `/website-migration`, `/beyond-ai`, `/resources`, `/contact`.

**Customer routes:** `/account` (dashboard), `/account/wallet`, `/account/my-domains`, `/account/my-domains/[domain]`.

**Config:** `config/routes.ts`, `config/site.ts` (`NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_APP_URL`).

## B. Feature audit (summary)

| Area                               | Status                                                                                                              |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Domain search & cart checkout      | Working — wallet debit, NameSilo adapter (env-dependent)                                                            |
| Premium 4-step cart / add-ons      | Implemented — verify in staging                                                                                     |
| Customer email/password auth       | Implemented                                                                                                         |
| Google OAuth                       | Implemented — production redirect reported working; full callback→session→checkout E2E not verified in this session |
| Customer dashboard shell (Phase 1) | **New** — sidebar, header, overview with real data                                                                  |
| Hosting orders (DB)                | Working — list on dashboard; no customer hosting instance UI                                                        |
| Hosting provisioning               | Partial / blocked — no customer cPanel-style service model                                                          |
| Business email purchase flow       | Partial — CMS pricing & cart; provisioning API not customer-facing                                                  |
| VPS customer management            | Not implemented — marketing only                                                                                    |
| WordPress 1-click                  | Not implemented — CMS content only                                                                                  |
| Invoices model                     | Not implemented — wallet transactions only                                                                          |
| Support tickets                    | Not implemented                                                                                                     |
| Customer notifications             | Not implemented                                                                                                     |
| Orbit admin CMS                    | Working — separate auth                                                                                             |
| Stripe wallet top-up               | Implemented when keys configured                                                                                    |
| Middleware                         | Orbit paths only; `/account` not in middleware                                                                      |

## C. Authentication & Google OAuth

- Cookie: `hb_customer_session`, JWT + `CustomerSession` row.
- OAuth: `app/api/auth/oauth/[provider]`, callback, `CustomerOAuthAccount`, state JWT via `sessionSecret()` / `ORBIT_SESSION_SECRET`.
- Callback URL built from `NEXT_PUBLIC_SITE_URL` || `ORBIT_ORIGIN` (see `lib/customer/oauth.ts`).
- Checkout auth panel can gate Google via `/api/checkout/offers` `auth.googleOAuth`.

## D. Database & providers

**Prisma highlights:** `CustomerUser`, `CustomerSession`, `CustomerOAuthAccount`, `DomainRegistration`, `DomainOrder`, `CustomerWallet`, `WalletTransaction`, `WalletPayment`, `HostingOrder`, `HostingProduct`/`HostingProductPlan`, `HostingAddon`, `MigrationRequest`, `BeyondAiProject` / `BeyondAiSubscription`. No `VpsInstance`, `SupportTicket`, or `Invoice` models.

**Providers (inspect `lib/` adapters):** Domain registrar (NameSilo), payments (Stripe for wallet), email/hosting provisioning largely order/catalog level.

## E. Dashboard sitemap (implemented nav)

See `lib/panel/navigation.ts` — links only to live routes; unavailable features show **Soon** (no dead links).

## F. Phase 1 files

**Added:** `lib/panel/*`, `components/panel/*`, `styles/panel.css`, `app/account/layout.tsx`, `docs/PHASE1-AUDIT.md`, `lib/panel/navigation.test.ts`.

**Updated:** `app/account/page.tsx`, `app/account/wallet/page.tsx`, `app/account/my-domains/*`.

## G. Risks & dependencies

- OAuth redirect URIs must match `NEXT_PUBLIC_SITE_URL` when migrating to `hostingbeyond.com`.
- Domain/hosting/email actions depend on provider credentials and server-side env (not in repo).
- Double wallet debit / idempotency: existing domain checkout logic — retest in Phase 3.
- No middleware on `/account` — relies on layout + page checks.

## H. Implementation plan (phases 2–7)

1. **Phase 2:** OAuth E2E, checkout Google button parity, safe redirects, optional middleware for `/account`.
2. **Phase 3:** My Domains polish, renewals UI, billing history from wallet + orders.
3. **Phase 4:** Hosting service instances + provisioning adapter states.
4. **Phase 5:** Business email provisioning + mailbox UI.
5. **Phase 6:** VPS abstraction + honest disabled actions until API exists.
6. **Phase 7:** A11y, SEO for public only, migration runbook, security pass.

## Domain migration (documentation only)

When switching to `https://hostingbeyond.com`:

1. Set `NEXT_PUBLIC_SITE_URL` (and production `.env` on server as `hostingbeyond` user).
2. Add Google OAuth authorized redirect: `https://hostingbeyond.com/api/auth/oauth/google/callback`.
3. DNS + TLS for new host; keep old host redirect if desired.
4. Redeploy via GitHub Actions; verify cookies (`Secure`, `SameSite`) on HTTPS.
5. Update Stripe return URLs if used.

Do not change production DNS or canonical URLs until approved.
