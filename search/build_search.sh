#!/usr/bin/env bash
#
# build_search.sh — Agent C (Search)
#
# Indexes the built static site into site/pagefind/ using Pagefind, so the
# full-text half of search.js has something to query.
#
# ORDER: run this LAST — AFTER the builder has emitted site/*.html AND after
# build_codes_index.py has written site/codes.json. Pagefind crawls the HTML
# that already exists on disk; if you run it before the site is built the index
# will be empty.
#
# Usage:
#   bash search/build_search.sh                 # indexes ./site (repo default)
#   bash search/build_search.sh /path/to/site   # index a custom output dir
#
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/.." && pwd)"
SITE_DIR="${1:-$ROOT/site}"

if [ ! -d "$SITE_DIR" ]; then
  echo "[build_search] error: site dir not found: $SITE_DIR" >&2
  echo "[build_search]        run the site builder first." >&2
  exit 1
fi

if ! find "$SITE_DIR" -name '*.html' -print -quit | grep -q .; then
  echo "[build_search] error: no .html files under $SITE_DIR — nothing to index." >&2
  echo "[build_search]        run the site builder before Pagefind." >&2
  exit 1
fi

echo "[build_search] indexing $SITE_DIR with Pagefind ..."
# --yes so CI can install pagefind on first use without an interactive prompt.
npx --yes pagefind --site "$SITE_DIR"

echo "[build_search] done -> $SITE_DIR/pagefind/"
