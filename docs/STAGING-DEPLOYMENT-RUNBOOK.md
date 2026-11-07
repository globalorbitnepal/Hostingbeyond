# HostingBeyond — Staging deployment runbook

**Status:** prepared, **not executed**. No staging application instance or separate
staging database was created in this sprint (see "Blocked" below).

Production is `https://hosting.theglobalorbit.com` on PM2 `hostingbeyond`
(port 3030). Staging must never share that process, port, database, or `.env`.

---

## Blocked items (exact reasons)

| Item                         | Blocker                                                                                                                                                                                                                                 |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Separate staging DB          | The only reachable PostgreSQL is the existing isolated integration cluster; its app role has `rolcreatedb=false` and there is no superuser access from this account. Creating a new cluster would violate the "no second cluster" rule. |
| Staging application instance | No staging app directory or staging PM2 process exists; the deploy workflow targets production only.                                                                                                                                    |
| Production release           | Release must go through `main` + GitHub Actions. The current worktree is ~300 changed paths on a feature branch, uncommitted and unreviewed.                                                                                            |

---

## 1. Environment matrix (names only — never commit values)

| Category      | Variables                                                                                          | Staging requirement                            |
| ------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Database      | `DATABASE_URL`                                                                                     | Dedicated staging DB + dedicated non-prod role |
| App origin    | `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SITE_URL`, `ORBIT_ORIGIN`                                      | `https://staging.<domain>`                     |
| Sessions      | `ORBIT_SESSION_SECRET`, `ORBIT_ENROLLMENT_SECRET`, `BEYOND_MASTER_GUEST_THREAD_SECRET`             | Fresh staging-only values                      |
| AI provider   | `GEMINI_API_KEY`, `BEYOND_MASTER_AI_PROVIDER=google`, `BEYOND_MASTER_AI_MODEL`                     | Development-scoped key                         |
| AI limits     | `BEYOND_MASTER_AI_RATE_LIMIT`, `BEYOND_MASTER_AI_RATE_WINDOW_MS`, `BEYOND_MASTER_AI_RESERVE_CENTS` | Keep defaults                                  |
| AI recovery   | `BEYOND_MASTER_AI_BUDGET_RECOVERY_ENABLED`                                                         | **Unset / 0**                                  |
| Stripe        | `STRIPE_SECRET_KEY` (`sk_test_…`), `STRIPE_WEBHOOK_SECRET`                                         | **Test mode only**                             |
| Stripe ledger | `STRIPE_WEBHOOK_EVENT_LEDGER_ENABLED`                                                              | `1` **only after** migration applied           |
| Domains       | `DOMAIN_API_ENV=test`, `DOMAIN_API_TEST_KEY`                                                       | Sandbox/OTE                                    |
| Orbit roles   | `ORBIT_FULL_ADMIN_IDS`, `ORBIT_SUPPORT_STAFF_IDS`                                                  | Synthetic admin IDs                            |
| Legacy        | `ORBIT_LEGACY_OPEN_ORBIT`                                                                          | **Must be `0`**                                |

---

## 2. Database creation (requires DBA)

```bash
# As a superuser on the staging host ONLY (never production):
CREATE ROLE hb_staging_user LOGIN PASSWORD '<generated>';
CREATE DATABASE hostingbeyond_staging OWNER hb_staging_user;
```

Then verify identity **before** migrating:

```bash
DATABASE_URL='...' node scripts/migrate-integration-guarded.mjs --identity-only
```

The guard refuses non-loopback hosts, non-approved database names, and the
production role `hostingbeyond_user`.

---

## 3. Migration order

1. `pg_dump` the empty staging DB as a pre-migration baseline.
2. Apply migrations **excluding** the ledger first.
3. Verify `prisma migrate status` → all applied.
4. Apply `20261107120000_stripe_webhook_event_ledger` **last**.
5. Verify `StripeWebhookEvent` exists with the unique index on `stripeEventId`.
6. Only then set `STRIPE_WEBHOOK_EVENT_LEDGER_ENABLED=1`.

The ledger migration is additive (one table, one enum, two indexes) — no existing
table is altered, so it is safe to apply after code deploy in that order.

---

## 4. Application start (separate from production)

```bash
cd /path/to/staging-checkout
PORT=3101 PM2_HOME=/home/<user>/.pm2-staging \
  pm2 start npm --name hostingbeyond-staging -- run start
```

Nginx: add a **separate** `server` block for the staging hostname. Do not edit
the production block.

---

## 5. Smoke-test checklist

| #   | Check                                                 | Expected                                      |
| --- | ----------------------------------------------------- | --------------------------------------------- |
| 1   | `GET /api/health`                                     | 200, JSON, no DB call                         |
| 2   | `GET /`                                               | 200                                           |
| 3   | `GET /api/beyond-master/models`                       | `configured:true` with Gemini key             |
| 4   | Guest chat: "What services does HostingBeyond offer?" | SSE `delta` … `done`, catalog-grounded prices |
| 5   | Guest second message                                  | 200 (guest token persisted)                   |
| 6   | Page refresh                                          | conversation restored                         |
| 7   | Register synthetic customer → login                   | 200 + session cookie                          |
| 8   | Customer asks own-domain question                     | account-scoped answer                         |
| 9   | Customer A requests B's thread id                     | 404                                           |
| 10  | Duplicate Stripe webhook (test mode)                  | one credit, `duplicate:true`                  |
| 11  | Guest 16th request in an hour                         | 429                                           |
| 12  | PM2 status                                            | online, no restart loop                       |

---

## 6. Rollback

- **Code:** `git reset --hard <previous-release-sha>` in the staging checkout, rebuild, `pm2 restart hostingbeyond-staging`.
- **Database:** restore the `pg_dump` baseline. The ledger table can also be dropped safely (nothing else references it) — but only if the ledger flag is disabled first.
- **Nginx:** remove the staging `server` block and `nginx -t && systemctl reload nginx`.
- **Never** roll back production with these steps.

---

## 7. Production release gate

All must be true:

1. Work reviewed and merged to `main`.
2. Unit + integration + build green on `main`.
3. Production `pg_dump` backup completed and verified restorable.
4. Production DB identity confirmed independently.
5. Migration list reviewed; ledger migration applied **after** code deploy.
6. Webhook endpoint verified with a test-mode event before the ledger flag is on.
7. Duplicate-delivery behaviour confirmed.
8. Rollback instructions written and staffed.
9. Monitoring/alerts confirmed live.
10. Post-deploy health checks pass.

If any item fails, keep the ledger disabled and do not deploy.
