#!/usr/bin/env bash
# Install Windows desktop backup SSH keys + age recipient for user hostingbeyond.
# Run on VPS as root or sysadmin with permission to edit /home/hostingbeyond/.ssh/
set -euo pipefail

HB_USER="${HB_USER:-hostingbeyond}"
HB_HOME="$(getent passwd "$HB_USER" | cut -d: -f6)"
APP_ROOT="${APP_ROOT:-/srv/apps/hostingbeyond}"
AGE_RECIPIENT_FILE="${HB_HOME}/.config/hostingbeyond-backup/age-recipient.txt"
AUTH_KEYS="${HB_HOME}/.ssh/authorized_keys"
CREATE_PUB="${1:-}"
FETCH_PUB="${2:-}"
AGE_PUB="${3:-}"

if [ "$(id -un)" != "root" ] && [ ! -w "$AUTH_KEYS" ] 2>/dev/null; then
  echo "Run as root or ensure you can write $AUTH_KEYS" >&2
  exit 1
fi

if [ -z "$CREATE_PUB" ] || [ -z "$FETCH_PUB" ]; then
  cat <<'EOF'
Usage:
  sudo bash install-desktop-backup-access.sh "<create.pub one line>" "<fetch.pub one line>" "[age1... recipient line]"

Paste public keys from Desktop\hostingbeyond\keys\ after running Install-DailyDesktopBackup.ps1 on Windows.
EOF
  exit 2
fi

install -d -m 700 -o "$HB_USER" -g "$HB_USER" "${HB_HOME}/.ssh"
install -d -m 700 -o "$HB_USER" -g "$HB_USER" "${HB_HOME}/.config/hostingbeyond-backup"

BACKUP_CMD="${APP_ROOT}/ops/backup/production/ssh-forced-backup.sh"
FETCH_CMD="${APP_ROOT}/ops/backup/production/ssh-forced-fetch.sh"

append_if_missing() {
  local line="$1"
  if [ -f "$AUTH_KEYS" ] && grep -Fq "${line#command=}" "$AUTH_KEYS" 2>/dev/null; then
    echo "already present: ${line:0:60}..."
    return 0
  fi
  echo "$line" >> "$AUTH_KEYS"
  chown "$HB_USER:$HB_USER" "$AUTH_KEYS"
  chmod 600 "$AUTH_KEYS"
  echo "appended authorized_keys entry"
}

append_if_missing "command=\"${BACKUP_CMD}\",no-port-forwarding,no-X11-forwarding,no-agent-forwarding,no-pty ${CREATE_PUB}"
append_if_missing "command=\"${FETCH_CMD}\",no-port-forwarding,no-X11-forwarding,no-agent-forwarding,no-pty ${FETCH_PUB}"

if [ -n "$AGE_PUB" ]; then
  printf '%s\n' "$AGE_PUB" > "$AGE_RECIPIENT_FILE"
  chown "$HB_USER:$HB_USER" "$AGE_RECIPIENT_FILE"
  chmod 600 "$AGE_RECIPIENT_FILE"
  echo "wrote age recipient"
fi

chmod 755 "${APP_ROOT}/ops/backup/production/ssh-forced-backup.sh" 2>/dev/null || true
chmod 755 "${APP_ROOT}/ops/backup/production/ssh-forced-fetch.sh" 2>/dev/null || true
install -d -m 700 -o "$HB_USER" -g "$HB_USER" "${HB_HOME}/backup-export"

echo "OK: backup SSH + age recipient installed for $HB_USER"
