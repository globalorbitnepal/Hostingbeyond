# HostingBeyond — production release gate

> **No secrets in this document.** **Production database results are unknown** until an authorized operator runs read-only preflight SQL in `docs/MIGRATION-HISTORY-REPAIR.md` and records PASS/FAIL in a change ticket.

## CI safety (GitHub Actions)

| Workflow                                                                            | Trigger                                        | Purpose                                                                                                                                                                                  |
| ----------------------------------------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **HostingBeyond CI — Orbit Admin and domain services** (`.github/workflows/ci.yml`) | `pull_request`, push to `main`                 | `ci-assert-integration-database.mjs` → `prisma migrate deploy` (integration DB only) → lint → typecheck → **full tests** (Orbit admin, domain services, and the rest of the app) → build |
| **Deploy HostingBeyond** (`.github/workflows/deploy.yml`)                           | **push** to **`main`**, or `workflow_dispatch` | **Typecheck** → **Deploy to VPS** (SSH) on `main` push (see below)                                                                                                                       |

### Integration database in CI

- Fixed env: `postgresql://hb_ci:***@127.0.0.1:5432/hostingbeyond_integration_test` (password is ephemeral CI-only, not a repository secret).
- **Never** uses production `.env`, `hostingbeyond_db`, or production secrets for tests.
- Pull requests run CI only; **deploy does not run** for PR workflows.

### Deploy trigger rules

| Event                                                                    | Deploy workflow starts?                                      | Production SSH / VPS deploy executes?                             |
| ------------------------------------------------------------------------ | ------------------------------------------------------------ | ----------------------------------------------------------------- |
| **Push to `main`**                                                       | **Yes** — **Deploy HostingBeyond** runs (Typecheck → Deploy) | **Yes** — SSH deploy after Typecheck passes                       |
| **HostingBeyond CI — Orbit Admin and domain services** on push to `main` | **Yes** — lint, tests, build (parallel)                      | **No** — deploy is not gated on full CI (same as historical flow) |
| Typecheck failure on deploy workflow                                     | **Yes** (workflow fails at Typecheck)                        | **No**                                                            |
| Pull request CI                                                          | **No** deploy workflow for PR branch                         | **No**                                                            |
| `workflow_dispatch` on **Deploy HostingBeyond**                          | **Yes**                                                      | **Yes** — Typecheck then SSH deploy (emergency / re-run)          |

**Deploy chain:** Push to **`main`** runs **Deploy HostingBeyond**: **Typecheck** → **Deploy to VPS**. **HostingBeyond CI — Orbit Admin and domain services** still runs on the same push for lint/tests/build but does not block deploy. **Database migrations** remain gated by `HOSTINGBEYOND_PRODUCTION_MIGRATE_APPROVED` (fail closed by default). **Deploy HostingBeyond** ships the public website and Orbit admin together; it is not an Orbit-only workflow.

Fork PRs cannot dispatch deploy workflows on the upstream repo.

### Manual re-run (not routine)

- Use **Actions → Deploy HostingBeyond → Run workflow** to redeploy `main` without a new commit.
- Still runs **Typecheck** before SSH deploy.
- Does **not** enable migrations (migrate secret is separate).

## Deploy vs migrate (fail closed)

| Step                                                         | Default on deploy                                                                                  |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| Deploy after push to `main`                                  | **Runs** when workflow **Typecheck** passes (no deploy approval secret)                            |
| `git reset --hard origin/main`, `npm ci`, build, PM2 restart | **Runs** when **Deploy to VPS** job runs                                                           |
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
