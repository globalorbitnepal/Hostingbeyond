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

age -r "$RECIPIENT" -o "$OUT" "$IN"
shred -u "$IN" 2>/dev/null || rm -f "$IN"
