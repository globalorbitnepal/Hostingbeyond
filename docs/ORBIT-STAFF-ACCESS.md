# Orbit staff access (explicit roles)

Orbit distinguishes **full administrators** and **support-only** staff using
server-side environment configuration only. Browser-supplied roles are never
trusted. Access is derived from immutable `AdminUser.id` values.

## Policy

- **Production must not use `ORBIT_LEGACY_OPEN_ORBIT`.** Leave it unset. The
  limited support release fails closed when the ID lists are missing or
  malformed.
- **`ORBIT_FULL_ADMIN_IDS`**: comma-separated `AdminUser.id` values with
  unrestricted Orbit access (CMS, wallets, billing, customers, provider
  credentials, settings).
- **`ORBIT_SUPPORT_STAFF_IDS`**: comma-separated `AdminUser.id` values with
  human-support queue + scoped Beyond Master conversation access only.
- An id listed in **both** sets is treated as **full** (full wins).
- An authenticated admin id in **neither** set receives **no** Orbit API
  access (`401`).
- Emails, wildcards (`*`), booleans (`true`/`false`), and role names
  (`full`, `admin`, `support`) in the lists are ignored. After filtering, an
  empty list is treated as empty (fail closed).
- Duplicate entries are collapsed.

Login (passkey / enrollment secret) can still create a session. Authorization
is enforced on every Orbit API helper after the session is loaded.

## How to set production IDs (approved source)

Do this on the production host as `hostingbeyond`, never in chat, never in git.

1. Take a verified database backup.
2. Query `AdminUser` **id** and `displayName` only from the production database
   that the live app uses. Do not copy passwords, tokens, or secrets.
3. Choose the existing full-admin account(s) by operator knowledge of who
   currently runs Orbit. **Do not** add every `AdminUser` row.
4. Write those ids into production `.env` as `ORBIT_FULL_ADMIN_IDS`.
5. Write support-only ids (if any) as `ORBIT_SUPPORT_STAFF_IDS`. Leave the
   support list empty if there are no support-only staff.
6. Confirm `ORBIT_LEGACY_OPEN_ORBIT` is absent.
7. Restart the app through the normal control script after deploy.

This repository does not contain production `AdminUser.id` values. They must
not be invented, guessed, or inferred from email addresses.

## Guest chat capability

Guest Beyond Master threads use a **server-issued capability token** (not only
`threadId`). Set `BEYOND_MASTER_GUEST_THREAD_SECRET` in production (used with
the token for verification). Clients store the raw token in `sessionStorage`
per thread.

## Staging E2E human support (manual)

With integration DB and two Orbit users (full admin id in
`ORBIT_FULL_ADMIN_IDS`, support id in `ORBIT_SUPPORT_STAFF_IDS` only):

1. Open the site in a private window (guest, no `hb_customer_session`).
2. Open Beyond AI, send a message, then ask for a human; confirm `human_queue`
   and polling picks up staff `[notice]` messages after full admin assigns in
   `/orbit/beyond-master/support-queue`.
3. Repeat signed-in as a customer; confirm only that customer sees their
   thread via `GET /api/beyond-master/threads?id=…` with cookie.
4. Attempt `GET /api/beyond-master/threads?id=…` with another thread id and
   valid guest header → expect `404`.
