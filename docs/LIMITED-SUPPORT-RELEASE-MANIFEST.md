# Limited Beyond Master Support — Release Manifest

**Prepared:** 2026-11-07
**Branch:** `feature/ai-agent-scoped` @ `8eea64c`
**Status:** manifest prepared, **not committed, not pushed, not deployed**
**Decision:** **B — RELEASE BLOCKED** (Orbit full-admin IDs + verified
production backup; see `docs/LIMITED-SUPPORT-PRODUCTION-RELEASE.md`)

---

## 1. Scope of this release

Ship the **text support assistant only**: guest chat, grounded public answers from
the live catalog, multilingual deterministic copy, guest conversation persistence,
authenticated customer identity, sign-in handoff, and human-support handoff.

Everything that spends money, mutates customer services, or calls a third-party
provider stays **off** behind `lib/beyond-master/capabilities.ts`.

---

## 2. Category A — required for the limited release

### 2.1 Chat surface (routes)

| File                                                               | Why required                                      |
| ------------------------------------------------------------------ | ------------------------------------------------- |
| `app/api/beyond-master/chat/route.ts`                              | The public chat endpoint (SSE)                    |
| `app/api/beyond-master/threads/route.ts`                           | Guest thread save/load, capability token issuance |
| `app/api/beyond-master/threads/messages/route.ts` (untracked, new) | Human-support message polling for guests          |
| `app/api/beyond-master/threads/[threadId]/attachments/route.ts`    | Attachment upload (ownership-checked)             |
| `app/api/beyond-master/models/route.ts`                            | Provider status probe (read-only)                 |

### 2.2 Core agent library

| File                                                              | Why required                                           |
| ----------------------------------------------------------------- | ------------------------------------------------------ |
| `lib/beyond-master/capabilities.ts` (new)                         | **Fail-closed gate for all consequential operations**  |
| `lib/beyond-master/operations/run.ts`                             | Commerce intent detection — now gated                  |
| `lib/beyond-master/commerce/http.ts`                              | Confirm endpoints — now gated (503)                    |
| `lib/beyond-master/dns/http.ts`                                   | DNS confirm — now gated (503)                          |
| `lib/beyond-master/authorization.ts`                              | Principal mapping, guest/customer/support/admin policy |
| `lib/beyond-master/agent-guest.ts`                                | Deterministic-path decisions                           |
| `lib/beyond-master/request.ts`                                    | Input validation, context trimming                     |
| `lib/beyond-master/copy.ts`, `replies.ts`                         | Localized customer-facing copy                         |
| `lib/beyond-master/locale.ts`, `language.ts`                      | BCP-47 detection                                       |
| `lib/beyond-master/guest-thread-capability.ts`                    | Token generation/hash/compare                          |
| `lib/beyond-master/history/store.ts`, `thread-write-policy.ts`    | Thread persistence + write rules                       |
| `lib/beyond-master/human-support.ts`                              | Queue assign/reassign/reply                            |
| `lib/beyond-master/rate-limit.ts`, `postgres-rate-limit.ts`       | Guest/customer limits                                  |
| `lib/beyond-master/ai-budget.ts`                                  | Reservation/reconciliation                             |
| `lib/beyond-master/settings.ts`, `providers/*`                    | Provider config + streaming (stays unconfigured)       |
| `lib/beyond-master/knowledge/*`                                   | Grounded knowledge + cache invalidation                |
| `lib/beyond-master/tools/*`                                       | Read-only account tools                                |
| `lib/beyond-master/thread.ts`, `types.ts`, `ui-store.ts`          | Client state + guest token persistence                 |
| `lib/beyond-master/dns/chat.ts`, `workflow.ts`, `prisma-store.ts` | DNS _guidance_ only (writes gated)                     |

### 2.3 Orbit staff surface (support queue only)

| File                                                                  | Why required                            |
| --------------------------------------------------------------------- | --------------------------------------- |
| `app/api/orbit/beyond-master/support-queue/route.ts` (untracked, new) | Assign / reassign / reply / link ticket |
| `app/api/orbit/beyond-master/conversations/route.ts`                  | Scoped thread + attachment read         |
| `app/orbit/(protected)/beyond-master/support-queue/` (new)            | Staff UI                                |
| `app/orbit/(protected)/beyond-master/conversations/page.tsx`          | Conversation viewer                     |

### 2.4 Shared security helpers

| File                                                       | Why required                                                     |
| ---------------------------------------------------------- | ---------------------------------------------------------------- |
| `lib/http/same-origin-mutation.ts`                         | CSRF/origin guard used by several routes                         |
| `lib/orbit/api.ts`                                         | Adds `requireOrbitFullAdmin` / `requireOrbitBeyondMasterSupport` |
| `lib/orbit/staff-access.ts` (untracked, new)               | Role derivation — **see §9 blocker**                             |
| `app/api/auth/change-password/route.ts`, `logout/route.ts` | Strict CSRF added                                                |

## 3. Category B — required dependencies

| File                                                                                                         | Required by                                       |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| `lib/orbit/session.ts`                                                                                       | Orbit auth for support queue                      |
| `lib/orbit/domain-pricing-auth.ts`                                                                           | Full-admin gating used by Orbit routes            |
| `lib/customer/session.ts`, `safe-redirect.ts`, `site-origin.ts`                                              | Customer identity + OAuth redirects               |
| `lib/domains/require-customer.ts`, `require-domain-ownership.ts`                                             | Ownership checks for tools                        |
| `lib/prisma.ts`                                                                                              | DB client                                         |
| `lib/test/integration-*`, `lib/test/orbit-admin-session-test-control.ts`, `customer-session-test-control.ts` | Test harness for the suites below                 |
| `prisma/schema.prisma`                                                                                       | Models for threads, rate limit, budget            |
| `prisma/migrations/20261104233000_beyond_master_chat_history`                                                | Thread + message + attachment tables              |
| `prisma/migrations/20261106010000_beyond_master_commerce_proposal`                                           | Commerce proposal table (schema; execution gated) |
| `prisma/migrations/20261106200000_beyond_master_ai_rate_budget_support_queue`                                | Rate-limit, budget, support-queue columns         |
| `scripts/run-node-tests.mjs`, `scripts/test-runner-lib.mjs`                                                  | Test runner used by all commands                  |

## 4. Category C — unrelated HostingBeyond work (exclude)

- `lib/domains/**`, `lib/hosting/**`, `lib/billing/**` provisioning/transfer/renewal work
- `app/api/domains/**`, `app/api/hosting/**`, `app/api/account/**`
- `app/api/webhooks/stripe/route.ts`, `lib/payments/**` ledger work
- `ops/backup/**`, `ops/windows-desktop-recovery/**`, `ops/ci/proposed/**`
- Vendor/pricing audit scripts (`scripts/namesilo-*`, `scripts/margin-report-local.mjs`, …)
- `components/layout/header.unrelated-preserved.tsx.txt`

These belong to separate initiatives and must not ride along in this release.

## 5. Category D — incomplete / experimental (exclude)

- `lib/hosting/provision-*` design/plan modules (design-only, no provider)
- `lib/beyond-master/commerce/*` proposal builders remain in the tree but are
  **unreachable** while capabilities are disabled. Including them is acceptable
  (they are inert) but they are not required for this release.
- `lib/payments/stripe-webhook-ledger.ts` + migration — inert until flag enabled.

## 6. Category E — artifacts (exclude)

- `.wip-snapshot-20261107-193128/` (safety snapshot)
- `.git-wip-backup-20261106-012248/`

## 7. Category F — secrets / sensitive (none found)

Scanned all changed paths for `.env`, `*.pem`, `*.key`, `credential`, `*.dump`,
`*.sql`, screenshots. **No sensitive files are present in the worktree changes.**

## 8. Migrations

| Migration                                                   | Production `migrate deploy`?                                 | Feature enabled?                         |
| ----------------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------- |
| `20261104233000_beyond_master_chat_history`                 | **Yes** — threads, messages, attachments                     | Yes (chat)                               |
| `20261106010000_beyond_master_commerce_proposal`            | **Yes** — `BeyondMasterCommerceProposal` in committed schema | **No** — all `BEYOND_MASTER_ALLOW_*` off |
| `20261106200000_beyond_master_ai_rate_budget_support_queue` | **Yes** — rate limit, budget, support-queue columns          | Yes (limits + queue)                     |
| `20261107120000_stripe_webhook_event_ledger`                | **Excluded** — not on release branch                         | **No** — flag off                        |

**Production schema change required:** all three Beyond Master release migrations
above, in timestamp order (`chat_history` → `commerce_proposal` →
`ai_rate_budget_support_queue`). They are additive (new tables / nullable
columns + indexes). Commerce capability flags stay off; the commerce migration
only prevents Prisma/schema drift.

Authoritative list: `BEYOND_MASTER_RELEASE_MIGRATIONS` in
`scripts/verify-migration-inventory.mjs` and `prisma/migrations/INVENTORY.txt`.

## 9. UNRESOLVED DEPENDENCY — Orbit role lockout risk

`lib/orbit/api.ts` now routes every Orbit route through `orbitAccessForAdmin()`,
which returns **`"none"`** when both `ORBIT_FULL_ADMIN_IDS` and
`ORBIT_SUPPORT_STAFF_IDS` are empty _and_ `ORBIT_LEGACY_OPEN_ORBIT` is not truthy.

The current server `.env` contains **none** of those three variables (verified by
name only). Deploying as-is would make **every Orbit administrator a 401**, taking
down CMS, billing, customers, wallets, and the support queue.

**This remains blocking.** The only allowed resolution is to set
`ORBIT_FULL_ADMIN_IDS` (and optional `ORBIT_SUPPORT_STAFF_IDS`) from live
`AdminUser.id` values on the production host. Do **not** set
`ORBIT_LEGACY_OPEN_ORBIT=true`. Do not invent IDs. Procedure:
`docs/ORBIT-STAFF-ACCESS.md`.

## 10. Environment variables (names only)

`DATABASE_URL`, `ORBIT_SESSION_SECRET`, `ORBIT_ENROLLMENT_SECRET`,
`BEYOND_MASTER_GUEST_THREAD_SECRET`, `ORBIT_FULL_ADMIN_IDS` (**required, see §9**),
`ORBIT_SUPPORT_STAFF_IDS`, `BEYOND_MASTER_AI_RATE_LIMIT`,
`BEYOND_MASTER_AI_RATE_WINDOW_MS`, `BEYOND_MASTER_AI_RESERVE_CENTS`.

Must remain **unset**: `BEYOND_MASTER_COMMERCE_ENABLED`,
`BEYOND_MASTER_ALLOW_*`, `STRIPE_WEBHOOK_EVENT_LEDGER_ENABLED`,
`BEYOND_MASTER_AI_BUDGET_RECOVERY_ENABLED`.

## 11. Enabled vs disabled

**Enabled:** guest text chat · grounded catalog answers · multilingual
deterministic copy · guest thread persistence · customer identity · sign-in
handoff · human-support handoff · tenant isolation · rate limits · budget cap.

**Disabled (fail-closed):** domain register/transfer/renew · DNS write ·
nameserver update · hosting checkout · email provisioning · wallet top-up ·
Stripe checkout · service activation · Gemini generation (no key).

## 12. Test commands and expected results

```bash
npm run test:unit          # expect 1254 pass, 0 fail
npm run build              # expect success
INTEGRATION_TESTS=required npm run test:integration   # expect 97 pass
npx prisma validate        # expect valid
```

Run with a **clean** environment (`env -u NODE_ENV …`); an exported
`NODE_ENV=production` disables test hooks and produces false failures.

## 13. Proposed commit structure

| #   | Subject                                                                         | Contents                                                                                                |
| --- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 1   | `feat(beyond-master): fail-closed capability gate for consequential operations` | `lib/beyond-master/capabilities.ts` + unit test, `operations/run.ts`, `commerce/http.ts`, `dns/http.ts` |
| 2   | `feat(beyond-master): guest chat, thread persistence and tenant isolation`      | chat/threads/attachments routes, history store, guest token, authorization, rate limit, budget          |
| 3   | `feat(orbit): support queue with scoped staff permissions`                      | support-queue + conversations routes, staff-access, orbit api, staff UI                                 |
| 4   | `fix(auth): strict CSRF on customer password and logout`                        | change-password, logout + tests                                                                         |
| 5   | `test(beyond-master): isolation, capability and locale regression suites`       | new/updated test files                                                                                  |
| 6   | `docs: limited support release manifest and staging runbook`                    | this file, staging runbook                                                                              |

## 14. Rollback

- Code: redeploy previous release commit; no destructive DB step required.
- DB: the two additive migrations can be left in place (harmless) or dropped
  with the support-queue columns.
- Feature: unset any `BEYOND_MASTER_ALLOW_*` to instantly disable commerce.

## 15. Deployment requirements

1. Resolve §9 (Orbit role env) — **blocking**.
2. Apply the two additive migrations with a verified backup.
3. Deploy code with all capability flags unset.
4. Smoke: `/api/health`, homepage 200, guest chat, follow-up persistence,
   customer login, cross-tenant 404, capability 503 on confirm.
5. Keep the Stripe ledger and Gemini flags off.
