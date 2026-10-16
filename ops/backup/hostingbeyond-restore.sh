#!/usr/bin/env bash
# Restore HostingBeyond PostgreSQL from pg_dump custom format.
# Destructive on target DB. Blocked for production .env (same as backup).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib.sh
source "$SCRIPT_DIR/lib.sh"

usage() {
  cat <<'EOF'
Usage: hostingbeyond-restore.sh --env-file <path> --dump <database.dump> [--upload-archive <uploads.tar.gz>] [--yes]

Restores into the database named in DATABASE_URL (drops/recreates objects via pg_restore --clean).

Blocked: production env file under /srv/apps/hostingbeyond/.env
Never restore a production dump into staging with real customer data — use synthetic backups only.

Requires --yes to proceed.
EOF
}

ENV_FILE=""
DUMP=""
UPLOAD_ARCHIVE=""
CONFIRM=""

while [ $# -gt 0 ]; do
  case "$1" in
    --env-file)
      ENV_FILE="${2:-}"
      shift 2
      ;;
    --dump)
      DUMP="${2:-}"
      shift 2
      ;;
    --upload-archive)
      UPLOAD_ARCHIVE="${2:-}"
      shift 2
      ;;
    --yes)
      CONFIRM=1
      shift
      ;;
    -h | --help)
      usage
      exit 0
      ;;
    *)
      die "unknown argument: $1"
      ;;
  esac
done

[ -n "$ENV_FILE" ] || die "missing --env-file"
[ -f "$ENV_FILE" ] || die "env file not found"
[ -n "$DUMP" ] || die "missing --dump"
[ -f "$DUMP" ] || die "dump file not found"
[ -n "$CONFIRM" ] || die "pass --yes to confirm restore"

if is_blocked_production_env_file "$ENV_FILE"; then
  die "refusing production env file"
fi

command -v pg_restore >/dev/null 2>&1 || die "pg_restore not found"

DATABASE_URL="$(pg_database_url_from_env_file "$ENV_FILE")" || die "DATABASE_URL not found"
DB_NAME="$(database_name_from_url "$DATABASE_URL")" || die "could not parse database name"
if [ "$DB_NAME" != "hostingbeyond_integration_test" ] && [ "$DB_NAME" != "hostingbeyond_staging_db" ] && [ "$DB_NAME" != "hostingbeyond_test" ] && [ "$DB_NAME" != "hostingbeyond_dev" ]; then
  die "refusing restore: unexpected database name ($DB_NAME)"
fi

echo "==> Target database name: $DB_NAME"
echo "==> Restoring from: $DUMP"

pg_restore --clean --if-exists --no-owner --no-acl -d "$DATABASE_URL" "$DUMP"

if [ -n "$UPLOAD_ARCHIVE" ] && [ -f "$UPLOAD_ARCHIVE" ]; then
  echo "==> Extract uploads archive (manual target dir): $UPLOAD_ARCHIVE"
  echo "    Extract with: tar -xzf <archive> -C <ORBIT_UPLOAD_PARENT>"
fi

echo "==> Restore finished — run hostingbeyond-backup-verify.sh and prisma migrate status"
