#!/usr/bin/env bash
# Forced SSH command for backup FETCH key only — streams LATEST ciphertext artifact.
set -euo pipefail

if [ -n "${SSH_ORIGINAL_COMMAND:-}" ]; then
  echo "ssh-forced-fetch: client command not permitted" >&2
  exit 1
fi

EXPORT_DIR="${HOME}/backup-export"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET="$(node "$SCRIPT_DIR/publish-export.mjs" --read-latest "$EXPORT_DIR")" || {
  echo "ssh-forced-fetch: LATEST pointer refused" >&2
  exit 4
}

exec cat "$TARGET"
