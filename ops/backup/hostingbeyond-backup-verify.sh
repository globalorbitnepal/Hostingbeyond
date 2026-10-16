#!/usr/bin/env bash
# Post-restore checks: connectivity, migration table, row counts (no PII).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib.sh
source "$SCRIPT_DIR/lib.sh"

ENV_FILE=""
while [ $# -gt 0 ]; do
  case "$1" in
    --env-file)
      ENV_FILE="${2:-}"
      shift 2
      ;;
    -h | --help)
      echo "Usage: hostingbeyond-backup-verify.sh --env-file <path>"
      exit 0
      ;;
    *)
      die "unknown argument: $1"
      ;;
  esac
done

[ -n "$ENV_FILE" ] || die "missing --env-file"
if is_blocked_production_env_file "$ENV_FILE"; then
  die "refusing production env file"
fi

DATABASE_URL="$(pg_database_url_from_env_file "$ENV_FILE")" || die "DATABASE_URL not found"
DB_NAME="$(database_name_from_url "$DATABASE_URL")" || die "could not parse database name"
if [ "$DB_NAME" != "hostingbeyond_integration_test" ] && [ "$DB_NAME" != "hostingbeyond_staging_db" ] && [ "$DB_NAME" != "hostingbeyond_test" ] && [ "$DB_NAME" != "hostingbeyond_dev" ]; then
  die "refusing verify: unexpected database name ($DB_NAME)"
fi
echo "==> Verifying database name: $DB_NAME"

echo "==> Verifying database connectivity"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "SELECT 1 AS ok;" >/dev/null

echo "==> Migration count"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -t -c 'SELECT COUNT(*) FROM "_prisma_migrations";'

echo "==> Table row counts (aggregate — no customer fields)"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
SELECT 'CustomerUser' AS rel, COUNT(*)::bigint AS n FROM "CustomerUser"
UNION ALL SELECT 'DomainOrder', COUNT(*) FROM "DomainOrder"
UNION ALL SELECT 'DomainRegistration', COUNT(*) FROM "DomainRegistration"
UNION ALL SELECT 'WalletTransaction', COUNT(*) FROM "WalletTransaction"
UNION ALL SELECT 'HostingOrder', COUNT(*) FROM "HostingOrder";
SQL

echo "==> Verify complete"
