# Backup tooling — deploy approval checklist (no auto-deploy)

Use this **before** the first production `create-pull-bundle.sh`. Day 2 does **not** commit or deploy; owner approves a normal release.

## Preconditions

- [ ] Code review complete for `ops/backup/production/`, `ops/backup/dr/`, `ops/windows-backup/`, and related docs.
- [ ] Local tests pass: `node --test ops/backup/**/*.test.mjs ops/backup/dr/**/*.test.mjs` (and full `npm run test` if desired).
- [ ] `bash -n` on `create-pull-bundle.sh`, `encrypt-artifact.sh`, `ssh-forced-*.sh`.
- [ ] **No** secrets in tracked files; `.env` remains server-only.

## Release steps (after approval)

1. Commit **only** backup/DR paths (not unrelated untracked audits) — explicit file list, not `git add .`.
2. Push `main`; wait for CI green on the release SHA.
3. Run GitHub Actions **Deploy HostingBeyond** (migrate secret remains **off** unless separate migrate window).
4. On VPS as `hostingbeyond`: confirm files exist:
   - `/srv/apps/hostingbeyond/ops/backup/production/create-pull-bundle.sh`
   - `/srv/apps/hostingbeyond/ops/backup/dr/verify-backup-set.mjs`
5. Configure **age** recipient on server per `encrypt-artifact.sh` / production README.
6. Install forced SSH commands for Windows pull (`SSH-KEYS-INSTALL.md`).

## Post-deploy verification (non-destructive)

- [ ] `test -x create-pull-bundle.sh`
- [ ] `node ops/backup/production/env-inventory.mjs /srv/apps/hostingbeyond/.env` writes JSON with **names only** (do not paste output to public tickets).
- [ ] **Do not** run full export until owner approves backup window (disk/CPU).

## Rollback

- Deploy previous git SHA via same pipeline.
- Backup scripts are additive; rollback does not remove existing `~/backup-export/` artifacts.

## Current gap (as of `78a30a7` on production)

Production checkout **does not** include this tooling until a deploy ships it (`create-pull-bundle.sh` **NOT_DEPLOYED** verified on `/srv/apps/hostingbeyond`). Manual `pg_dump` remains a fallback only with explicit owner procedure — prefer scripted bundle after deploy.

---

## Intended commit scope (explicit paths — not `git add .`)

**Staging/local (already tracked; include README update):**

- `ops/backup/README.md`

**Production VPS bundle (new):**

- `ops/backup/production/BUNDLE-CONTENTS.md`
- `ops/backup/production/README.md`
- `ops/backup/production/assert-production-database.mjs`
- `ops/backup/production/assert-production-database.test.mjs`
- `ops/backup/production/create-pull-bundle.sh`
- `ops/backup/production/encrypt-artifact.sh`
- `ops/backup/production/env-inventory.mjs`
- `ops/backup/production/source-aggregates.mjs`
- `ops/backup/production/ssh-forced-backup.sh`
- `ops/backup/production/ssh-forced-fetch.sh`
- `ops/backup/production/ssh-forced-fetch.test.sh`

**DR / verification / lab restore (new):**

- `ops/backup/dr/*` (all `.mjs`, `.md` in tree — 20 files)

**Windows PC pull (new):**

- `ops/windows-backup/*` (scripts, tests, `config.example.json`, `templates/README-RECOVERY.md` — **not** `config.json`)

**Documentation (new; backup/DR/preflight only):**

- `docs/BACKUP-DR-AUDIT.md`
- `docs/BACKUP-TOOLING-DEPLOY-APPROVAL.md` (this file)
- `docs/DAY2-PRODUCTION-PREFLIGHT-CHECKLIST.md`
- `docs/DISASTER-RECOVERY-RUNBOOK.md`
- `docs/OWNER-DAY2-EXECUTION-CHECKLIST.md`
- `docs/OWNER-OFFLINE-BACKUP-COPY.md`
- `docs/PREFLIGHT-EVIDENCE-EXAMPLE.md`
- `docs/PRODUCTION-PREFLIGHT-RUNBOOK.md`
- `docs/WINDOWS-PC-BACKUP.md`

**Exclude from this commit** (preserve locally; unrelated): `.cursor/`, domain audit JSON/scripts, `lib/domains/supplier-retail-margin*`, roadmap/migration planning docs not listed above, `ops/check-customer-oauth-env.sh`, etc.

**Never commit:** `config.json` on Windows, age identity, SSH private keys, any `.env`.

---

## Prerequisites before deploy (owner + ops)

| #   | Prerequisite                                | Notes                                                                                               |
| --- | ------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 1   | Reviewed commit merged to `main`            | CI green (`npm run test` includes `ops/backup/**/*.test.mjs`)                                       |
| 2   | `HOSTINGBEYOND_PRODUCTION_MIGRATE_APPROVED` | Stays **off** for tooling-only deploy                                                               |
| 3   | `age` installed on VPS as `hostingbeyond`   | `encrypt-artifact.sh` exits 5 if missing                                                            |
| 4   | Public age recipient on VPS                 | `~/.config/hostingbeyond-backup/age-recipient.txt` (identity stays on PC)                           |
| 5   | Windows `config.json`                       | e.g. `C:\Users\User\HostingBeyond-Backups` — local only; ≥50 GB free (you reported ~61.56 GB on C:) |
| 6   | Backup SSH keys in `authorized_keys`        | Forced commands per `SSH-KEYS-INSTALL.md`                                                           |
| 7   | Separate approval                           | First `create-pull-bundle.sh` / Windows pull **after** deploy verify                                |

---

## Post-deploy verification (production checkout)

```bash
# As hostingbeyond or read-only sysadmin — paths only, no secrets
test -f /srv/apps/hostingbeyond/ops/backup/production/create-pull-bundle.sh && echo OK || echo MISSING
test -f /srv/apps/hostingbeyond/ops/backup/dr/verify-backup-set.mjs && echo OK || echo MISSING
cd /srv/apps/hostingbeyond && git rev-parse HEAD
```

Deploy is **not** complete until both scripts exist at the new SHA.

---

## Deployment approval checklist (sign-off before push)

- [ ] All files in **Intended commit scope** reviewed; no secrets in diff.
- [ ] Local: `bash -n` on production `*.sh` — **PASS**
- [ ] Local: backup/DR/Windows tests (73) — **PASS**
- [ ] `restore-test-isolated` refuses `hostingbeyond_db` — covered by tests.
- [ ] Bundle excludes `.env`; encrypts DB; tar includes `ORBIT_UPLOAD_DIR` — `BUNDLE-CONTENTS.md`.
- [ ] Owner approves **commit message** and **push to main**.
- [ ] Owner approves **Deploy HostingBeyond** workflow (no migrate).
- [ ] Post-deploy path checks **PASS** on VPS.
- [ ] **Separate** approval for first backup export and `Invoke-HostingBeyondBackup.ps1`.
