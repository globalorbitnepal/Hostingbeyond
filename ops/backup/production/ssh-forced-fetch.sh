#!/usr/bin/env bash
# Forced SSH command for backup FETCH key only — streams LATEST ciphertext artifact.
set -euo pipefail

if [ -n "${SSH_ORIGINAL_COMMAND:-}" ]; then
  echo "ssh-forced-fetch: client command not permitted" >&2
  exit 1
fi

EXPORT_DIR="${HOME}/backup-export"
LINK="${EXPORT_DIR}/LATEST.bundle.tar.age"
META="${EXPORT_DIR}/LATEST.bundle.meta.json"

if [ ! -L "$LINK" ] && [ ! -f "$LINK" ]; then
  echo "ssh-forced-fetch: no LATEST artifact" >&2
  exit 1
fi

TARGET="$(readlink -f "$LINK" 2>/dev/null || realpath "$LINK")"
case "$TARGET" in
  "${EXPORT_DIR}"/*) ;;
  *)
    echo "ssh-forced-fetch: path refused" >&2
    exit 2
    ;;
esac

if [[ "$TARGET" != *.tar.age ]]; then
  echo "ssh-forced-fetch: suffix refused" >&2
  exit 3
fi

if [ ! -f "$TARGET" ]; then
  echo "ssh-forced-fetch: artifact missing" >&2
  exit 4
fi

# Metadata line on stderr (checksum only — no secrets).
if [ -f "$META" ]; then
  node -e "
const fs=require('fs');
const j=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));
process.stderr.write('HB_ARTIFACT_SHA256='+j.ciphertextSha256+'\n');
process.stderr.write('HB_BACKUP_SET_ID='+j.backupSetId+'\n');
" "$META" 2>/dev/null || true
fi

exec cat "$TARGET"
