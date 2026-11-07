# Beyond Master — API map

All paths are relative to the app root. Auth column is the helper that gates the
handler.

---

## 1. Customer-facing `/api/beyond-master`

| Method | Path                                                        | Auth                                                 | Purpose                             |
| ------ | ----------------------------------------------------------- | ---------------------------------------------------- | ----------------------------------- |
| POST   | `/api/beyond-master/chat`                                   | optional customer JWT; guest token for thread writes | SSE chat                            |
| GET    | `/api/beyond-master/models`                                 | public                                               | provider status (read-only)         |
| POST   | `/api/beyond-master/threads`                                | customer JWT or guest capability token               | create/save thread                  |
| GET    | `/api/beyond-master/threads?id=`                            | customer JWT or guest token                          | read own thread                     |
| POST   | `/api/beyond-master/threads/messages`                       | customer JWT                                         | customer follow-up reply            |
| POST   | `/api/beyond-master/threads/[threadId]/attachments`         | customer JWT or guest token                          | upload (≤5 MB)                      |
| POST   | `/api/beyond-master/commerce/confirm`                       | customer JWT                                         | gated confirm → `503` when disabled |
| POST   | `/api/beyond-master/commerce/cancel`                        | customer JWT                                         | cancel proposal                     |
| POST   | `/api/beyond-master/dns/confirm`                            | customer JWT                                         | gated DNS confirm → `503`           |
| POST   | `/api/beyond-master/dns/cancel`                             | customer JWT                                         | cancel DNS proposal                 |
| POST   | `/api/beyond-master/tickets`                                | customer JWT                                         | list/create tickets                 |
| GET    | `/api/beyond-master/tickets/[reference]`                    | customer JWT                                         | own ticket                          |
| POST   | `/api/beyond-master/tickets/[reference]/replies`            | customer JWT                                         | reply                               |
| POST   | `/api/beyond-master/tickets/drafts`                         | customer JWT                                         | draft ticket                        |
| POST   | `/api/beyond-master/tickets/drafts/[confirmationId]/cancel` | customer JWT                                         | cancel draft                        |

SSE event names: `support`, `tools`, `account`, `commerce`, `dns`, `domains`,
`delta`, `budget`, `error`, `done`.

## 2. Orbit Beyond Master `/api/orbit/beyond-master`

| Method         | Path                          | Role                 | Purpose                         |
| -------------- | ----------------------------- | -------------------- | ------------------------------- |
| GET/POST       | `overview`                    | full                 | agent overview                  |
| GET/POST       | `status`                      | full                 | provider/config status          |
| GET/POST       | `security`                    | full                 | security + audit panel          |
| GET            | `usage`                       | full                 | usage analytics                 |
| GET            | `ai-budget`                   | full                 | budget ledger                   |
| POST           | `ai-budget`                   | full                 | `403 recovery_disabled`         |
| GET/POST       | `support-queue`               | full or support-only | assign / reassign / reply       |
| GET/DELETE     | `conversations`               | full or support-only | scoped thread + attachment read |
| GET/POST       | `knowledge`                   | full                 | knowledge admin                 |
| GET/PUT/DELETE | `knowledge/[id]`              | full                 | single article                  |
| GET/POST       | `dns`                         | full                 | DNS proposals                   |
| GET/DELETE     | `dns/[id]`                    | full                 | single proposal                 |
| GET            | `dns/audit`                   | full                 | audit history                   |
| GET            | `tickets`                     | full                 | BM ticket list                  |
| GET            | `tickets/[reference]`         | full                 | ticket detail                   |
| POST           | `tickets/[reference]/notes`   | full                 | operator note                   |
| POST           | `tickets/[reference]/replies` | full                 | operator reply                  |

## 3. Legacy Orbit support tickets (unimplemented)

| Method | Path                                             | Role | Status                        |
| ------ | ------------------------------------------------ | ---- | ----------------------------- |
| GET    | `/api/orbit/support/tickets`                     | full | `503 support_not_implemented` |
| GET    | `/api/orbit/support/tickets/[publicId]`          | full | `503`                         |
| POST   | `/api/orbit/support/tickets/[publicId]/messages` | full | `503`                         |

These are deliberately full-admin only so a future implementation cannot leak
global customer tickets to support-only staff.

## 4. Orbit session

| Method | Path                               | Auth                                              |
| ------ | ---------------------------------- | ------------------------------------------------- |
| GET    | `/api/orbit/me`                    | `requireOrbitAdmin` (support gets redacted stats) |
| POST   | `/api/orbit/auth/access`           | enrollment secret                                 |
| GET    | `/api/orbit/auth/login/options`    | public                                            |
| POST   | `/api/orbit/auth/login/verify`     | public                                            |
| GET    | `/api/orbit/auth/register/options` | public                                            |
| POST   | `/api/orbit/auth/register/verify`  | public                                            |
| POST   | `/api/orbit/auth/logout`           | cookie; clears session                            |

## 5. Standard error codes

| Code                        | HTTP            | Meaning                                |
| --------------------------- | --------------- | -------------------------------------- |
| `capability_disabled`       | 503             | consequential operation gated off      |
| `guest_capability_required` | 400             | guest token missing/invalid for thread |
| `rate_limited`              | 429             | fixed window exceeded                  |
| `provider_not_configured`   | — (chat notice) | no AI provider configured              |
| `recovery_disabled`         | 403             | budget recovery off for this release   |
| `support_not_implemented`   | 503             | legacy Orbit ticket API                |

Full Orbit product route matrix (customers, wallets, invoices, CMS, pricing):
`docs/ORBIT-AUTHORIZATION-MATRIX.md`.
