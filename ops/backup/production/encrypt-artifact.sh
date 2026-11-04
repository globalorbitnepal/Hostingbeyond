#!/usr/bin/env bash
# Encrypt a file with age public recipient (no private key on server).
set -euo pipefail

IN="${1:-}"
OUT="${2:-}"
RECIPIENT_FILE="${HB_AGE_RECIPIENT_FILE:-$HOME/.config/hostingbeyond-backup/age-recipient.txt}"

if [ -z "$IN" ] || [ -z "$OUT" ]; then
  echo "encrypt-artifact: usage encrypt-artifact.sh <infile> <outfile.age>" >&2
  exit 2
fi
if [ ! -f "$IN" ]; then
  echo "encrypt-artifact: input missing" >&2
  exit 3
fi
if [ -e "$OUT" ]; then
  echo "encrypt-artifact: output already exists (refusing overwrite)" >&2
  exit 7
fi
if [ ! -f "$RECIPIENT_FILE" ]; then
  echo "encrypt-artifact: recipient file missing (install public age key only)" >&2
  exit 4
fi
command -v age >/dev/null 2>&1 || {
  echo "encrypt-artifact: age not installed on server" >&2
  exit 5
}

RECIPIENT="$(grep -E '^age1[A-Za-z0-9]+$' "$RECIPIENT_FILE" | head -1 | tr -d '\r\n')"
if [ -z "$RECIPIENT" ]; then
  echo "encrypt-artifact: no age1 public recipient line in recipient file" >&2
  exit 6
fi

# shred overwrites a regular file when the filesystem permits it.
# It does not prove bytes are unrecoverable on SSD, snapshots, or copy-on-write storage.
# Success means the path is gone. Exit 8 if a plaintext or partial output path remains.
secure_delete() {
  local target="$1"
  if [ ! -e "$target" ]; then
    return 0
  fi
  shred -u "$target" 2>/dev/null || rm -f "$target"
  if [ -e "$target" ]; then
    echo "encrypt-artifact: cleanup could not remove path" >&2
    return 1
  fi
  return 0
}

CLEANING=0
on_exit() {
  local rc=$?
  if [ "$CLEANING" = 1 ]; then
    exit "$rc"
  fi
  if [ "$rc" -eq 0 ]; then
    return 0
  fi
  CLEANING=1
  secure_delete "$IN" || rc=8
  if [ -n "${OUT:-}" ]; then
    secure_delete "$OUT" || rc=8
  fi
  if [ -e "$IN" ]; then
    rc=8
  fi
  exit "$rc"
}
trap on_exit EXIT

age -r "$RECIPIENT" -o "$OUT" "$IN"
if ! secure_delete "$IN"; then
  echo "encrypt-artifact: plaintext input remained after encryption" >&2
  exit 8
fi
