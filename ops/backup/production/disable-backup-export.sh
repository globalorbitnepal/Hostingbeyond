#!/usr/bin/env bash
# Disable the production backup export window.
# Writes one HOSTINGBEYOND_PRODUCTION_BACKUP_EXPORT_APPROVED=false line.
# Run as hostingbeyond. Never prints .env contents.
# HB_SELFTEST=1 is for the temp-file test only and cannot target production .env.
set -euo pipefail

KEY="HOSTINGBEYOND_PRODUCTION_BACKUP_EXPORT_APPROVED"
PROD_ENV="/srv/apps/hostingbeyond/.env"
APP_ROOT="${APP_ROOT:-/srv/apps/hostingbeyond}"
ENV_FILE="${ENV_FILE:-${APP_ROOT}/.env}"

die() {
  echo "disable-backup-export: $1" >&2
  exit "$2"
}

if [ "${HB_SELFTEST:-}" = "1" ]; then
  case "$ENV_FILE" in
    "$PROD_ENV"|"${APP_ROOT}/.env")
      die "refused (selftest cannot target production env)" 8
      ;;
  esac
else
  if [ "$(id -un)" != "hostingbeyond" ]; then
    die "refused (user)" 4
  fi
fi

if [ ! -f "$ENV_FILE" ]; then
  die "missing env file" 1
fi
if [ -L "$ENV_FILE" ]; then
  die "refused (symlink)" 9
fi

owner="$(stat -c '%U' "$ENV_FILE")"
mode="$(stat -c '%a' "$ENV_FILE")"
if [ "$owner" != "$(id -un)" ]; then
  die "refused (owner)" 5
fi
if [ "$mode" != "600" ]; then
  die "refused (mode ${mode})" 6
fi
env_dir="$(dirname -- "$ENV_FILE")"
if [ ! -w "$ENV_FILE" ] || [ ! -w "$env_dir" ]; then
  die "refused (not writable)" 7
fi

tmp="$(mktemp "${env_dir}/.env.disable.XXXXXX")"
cleanup() {
  if [ -n "${tmp:-}" ] && [ -f "$tmp" ]; then
    rm -f -- "$tmp"
  fi
}
trap cleanup EXIT
chmod 600 "$tmp"

awk -v key="$KEY" '
  {
    trimmed = $0
    sub(/^[ \t\r]+/, "", trimmed)
    if (index(trimmed, key "=") == 1) {
      next
    }
    print
  }
' "$ENV_FILE" >"$tmp"
printf '%s=false\n' "$KEY" >>"$tmp"

chown --reference="$ENV_FILE" "$tmp"
chmod --reference="$ENV_FILE" "$tmp"
mv -f -- "$tmp" "$ENV_FILE"
tmp=""
trap - EXIT

echo "OK: ${KEY}=false"
