#!/usr/bin/env bash
# Production backup bundle for pull-based off-site copy (Windows desktop).
# Run ON the VPS as user hostingbeyond after owner approval.
# Does not delete or modify production source data (read-only file copy + pg_dump).
set -euo pipefail

APP_ROOT="${HB_APP_ROOT:-/srv/apps/hostingbeyond}"
ENV_FILE="${HB_ENV_FILE:-$APP_ROOT/.env}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

usage() {
  cat <<'EOF'
Usage: create-pull-bundle.sh [--output-dir <dir>]

Creates a timestamped directory (then outer ciphertext for transfer):
  database/hostingbeyond.dump.age   (pg_dump encrypted on server; no plaintext leaves VPS)
  files/*.tar.gz                (upload trees + optional app data paths)
  metadata/*                    (git, prisma, env inventory, server facts)
  checksums/SHA256SUMS
  manifest.json

Stdout: absolute path to bundle directory (for SCP/rsync).
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
BUNDLE_OK=0
cleanup_bundle() {
  if [ "$BUNDLE_OK" != "1" ] && [ -n "${BUNDLE:-}" ] && [ -d "$BUNDLE" ]; then
    rm -rf "$BUNDLE"
  fi
}
trap cleanup_bundle EXIT INT TERM HUP

mkdir -p "$BUNDLE/database" "$BUNDLE/files" "$BUNDLE/metadata" "$BUNDLE/checksums"

export PGHOST PGPORT PGUSER PGPASSWORD PGDATABASE
eval "$(ENV_FILE="$ENV_FILE" node <<'NODE'
const fs = require("fs");
const envPath = process.env.ENV_FILE;
const text = fs.readFileSync(envPath, "utf8");
let raw = "";
for (const line of text.split("\n")) {
  const m = line.match(/^DATABASE_URL=(.*)$/);
  if (!m) continue;
  let v = m[1].trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1);
  }
  raw = v;
  break;
}
if (!raw) process.exit(2);
const u = new URL(raw);
const sp = new URLSearchParams(u.search);
for (const k of ["schema", "connection_limit", "pool_timeout", "socket_timeout", "pgbouncer"]) {
  sp.delete(k);
}
let pghost = u.hostname || "";
if (pghost.startsWith("[") && pghost.endsWith("]")) pghost = pghost.slice(1, -1);
function sh(n, val) { return `export ${n}=${JSON.stringify(val)}\n`; }
let out = "";
out += sh("PGHOST", pghost);
out += sh("PGPORT", u.port || "5432");
out += sh("PGUSER", decodeURIComponent(u.username || ""));
out += sh("PGPASSWORD", decodeURIComponent(u.password || ""));
out += sh("PGDATABASE", decodeURIComponent(u.pathname.replace(/^\//, "") || ""));
const sslmode = sp.get("sslmode");
if (sslmode) out += sh("PGSSLMODE", sslmode);
process.stdout.write(out);
NODE
)"

DB_NAME="${PGDATABASE:-unknown}"

if ! PGDATABASE="$DB_NAME" node "$SCRIPT_DIR/assert-production-database.mjs"; then
  echo "create-pull-bundle: refused database target (non-production name)" >&2
  exit 7
fi

if [ "$ENV_FILE" != "$APP_ROOT/.env" ]; then
  echo "create-pull-bundle: ENV_FILE must be $APP_ROOT/.env" >&2
  exit 8
fi

echo "==> Database dump (custom format)"
pg_dump -Fc --no-owner --no-acl -f "$BUNDLE/database/hostingbeyond.dump"

if ! pg_restore -l "$BUNDLE/database/hostingbeyond.dump" >/dev/null 2>&1; then
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
OUTER_TAR="${EXPORT_ROOT}/${TS}.bundle.tar"
OUTER_AGE="${OUTER_TAR}.age"
META="${EXPORT_ROOT}/${TS}.bundle.meta.json"

tar -cf "$OUTER_TAR" -C "$(dirname "$BUNDLE")" "$(basename "$BUNDLE")"
if ! "$SCRIPT_DIR/encrypt-artifact.sh" "$OUTER_TAR" "$OUTER_AGE"; then
  echo "create-pull-bundle: outer bundle encryption failed" >&2
  exit 11
fi

CIPHER_SHA="$(sha256sum "$OUTER_AGE" | awk '{print $1}')"
node -e "
const fs=require('fs');
const j={
  backupSetId: process.argv[1],
  ciphertextPath: process.argv[2],
  ciphertextSha256: process.argv[3],
  encryption: 'age',
  plaintextDatabaseOnServer: false,
  createdAt: new Date().toISOString()
};
fs.writeFileSync(process.argv[4], JSON.stringify(j,null,2));
" "$TS" "$OUTER_AGE" "$CIPHER_SHA" "$META"

ln -sfn "$OUTER_AGE" "${EXPORT_ROOT}/LATEST.bundle.tar.age"
ln -sfn "$META" "${EXPORT_ROOT}/LATEST.bundle.meta.json"

rm -rf "$BUNDLE"

BUNDLE_OK=1
trap - EXIT INT TERM HUP
echo "$OUTER_AGE"
