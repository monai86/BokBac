#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERSION="$(tr -d '[:space:]' < "$ROOT_DIR/VERSION")"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="${1:-$ROOT_DIR/BokBac-export-v3-${VERSION}-v4-4.0.0-$STAMP.zip}"

cd "$ROOT_DIR"

zip -qr "$OUT" . \
  -x '.git/*' \
  -x '.wrangler/*' \
  -x '**/.wrangler/*' \
  -x 'node_modules/*' \
  -x '**/node_modules/*' \
  -x 'dist/*' \
  -x '**/dist/*' \
  -x 'dist-ssr/*' \
  -x '**/dist-ssr/*' \
  -x '__MACOSX/*' \
  -x '**/__MACOSX/*' \
  -x '.DS_Store' \
  -x '**/.DS_Store' \
  -x 'test-results/*' \
  -x '**/test-results/*' \
  -x 'playwright-report/*' \
  -x '**/playwright-report/*' \
  -x 'coverage/*' \
  -x '**/coverage/*' \
  -x '*.pdf' \
  -x '**/*.pdf' \
  -x '*.csv' \
  -x '**/*.csv' \
  -x 'assets/references/local/*' \
  -x 'assets/references/local/**' \
  -x 'scripts/mcm_extract/layout/*' \
  -x 'scripts/mcm_extract/layout/**' \
  -x 'scripts/mcm_extract/raw_tables/*' \
  -x 'scripts/mcm_extract/raw_tables/**' \
  -x 'scripts/mcm_extract/tables/*' \
  -x 'scripts/mcm_extract/tables/**' \
  -x 'scripts/mcm_extract/*.txt' \
  -x '*.log' \
  -x '.env' \
  -x '.env.local' \
  -x '.env.*.local' \
  -x '**/.env' \
  -x '**/.env.local' \
  -x '**/.env.*.local'

printf 'Created %s\n' "$OUT"
