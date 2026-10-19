#!/usr/bin/env bash
# Static validation for fetch path rules (synthetic; no production).
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export HOME="${TMPDIR:-/tmp}/hb-fetch-test-home"
mkdir -p "$HOME/backup-export"
export SSH_ORIGINAL_COMMAND="scp -f /etc/passwd"
if "$SCRIPT_DIR/ssh-forced-fetch.sh" 2>/dev/null; then
  echo "FAIL: should reject SSH_ORIGINAL_COMMAND"
  exit 1
fi
unset SSH_ORIGINAL_COMMAND
ln -sfn /etc/passwd "$HOME/backup-export/LATEST.bundle.tar.age"
if "$SCRIPT_DIR/ssh-forced-fetch.sh" 2>/dev/null; then
  echo "FAIL: should reject path outside backup-export"
  exit 1
fi
echo "PASS ssh-forced-fetch static checks"
