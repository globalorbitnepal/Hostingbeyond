# Beyond Master — production release

**Branch:** `feature/ai-agent-scoped`
**PR:** [#15](https://github.com/globalorbitnepal/Hostingbeyond/pull/15)
**Status:** release blocked on Orbit full-admin configuration and a verified
production backup. Nothing here has been deployed.

---

## 1. Release scope

Ship the text support assistant: guest and customer chat, grounded catalog
answers, multilingual copy, guest persistence, tenant isolation, customer
identity, sign-in handoff, human-support handoff, Orbit support queue, and
read-only account tools.

Consequential commerce stays disabled. Gemini generation is unavailable without
an approved key; the deterministic path is the shipped behaviour.

## 2. Deployment path

`main` only, through GitHub Actions **Deploy HostingBeyond**:

1. Push/merge to `main`.
2. `quality` job: `npm ci`, `prisma generate`, `tsc --noEmit`.
3. Migration gate: runs only when the owner sets
   `HOSTINGBEYOND_PRODUCTION_MIGRATE_APPROVED=true`.
4. SSH preflight, `git reset --hard origin/main`, build, PM2 restart.
5. Live verify.

Do not deploy from the feature branch. Do not copy files to production.

## 3. Migrations

Apply, in order, with a verified backup:

1. `20261104233000_beyond_master_chat_history`
2. `20261106010000_beyond_master_commerce_proposal` (inert table; committed schema)
3. `20261106200000_beyond_master_ai_rate_budget_support_queue`

The migration `20261107120000_stripe_webhook_event_ledger` is **not** on this
release branch and must not be applied. Keep `STRIPE_WEBHOOK_EVENT_LEDGER_ENABLED`
unset.

## 4. Required production configuration

- `ORBIT_FULL_ADMIN_IDS` — real `AdminUser.id` values, set on the host
- `ORBIT_SUPPORT_STAFF_IDS` — optional
- `BEYOND_MASTER_GUEST_THREAD_SECRET`
- `ORBIT_SESSION_SECRET`, `ORBIT_ENROLLMENT_SECRET`, `DATABASE_URL`

Must stay unset: `ORBIT_LEGACY_OPEN_ORBIT`, `BEYOND_MASTER_COMMERCE_ENABLED`,
all `BEYOND_MASTER_ALLOW_*`, `BEYOND_MASTER_AI_BUDGET_RECOVERY_ENABLED`,
`STRIPE_WEBHOOK_EVENT_LEDGER_ENABLED`.

## 5. Smoke tests after deploy

1. `GET /api/health` → `{"ok":true,"service":"hostingbeyond"}`
2. `GET /` → 200
3. Guest chat first message + follow-up persistence
4. Guest token cannot read another thread
5. Customer A cannot read customer B
6. Sign-in handoff
7. Human handoff appears in the support queue
8. Support-only staff 401 on CMS, wallets, invoices
9. Full admin opens Orbit
10. `POST /api/beyond-master/dns/confirm` → 503
11. `POST /api/beyond-master/commerce/confirm` → 503
12. Guest limit ~15/hour
13. Unknown Orbit user → 401

## 6. Rollback

Redeploy the previous `main` commit; additive tables may remain; restore the
verified backup only if a migration misbehaves. Never use the legacy open-Orbit
flag as rollback.

## 7. Monitoring

`/api/health`, PM2 status via `hostingbeyond-ctl`, Nginx access/error logs,
Orbit login as a configured admin, support queue activity rows, AI budget page
(committed ≤ $5), and absence of Stripe ledger traffic.

## 8. Known limitations

- No live Gemini generation without a key.
- All commerce capabilities disabled.
- Legacy `/api/orbit/support/tickets*` returns 503.
- Stripe webhook ledger not in this release.
- Orbit locks out if `ORBIT_FULL_ADMIN_IDS` is missing (fail-closed).

## 9. Required approvals

1. Operations sets production full-admin ids (no chat paste).
2. Independent check that support-only staff cannot open CMS/wallets/billing.
3. File-by-file review of the release set.
4. Lint, typecheck, unit, integration, build green on CI.
5. Migration review + confirmed database target.
6. Verified production backup.
7. Rollback accepted.
8. Merge to `main` through branch protection.
9. Explicit deploy approval after merge.

## 10. Current blockers

| #   | Blocker                                         | Owner       |
| --- | ----------------------------------------------- | ----------- |
| 1   | `ORBIT_FULL_ADMIN_IDS` not set in production    | operations  |
| 2   | Production backup not verified for this release | operations  |
| 3   | Migrations not applied (correct until 1–2)      | operations  |
| 4   | CI must be green on the final commit            | engineering |
| 5   | Explicit deploy approval not recorded           | owner       |
