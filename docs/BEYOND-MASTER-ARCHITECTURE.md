# Beyond Master — backend architecture

Status of this document: describes the **shipped** structure on
`feature/ai-agent-scoped`, not an aspirational tree.

---

## 1. Framework and boundaries

Next.js App Router stays the application framework. There is no second runtime,
no separate service, and no duplicate agent.

```
Browser (chat panel / Orbit UI)
        │  fetch + SSE
        ▼
app/api/**/route.ts          thin HTTP boundary: parse, authenticate, delegate
        │  typed calls only
        ▼
lib/beyond-master/**         application services and domain rules
        │
        ├── lib/beyond-master/providers/   external AI provider adapters
        ├── lib/beyond-master/history/     conversation persistence
        ├── lib/beyond-master/tools/       read-only account tools
        └── lib/beyond-master/commerce/    gated consequential operations
        │
        ▼
lib/prisma.ts → PostgreSQL
```

Orbit staff surfaces mirror the same shape under `app/api/orbit/**` with
`lib/orbit/**` for roles and sessions.

## 2. Layer responsibilities

### Route layer (`app/api/**/route.ts`)

- Parse and validate the request body (`lib/beyond-master/request.ts`,
  `zod` where used).
- Establish identity: customer JWT (`lib/customer/session.ts`), Orbit session
  (`lib/orbit/session.ts`), or guest capability token.
- Apply cross-origin protection (`lib/http/same-origin-mutation.ts`).
- Call **one** application entry point.
- Emit SSE or JSON with stable shapes.

Routes do not contain business rules and are not allowed to trust
client-provided roles or ids.

### Application services (`lib/beyond-master/*`)

| Service       | Entry point                                                                     | Responsibility                                      |
| ------------- | ------------------------------------------------------------------------------- | --------------------------------------------------- |
| Identity      | `authorization.ts`                                                              | map verified sessions to `AiPrincipal`              |
| Intent        | `domain-intent.ts`, `account/intent.ts`, `tickets/intent.ts`, `tools/intent.ts` | deterministic classification                        |
| Knowledge     | `knowledge/retrieve.ts`, `knowledge/build.ts`                                   | grounded retrieval + prompt block                   |
| Tools         | `tools/run.ts`                                                                  | dispatch allowlisted read-only tools with principal |
| Provider      | `providers/stream.ts`                                                           | streaming, timeout, error normalization             |
| Conversations | `history/store.ts`                                                              | thread/message/attachment persistence + ownership   |
| Human support | `human-support.ts`                                                              | queue, assign, reassign, reply                      |
| Budget        | `ai-budget.ts`                                                                  | reservation, reconciliation, hard cap               |
| Rate limit    | `rate-limit.ts`, `postgres-rate-limit.ts`                                       | fixed-window counters                               |
| Commerce      | `operations/run.ts`, `commerce/http.ts`, `dns/http.ts`                          | gated proposals + confirm                           |
| Localization  | `locale.ts`, `language.ts`, `replies.ts`, `copy.ts`                             | BCP-47 + copy                                       |

### Policy constants

`lib/beyond-master/limits.ts` is the single source of truth for the $5 cap,
$3/$4 thresholds, guest 15/hour, tool 30/10min, provider timeout/output size,
and stale-reservation threshold. `ai-budget.ts`, `rate-limit.ts`, and
`settings.ts` import from it. Previously these numbers were duplicated across
three files, which risked one drifting.

### Flags

`lib/config/env-flags.ts` owns `isTruthyEnvFlag` (explicit `1`/`true`/`yes`
only). `lib/http/same-origin-mutation.ts` re-exports it for compatibility so
existing imports keep working. Capability gates import it directly from
`lib/config`, which removes an accidental dependency from a product gate onto
the CSRF module.

### Provider adapters (`lib/beyond-master/providers/`)

`stream.ts` exposes `streamBeyondMasterProvider` and `publicProviderError`.
`gemini.ts` owns URL construction, payloads, HTTP status classification, and
the non-streaming fallback decision. Google is the only live provider for this
release; any other `BEYOND_MASTER_AI_PROVIDER` value yields
`configurationError: "provider"` and no call is attempted.

No silent paid fallback exists. If the key is missing, the chat route serves
the deterministic grounded path.

### Persistence

Prisma is imported only in `lib/prisma.ts` consumers under `lib/`. Route
handlers that need reads call the service; they do not build ad-hoc queries
except for narrow admin listings that are already parameter-validated.

Ownership is enforced in the query (`supportStaffThreadWhere`,
`readCustomerChatThread`, `readGuestChatThread`, `readChatAttachmentWhere`), not
in the UI.

## 3. Conversation lifecycle

```
1  Guest opens chat            components/beyond-master/beyond-master-panel.tsx
2  Guest identity              guest-thread-capability.ts (server-issued token)
3  Thread created/validated    POST /api/beyond-master/threads
4  Message                      POST /api/beyond-master/chat
5  Validation + rate limit     request.ts, rate-limit.ts (15/hour guest)
6  Identity resolution         authorization.ts
7  Account context             account/read.ts, tools/run.ts
8  Intent                      deterministic classifiers
9  Knowledge                   knowledge/retrieve.ts
10 Tool selection              tools/run.ts (guest allowlist enforced)
11 Provider (when needed)      providers/stream.ts
12 SSE response                delta / done / error
13 Persistence                 ui-store.ts → threads route → history/store.ts
14 Usage                       usage.ts
15 Human handoff               human-support.ts
```

Persistence is client-triggered through the threads route (with `keepalive`),
which avoids duplicate server writes of the same message. Attachments are
separate rows with thread ownership.

## 4. Why the file tree was not mass-moved

The proposed domain tree (`core/`, `identity/`, `security/`, …) is a good
target, but this branch already has:

- 78 Orbit route files importing `@/lib/orbit/api`
- ~60 unit/integration suites importing `@/lib/beyond-master/<path>`
- a published PR with six reviewed commits

A mass move would touch every import, invalidate the reviewed diff, and risk
server/client boundary mistakes, for zero behaviour gain. Instead:

- Shared cross-cutting helpers were actually extracted where duplication
  existed (`lib/config/env-flags.ts`, `lib/beyond-master/limits.ts`).
- The target tree is recorded below as the migration map, to be applied
  incrementally on short-lived branches off `main` after this release.

### Migration map (future, one module per PR)

| Current                                                               | Target                       |
| --------------------------------------------------------------------- | ---------------------------- |
| `lib/beyond-master/limits.ts`, `settings.ts`, `capabilities.ts`       | `core/config/`               |
| `lib/beyond-master/authorization.ts`                                  | `identity/`                  |
| `lib/beyond-master/guest-thread-capability.ts`                        | `identity/guest-identity/`   |
| `lib/http/same-origin-mutation.ts`, `rate-limit.ts`                   | `security/`                  |
| `lib/beyond-master/history/*`                                         | `conversations/`             |
| `lib/beyond-master/operations/`, `grounded.ts`, `agent-guest.ts`      | `agent/`                     |
| `lib/beyond-master/providers/*`                                       | `providers/` (already close) |
| `lib/beyond-master/tools/*`                                           | `tools/` (already close)     |
| `lib/beyond-master/account/*`                                         | `customers/`                 |
| `lib/beyond-master/knowledge/*`                                       | `knowledge/` (already close) |
| `lib/beyond-master/human-support.ts`, `tickets/*`                     | `support/`                   |
| `lib/beyond-master/ai-budget.ts`                                      | `budget/`                    |
| `lib/beyond-master/commerce/*`, `dns/*`                               | `commerce/`                  |
| `lib/beyond-master/locale.ts`, `language.ts`, `replies.ts`, `copy.ts` | `localization/`              |
| `lib/orbit/*`                                                         | `admin/` + `security/`       |

## 5. Error and response contract

- SSE events: `support`, `tools`, `account`, `commerce`, `dns`, `domains`,
  `delta`, `budget`, `error`, `done`.
- JSON errors: `{ error, code? }` with stable codes
  (`capability_disabled`, `guest_capability_required`, `rate_limited`,
  `provider_not_configured`, `recovery_disabled`).
- No stack traces, connection strings, keys, or filesystem paths are returned.
  Admin mutations use `lib/http/safe-api-error.ts`.

## 6. Security invariants

1. Client-supplied identity and roles are never trusted.
2. Guest tokens grant conversation access only, never account data.
3. A customer JWT never becomes an Orbit session and vice versa
   (`kind` claim check).
4. Unknown/malformed Orbit role config fails closed.
5. Consequential capabilities require two independent env switches and are off
   by default.
6. Commerce confirmation revalidates the stored proposal; unknown proposal
   kinds return `503 capability_disabled`.
7. Budget recovery is disabled for this release.
