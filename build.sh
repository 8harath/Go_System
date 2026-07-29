#!/usr/bin/env bash
#
# build.sh — GoSystem Tax RS Help search portal — full pipeline orchestrator (Agent D)
#
# Pipeline (STRICT ORDER):
#   1. scrape            → data/manifest.json, content/, _raw/
#   2. build_site        → site/ pages + site/assets/styles.css + site/index.html
#   3. build_codes_index → site/codes.json
#   4. install search.js → copy search/search.js into site/assets/
#   5. pagefind index    → site/pagefind/
#
# Idempotent: safe to re-run; every component overwrites its own outputs.
#
# Configurable via env var SECTIONS (default: e-file):
#   SECTIONS=e-file              ./build.sh   # current production corpus (default)
#   SECTIONS=all                 ./build.sh   # all 10 sections (expanded below)
#   SECTIONS=709,706,1040        ./build.sh   # explicit subset
#
set -euo pipefail

# --- Resolve repo root (this script's dir) so it runs from anywhere -----------
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

PY="$ROOT/.venv/bin/python"

# Canonical full section list (from CONTRACT.md). Used when SECTIONS=all.
FULL_SECTIONS="e-file,import-export,1065,1120,1040,1041,990,5500,706,709"

# --- Section selection --------------------------------------------------------
SECTIONS="${SECTIONS:-e-file}"
if [ "$SECTIONS" = "all" ]; then
  SECTIONS="$FULL_SECTIONS"
fi

log() { printf '\n\033[1;36m==> %s\033[0m\n' "$*"; }

# --- Preflight checks (fail fast) ---------------------------------------------
if [ ! -x "$PY" ]; then
  echo "ERROR: Python venv not found at: $PY" >&2
  echo "  Create it and install deps:" >&2
  echo "    python3 -m venv .venv && .venv/bin/pip install -r requirements.txt" >&2
  exit 1
fi
if ! command -v npx >/dev/null 2>&1; then
  echo "ERROR: 'npx' (Node.js) not found on PATH. Install Node 18+ then run: npm install" >&2
  exit 1
fi

log "Pipeline start — SECTIONS=$SECTIONS"

# 1. Scrape --------------------------------------------------------------------
log "[1/5] Scraping GoSystem Tax RS help (sections: $SECTIONS)"
"$PY" scraper/scrape.py --sections "$SECTIONS"

# 2. Build static site ---------------------------------------------------------
log "[2/5] Building static site from data/manifest.json + content/"
"$PY" builder/build_site.py

# 3. Build error-code index ----------------------------------------------------
log "[3/6] Building error-code index → site/codes.json"
"$PY" search/build_codes_index.py

# 4. Build deterministic signature index ---------------------------------------
log "[4/6] Building error-signature index → site/signatures.json"
"$PY" search/build_signature_index.py

# 5. Install search client -----------------------------------------------------
log "[5/6] Installing search client → site/assets/"
mkdir -p site/assets
cp search/search.js site/assets/search.js
cp search/error_matcher.js site/assets/error_matcher.js

# 6. Pagefind full-text index --------------------------------------------------
log "[6/6] Building Pagefind full-text index → site/pagefind/"
npx --yes pagefind --site site

log "DONE — deployable static site is in ./site/  (open ./site/index.html)"
