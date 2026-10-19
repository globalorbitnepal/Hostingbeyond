# HostingBeyond backup & restore (staging / local only)

These scripts support **logical backups** for isolated **staging** or **local development** databases. They **refuse** `/srv/apps/hostingbeyond/.env` (production runtime) to prevent accidental use from developer workstations.

## Requirements

- `pg_dump`, `pg_restore`, `psql` (PostgreSQL client tools)
- Node.js (read `DATABASE_URL` from env file without printing it)
- `bash` 4+

## Quick start (local dev)

```bash
cd /home/sysadmin/dev/Hostingbeyond
chmod +x ops/backup/*.sh

# Use a local .env pointing at localhost staging DB — never production
./ops/backup/hostingbeyond-backup.sh \
  --env-file .env \
  --upload-dir "${ORBIT_UPLOAD_DIR:-./data/uploads}" \
  --output-dir ./data/backups

./ops/backup/hostingbeyond-backup-verify.sh --env-file .env
```

## Restore (destructive)

```bash
./ops/backup/hostingbeyond-restore.sh \
  --env-file .env \
  --dump ./data/backups/<timestamp>/database.dump \
  --yes

./ops/backup/hostingbeyond-backup-verify.sh --env-file .env
```

## Production backups

The scripts in **this directory** (`hostingbeyond-backup.sh`, etc.) **refuse** `/srv/apps/hostingbeyond/.env` — they remain **staging/local only**.

For **production → Windows desktop** disaster recovery, use:

| Piece                       | Location                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------- |
| VPS bundle export           | `ops/backup/production/create-pull-bundle.sh`                                         |
| Windows pull + schedule     | `ops/windows-backup/`                                                                 |
| Audit matrix                | `docs/BACKUP-DR-AUDIT.md`                                                             |
| DR runbook index            | `docs/DISASTER-RECOVERY-RUNBOOK.md`                                                   |
| Owner PC/HDD copy           | `docs/OWNER-OFFLINE-BACKUP-COPY.md`                                                   |
| Production preflight        | `docs/PRODUCTION-PREFLIGHT-RUNBOOK.md`, `docs/DAY2-PRODUCTION-PREFLIGHT-CHECKLIST.md` |
| Isolated restore drill      | `ops/backup/dr/RESTORE-DRILL-LAB.md`                                                  |
| Owner Day 2 steps (ordered) | `docs/OWNER-DAY2-EXECUTION-CHECKLIST.md`                                              |
| Deploy backup tooling       | `docs/BACKUP-TOOLING-DEPLOY-APPROVAL.md`                                              |
| Recovery runbook template   | `ops/windows-backup/templates/README-RECOVERY.md`                                     |

Also maintain provider-level PostgreSQL snapshots where available.

**Do not** copy production dumps into staging without owner policy.

## Daily automation (after approval)

Example **staging** cron (run as staging Unix user, not production):

```cron
# 02:15 UTC daily — staging only
15 2 * * * HB_BACKUP_OUTPUT_ROOT=/var/backups/hostingbeyond-staging /srv/apps/hostingbeyond-staging/ops/backup/hostingbeyond-backup.sh --env-file /srv/apps/hostingbeyond-staging/.env --upload-dir /data/hostingbeyond-staging/uploads || logger -t hb-backup-staging FAIL
```

Add monitoring: alert if `SHA256SUMS` not updated within 26 hours.

## Encryption

Encrypt archives at rest (e.g. `age` or GPG) before off-server sync — document keys in password manager, not Git.
