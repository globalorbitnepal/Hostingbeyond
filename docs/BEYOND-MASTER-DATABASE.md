# Beyond Master — database

**Provider:** PostgreSQL, Prisma ORM.
**Schema:** `prisma/schema.prisma` (validated).
**Integration target (only):** `127.0.0.1:55432` / `hostingbeyond_integration_test`
with a non-production role. Guards live in `lib/test/isolated-database-policy.ts`
and `lib/test/integration-gate.ts`.

---

## 1. Models

| Model                              | Purpose                      | Key constraints                                                                                                          |
| ---------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `BeyondMasterUsage`                | per-request usage rows       | indexes on `createdAt`, `customerUserId`, `provider`, `status`                                                           |
| `BeyondMasterKnowledgeArticle`     | operator knowledge           | indexes on `category`, `published`                                                                                       |
| `BeyondMasterTicket`               | support ticket               | `[customerUserId,status]`, `[status,updatedAt]`, assignee/category/priority; customer `Cascade`, assignee `SetNull`      |
| `BeyondMasterTicketMessage`        | ticket messages              | `[ticketId,createdAt]`, `visibility`; ticket `Cascade`                                                                   |
| `BeyondMasterTicketAttachment`     | ticket files                 | `[ticketId]`; `Cascade`                                                                                                  |
| `BeyondMasterTicketActivity`       | ticket audit                 | `[ticketId,createdAt]`, `action`; `Cascade`                                                                              |
| `BeyondMasterChatThread`           | conversation                 | `[customerUserId,updatedAt]`, `[supportQueueStatus]`, `[supportAssignedAdminId]`; customer `Cascade`, assignee `SetNull` |
| `BeyondMasterChatMessage`          | conversation messages        | `[threadId,createdAt]`; thread `Cascade`                                                                                 |
| `BeyondMasterChatAttachment`       | chat files (≤5 MB)           | `[threadId]`; thread `Cascade`                                                                                           |
| `BeyondMasterDnsProposal`          | DNS change preview           | `[customerUserId,status]`, `[domain]`, `[expiresAt]`; `Cascade`                                                          |
| `BeyondMasterCommerceProposal`     | commerce preview             | `[customerUserId,status]`, `[expiresAt]`; `Cascade`                                                                      |
| `BeyondMasterRateLimitBucket`      | shared fixed-window counters | `bucketKey` unique, `[windowStart]`                                                                                      |
| `BeyondMasterAiBudgetMonth`        | monthly cap ledger           | `monthKey` unique                                                                                                        |
| `BeyondMasterAiBudgetReservation`  | per-call reservation         | `requestId` unique, `[monthKey]`, `[customerUserId]`                                                                     |
| `BeyondMasterAiCustomerMonthSpend` | per-customer spend           | `@@unique([monthKey,customerUserId])`, `[monthKey]`; `Cascade`                                                           |

Enums extended for support: `ActivityAction` gains
`BEYOND_MASTER_SUPPORT_QUEUE` and `BEYOND_MASTER_SUPPORT_MESSAGE`.

## 2. Migrations committed on `feature/ai-agent-scoped`

Beyond Master migrations, in order:

1. `20261103150000_beyond_master_usage`
2. `20261103210000_beyond_master_knowledge`
3. `20261103220000_beyond_master_tickets`
4. `20261103230000_beyond_master_dns_proposal`
5. `20261104233000_beyond_master_chat_history`
6. `20261106010000_beyond_master_commerce_proposal`
7. `20261106200000_beyond_master_ai_rate_budget_support_queue`

`prisma/migrations/INVENTORY.txt` lists 28 entries and matches the committed
folders. The migration-inventory test (`scripts/verify-migration-inventory.test.mjs`)
passes on a clean checkout.

### Required vs optional for this release

| Migration                                                   | Required         | Reason                                                                                                          |
| ----------------------------------------------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------- |
| `20261104233000_beyond_master_chat_history`                 | **yes**          | threads, messages, attachments                                                                                  |
| `20261106200000_beyond_master_ai_rate_budget_support_queue` | **yes**          | rate-limit, budget, support-queue columns; depends on chat-history                                              |
| `20261106010000_beyond_master_commerce_proposal`            | **apply anyway** | table exists in the committed schema; skipping it would cause schema drift even though code paths are gated off |

Commerce is **disabled by flags**, not by omitting the table. Applying its
additive table does not enable spending. Skipping a committed migration while
Prisma expects it is worse than applying an inert table.

### Not on this branch

`20261107120000_stripe_webhook_event_ledger` exists only as a local untracked
folder and is **not** committed. The Stripe ledger code, schema models, and
tests are likewise local-only. They must not be shipped by this release.

## 3. Ordering and dependencies

`20261106200000` alters `BeyondMasterChatThread` (adds support columns), so it
must run after `20261104233000` creates that table. Prisma applies migrations
in folder-name (timestamp) order, which satisfies this.

## 4. Additive compatibility

All three release migrations are additive: new tables, new nullable columns,
new indexes, new enum values. No column is dropped or narrowed.

- App can run against the old schema during rollout; new columns are nullable.
- Reads of new tables must tolerate absence until the migration completes.
- `ALTER TYPE … ADD VALUE` is not transactional on older PostgreSQL versions;
  run migrations before starting the new app revision.

## 5. Idempotency and transactions

- `requestId` unique on budget reservations.
- `monthKey` unique on the monthly ledger; reserve/reconcile share an advisory
  lock key (`beyondMasterBudgetLockKey`) so concurrent reservations cannot
  overspend.
- `bucketKey` unique on rate-limit rows so increments are atomic.
- Invoice issuance and ticket creation already use transactions and unique
  constraints on their own paths.

## 6. Rollback

Code rollback: redeploy the previous `main` commit. Additive tables can stay.

Database rollback: only from a verified backup. Do not hand-write down
migrations in production; do not delete enum values.

## 7. Production migration plan (requires approval)

1. Confirm target is the production HostingBeyond database (host + database
   name only, no credential echo).
2. Take a production backup and independently verify restoreability.
3. Set the repository migrate-approval secret only after step 2.
4. Let the deploy workflow run `prisma migrate deploy`.
5. Confirm `_prisma_migrations` contains the three new rows.
6. Smoke: health, guest chat, Orbit login.

No production migration has been run from this session.

## 8. Retention

Chat threads, messages, attachments, tickets, and usage rows have no automatic
expiry. Budget ledger rows are append-only per month. Any retention policy is a
future product decision and is not implemented.
