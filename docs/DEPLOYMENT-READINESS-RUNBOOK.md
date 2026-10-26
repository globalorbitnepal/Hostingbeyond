# HostingBeyond — production deployment readiness (backup tooling)

**Scope:** Install merged backup safety tooling via the **approved GitHub deploy workflow** only.  
**Not in scope:** Production backup export (`HOSTINGBEYOND_PRODUCTION_BACKUP_EXPORT_APPROVED` remains unset until a separate backup window).

## Preconditions (owner)

| #   | Check              | Pass criteria                                                                                            |
| --- | ------------------ | -------------------------------------------------------------------------------------------------------- |
| 1   | Release SHA        | `git rev-parse origin/main` on GitHub matches intended release (e.g. `129c867…` or newer with green CI). |
| 2   | CI                 | **HostingBeyond CI — Orbit Admin and domain services** **SUCCESS** on that exact SHA.                    |
| 3   | Maintenance window | Stakeholders notified; **PM2 restart** and brief `127.0.0.1:3030` unavailability acceptable.             |
| 4   | Rollback target    | Record current VPS `git rev-parse HEAD` (historical: `14bb7e5` before first post–PR #3 deploy).          |
| 5   | Deploy gate        | `HOSTINGBEYOND_PRODUCTION_DEPLOY_APPROVED` **absent** until window opens.                                |

## Authorization A — deployment only

1. Approve maintenance window and target SHA.
2. Set GitHub secret `HOSTINGBEYOND_PRODUCTION_DEPLOY_APPROVED` = `true` **only** for the window.
3. Ensure CI succeeded on target SHA; allow **Deploy HostingBeyond** (`workflow_run` or approved manual dispatch per `deploy.yml`).
4. Confirm deploy job **succeeds** (SSH steps run only after gate passes).

## Post-deploy verification (no export)

As `hostingbeyond` on VPS — **do not print `.env` values**:

```bash
cd /srv/apps/hostingbeyond
git rev-parse HEAD
test -x ops/backup/production/export-preflight.sh
sha256sum ops/backup/production/create-pull-bundle.sh ops/backup/production/export-preflight.sh
```

Expected hashes at `129c867` (verify against `origin/main` if SHA differs):

| File                    | SHA-256                                                            |
| ----------------------- | ------------------------------------------------------------------ |
| `create-pull-bundle.sh` | `3c665d4d04e2b9f8d68a972ee62467f530602c8e18cff23f43c38ce31965a734` |
| `export-preflight.sh`   | `af8ff9471de5848d22242b9465e58a30ad41bd47aba6c50b7f63775172888d67` |

Application health (owner):

```bash
/usr/local/sbin/hostingbeyond-ctl status
curl -fsS -o /dev/null -w '%{http_code}\n' https://hosting.theglobalorbit.com/ || true
```

Fail-closed preflight (**export approval must remain unset**):

```bash
/srv/apps/hostingbeyond/ops/backup/production/export-preflight.sh \
  --env-file /srv/apps/hostingbeyond/.env
echo "expect exit 11 (EXPORT_BLOCKED) or documented preflight fail before any dump"
```

## Remove one-shot deploy approval

Unset or remove `HOSTINGBEYOND_PRODUCTION_DEPLOY_APPROVED` after verification.  
Push to `main` should trigger CI success then **Deploy** job **failure** at authorization step (no SSH deploy).

## Rollback

1. Set deploy approval secret for rollback window only.
2. Deploy previous known-good `main` SHA via same workflow, **or**
3. On VPS as `hostingbeyond`: `git fetch origin && git reset --hard <previous-sha>` + `npm ci && npm run build` + `hostingbeyond-ctl restart` (owner procedure; matches deploy script intent).

Rollback does not delete existing `~/backup-export/` artifacts if any were created later.

## Related

- Export approval: `docs/production-backup-policy.md`, `ops/backup/production/README.md`
- Validation checklist: `docs/backup-restore-validation.md`
- Deploy gate: `docs/RELEASE-GATE.md`, `.github/workflows/deploy.yml`
