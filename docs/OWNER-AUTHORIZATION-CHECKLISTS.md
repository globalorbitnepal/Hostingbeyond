# Owner authorization checklists (deployment vs backup)

Two **separate** approvals. Neither is granted by merging PR #3 alone.

## Authorization A — Deployment only

- [ ] Maintenance window approved (PM2 restart / short outage).
- [ ] Target `main` SHA identified and CI green on that SHA.
- [ ] Previous VPS commit recorded for rollback.
- [ ] `HOSTINGBEYOND_PRODUCTION_DEPLOY_APPROVED` set **only** for deploy window.
- [ ] Deploy HostingBeyond workflow completed successfully.
- [ ] VPS `git rev-parse HEAD` matches target; backup scripts present (see `DEPLOYMENT-READINESS-RUNBOOK.md`).
- [ ] `export-preflight.sh` exits **11** while export approval **unset** (no dump).
- [ ] Deploy secret removed/unset after verification.
- [ ] Confirm next push to `main` does **not** auto-deploy (gate failure at authorization step).

## Authorization B — Production backup only

- [ ] Authorization A complete (tooling on VPS at expected SHA).
- [ ] Age **public** recipient installed (`~/.config/hostingbeyond-backup/age-recipient.txt`); private identity **not** on VPS.
- [ ] Destination `~/backup-export` acceptable; disk space OK.
- [ ] `HOSTINGBEYOND_PRODUCTION_BACKUP_EXPORT_APPROVED` **unset** for preflight gate test.
- [ ] Preflight pass with approval **off** → blocked (exit 11).
- [ ] **Separate** explicit approval for backup window.
- [ ] Set `HOSTINGBEYOND_PRODUCTION_BACKUP_EXPORT_APPROVED=true` in deployment `.env` **only** for window.
- [ ] Run `create-pull-bundle.sh`; verify `.bundle.meta.json` + ciphertext SHA on server.
- [ ] Windows pull; verify against **server** manifest (not local checksum alone).
- [ ] Isolated restore drill per `ops/backup/dr/RESTORE-DRILL-LAB.md` — **not** synthetic fixtures.
- [ ] Configure and test internal failure alerting (`BACKUP-SCHEDULER-ALERTING.md`).
- [ ] Clear export approval after window if policy requires.
