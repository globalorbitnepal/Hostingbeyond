# Beyond Master — testing

---

## 1. Commands

```bash
# clean env: never export NODE_ENV=production into tests
env -u NODE_ENV npm ci
env -u NODE_ENV npx prisma validate
env -u NODE_ENV npx prisma generate
env -u NODE_ENV npm run lint
env -u NODE_ENV npm run typecheck
env -u NODE_ENV npm run test:unit

# integration: isolated DB only
set -a && . ./.env.integration.local && set +a
env -u NODE_ENV INTEGRATION_TESTS=required npm run test:integration

env -u NODE_ENV npm run build
```

Integration target must be `127.0.0.1:55432` /
`hostingbeyond_integration_test` with a non-production role. The guards are
`lib/test/isolated-database-policy.ts` and
`scripts/ci-assert-integration-database.mjs`.

## 2. Test layout

| Layer       | Pattern                                    | Runner                                    |
| ----------- | ------------------------------------------ | ----------------------------------------- |
| Unit        | `lib/**/*.test.ts`, `app/api/**/*.test.ts` | `scripts/run-node-tests.mjs --unit-only`  |
| Integration | `**/*.integration.test.ts`                 | same runner, `INTEGRATION_TESTS=required` |
| Route auth  | `**/route.auth.test.ts`                    | unit runner                               |
| CSRF        | `**/route.csrf.test.ts`                    | unit runner                               |

The runner fails closed on TAP `not ok` or `cancelled` even when a summary
claims zero failures.

## 3. What is covered

- Chat route: grounded fallback, SSE events, no provider required.
- Guest identity: capability token binding, forged token rejection, no customer
  thread exposure.
- Tenant isolation: customer A vs B thread, history, attachment bytes.
- Attachments: staff vs customer vs guest authorization.
- Human support: concurrent claim (exactly one winner), assign, reply,
  reassign, close, resume AI.
- Orbit roles: full vs support-only vs unknown vs missing/invalid env, client
  role ignored, JWT kind isolation, expiry.
- Capabilities: all eight disabled by default, single-gate disabled, malformed
  values disabled, per-capability isolation.
- Rate limits: exactly N concurrent increments per window, bucket isolation.
- AI budget: no overspend under concurrency, reconcile idempotency, shared
  advisory lock key.
- Localization: locale coverage, Nepali/Hindi disambiguation, English
  detection, reply localisation.
- Knowledge: cache invalidation after admin create/update.
- Migration inventory: committed folders match `INVENTORY.md`.

## 4. Deliberate CI correction

`lib/beyond-master/staging.integration.test.ts` previously asserted
`SELECT inet_server_port()` equals **55432**. In GitHub Actions the PostgreSQL
service listens on **5432 inside the container** and is only published to host
**55432**, so that assertion failed while proving nothing about isolation.

The test now:

- keeps `assertIntegrationDatabaseTarget()` (host/database/role policy),
- keeps the `current_database()` assertion,
- drops the internal-port comparison, with an explanatory comment.

No guard was weakened and the test is not skipped.

## 5. Not covered / known gaps

| Gap                                  | Note                                                               |
| ------------------------------------ | ------------------------------------------------------------------ |
| Live Gemini streaming                | no key in this environment; deterministic path tested              |
| Real Stripe webhooks                 | ledger not on this branch                                          |
| Real registrar / email providers     | no live credentials; never exercised                               |
| Browser E2E in CI                    | Playwright suite lives outside the repo; browser checks are manual |
| Legacy `/api/orbit/support/tickets*` | unimplemented (`503`), only auth asserted                          |

## 6. Manual verification checklist (before release approval)

- Desktop and mobile layout of the chat panel.
- Open/close behaviour, empty and loading states, error state.
- Guest conversation persists across reload.
- Signed-in conversation persists and is isolated.
- Language switching changes copy.
- Human handoff appears in the Orbit queue.
- Support-only staff cannot open CMS, wallets, or invoices.
- Commerce and DNS confirm return `503`.

Use synthetic data only. Never run real registrations or payments.
