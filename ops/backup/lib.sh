#!/usr/bin/env bash
# Shared helpers for HostingBeyond backup scripts. Never prints secrets.
set -euo pipefail

die() {
  echo "hostingbeyond-backup: $*" >&2
  exit 1
}

# Production runtime .env — backups via these scripts are blocked (use provider snapshots separately).
is_blocked_production_env_file() {
  local f
  f="$(readlink -f "$1" 2>/dev/null || realpath "$1" 2>/dev/null || echo "$1")"
  case "$f" in
    /srv/apps/hostingbeyond/.env | /srv/apps/hostingbeyond/.env.*)
      return 0
      ;;
  esac
  return 1
}

# Extract DATABASE_URL without echoing it (requires node).
database_url_from_env_file() {
  local env_file="$1"
  ENV_FILE="$env_file" node <<'NODE'
const fs = require("fs");
const path = process.env.ENV_FILE;
const text = fs.readFileSync(path, "utf8");
let url = "";
for (const line of text.split("\n")) {
  const m = line.match(/^DATABASE_URL=(.*)$/);
  if (!m) continue;
  let v = m[1].trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1);
  }
  url = v;
  break;
}
if (!url) process.exit(2);
process.stdout.write(url);
NODE
}

# pg_dump/psql/pg_restore reject Prisma's ?schema= query parameter.
pg_database_url_from_env_file() {
  local env_file="$1"
  DATABASE_URL="$(database_url_from_env_file "$env_file")" node <<'NODE'
try {
  const u = new URL(process.env.DATABASE_URL);
  u.search = "";
  process.stdout.write(u.toString());
} catch {
  process.exit(4);
}
NODE
}

database_name_from_url() {
  DATABASE_URL="$1" node <<'NODE'
try {
  const u = new URL(process.env.DATABASE_URL);
  const db = u.pathname.replace(/^\//, "").split("?")[0];
  process.stdout.write(db || "");
} catch {
  process.exit(3);
}
NODE
}

timestamp_utc() {
  date -u +"%Y%m%dT%H%M%SZ"
}
