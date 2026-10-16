#!/usr/bin/env bash
# Logical backup for HostingBeyond PostgreSQL + optional upload tree.
# Safe-by-default: refuses production runtime .env (see ops/backup/README.md).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib.sh
source "$SCRIPT_DIR/lib.sh"

usage() {
  cat <<'EOF'
Usage: hostingbeyond-backup.sh --env-file <path> [--upload-dir <path>] [--output-dir <path>]

Creates:
  <output-dir>/<timestamp>/database.dump   (pg_dump custom format)
  <output-dir>/<timestamp>/uploads.tar.gz  (if --upload-dir exists)
  <output-dir>/<timestamp>/manifest.json   (metadata, no secrets)

Blocked: --env-file /srv/apps/hostingbeyond/.env (production). Use provider-level
backups for production or an approved ops runbook outside this script.

Environment:
  HB_BACKUP_OUTPUT_ROOT  Default output root (default: ./data/backups)
EOF
}

ENV_FILE=""
UPLOAD_DIR=""
OUTPUT_ROOT="${HB_BACKUP_OUTPUT_ROOT:-./data/backups}"

while [ $# -gt 0 ]; do
  case "$1" in
    --env-file)
      ENV_FILE="${2:-}"
      shift 2
      ;;
    --upload-dir)
      UPLOAD_DIR="${2:-}"
      shift 2
      ;;
    --output-dir)
      OUTPUT_ROOT="${2:-}"
      shift 2
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

if is_blocked_production_env_file "$ENV_FILE"; then
  die "refusing production env file (use staging/local env only)"
fi

command -v pg_dump >/dev/null 2>&1 || die "pg_dump not found"

DATABASE_URL="$(pg_database_url_from_env_file "$ENV_FILE")" || die "DATABASE_URL not found in env file"
DB_NAME="$(database_name_from_url "$DATABASE_URL")" || die "could not parse database name from DATABASE_URL"
if [ "$DB_NAME" != "hostingbeyond_integration_test" ] && [ "$DB_NAME" != "hostingbeyond_staging_db" ] && [ "$DB_NAME" != "hostingbeyond_test" ] && [ "$DB_NAME" != "hostingbeyond_dev" ]; then
  die "refusing backup: unexpected database name ($DB_NAME)"
fi

TS="$(timestamp_utc)"
DEST="${OUTPUT_ROOT%/}/${TS}"
mkdir -p "$DEST"

echo "==> Backup destination: $DEST"
echo "==> Database name: $DB_NAME"

pg_dump -Fc --no-owner --no-acl -d "$DATABASE_URL" -f "$DEST/database.dump"

UPLOAD_ARCHIVE=""
if [ -n "$UPLOAD_DIR" ] && [ -d "$UPLOAD_DIR" ]; then
  tar -czf "$DEST/uploads.tar.gz" -C "$(dirname "$UPLOAD_DIR")" "$(basename "$UPLOAD_DIR")"
  UPLOAD_ARCHIVE="uploads.tar.gz"
fi

COMMIT="$(git -C "$(dirname "$SCRIPT_DIR")/.." rev-parse HEAD 2>/dev/null || echo unknown)"
cat >"$DEST/manifest.json" <<EOF
{
  "createdAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "databaseName": "$DB_NAME",
  "gitCommit": "$COMMIT",
  "uploadArchive": "$UPLOAD_ARCHIVE",
  "tool": "hostingbeyond-backup.sh"
}
EOF

sha256sum "$DEST/database.dump" >"$DEST/SHA256SUMS"
[ -f "$DEST/uploads.tar.gz" ] && sha256sum "$DEST/uploads.tar.gz" >>"$DEST/SHA256SUMS"

echo "==> Backup complete"
