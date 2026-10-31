#!/usr/bin/env bash
# Idempotent: allow production backup export (owner-approved window).
# Run as hostingbeyond with write access to APP_ROOT/.env
set -euo pipefail
APP_ROOT="${APP_ROOT:-/srv/apps/hostingbeyond}"
ENV_FILE="${APP_ROOT}/.env"
KEY="HOSTINGBEYOND_PRODUCTION_BACKUP_EXPORT_APPROVED"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE" >&2
  exit 1
fi
if grep -qE "^${KEY}=true[[:space:]]*$" "$ENV_FILE" 2>/dev/null; then
  echo "OK: ${KEY}=true already set"
  exit 0
fi
tmp="$(mktemp)"
grep -vE "^${KEY}=" "$ENV_FILE" >"$tmp" || true
printf '%s=true\n' "$KEY" >>"$tmp"
mv "$tmp" "$ENV_FILE"
chmod 600 "$ENV_FILE" 2>/dev/null || true
echo "OK: set ${KEY}=true in $ENV_FILE"
