# Beyond Master — current state

**Verified against:** `feature/ai-agent-scoped` at `6cc5128` (pushed), plus local
uncommitted architecture work.
**Method:** file inventory plus route → service → database tracing. A file's
existence alone was not treated as "done".

Status key:

- **A** implemented and tested
- **B** implemented, needs integration wiring
- **C** implemented, not fully tested
- **D** disabled by a safety gate
- **E** experimental / incomplete
- **F** not implemented
- **G** requires an external provider
- **H** production configuration blocked

---

## 1. Chat surface (customer-facing)

| Capability                     | Status | Location                                            | Notes                                                                                                                     |
| ------------------------------ | ------ | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Guest text chat (SSE)          | A      | `app/api/beyond-master/chat/route.ts`               | 568-line handler; streams `support`, `tools`, `account`, `commerce`, `dns`, `domains`, `delta`, `budget`, `error`, `done` |
| Signed-in customer chat        | A      | same                                                | customer JWT wins over Orbit cookie                                                                                       |
| Deterministic grounded answers | A      | `lib/beyond-master/grounded.ts`                     | answers without a provider key                                                                                            |
| Multilingual copy              | A      | `locale.ts`, `language.ts`, `replies.ts`, `copy.ts` | es/fr/de/ru/ar/bn + ne/hi disambiguation                                                                                  |
| Guest persistence              | A      | `threads/route.ts`, `history/store.ts`              | capability token, not just thread id                                                                                      |
| Guest capability token         | A      | `guest-thread-capability.ts`                        | hash + `timingSafeEqual`, bound per thread                                                                                |
| Attachments                    | A      | `threads/[threadId]/attachments/route.ts`           | 5 MB, ownership checked                                                                                                   |
| Human-support handoff          | A      | `human-support.ts`, `tickets/http.ts`               | "talk to human" queues the thread                                                                                         |
| Provider streaming             | C      | `providers/stream.ts`, `providers/gemini.ts`        | works, but no live key in this environment                                                                                |
| LLM generation                 | G      | —                                                   | `GEMINI_API_KEY` absent; deterministic path used                                                                          |
| Voice input                    | C      | `components/beyond-master/voice-bar.tsx`            | UI only; not part of this release gate                                                                                    |

## 2. Read-only account tools

Status A for all, implemented in `lib/beyond-master/tools/`.

`search_domain`, `check_domain_availability`, `get_domain_pricing`,
`get_my_domains`, `get_my_hosting`, `get_my_invoices`, `get_my_orders`,
`get_hosting_order_status`, `get_my_tickets`, `get_dns_records`,
`get_hosting_plans`.

Guest allowlist is exactly four: `search_domain`,
`check_domain_availability`, `get_domain_pricing`, `get_hosting_plans`.

Tool authorization receives a server-built `AiPrincipal`; no tool accepts a
client-supplied identity.

## 3. Consequential commerce

| Capability          | Status | Gate                                                         |
| ------------------- | ------ | ------------------------------------------------------------ |
| Domain registration | D      | `BEYOND_MASTER_COMMERCE_ENABLED` + `…_ALLOW_DOMAIN_REGISTER` |
| Domain transfer     | D      | `…_ALLOW_DOMAIN_TRANSFER`                                    |
| Domain renewal      | D      | `…_ALLOW_DOMAIN_RENEW`                                       |
| DNS write           | D      | `…_ALLOW_DNS_WRITE`                                          |
| Nameserver update   | D      | `…_ALLOW_NAMESERVER_UPDATE`                                  |
| Hosting checkout    | D      | `…_ALLOW_HOSTING_CHECKOUT`                                   |
| Email provisioning  | D      | `…_ALLOW_EMAIL_PROVISION`                                    |
| Wallet top-up       | D      | `…_ALLOW_WALLET_TOPUP`                                       |

Gate implementation: `lib/beyond-master/capabilities.ts` (two switches
required). Enforced at `operations/run.ts`, `commerce/http.ts`, `dns/http.ts`.

Renewal/transfer/email/wallet have **no chat execution path at all** — the gate
names exist but there is no reachable route. That is intentional for this
release and must not be described as functional.

## 4. Human support

| Capability                           | Status | Location                                                     |
| ------------------------------------ | ------ | ------------------------------------------------------------ |
| Enqueue on handoff                   | A      | `human-support.ts#enqueueThreadForHumanSupport`              |
| Queue listing (scoped)               | A      | `listHumanSupportQueue`, `supportStaffThreadWhere`           |
| Assign / reassign                    | A      | `assignHumanSupportThread`, `reassignHumanSupportThread`     |
| Staff reply                          | A      | `staffReplyOnHumanSupportThread`                             |
| Guest polling                        | A      | `threads/messages/route.ts`                                  |
| Orbit queue API                      | A      | `app/api/orbit/beyond-master/support-queue/route.ts`         |
| Orbit queue UI                       | A      | `app/orbit/(protected)/beyond-master/support-queue/page.tsx` |
| Legacy `/api/orbit/support/tickets*` | E      | returns `503 support_not_implemented`                        |

The legacy Orbit support-ticket API is **not** the Beyond Master queue and is
**not** finished. It stays full-admin only.

## 5. Orbit administration

| Page                  | Status                  | API                                      |
| --------------------- | ----------------------- | ---------------------------------------- |
| Overview              | A                       | `/api/orbit/beyond-master/overview`      |
| Conversations         | A                       | `/api/orbit/beyond-master/conversations` |
| Support queue         | A                       | `/api/orbit/beyond-master/support-queue` |
| Knowledge             | A                       | `/api/orbit/beyond-master/knowledge`     |
| DNS audit / proposals | A (read) / D (write)    | `/api/orbit/beyond-master/dns*`          |
| Usage analytics       | A                       | `/api/orbit/beyond-master/usage`         |
| AI budget             | A (read) / D (recovery) | `/api/orbit/beyond-master/ai-budget`     |
| Security panel        | A                       | `/api/orbit/beyond-master/security`      |
| Provider status       | A                       | `/api/orbit/beyond-master/status`        |
| Tickets               | A                       | `/api/orbit/beyond-master/tickets`       |

AI budget **POST** (stale-reservation recovery) now returns
`403 recovery_disabled`. It previously imported a module that is not part of
this branch, which broke CI typecheck.

## 6. Authorization model

- `lib/orbit/staff-access.ts` — role from `ORBIT_FULL_ADMIN_IDS` /
  `ORBIT_SUPPORT_STAFF_IDS`, matched on immutable `AdminUser.id`.
- Email, `*`, booleans, and role words are filtered out of the lists.
- Empty/malformed config fails closed (every Orbit API 401).
- `ORBIT_LEGACY_OPEN_ORBIT` is **not** part of this release.
- `lib/orbit/jwt.ts` stamps `kind: "orbit"`; customer JWTs are rejected.
- Full matrix: `docs/ORBIT-AUTHORIZATION-MATRIX.md`.

## 7. Data model (Beyond Master)

`BeyondMasterUsage`, `BeyondMasterKnowledgeArticle`, `BeyondMasterTicket*`
(draft, sequence, ticket, message, attachment, activity), `BeyondMasterChatThread`,
`ChatMessage`, `ChatAttachment`, `BeyondMasterDnsProposal`,
`BeyondMasterCommerceProposal`, `BeyondMasterRateLimitBucket`,
`BeyondMasterAiBudgetMonth`, `AiBudgetReservation`, `AiCustomerMonthSpend`.

## 8. Testing

Existing suites cover chat route, agent-guest, authorization, locale,
replies, capabilities, rate limits, AI budget, thread write policy, guest
persistence, knowledge cache invalidation, and Orbit role helpers, plus
integration suites for support queue, guest token isolation, attachments,
rate limit, budget concurrency, and staging.

## 9. Blockers

| Blocker                                            | Class |
| -------------------------------------------------- | ----- |
| `ORBIT_FULL_ADMIN_IDS` unset in production         | H     |
| Production backup not verified for this release    | H     |
| Migrations not applied                             | H     |
| Gemini key absent                                  | G     |
| Stripe ledger intentionally excluded from branch   | D     |
| Legacy `/api/orbit/support/tickets*` unimplemented | E     |

## 10. Deliberately not done

- No second agent, no duplicate provider layer.
- No mass file move into the target domain tree (see
  `docs/BEYOND-MASTER-ARCHITECTURE.md` §4 for why).
- No new admin pages; existing nine pages were verified instead.
