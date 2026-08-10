#!/usr/bin/env bash
#
# build.sh — GoSystem Tax RS Help search portal — full pipeline orchestrator (Agent D)
#
# Pipeline (STRICT ORDER):
#   1. scrape            → data/manifest.json, content/, _raw/
#   2. build_catalog     → data/catalog.json          (facets for /errors/)
#   3. build_site        → site/ pages + assets + index.html + /errors/ + catalog.json
#   4. build_codes_index → site/codes.json
#   5. build_signatures  → site/signatures.json
#   6. install clients   → copy search/*.js into site/assets/
#   7. pagefind index    → site/pagefind/
#
# build_catalog runs BEFORE build_site because build_site wipes site/ and then
# copies data/catalog.json into it.
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
if [ ! -x "$PY" ]; then
  if command -v python3 >/dev/null 2>&1; then
    PY="python3"
  elif command -v python >/dev/null 2>&1; then
    PY="python"
  else
    echo "ERROR: Python not found." >&2
    exit 1
  fi
fi
if ! command -v npx >/dev/null 2>&1; then
  echo "ERROR: 'npx' (Node.js) not found on PATH. Install Node 18+ then run: npm install" >&2
  exit 1
fi

# Canonical full section list (from CONTRACT.md). Used when SECTIONS=all.
FULL_SECTIONS="e-file,import-export,1065,1120,1040,1041,990,5500,706,709"

# --- Section selection --------------------------------------------------------
SECTIONS="${SECTIONS:-e-file}"
if [ "$SECTIONS" = "all" ]; then
  SECTIONS="$FULL_SECTIONS"
fi

log() { printf '\n\033[1;36m==> %s\033[0m\n' "$*"; }

log "Pipeline start — SECTIONS=$SECTIONS"

# 1. Scrape --------------------------------------------------------------------
if [ "${SKIP_SCRAPE:-0}" = "1" ] || [ "${FORCE_SCRAPE:-0}" != "1" -a -f "data/manifest.json" ]; then
  log "[1/7] Skipping live scraping (data/manifest.json exists). Set FORCE_SCRAPE=1 to rescrape."
else
  log "[1/7] Scraping GoSystem Tax RS help (sections: $SECTIONS)"
  "$PY" scraper/scrape.py --sections "$SECTIONS"
fi

# 2. Build catalog facet index -------------------------------------------------
log "[2/7] Building catalog facet index → data/catalog.json"
"$PY" builder/build_catalog.py

# 3. Build static site ---------------------------------------------------------
log "[3/7] Building static site from data/manifest.json + content/ + data/catalog.json"
"$PY" builder/build_site.py

# 4. Build error-code index ----------------------------------------------------
log "[4/7] Building error-code index → site/codes.json"
"$PY" search/build_codes_index.py

# 5. Build deterministic signature index ---------------------------------------
log "[5/7] Building error-signature index → site/signatures.json"
"$PY" search/build_signature_index.py

# 6. Install browser clients ---------------------------------------------------
log "[6/7] Installing browser clients → site/assets/"
mkdir -p site/assets
cp search/search.js site/assets/search.js
cp search/error_matcher.js site/assets/error_matcher.js
cp search/catalog.js site/assets/catalog.js

# 7. Pagefind full-text index --------------------------------------------------
log "[7/7] Building Pagefind full-text index → site/pagefind/"
npx --yes pagefind --site site

log "DONE — deployable static site is in ./site/  (open ./site/index.html)"
