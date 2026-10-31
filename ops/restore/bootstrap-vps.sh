#!/usr/bin/env bash
# HostingBeyond — new VPS bootstrap after disaster (owner-run).
# Uses Desktop backup current/ ciphertext + password-manager .env — not automated secrets.
set -euo pipefail

APP_ROOT="${APP_ROOT:-/srv/apps/hostingbeyond}"
APP_USER="${APP_USER:-hostingbeyond}"
DB_NAME="${DB_NAME:-hostingbeyond_db}"

usage() {
  cat <<'EOF'
Usage (run as root on a fresh Ubuntu VPS):

  export BUNDLE_TAR_AGE=/path/from/desktop/current/ciphertext.bundle.tar.age
  export AGE_IDENTITY_FILE=/path/to/age-identity.txt
  export ENV_FILE=/path/to/production.env.from.vault
  export GIT_COMMIT=optional-from-MIRROR.json-or-server-facts

  bash bootstrap-vps.sh phase-check
  bash bootstrap-vps.sh restore-files
  bash bootstrap-vps.sh restore-db
  bash bootstrap-vps.sh build-app

Phases are separate so you can verify each step. Full narrative:
  ops/windows-backup/templates/README-RECOVERY.md
  docs/DISASTER-RECOVERY-RUNBOOK.md
EOF
}

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "missing command: $1" >&2
    exit 1
  }
}

phase_check() {
  need_cmd node
  need_cmd git
  need_cmd npm
  need_cmd psql
  need_cmd pg_restore
  need_cmd age
  need_cmd tar
  if [ -z "${BUNDLE_TAR_AGE:-}" ] || [ ! -f "$BUNDLE_TAR_AGE" ]; then
    echo "Set BUNDLE_TAR_AGE to current/ciphertext.bundle.tar.age from Desktop backup" >&2
    exit 1
  fi
  if [ -z "${AGE_IDENTITY_FILE:-}" ] || [ ! -f "$AGE_IDENTITY_FILE" ]; then
    echo "Set AGE_IDENTITY_FILE (age identity from password manager)" >&2
    exit 1
  fi
  echo "phase-check OK"
}

restore_files() {
  phase_check
  WORK="${WORK:-/tmp/hb-restore-$$}"
  mkdir -p "$WORK/extracted"
  age -d -i "$AGE_IDENTITY_FILE" -o "$WORK/outer.tar" "$BUNDLE_TAR_AGE"
  tar -xf "$WORK/outer.tar" -C "$WORK/extracted"
  INNER="$(find "$WORK/extracted" -mindepth 1 -maxdepth 1 -type d | head -1)"
  if [ -z "$INNER" ]; then
    echo "could not find inner bundle directory" >&2
    exit 1
  fi
  echo "Inner bundle: $INNER"
  echo "Extract file tars per README-RECOVERY.md (ORBIT_UPLOAD_DIR, public/uploads)."
  echo "Metadata: $INNER/metadata/server-facts.json"
  if [ -f "$INNER/metadata/server-facts.json" ]; then
    cat "$INNER/metadata/server-facts.json"
  fi
}

restore_db() {
  phase_check
  if [ -z "${ENV_FILE:-}" ] || [ ! -f "$ENV_FILE" ]; then
    echo "Set ENV_FILE to production .env from vault before pg_restore" >&2
    exit 1
  fi
  WORK="${WORK:-/tmp/hb-restore-$$}"
  DUMP="$WORK/hostingbeyond.dump"
  if [ ! -f "$DUMP" ]; then
    echo "Decrypt inner hostingbeyond.dump.age first (see README-RECOVERY.md)" >&2
    exit 1
  fi
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
  if [ "${PGDATABASE:-}" != "$DB_NAME" ]; then
    echo "refused: PGDATABASE must be $DB_NAME" >&2
    exit 1
  fi
  echo "Owner must confirm maintenance window before pg_restore."
  pg_restore --no-owner --no-acl -d "$DB_NAME" "$DUMP"
}

build_app() {
  if [ "$(id -un)" != "$APP_USER" ]; then
    echo "Run as: sudo -u $APP_USER -H bash $0 build-app" >&2
    exit 1
  fi
  if [ ! -d "$APP_ROOT/.git" ]; then
    git clone git@github.com:globalorbitnepal/Hostingbeyond.git "$APP_ROOT"
  fi
  cd "$APP_ROOT"
  if [ -n "${GIT_COMMIT:-}" ]; then
    git fetch origin main
    git checkout "$GIT_COMMIT"
  else
    git pull origin main
  fi
  npm ci
  npx prisma generate
  npm run build
  echo "Place .env at $APP_ROOT/.env then: hostingbeyond-ctl restart (owner)"
}

cmd="${1:-}"
case "$cmd" in
  phase-check) phase_check ;;
  restore-files) restore_files ;;
  restore-db) restore_db ;;
  build-app) build_app ;;
  *) usage; exit 2 ;;
esac
