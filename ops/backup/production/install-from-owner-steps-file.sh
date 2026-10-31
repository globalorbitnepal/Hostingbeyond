#!/usr/bin/env bash
# Parse Desktop VPS-OWNER-STEPS.txt (+ optional age recipient file) and run install-desktop-backup-access.sh
set -euo pipefail
STEPS_FILE="${1:-}"
AGE_FILE="${2:-}"
if [ -z "$STEPS_FILE" ] || [ ! -f "$STEPS_FILE" ]; then
  echo "Usage: sudo bash install-from-owner-steps-file.sh /path/to/VPS-OWNER-STEPS.txt [/path/to/backup-recipient.txt]" >&2
  exit 2
fi

strip_forced_prefix() {
  sed 's/^command="[^"]*",no-port-forwarding,no-X11-forwarding,no-agent-forwarding,no-pty //'
}

create_line="$(grep -F 'hostingbeyond-backup-create' "$STEPS_FILE" | head -1 || true)"
fetch_line="$(grep -F 'hostingbeyond-backup-fetch' "$STEPS_FILE" | head -1 || true)"
if [ -z "$create_line" ] || [ -z "$fetch_line" ]; then
  echo "Expected create/fetch key lines in $STEPS_FILE" >&2
  exit 3
fi

create_pub="$(printf '%s\n' "$create_line" | strip_forced_prefix)"
fetch_pub="$(printf '%s\n' "$fetch_line" | strip_forced_prefix)"

age_pub=""
if [ -n "$AGE_FILE" ] && [ -f "$AGE_FILE" ]; then
  age_pub="$(grep -E '^age1' "$AGE_FILE" | head -1 || true)"
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec bash "$SCRIPT_DIR/install-desktop-backup-access.sh" "$create_pub" "$fetch_pub" "$age_pub"
