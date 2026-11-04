#!/usr/bin/env bash
# Temp-file tests for enable-backup-export.sh. Never reads production .env.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
SCRIPT="$ROOT/enable-backup-export.sh"
APPROVAL="$ROOT/export-approval.mjs"
KEY="HOSTINGBEYOND_PRODUCTION_BACKUP_EXPORT_APPROVED"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

run_enable() {
  HB_SELFTEST=1 ENV_FILE="$1" bash "$SCRIPT"
}

assert_approved() {
  local file="$1"
  local out
  set +e
  out="$(node "$APPROVAL" "$file" 2>&1)"
  local code=$?
  set -e
  test "$code" -eq 0
  printf '%s' "$out" | grep -q 'EXPORT_APPROVED'
}

missing="$TMP/missing.env"
printf 'DATABASE_URL=postgresql://example\nMAIL_FROM=ops@example.test\n' >"$missing"
chmod 600 "$missing"
run_enable "$missing" >/dev/null
grep -qx 'DATABASE_URL=postgresql://example' "$missing"
grep -qx 'MAIL_FROM=ops@example.test' "$missing"
test "$(grep -c "^${KEY}=" "$missing")" -eq 1
grep -qx "${KEY}=true" "$missing"
assert_approved "$missing"

dup="$TMP/dup.env"
printf '%s\n' \
  "${KEY}=false" \
  'OTHER=keep-me' \
  "${KEY}=true" \
  "  ${KEY}=1" \
  >"$dup"
chmod 600 "$dup"
run_enable "$dup" >/dev/null
test "$(grep -c "${KEY}=" "$dup")" -eq 1
grep -qx 'OTHER=keep-me' "$dup"
grep -qx "${KEY}=true" "$dup"
assert_approved "$dup"

already="$TMP/already.env"
printf '%s\n' 'UNRELATED_SECRET=fixture-secret-value' "${KEY}=true" >"$already"
chmod 600 "$already"
run_enable "$already" >/dev/null
test "$(grep -c "^${KEY}=" "$already")" -eq 1
grep -qx "${KEY}=true" "$already"
grep -qx 'UNRELATED_SECRET=fixture-secret-value' "$already"
assert_approved "$already"

secret="$TMP/secret.env"
printf '%s\n' 'API_TOKEN=do-not-print-this-token' "${KEY}=false" >"$secret"
chmod 600 "$secret"
before_mode="$(stat -c '%a' "$secret")"
before_owner="$(stat -c '%U' "$secret")"
output="$(run_enable "$secret" 2>&1)"
printf '%s' "$output" | grep -q "OK: ${KEY}=true"
if printf '%s' "$output" | grep -q 'do-not-print-this-token'; then
  echo "secret leaked to output" >&2
  exit 1
fi
test "$(stat -c '%a' "$secret")" = "$before_mode"
test "$(stat -c '%U' "$secret")" = "$before_owner"
test "$(stat -c '%a' "$secret")" = "600"
test ! -e "$TMP/.env.enable."*
assert_approved "$secret"

loose="$TMP/loose.env"
printf '%s\n' "${KEY}=false" 'KEEP=1' >"$loose"
chmod 644 "$loose"
set +e
loose_out="$(HB_SELFTEST=1 ENV_FILE="$loose" bash "$SCRIPT" 2>&1)"
loose_code=$?
set -e
test "$loose_code" -eq 6
printf '%s' "$loose_out" | grep -q 'refused (mode 644)'
grep -qx "${KEY}=false" "$loose"

set +e
user_out="$(ENV_FILE="$secret" bash "$SCRIPT" 2>&1)"
user_code=$?
set -e
if [ "$(id -un)" != "hostingbeyond" ]; then
  test "$user_code" -eq 4
  printf '%s' "$user_out" | grep -q 'refused (user)'
fi

set +e
prod_out="$(HB_SELFTEST=1 ENV_FILE=/srv/apps/hostingbeyond/.env bash "$SCRIPT" 2>&1)"
prod_code=$?
set -e
test "$prod_code" -eq 8
printf '%s' "$prod_out" | grep -q 'selftest cannot target production env'

echo "PASS enable-backup-export"
