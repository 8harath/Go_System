#!/usr/bin/env python3
"""
build_codes_index.py — Agent C (Search)

Reads ``data/manifest.json`` and writes ``site/codes.json``: a fast client-side
lookup table mapping a NORMALIZED error / form code to the article that
documents it.

================================================================================
NORMALIZATION RULE  (authoritative — ``search.js`` MUST replicate it byte-for-byte)
================================================================================

    normalize(code) = upper-case, then delete every character that is not
                      an ASCII letter (A-Z) or digit (0-9).

    Python :  re.sub(r'[^A-Z0-9]', '', code.upper())
    JS     :  code.toUpperCase().replace(/[^A-Z0-9]/g, '')

Why this rule: it collapses case, whitespace, and ALL separators (hyphens,
spaces, dots, slashes, underscores, ...) into a single canonical token, so a
user can paste a code in any common style and still hit the same key.

    Example — every one of these inputs normalizes to  "F106503702":
        "F1065-037-02"      (canonical TR style)
        "f1065 037 02"      (lower-case, spaces)
        "F1065037-02"       (partial / mangled separators)

Because separators are stripped, the stored keys are separator-free. Prefix
search in ``search.js`` therefore also runs on the separator-free form:
typing "F1065" (-> "F1065") prefix-matches the key "F106503702".

================================================================================
codes.json SCHEMA  (superset of the CONTRACT schema — stays backward compatible)
================================================================================

    {
      "normalize": "<human-readable description of the rule above>",
      "generated_at": "<ISO8601Z>",
      "count": <number of distinct normalized keys>,
      "codes": {
        "<NORMALIZED_CODE>": {
          "title":   "<article title>",     # primary match (CONTRACT fields)
          "url":     "/709/.../page.html",  # LOCAL built-site page (not the TR source)
          "section": "709",
          "matches": [                       # OPTIONAL — present only on collisions
            {"title": ..., "url": ..., "section": ...},
            ...
          ]
        }
      }
    }

Collision handling: the same normalized code can appear in several articles
(e.g. form "4868" is referenced by multiple 709 topics). The CONTRACT's flat
``{title,url,section}`` fields always describe the PRIMARY match (real articles
preferred over category landing pages, then manifest order). When >1 distinct
article shares a code, a ``matches`` array lists them all so ``search.js`` can
surface every hit. Consumers that only understand the flat schema still work.

URL note: ``url`` points at the LOCAL page the builder emits (mirrors the
article ``path``), NOT the Thomson Reuters ``source_url``. This makes clicks go
to our verbatim copy AND lets URLs de-dupe cleanly against Pagefind results,
which index those same local pages.

Usage
-----
    .venv/bin/python search/build_codes_index.py                # real manifest -> site/codes.json
    .venv/bin/python search/build_codes_index.py --manifest X --out Y
    .venv/bin/python search/build_codes_index.py --self-test    # synthetic normalizer proof
"""

from __future__ import annotations

import argparse
import datetime as _dt
import json
import os
import re
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
_ROOT = os.path.dirname(_HERE)  # repo root (search/ -> ..)
if _ROOT not in sys.path:
    sys.path.insert(0, _ROOT)

from builder.jurisdiction import detect_jurisdiction

DEFAULT_MANIFEST = os.path.join(_ROOT, "data", "manifest.json")
DEFAULT_OUT = os.path.join(_ROOT, "site", "codes.json")

# Human-readable rule embedded verbatim into codes.json so the front-end and
# any auditor can read the contract without opening this file.
NORMALIZE_RULE = (
    "Upper-case, then remove every character that is not A-Z or 0-9 "
    "(strips spaces, hyphens, dots, slashes, underscores and all other "
    "punctuation). Example: 'F1065-037-02', 'f1065 037 02', and 'F1065037-02' "
    "all normalize to 'F106503702'. JS equivalent: "
    "code.toUpperCase().replace(/[^A-Z0-9]/g, '')."
)

_NON_ALNUM = re.compile(r"[^A-Z0-9]")


def normalize_code(code: str) -> str:
    """Canonicalize an error/form code. See module docstring for the rule."""
    if code is None:
        return ""
    return _NON_ALNUM.sub("", str(code).upper())


def local_url(article: dict) -> str:
    """LOCAL built-site page URL from an article's ``path`` (mirrors builder)."""
    path = str(article.get("path", "")).strip("/")
    if not path:
        return "/"
    if article.get("is_category"):
        return "/" + path + "/index.html"
    return "/" + path + ".html"


def build_index(articles: list) -> dict:
    """Map normalized code -> ordered list of match dicts (deduped by URL)."""
    index: dict[str, list] = {}
    for art in articles:
        codes = art.get("codes") or []
        if not codes:
            continue
        url = local_url(art)
        j = art.get("jurisdiction") or detect_jurisdiction(art)
        match = {
            "title": art.get("title", ""),
            "url": url,
            "section": art.get("section", ""),
            "jurisdiction": j["label"],
            "jurisdiction_code": j["code"],
            "_is_category": bool(art.get("is_category")),
        }
        for raw in codes:
            key = normalize_code(raw)
            if not key:
                continue
            bucket = index.setdefault(key, [])
            if not any(existing["url"] == url for existing in bucket):
                bucket.append(dict(match))
    return index


def to_codes_json(index: dict) -> dict:
    """Render the internal index into the codes.json ``codes`` object."""
    out: dict[str, dict] = {}
    for key in sorted(index):
        # Real articles (is_category == False) sort before landing pages;
        # ties keep manifest insertion order (stable sort).
        matches = sorted(index[key], key=lambda m: (m["_is_category"],))
        clean = [
            {
                "title": m["title"],
                "url": m["url"],
                "section": m["section"],
                "jurisdiction": m.get("jurisdiction", "General / Federal"),
                "jurisdiction_code": m.get("jurisdiction_code", "General"),
            }
            for m in matches
        ]
        entry = dict(clean[0])  # primary => flat CONTRACT fields
        if len(clean) > 1:
            entry["matches"] = clean
        out[key] = entry
    return out


def build(manifest_path: str, out_path: str) -> dict:
    with open(manifest_path, "r", encoding="utf-8") as fh:
        manifest = json.load(fh)

    articles = manifest.get("articles", [])
    index = build_index(articles)
    codes = to_codes_json(index)

    payload = {
        "normalize": NORMALIZE_RULE,
        "generated_at": _dt.datetime.now(_dt.timezone.utc)
        .isoformat(timespec="seconds")
        .replace("+00:00", "Z"),
        "count": len(codes),
        "codes": codes,
    }

    os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as fh:
        json.dump(payload, fh, indent=2, ensure_ascii=False)
        fh.write("\n")

    return payload


# ---------------------------------------------------------------------------
# Self-test — proves the normalizer with a synthetic e-file-style manifest.
# ---------------------------------------------------------------------------
def _self_test() -> int:
    print("=== build_codes_index.py normalizer self-test ===\n")
    print("Rule:", NORMALIZE_RULE, "\n")

    # Synthetic manifest with codes the real 709 PoC data does not contain,
    # including a deliberate collision (F1065-037-02 in two sections).
    synthetic = {
        "articles": [
            {
                "title": "Fix reject F1065-037-02",
                "path": "1065/e-file/f1065-037-02",
                "section": "1065",
                "is_category": False,
                "codes": ["F1065-037-02"],
            },
            {
                "title": "F1065-037-02 also affects consolidated returns",
                "path": "1120/e-file/f1065-037-02-consolidated",
                "section": "1120",
                "is_category": False,
                "codes": ["f1065 037 02"],  # different spelling, same code
            },
            {
                "title": "Resolve reject R0000-058-01",
                "path": "e-file/r0000-058-01",
                "section": "e-file",
                "is_category": False,
                "codes": ["R0000-058-01"],
            },
            {
                "title": "Business rule X0000-005",
                "path": "e-file/x0000-005",
                "section": "e-file",
                "is_category": False,
                "codes": ["X0000-005"],
            },
            {
                "title": "Individual reject IND-039-01",
                "path": "1040/e-file/ind-039-01",
                "section": "1040",
                "is_category": False,
                "codes": ["IND-039-01"],
            },
            {
                "title": "Transmission error 80004005",
                "path": "e-file/80004005",
                "section": "e-file",
                "is_category": False,
                "codes": ["80004005"],
            },
        ]
    }

    index = build_index(synthetic["articles"])
    codes = to_codes_json(index)

    print("Built keys:", ", ".join(sorted(codes)), "\n")

    # Varied user inputs -> expected normalized key.
    cases = [
        ("F1065-037-02", "F106503702"),
        ("f1065 037 02", "F106503702"),
        ("F1065037-02", "F106503702"),
        ("  f1065-037-02  ", "F106503702"),
        ("f1065.037.02", "F106503702"),
        ("R0000-058-01", "R000005801"),
        ("r0000 058 01", "R000005801"),
        ("r0000/058/01", "R000005801"),
        ("X0000-005", "X0000005"),
        ("x0000005", "X0000005"),
        ("IND-039-01", "IND03901"),
        ("ind_039_01", "IND03901"),
        ("IND03901", "IND03901"),
        ("80004005", "80004005"),
        ("8000 4005", "80004005"),
    ]

    print(f"{'input':<20} {'normalized':<14} {'match?':<7} {'-> title'}")
    print("-" * 78)
    ok = True
    for raw, expected in cases:
        norm = normalize_code(raw)
        hit = codes.get(norm)
        status = "PASS" if norm == expected else "FAIL"
        if norm != expected:
            ok = False
        title = hit["title"] if hit else "(no key)"
        print(f"{raw!r:<20} {norm:<14} {status:<7} {title}")

    # Prefix-search proof (search.js does the same on separator-free keys).
    print("\nPrefix search demo (user types a stem):")
    for stem_raw in ["F1065", "F1065-037", "R0000", "IND", "8000"]:
        stem = normalize_code(stem_raw)
        matched = sorted(k for k in codes if k.startswith(stem))
        print(f"  {stem_raw!r:<14} -> {stem:<12} matches {matched}")

    # Collision proof.
    print("\nCollision demo (F106503702 documented in 2 sections):")
    entry = codes["F106503702"]
    print("  primary:", entry["url"], f"(section {entry['section']})")
    for m in entry.get("matches", []):
        print("   match: ", m["url"], f"(section {m['section']})")

    print("\nRESULT:", "ALL NORMALIZER CASES PASS" if ok else "SOME CASES FAILED")
    return 0 if ok else 1


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(
        description="Build site/codes.json (normalized error-code lookup) from data/manifest.json."
    )
    parser.add_argument("--manifest", default=DEFAULT_MANIFEST, help="path to manifest.json")
    parser.add_argument("--out", default=DEFAULT_OUT, help="output codes.json path")
    parser.add_argument(
        "--self-test",
        action="store_true",
        help="run the synthetic normalizer proof and exit (writes nothing)",
    )
    args = parser.parse_args(argv)

    if args.self_test:
        return _self_test()

    if not os.path.exists(args.manifest):
        print(f"error: manifest not found: {args.manifest}", file=sys.stderr)
        return 1

    payload = build(args.manifest, args.out)
    n_codes = payload["count"]
    n_collisions = sum(1 for v in payload["codes"].values() if "matches" in v)
    print(f"wrote {args.out}")
    print(f"  normalized keys: {n_codes}  (with collisions: {n_collisions})")
    if n_codes == 0:
        print("  note: manifest contains no codes — code lookup will be empty; "
              "search.js still serves Pagefind full-text results.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
