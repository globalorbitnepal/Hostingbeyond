# Phase 2 — Google OAuth and checkout (dev)

## Post-login redirect origin

OAuth callback and `/account` login redirects must **not** use `request.url` as the redirect base behind Nginx (PM2 listens on `127.0.0.1:3030`). Use `lib/customer/site-origin.ts` (`requestSiteOrigin` / `absoluteSiteUrl`). Ensure production sets `NEXT_PUBLIC_SITE_URL=https://hosting.theglobalorbit.com` and Nginx passes `X-Forwarded-Host` / `X-Forwarded-Proto`.

Customer OAuth `redirect_uri` uses `storefrontSiteOriginForOAuth()` — production defaults to **`https://hostingbeyond.com`** (`CUSTOMER_OAUTH_PUBLIC_ORIGIN`). Register this callback in Google Cloud Console:

`https://hostingbeyond.com/api/auth/oauth/google/callback`

Also ensure **`hostingbeyond.com`** (and `hosting.theglobalorbit.com`) are allowed return origins: after Google returns to `hostingbeyond.com`, the app redirects to the storefront host via `/api/auth/oauth/establish` so the session cookie is set where the customer browses (`NEXT_PUBLIC_SITE_URL`).

On the OAuth consent screen, set **App name** to **HostingBeyond** (logo/homepage `https://hostingbeyond.com` or your storefront URL).

## Redirect safety

- `sanitizeCustomerRedirectPath()` in `lib/customer/safe-redirect.ts` is used for OAuth `next`, login/signup `next`, and OAuth state payloads.
- OAuth start and callback both sanitize destinations; state JWT still verified with `sessionSecret()`.

## Checkout return paths

- `/get-started`: `CheckoutAuthPanel` uses current path + query as OAuth `next` when not overridden.
- `/cart?step=3`: explicit `oauthNext` from `PremiumCartJourney`.
- Guest domain cart merges via `DomainCartProvider.refreshCart()` after OAuth; `DomainCheckoutView` syncs lines from cart context.

## Account protection

- Middleware: unauthenticated JWT on `/account/*` → `/login?next=<safe path>`.
- Layout: full `CustomerSession` validation (unchanged).

## Manual browser checklist (required before production sign-off)

1. Guest adds domain(s), open `/get-started`, **Continue with Google** → return to `/get-started` with domains still listed.
2. Same on `/cart` step 3 with add-ons selected (sessionStorage) → return to step 3 with selections.
3. `/login` and `/signup` show Google only when `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` are set.
4. Logout → `/account` redirects to login with `next` preserved.
5. Attempt `?next=//evil.com` on login — should land on `/account` after auth, not external site.
