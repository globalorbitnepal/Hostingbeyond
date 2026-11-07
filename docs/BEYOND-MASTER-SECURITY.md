# Beyond Master — security model

---

## 1. Identity

| Caller              | Proof                                                    | Result                               |
| ------------------- | -------------------------------------------------------- | ------------------------------------ |
| Guest               | server-issued guest capability token bound to one thread | conversation read/write only         |
| Customer            | `hb_customer_session` JWT, `kind: "customer"`            | own account scope                    |
| Orbit full admin    | `hb_orbit_session` JWT + id in `ORBIT_FULL_ADMIN_IDS`    | full Orbit                           |
| Orbit support-only  | orbit JWT + id in `ORBIT_SUPPORT_STAFF_IDS`              | support queue + scoped conversations |
| Unlisted Orbit user | valid session, id in neither list                        | **no Orbit API** (401)               |

`lib/orbit/jwt.ts` stamps `kind: "orbit"` and rejects `kind: "customer"`.
`lib/customer/session.ts` rejects non-customer `kind`. Tokens are not
interchangeable even though both use the same signing secret.

## 2. Guest capability tokens

- Generated server-side, stored hashed, compared with `timingSafeEqual`.
- Bound to exactly one `threadId`; reuse against another thread returns 404.
- Guests cannot read customer threads through the guest path.
- The raw token lives in `sessionStorage`, never in a URL.

## 3. Tenant isolation

Enforced in queries, not UI:

- `readCustomerChatThread` filters by `customerUserId`.
- `readGuestChatThread` filters by thread + hashed token.
- `supportStaffThreadWhere` restricts support-only staff to threads assigned to
  them; full admins see the full queue.
- `readChatAttachmentWhere` applies the same scope to attachment bytes.

Verified by `guest-token-isolation.integration.test.ts`,
`conversations-attachments.integration.test.ts`, and the staging suite.

## 4. Orbit role policy

`lib/orbit/staff-access.ts`:

- Parses comma/newline/semicolon separated `AdminUser.id` values.
- Rejects emails, `*`, `true`/`false`/`yes`/`no`, `all`, `any`, `full`,
  `support`, `admin`.
- Full list wins over support list on overlap.
- Empty or fully-invalid lists → `none` for everyone (fail closed).
- `ORBIT_LEGACY_OPEN_ORBIT` is a migration-only escape hatch and is **not** used
  for this release.

Support-only staff are denied CMS, wallets, invoices, global customers, AI
budget, provider credentials, and settings. Matrix:
`docs/ORBIT-AUTHORIZATION-MATRIX.md`.

## 5. CSRF

`lib/http/same-origin-mutation.ts` blocks cross-origin browser mutations
(`POST`/`PUT`/`PATCH`/`DELETE`) when `Origin` does not match `Host`.

Strict mode (`{ strict: true }`) is applied to:

- `POST /api/auth/change-password`
- `POST /api/auth/logout`

Missing `Origin` is treated as unsafe in strict mode. `NODE_ENV=test` bypass is
disabled in the unit tests that assert the guard
(`ignoreTestBypass: true`).

## 6. Rate limiting

- Guest chat: **15 / hour**, key `beyond-master:guest:<clientKey>`.
- Authenticated chat: `BEYOND_MASTER_AI_RATE_LIMIT` (default 20 / 10 min).
- Account tools: 30 / 10 min.
- Support tickets: 8 / 10 min.

Production uses the PostgreSQL fixed-window table; unit runs fall back to the
in-memory limiter only in `NODE_ENV=test` and only for known DB-init errors.

## 7. AI budget

- $3 warn, $4 critical, **$5 hard cap** (application-level only).
- Reservation before the paid call, reconciliation after token usage.
- Stale reservation recovery is **disabled** (`recovery_disabled`).
- This is **not** a provider-side billing cap. Provider budgets/alerts must be
  configured separately.

## 8. Consequential operations

Two independent switches are required: `BEYOND_MASTER_COMMERCE_ENABLED` plus the
capability-specific `BEYOND_MASTER_ALLOW_*`. Default is off. Missing, malformed,
or partial configuration yields disabled.

`/api/beyond-master/commerce/confirm` and `/api/beyond-master/dns/confirm`
return `503 capability_disabled` before any provider call. Unknown proposal
kinds also return `503` instead of falling through to hosting confirmation.

For any future enablement the required sequence is: verified identity →
ownership → preview → explicit confirmation → revalidation → provider execute →
provider verify → audit. Changing values after confirmation invalidates it.

## 9. Secret handling

- No secrets in the repo; env names only in docs.
- `.env`, keys, dumps, snapshots are excluded from release commits.
- Admin error responses use mapped codes; no stack traces or paths.
- Production IDs and provider keys must never be pasted into chat.

## 10. Known residual risks

| Risk                                             | Mitigation                                      |
| ------------------------------------------------ | ----------------------------------------------- |
| Orbit lockout if `ORBIT_FULL_ADMIN_IDS` is unset | documented blocking gate; fail-closed by design |
| Legacy Orbit ticket API unimplemented            | returns 503; full-admin only                    |
| Provider key absent                              | deterministic grounded path only                |
| Stripe ledger excluded from branch               | flag unset; ledger code not shipped             |
| Application budget ≠ billing cap                 | documented disclaimer in API + docs             |
