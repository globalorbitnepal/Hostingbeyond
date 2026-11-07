# Beyond Master — operations

---

## 1. Runtime layout

| Item                | Value                                             |
| ------------------- | ------------------------------------------------- |
| App                 | Next.js, `127.0.0.1:3030`                         |
| Process manager     | PM2 process `hostingbeyond`                       |
| Control script      | `/usr/local/sbin/hostingbeyond-ctl`               |
| Reverse proxy       | Nginx → `https://hosting.theglobalorbit.com`      |
| Production checkout | `/srv/apps/hostingbeyond` (owner `hostingbeyond`) |
| Deploy              | GitHub Actions `Deploy HostingBeyond` on `main`   |

Never edit `/srv/apps/hostingbeyond` from a developer shell. Production changes
arrive only through `main` + Actions, or a manual deploy as `hostingbeyond`.

## 2. Health

| Check                           | Expected                                |
| ------------------------------- | --------------------------------------- |
| `GET /api/health`               | `{"ok":true,"service":"hostingbeyond"}` |
| `GET /`                         | 200                                     |
| `GET /api/beyond-master/models` | provider status JSON                    |

A green Actions run is not proof the app is healthy — check the three endpoints
against the deployed SHA.

## 3. Environment (names only)

Required:

- `DATABASE_URL`
- `ORBIT_SESSION_SECRET`
- `ORBIT_ENROLLMENT_SECRET`
- `ORBIT_FULL_ADMIN_IDS` ← blocking for Orbit
- `BEYOND_MASTER_GUEST_THREAD_SECRET`

Optional:

- `ORBIT_SUPPORT_STAFF_IDS`
- `BEYOND_MASTER_AI_PROVIDER` (must be `google` or unset)
- `BEYOND_MASTER_AI_MODEL`
- `GEMINI_API_KEY`
- `BEYOND_MASTER_AI_RATE_LIMIT`, `BEYOND_MASTER_AI_RATE_WINDOW_MS`
- `BEYOND_MASTER_RATE_LIMIT_STORE` (`postgres` in production)
- `BEYOND_MASTER_AI_RESERVE_CENTS`

Must stay unset/false in production for this release:

- `ORBIT_LEGACY_OPEN_ORBIT`
- `BEYOND_MASTER_COMMERCE_ENABLED`
- every `BEYOND_MASTER_ALLOW_*`
- `BEYOND_MASTER_AI_BUDGET_RECOVERY_ENABLED`
- `STRIPE_WEBHOOK_EVENT_LEDGER_ENABLED`

## 4. Orbit administration

1. Read production `AdminUser.id` values on the host as `hostingbeyond`.
2. Put the real full-admin id(s) into production `.env` as
   `ORBIT_FULL_ADMIN_IDS`.
3. Put support-only ids into `ORBIT_SUPPORT_STAFF_IDS` (may be empty).
4. Leave `ORBIT_LEGACY_OPEN_ORBIT` unset.
5. Restart via the control script.

Do not invent ids, do not add every admin, do not paste ids into chat.

## 5. Budget and rate-limit monitoring

- Orbit → Beyond Master → AI budget shows committed vs $5 cap and stale
  reservation count.
- Warn $3, critical $4, hard stop $5 (application level only).
- Provider-side budgets must be set separately; the app cap does not stop
  provider billing.
- Recovery is disabled: the POST endpoint returns `403 recovery_disabled`.
  Do not enable `BEYOND_MASTER_AI_BUDGET_RECOVERY_ENABLED` without a separate
  approval.

## 6. Human support operations

1. Staff opens `/orbit/beyond-master/support-queue`.
2. Assign an open thread (full admin may claim any; support-only staff see only
   their own assignments).
3. Reply from the queue; replies persist as `[notice]` messages the customer
   sees on polling.
4. Link a ticket reference when one exists.
5. Close the queue entry to return the thread to AI handling.

## 7. Incident playbook

| Symptom                      | First action                                                               |
| ---------------------------- | -------------------------------------------------------------------------- |
| All Orbit API 401            | check `ORBIT_FULL_ADMIN_IDS` presence/shape; it is fail-closed             |
| Chat returns rate-limited    | check guest bucket counts; limit is 15/hour                                |
| Chat has no AI text          | check `/api/beyond-master/models`; grounded path is expected without a key |
| Commerce confirm returns 503 | expected; capability flags are off                                         |
| Budget page errors           | check DB reachability and that the budget migration ran                    |
| Deploy green but old UI      | verify deployed SHA and PM2 restart                                        |

## 8. Logs

- PM2 logs for the app process.
- Activity rows in `ActivityLog` for Orbit actions.
- Usage rows in `BeyondMasterUsage` for chat requests.
- No secrets are logged; provider keys are never copied onto status objects.

## 9. Backup and rollback

1. Verified production backup before any migration.
2. Rollback = redeploy previous `main` commit.
3. Additive tables may remain; do not hand-edit `_prisma_migrations`.
4. Never use `ORBIT_LEGACY_OPEN_ORBIT=true` as a rollback shortcut.

## 10. Future development

Work from latest `main`, short-lived branches, small reviewed commits, PR with
required checks, then the existing deploy workflow. Do not keep a second
long-lived release branch.
