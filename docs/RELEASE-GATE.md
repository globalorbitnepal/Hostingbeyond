# HostingBeyond — production release gate

> **No secrets in this document.** **Production database results are unknown** until an authorized operator runs read-only preflight SQL in `docs/MIGRATION-HISTORY-REPAIR.md` and records PASS/FAIL in a change ticket.

## CI safety (GitHub Actions)

| Workflow                                                  | Trigger                                                                                | Purpose                                                                                                                          |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **HostingBeyond CI** (`.github/workflows/ci.yml`)         | `pull_request`, push to `main`                                                         | `ci-assert-integration-database.mjs` → `prisma migrate deploy` (integration DB only) → lint → typecheck → **full tests** → build |
| **Deploy HostingBeyond** (`.github/workflows/deploy.yml`) | `workflow_run` after **successful** CI on **`main`**, or emergency `workflow_dispatch` | SSH code deploy to production                                                                                                    |

### Integration database in CI

- Fixed env: `postgresql://hb_ci:***@127.0.0.1:5432/hostingbeyond_integration_test` (password is ephemeral CI-only, not a repository secret).
- **Never** uses production `.env`, `hostingbeyond_db`, or production secrets for tests.
- Pull requests run CI only; **deploy does not run** for PR workflows.

### Deploy trigger rules

| Event                                                      | Deploy runs?                                                                                                             |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| CI success on **push to `main`**                           | Yes (via `workflow_run`, `head_branch == main`)                                                                          |
| CI failure on `main`                                       | **No**                                                                                                                   |
| Pull request CI                                            | **No** deploy                                                                                                            |
| `workflow_dispatch` with `confirm_manual_deploy == DEPLOY` | **Only if** repository secret `HOSTINGBEYOND_MANUAL_DEPLOY_APPROVED` is `true` (emergency; **bypasses CI-success path**) |

Fork PRs cannot dispatch deploy workflows on the upstream repo.

### Manual emergency deploy (not routine)

- **Bypasses** the normal `push → CI success → deploy` chain.
- Requires **both** typing `DEPLOY` in the workflow input **and** `HOSTINGBEYOND_MANUAL_DEPLOY_APPROVED=true` (unset after use if policy requires).
- Does **not** enable migrations (migrate secret is separate).
- GitHub runtime behavior for `workflow_run` / PR branches has **not** been verified in this repo until first Actions run after push.

## Deploy vs migrate (fail closed)

| Step                                                         | Default on deploy                                                                                  |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| Automatic deploy after CI on `main`                          | **Blocked** unless repository secret `HOSTINGBEYOND_PRODUCTION_DEPLOY_APPROVED` is exactly `true` |
| `git reset --hard origin/main`, `npm ci`, build, PM2 restart | **Runs** when deploy job runs and deploy authorization step passed (automatic or manual path)                                                                      |
| `npx prisma migrate deploy` on production                    | **Skipped** unless repository secret `HOSTINGBEYOND_PRODUCTION_MIGRATE_APPROVED` is exactly `true` |

**Workflow inputs cannot enable migrations.** Only the owner-controlled repository secret can. Remove or unset the secret immediately after a successful migrate window if desired.

### Operator prerequisites before setting migrate secret

1. Owner approval and maintenance window.
2. **Verified restorable backup** (restore drill evidence).
3. Read-only preflight: host + database name confirmed; `beyond_ai` classification; checksum P3 if repair path.
4. Transactional **beyond_ai** history repair when required (`20250924190000` → `20260913120000`).
5. Duplicate in-flight **renew** query → **zero rows**.
6. Duplicate in-flight **register** query → **zero rows**.
7. Set `HOSTINGBEYOND_PRODUCTION_MIGRATE_APPROVED=true`, run deploy (or re-run deploy job), verify `migrate status` and HTTPS smoke.
8. Unset migrate secret when done if policy requires fail-closed default.

## Rate limiting note (application)

Public endpoint rate limits use in-memory buckets per Node process. Behind Nginx, keys prefer `X-Real-IP`. Limits are not shared across multiple PM2 instances or horizontal replicas without a shared store.

## Local release verification (before push)

```bash
cd /home/sysadmin/dev/Hostingbeyond
set -a && source .env.integration.local && set +a
node scripts/ci-assert-integration-database.mjs
npx prisma migrate deploy
npm run test && npm run lint && npm run typecheck && npm run build
```

## Push boundary

Pushing to `main` runs CI, then **production code deploy** on CI success. Migrations remain off until the migrate secret is set. **Production readiness** is separate from **commit review** — see preflight docs.
