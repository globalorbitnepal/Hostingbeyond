#!/usr/bin/env bash
# Production backup bundle for pull-based off-site copy (Windows desktop).
# Run ON the VPS as user hostingbeyond after owner approval.
# Does not delete or modify production source data (read-only file copy + pg_dump).
set -euo pipefail

APP_ROOT="${HB_APP_ROOT:-/srv/apps/hostingbeyond}"
ENV_FILE="${HB_ENV_FILE:-$APP_ROOT/.env}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
RUN_PG=(node "$SCRIPT_DIR/run-with-pg-env.mjs" --env-file "$ENV_FILE" --)

usage() {
  cat <<'EOF'
Usage: create-pull-bundle.sh [--output-dir <dir>]

Creates a timestamped directory (then outer ciphertext for transfer):
  database/hostingbeyond.dump.age   (pg_dump encrypted on server; no plaintext leaves VPS)
  files/*.tar.gz                (upload trees + optional app data paths)
  metadata/*                    (git, prisma, env inventory, server facts)
  checksums/SHA256SUMS
  manifest.json

Stdout on success: absolute path to outer ciphertext
  ~/backup-export/<timestamp>.bundle.tar.age
(inner bundle directory is removed after outer encryption; use ssh-forced-fetch.sh or
 Windows Invoke-HostingBeyondBackup.ps1 for off-site copy — not a plaintext directory path).
Never prints secrets.

Requires: pg_dump, pg_restore, psql, node, tar, sha256sum
EOF
}

OUTPUT_PARENT=""
while [ $# -gt 0 ]; do
  case "$1" in
    --output-dir)
      OUTPUT_PARENT="${2:-}"
      shift 2
      ;;
    -h | --help)
      usage
      exit 0
      ;;
    *)
      echo "create-pull-bundle: unknown arg: $1" >&2
      exit 2
      ;;
  esac
done

if [ "$(id -un)" != "hostingbeyond" ]; then
  echo "create-pull-bundle: must run as hostingbeyond" >&2
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "create-pull-bundle: missing env file" >&2
  exit 1
fi

PREFLIGHT_OUTPUT_PARENT="${OUTPUT_PARENT:-${HOME}/backup-export}"
if ! "$SCRIPT_DIR/export-preflight.sh" \
  --env-file "$ENV_FILE" \
  --app-root "$APP_ROOT" \
  --output-parent "$PREFLIGHT_OUTPUT_PARENT"; then
  echo "create-pull-bundle: preflight failed (export blocked or environment not ready)" >&2
  exit 11
fi

LOCK_DIR="${HOME}/.cache/hostingbeyond-backup"
mkdir -p "$LOCK_DIR"
exec 9>"$LOCK_DIR/create-pull-bundle.lock"
if ! flock -n 9; then
  echo "create-pull-bundle: another export is running" >&2
  exit 3
fi

TS="$(date -u +"%Y-%m-%d_%H-%M-%S")"
if [ -n "$OUTPUT_PARENT" ]; then
  BUNDLE="$OUTPUT_PARENT/$TS"
else
  BUNDLE="${HOME}/backup-export/$TS"
fi
if [ -e "$BUNDLE" ] || [ -e "${HOME}/backup-export/${TS}.bundle.tar.age" ]; then
  echo "create-pull-bundle: backup path already exists (refusing overwrite)" >&2
  exit 13
fi
BUNDLE_OK=0
OUTER_TAR=""
OUTER_AGE=""
META=""
OUTER_PUBLISHED=0

cleanup_on_exit() {
  if [ "$BUNDLE_OK" != "1" ] && [ -n "${BUNDLE:-}" ] && [ -d "$BUNDLE" ]; then
    rm -rf "$BUNDLE"
  fi
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
trap cleanup_on_exit EXIT INT TERM HUP

mkdir -p "$BUNDLE/database" "$BUNDLE/files" "$BUNDLE/metadata" "$BUNDLE/checksums"

DB_NAME="$(node "$SCRIPT_DIR/parse-database-env.mjs" --database-name "$ENV_FILE")" || {
  echo "create-pull-bundle: could not parse DATABASE_URL from env file" >&2
  exit 6
}

if ! "${RUN_PG[@]}" node "$SCRIPT_DIR/assert-production-database.mjs"; then
  echo "create-pull-bundle: refused database target (non-production name)" >&2
  exit 7
fi

if [ "$ENV_FILE" != "$APP_ROOT/.env" ]; then
  echo "create-pull-bundle: ENV_FILE must be $APP_ROOT/.env" >&2
  exit 8
fi

echo "==> Database dump (custom format)"
"${RUN_PG[@]}" pg_dump -Fc --no-owner --no-acl -f "$BUNDLE/database/hostingbeyond.dump"

if ! "${RUN_PG[@]}" pg_restore -l "$BUNDLE/database/hostingbeyond.dump" >/dev/null 2>&1; then
  echo "create-pull-bundle: dump list failed" >&2
  exit 4
fi

DUMP_BYTES="$(stat -c%s "$BUNDLE/database/hostingbeyond.dump" 2>/dev/null || stat -f%z "$BUNDLE/database/hostingbeyond.dump")"
if [ "$DUMP_BYTES" -lt 1024 ]; then
  echo "create-pull-bundle: dump suspiciously small" >&2
  exit 4
fi

echo "==> Encrypt database dump on server (public recipient only)"
if ! "$SCRIPT_DIR/encrypt-artifact.sh" \
  "$BUNDLE/database/hostingbeyond.dump" \
  "$BUNDLE/database/hostingbeyond.dump.age"; then
  echo "create-pull-bundle: database encryption failed" >&2
  exit 10
fi
if [ -f "$BUNDLE/database/hostingbeyond.dump" ]; then
  echo "create-pull-bundle: plaintext dump still present after encryption" >&2
  exit 10
fi

echo "==> Source aggregates (sanitized)"
if node "$SCRIPT_DIR/source-aggregates.mjs" >"$BUNDLE/metadata/source-aggregates.json" 2>/dev/null; then
  echo "aggregates=ok"
else
  echo "aggregates=skipped"
  echo '{}' >"$BUNDLE/metadata/source-aggregates.json"
fi

ORBIT_UPLOAD=""
ORBIT_UPLOAD="$(grep -E '^ORBIT_UPLOAD_DIR=' "$ENV_FILE" | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'" || true)"

pack_dir() {
  local label="$1"
  local dir="$2"
  if [ -d "$dir" ]; then
    # Do not follow symlinks to arbitrary paths; exclude secrets if present.
    tar -czf "$BUNDLE/files/${label}.tar.gz" \
      --exclude=".env" \
      --exclude=".env.*" \
      -C "$(dirname "$dir")" "$(basename "$dir")"
    echo "packed:$label"
  fi
}

pack_dir "orbit_uploads" "${ORBIT_UPLOAD:-/data/hostingbeyond/uploads}"
pack_dir "public_uploads" "$APP_ROOT/public/uploads"
pack_dir "data_uploads" "$APP_ROOT/data/uploads"
pack_dir "data_hostingbeyond" "$APP_ROOT/data/hostingbeyond"

echo "==> Metadata"
GIT_COMMIT="$(git -C "$APP_ROOT" rev-parse HEAD 2>/dev/null || echo unknown)"
GIT_BRANCH="$(git -C "$APP_ROOT" branch --show-current 2>/dev/null || echo unknown)"
NODE_VERSION="$(node -v 2>/dev/null || echo unknown)"
PG_VERSION="$(pg_dump --version 2>/dev/null | head -1 || echo unknown)"

cat >"$BUNDLE/metadata/server-facts.json" <<EOF
{
  "appRoot": "$APP_ROOT",
  "databaseName": "$DB_NAME",
  "gitCommit": "$GIT_COMMIT",
  "gitBranch": "$GIT_BRANCH",
  "nodeVersion": "$NODE_VERSION",
  "pgDumpVersion": "$PG_VERSION",
  "domain": "hosting.theglobalorbit.com",
  "pm2App": "hostingbeyond",
  "listenPort": 3030
}
EOF

node "$SCRIPT_DIR/env-inventory.mjs" "$ENV_FILE" >"$BUNDLE/metadata/env-inventory.json"
tar -czf "$BUNDLE/metadata/prisma-migrations.tar.gz" -C "$APP_ROOT" prisma/schema.prisma prisma/migrations

FILE_COUNT="$(find "$BUNDLE" -type f | wc -l | tr -d ' ')"
TOTAL_BYTES="$(du -sb "$BUNDLE" 2>/dev/null | awk '{print $1}' || du -sk "$BUNDLE" | awk '{print $1 * 1024}')"

if ! node "$REPO_ROOT/ops/backup/dr/build-manifest.mjs" \
  --bundle "$BUNDLE" \
  --timestamp "$TS" \
  --db-name "$DB_NAME" \
  --git-commit "$GIT_COMMIT" \
  --file-count "$FILE_COUNT" \
  --total-bytes "$TOTAL_BYTES"; then
  echo "create-pull-bundle: manifest generation failed" >&2
  exit 9
fi

(
  cd "$BUNDLE"
  {
    find database files metadata -type f -print0 | sort -z | xargs -0 sha256sum
    sha256sum manifest.json
  } >checksums/SHA256SUMS
)

if [ ! -f "$BUNDLE/manifest.json" ] || [ ! -f "$BUNDLE/checksums/SHA256SUMS" ]; then
  echo "create-pull-bundle: incomplete bundle (manifest/checksums)" >&2
  exit 9
fi

EXPORT_ROOT="${HOME}/backup-export"
mkdir -p "$EXPORT_ROOT"
umask 077
OUTER_TAR="${EXPORT_ROOT}/${TS}.bundle.tar"
OUTER_AGE="${OUTER_TAR}.age"
META="${EXPORT_ROOT}/${TS}.bundle.meta.json"

tar -cf "$OUTER_TAR" -C "$(dirname "$BUNDLE")" "$(basename "$BUNDLE")"
if ! "$SCRIPT_DIR/encrypt-artifact.sh" "$OUTER_TAR" "$OUTER_AGE"; then
  echo "create-pull-bundle: outer bundle encryption failed" >&2
  exit 11
fi
OUTER_TAR=""
if [ -f "${EXPORT_ROOT}/${TS}.bundle.tar" ]; then
  echo "create-pull-bundle: plaintext outer tar still present after encryption" >&2
  exit 11
fi

CIPHER_SHA="$(sha256sum "$OUTER_AGE" | awk '{print $1}')"
if ! node "$SCRIPT_DIR/publish-export.mjs" \
  --export-root "$EXPORT_ROOT" \
  --backup-set-id "$TS" \
  --ciphertext "$OUTER_AGE" \
  --ciphertext-sha256 "$CIPHER_SHA"; then
  echo "create-pull-bundle: export publication failed" >&2
  exit 12
fi
OUTER_PUBLISHED=1

rm -rf "$BUNDLE"

BUNDLE_OK=1
trap - EXIT INT TERM HUP
echo "$OUTER_AGE"
