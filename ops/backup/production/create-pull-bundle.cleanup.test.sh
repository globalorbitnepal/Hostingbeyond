#!/usr/bin/env bash
# Regression: unpublished outer export paths are removed; published paths are kept.
set -euo pipefail

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

OUTER_TAR="$TMP/2026-01-01_00-00-00.bundle.tar"
OUTER_AGE="$TMP/2026-01-01_00-00-00.bundle.tar.age"
META="$TMP/2026-01-01_00-00-00.bundle.meta.json"
OUTER_PUBLISHED=0

printf 'plaintext-outer' >"$OUTER_TAR"
printf 'cipher' >"$OUTER_AGE"
printf '{}' >"$META"

cleanup_on_exit() {
  if [ "$OUTER_PUBLISHED" != "1" ]; then
    if [ -n "$OUTER_TAR" ] && [ -f "$OUTER_TAR" ]; then
      rm -f "$OUTER_TAR"
    fi
    if [ -n "$OUTER_AGE" ] && [ -f "$OUTER_AGE" ]; then
      rm -f "$OUTER_AGE"
    fi
    if [ -n "$META" ] && [ -f "$META" ]; then
      rm -f "$META"
    fi
  fi
}

cleanup_on_exit
test ! -f "$OUTER_TAR"
test ! -f "$OUTER_AGE"
test ! -f "$META"

# After successful outer encrypt, create-pull-bundle.sh clears OUTER_TAR before publication.
OUTER_TAR=""
printf 'cipher' >"$OUTER_AGE"
printf '{}' >"$META"
OUTER_PUBLISHED=1
cleanup_on_exit
test -f "$OUTER_AGE"
test -f "$META"

echo "PASS create-pull-bundle cleanup semantics"
