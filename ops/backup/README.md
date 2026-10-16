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

Production is **out of scope** for these scripts. Use:

- Managed database snapshots (if applicable), or
- A dedicated ops runbook run **on the server** as `hostingbeyond` with encrypted off-site storage — scheduled separately after owner approval.

**Do not** copy production dumps into staging.

## Daily automation (after approval)

Example **staging** cron (run as staging Unix user, not production):

```cron
# 02:15 UTC daily — staging only
15 2 * * * HB_BACKUP_OUTPUT_ROOT=/var/backups/hostingbeyond-staging /srv/apps/hostingbeyond-staging/ops/backup/hostingbeyond-backup.sh --env-file /srv/apps/hostingbeyond-staging/.env --upload-dir /data/hostingbeyond-staging/uploads || logger -t hb-backup-staging FAIL
```

Add monitoring: alert if `SHA256SUMS` not updated within 26 hours.

## Encryption

Encrypt archives at rest (e.g. `age` or GPG) before off-server sync — document keys in password manager, not Git.
