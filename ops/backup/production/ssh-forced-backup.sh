#!/usr/bin/env bash
# Forced SSH command for Windows backup key only.
# sshd runs this instead of any command the client requests.
set -euo pipefail

if [ -n "${SSH_ORIGINAL_COMMAND:-}" ]; then
  echo "ssh-forced-backup: client command not permitted" >&2
  exit 1
fi

ROOT="/srv/apps/hostingbeyond"
SCRIPT="$ROOT/ops/backup/production/create-pull-bundle.sh"
if [ ! -x "$SCRIPT" ]; then
  echo "ssh-forced-backup: bundle script missing" >&2
  exit 1
fi
exec "$SCRIPT"
