# Limited Beyond Master Support — production release

**Prepared:** 2026-11-07  
**Branch:** `feature/ai-agent-scoped`  
**HEAD at preparation:** `8eea64c` plus uncommitted authorization hardening and docs  
**Status:** prepared, **not committed, not pushed, not merged, not deployed**  
**Decision:** **B — RELEASE BLOCKED** until the human gates in §15 are complete.

Production deploy path is **main only** via GitHub Actions workflow
`Deploy HostingBeyond`. Do not deploy from this feature branch. Do not copy
files into `/srv/apps/hostingbeyond`.

---

## 1. Release scope

Ship the **text support assistant only**:

- Guest text chat and deterministic public answers
- Real catalog pricing (read-only)
- Domain, hosting, DNS, SSL, and email **guidance**
- Troubleshooting
- Multilingual deterministic responses
- Guest conversation persistence
- Customer identity verification and sign-in handoff
- Human-support handoff with tenant isolation

Keep existing HostingBeyond / Orbit product behavior for full administrators
once `ORBIT_FULL_ADMIN_IDS` is set from an approved source.

Consequential commerce stays **disabled**.

---

## 2. Included files (minimal set)

Include only these groups in the release commits. Paths are relative to the
dev checkout.

### 2.1 Commerce capability gate

- `lib/beyond-master/capabilities.ts`
- `lib/beyond-master/capabilities.unit.test.ts`
- `lib/beyond-master/operations/run.ts`
- `lib/beyond-master/commerce/http.ts`
- `lib/beyond-master/dns/http.ts`

### 2.2 Guest chat, persistence, tenant isolation

- `app/api/beyond-master/chat/route.ts`
- `app/api/beyond-master/threads/route.ts`
- `app/api/beyond-master/threads/messages/route.ts`
- `app/api/beyond-master/threads/[threadId]/attachments/route.ts`
- `app/api/beyond-master/models/route.ts`
- `lib/beyond-master/authorization.ts`
- `lib/beyond-master/agent-guest.ts`
- `lib/beyond-master/request.ts`
- `lib/beyond-master/copy.ts`
- `lib/beyond-master/replies.ts`
- `lib/beyond-master/locale.ts`
- `lib/beyond-master/language.ts`
- `lib/beyond-master/guest-thread-capability.ts`
- `lib/beyond-master/history/store.ts`
- `lib/beyond-master/history/thread-write-policy.ts`
- `lib/beyond-master/human-support.ts`
- `lib/beyond-master/rate-limit.ts`
- `lib/beyond-master/postgres-rate-limit.ts`
- `lib/beyond-master/ai-budget.ts`
- `lib/beyond-master/settings.ts`
- `lib/beyond-master/thread.ts`
- `lib/beyond-master/types.ts`
- `lib/beyond-master/ui-store.ts`
- `lib/beyond-master/knowledge/` (grounded answers + cache invalidation)
- `lib/beyond-master/tools/` (read-only account tools)
- `lib/beyond-master/providers/`
- `lib/beyond-master/dns/chat.ts`
- `lib/beyond-master/dns/workflow.ts`
- `lib/beyond-master/dns/prisma-store.ts`

### 2.3 Orbit support queue and authorization

- `lib/orbit/api.ts`
- `lib/orbit/staff-access.ts`
- `lib/orbit/staff-access.unit.test.ts`
- `lib/orbit/jwt.ts`
- `lib/orbit/jwt.session-isolation.unit.test.ts`
- `lib/orbit/api.authorization.unit.test.ts`
- `lib/orbit/session.ts`
- `lib/orbit/domain-pricing-auth.ts`
- `app/api/orbit/me/route.ts`
- `app/api/orbit/beyond-master/support-queue/route.ts`
- `app/api/orbit/beyond-master/conversations/route.ts`
- `app/orbit/(protected)/beyond-master/support-queue/`
- `app/orbit/(protected)/beyond-master/conversations/page.tsx`
- Orbit route files that switched to `requireOrbitFullAdmin` (see
  `docs/ORBIT-AUTHORIZATION-MATRIX.md`) — required so existing Orbit APIs do
  not stay on the old helper after `requireOrbitAdmin` became role-aware.

### 2.4 Customer authentication CSRF

- `app/api/auth/change-password/route.ts`
- `app/api/auth/logout/route.ts`
- `lib/http/same-origin-mutation.ts`
- `lib/customer/session.ts`
- `lib/customer/safe-redirect.ts`
- `lib/customer/site-origin.ts`

### 2.5 Schema (limited-release migrations only)

- `prisma/schema.prisma` (thread, rate-limit, budget, support-queue fields)
- `prisma/migrations/20261104233000_beyond_master_chat_history/`
- `prisma/migrations/20261106200000_beyond_master_ai_rate_budget_support_queue/`

Do **not** enable or depend on:

- `prisma/migrations/20261106010000_beyond_master_commerce_proposal/`
- `prisma/migrations/20261107120000_stripe_webhook_event_ledger/`

If those files exist on `main` after merge, keep
`STRIPE_WEBHOOK_EVENT_LEDGER_ENABLED` unset and commerce flags unset so the
ledger and proposals stay inert. Prefer not merging ledger/proposal-only
application code in this release.

### 2.6 Tests and harness

- `lib/test/orbit-admin-session-test-control.ts`
- `lib/test/customer-session-test-control.ts`
- `lib/test/integration-*`
- `scripts/run-node-tests.mjs`
- `scripts/test-runner-lib.mjs`
- New/updated `*.test.ts` files listed in the commit plan §13

### 2.7 Release documentation

- `docs/LIMITED-SUPPORT-PRODUCTION-RELEASE.md` (this file)
- `docs/LIMITED-SUPPORT-RELEASE-MANIFEST.md`
- `docs/ORBIT-STAFF-ACCESS.md`
- `docs/ORBIT-AUTHORIZATION-MATRIX.md`

---

## 3. Excluded files

Do not stage:

- Unrelated domain/hosting provisioning (`lib/domains/**` product work,
  `lib/hosting/provision-*`, `app/api/domains/**`, `app/api/hosting/**`)
- Stripe ledger application enablement (`lib/payments/stripe-webhook-ledger.ts`
  as a live path)
- Incomplete commerce modules as **required** files (they may remain in the
  tree if already imported, but stay gated off)
- Temporary snapshots: `.wip-snapshot-20261107-193128/`,
  `.git-wip-backup-20261106-012248/`
- Generated artifacts, Playwright output, `.next/`
- Vendor-pricing scripts (`scripts/namesilo-*`, margin reports)
- Unrelated website/layout experiments
  (`components/layout/header.unrelated-preserved.tsx.txt`)
- `ops/backup/**`, `ops/windows-desktop-recovery/**`, `ops/ci/proposed/**`
  unless a later ops-only change is separately approved

---

## 4. Required environment configuration (names only)

Must be present in production:

- `DATABASE_URL`
- `ORBIT_SESSION_SECRET`
- `ORBIT_ENROLLMENT_SECRET`
- `ORBIT_FULL_ADMIN_IDS` — **blocking; see §5**
- `BEYOND_MASTER_GUEST_THREAD_SECRET`

Optional:

- `ORBIT_SUPPORT_STAFF_IDS` — empty if there are no support-only staff

Must remain **unset / false**:

- `ORBIT_LEGACY_OPEN_ORBIT` — never use for this release
- `BEYOND_MASTER_COMMERCE_ENABLED`
- `BEYOND_MASTER_ALLOW_DOMAIN_REGISTER`
- `BEYOND_MASTER_ALLOW_DOMAIN_TRANSFER`
- `BEYOND_MASTER_ALLOW_DOMAIN_RENEW`
- `BEYOND_MASTER_ALLOW_DNS_WRITE`
- `BEYOND_MASTER_ALLOW_NAMESERVER_UPDATE`
- `BEYOND_MASTER_ALLOW_HOSTING_CHECKOUT`
- `BEYOND_MASTER_ALLOW_EMAIL_PROVISION`
- `BEYOND_MASTER_ALLOW_WALLET_TOPUP`
- `STRIPE_WEBHOOK_EVENT_LEDGER_ENABLED`
- `BEYOND_MASTER_AI_BUDGET_RECOVERY_ENABLED` (and any AI recovery flag)

Defaults in code (do not raise for this release):

- AI monthly cap: 500 cents ($5) in `lib/beyond-master/ai-budget.ts`
- Guest chat rate limit: 15 / hour in `lib/beyond-master/rate-limit.ts`

Gemini: leave unconfigured (no generative key) or explicitly disabled.

---

## 5. Orbit role configuration

Approved source: production `AdminUser.id` values read on the VPS as
`hostingbeyond` from the live database, written only into production `.env`.

Rules:

- Use immutable ids, not emails, not client roles.
- Do not add every `AdminUser` row.
- Do not invent ids.
- Do not paste ids into git, chat, or logs.
- Missing or malformed lists fail closed (every Orbit API `401`).
- Support-only ids cannot call CMS, wallets, full billing, settings, or
  customer administration.

**This release is blocked until those ids are configured through that
process.** The Cursor workspace user cannot read `/srv/apps/hostingbeyond/.env`
and must not query production.

Procedure: `docs/ORBIT-STAFF-ACCESS.md`.

---

## 6. Database migrations

Required, additive, not applied by this preparation:

1. `20261104233000_beyond_master_chat_history`  
   New thread, message, attachment tables.
2. `20261106200000_beyond_master_ai_rate_budget_support_queue`  
   Rate-limit and budget tables; support-queue columns on chat threads;
   activity enum values.

Not required:

- `20261106010000_beyond_master_commerce_proposal`
- `20261107120000_stripe_webhook_event_ledger`

Dependencies: the support-queue migration alters `BeyondMasterChatThread`, so
the chat-history migration must run first. Prisma order is timestamp order.

Compatibility: additive (new tables / nullable columns / indexes). Existing
rows keep working. The app can run during deploy if the new code is not
started until `prisma migrate deploy` finishes on the same release.

Rollback: leave additive tables in place (safe) or restore the verified
backup. Do not hand-edit production catalogs.

**Do not apply migrations until:**

1. Production backup exists and is independently verified.
2. Database target is confirmed as the production HostingBeyond database
   (host/name only; no secret echo).
3. GitHub migrate approval secret is set by the owner after that confirmation.

---

## 7. Feature flags

| Flag                             | Production               |
| -------------------------------- | ------------------------ |
| Commerce global + per-capability | unset (fail closed)      |
| Stripe webhook ledger            | unset                    |
| AI budget recovery               | unset / disabled         |
| Gemini                           | unconfigured or disabled |
| Orbit legacy open                | unset                    |

Incomplete commerce code stays in the tree and is unreachable while flags are
off. Unknown proposal kinds now return `503 capability_disabled` instead of
falling through to hosting confirm.

---

## 8. Smoke tests (after a future approved deploy)

1. `GET /api/health` → `{"ok":true,"service":"hostingbeyond"}`
2. Homepage `200`
3. Guest chat: first message + follow-up persistence
4. Guest capability token cannot read another thread
5. Customer A cannot read customer B
6. Sign-in handoff
7. Human-support enqueue; support-only staff can open the queue
8. Support-only staff `401` on `/api/orbit/content/home`, `/api/orbit/wallets`,
   `/api/orbit/invoices`
9. Full admin (configured id) can open Orbit CMS
10. `POST /api/beyond-master/dns/confirm` → `503 capability_disabled`
11. `POST /api/beyond-master/commerce/confirm` → `503` while flags are off
12. Guest rate limit 15/hour still enforced
13. Unknown Orbit user `401`

---

## 9. Backup

A production backup must exist **and be verified** immediately before migrate
and deploy. Presence of `/var/backups/hostingbeyond` on the host is **not**
sufficient without an independent restore check.

Use the existing `ops/backup` HostingBeyond backup/verify scripts as
`hostingbeyond`, not from Cursor.

---

## 10. Rollback

1. GitHub Actions: redeploy the previous `main` commit (Actions SSH
   `git reset --hard origin/main` in the production checkout).
2. Database: restore the verified backup if a migration misbehaves; otherwise
   additive tables may remain.
3. Immediate feature kill: keep commerce flags unset; remove staff from
   `ORBIT_SUPPORT_STAFF_IDS` if needed.
4. Do not use `ORBIT_LEGACY_OPEN_ORBIT=true` as rollback.

---

## 11. Monitoring

- `/api/health`
- PM2 `hostingbeyond` via `/usr/local/sbin/hostingbeyond-ctl`
- Nginx `hosting.theglobalorbit.com`
- Orbit login success for a configured full admin
- Support queue assign/reply activity actions
- No Stripe ledger traffic
- AI spend remains under the $5 monthly cap

---

## 12. Known limitations

- Gemini generation is unavailable without a configured provider.
- Domain registration, transfer, renewal, DNS write, nameservers, hosting
  checkout, email provisioning, and wallet top-up are disabled.
- `/api/orbit/support/tickets*` is unimplemented (`503`).
- Stripe webhook event ledger is not part of this release.
- Existing Orbit administrators lock out if `ORBIT_FULL_ADMIN_IDS` is missing.

---

## 13. Proposed commits (do not create until asked)

1. Commerce capability gate
2. Guest chat, persistence, tenant isolation
3. Orbit support queue and authorization
4. Customer authentication CSRF hardening
5. Regression tests
6. Release documentation

Do not stage snapshots, generated artifacts, or unrelated HostingBeyond work.

---

## 14. Required approvals

1. Operator sets production `ORBIT_FULL_ADMIN_IDS` / optional
   `ORBIT_SUPPORT_STAFF_IDS` from live `AdminUser.id` (no chat paste).
2. Independent verification that support-only cannot open CMS/wallets/billing.
3. File-by-file review of the include list.
4. Unit, integration, and production build green on a clean environment.
5. Migration review + confirmed database target.
6. Verified production backup.
7. Rollback procedure accepted.
8. Merge to `main` through branch protection (review + Actions).
9. Explicit **deploy** approval after merge. Pushing to `main` triggers
   Actions; that step still needs a human decision.

---

## 15. Remaining blockers (current)

1. Production full-admin IDs are **not** configured through an approved
   process. Cursor cannot read production `.env` and must not invent IDs.
2. Production backup has **not** been independently verified for this release.
3. Migrations have **not** been applied (correct). Apply only after (1) and (2).
4. This work is still on `feature/ai-agent-scoped` with a large mixed
   worktree. Commits have not been created.

Until those are done, production launch stays **BLOCKED**.
