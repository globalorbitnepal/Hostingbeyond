#!/usr/bin/env bash
# Non-destructive preflight for production pull export (fail closed).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_ROOT="${HB_APP_ROOT:-/srv/apps/hostingbeyond}"
ENV_FILE=""
OUTPUT_PARENT=""

while [ $# -gt 0 ]; do
  case "$1" in
    --env-file)
      ENV_FILE="${2:-}"
      shift 2
      ;;
    --app-root)
      APP_ROOT="${2:-}"
      shift 2
      ;;
    --output-parent)
      OUTPUT_PARENT="${2:-}"
      shift 2
      ;;
    -h | --help)
      echo "Usage: export-preflight.sh --env-file <path> [--app-root <path>] [--output-parent <dir>]"
      exit 0
      ;;
    *)
      echo "export-preflight: unknown arg: $1" >&2
      exit 2
      ;;
  esac
done

if [ -z "$ENV_FILE" ]; then
  echo "export-preflight: missing --env-file" >&2
  exit 2
fi

if [ -z "$OUTPUT_PARENT" ]; then
  OUTPUT_PARENT="${HOME}/backup-export"
fi

exec node "$SCRIPT_DIR/export-preflight.mjs" \
  --env-file "$ENV_FILE" \
  --app-root "$APP_ROOT" \
  --output-parent "$OUTPUT_PARENT"
