#!/usr/bin/env python3
"""
build_catalog.py — facet index for the browsable error catalog (/errors/).

Reads  : data/manifest.json + content/**/*.md
Writes : data/catalog.json

`build_site.py` consumes this file to render the catalog page, the static
per-jurisdiction and per-return-type index pages, and to copy the payload to
site/catalog.json for the client-side filter. It runs BEFORE build_site.py
because build_site.py wipes site/ — hence the output lives in data/, not site/.

================================================================================
catalog.json SCHEMA
================================================================================

    {
      "generated_at": "<ISO8601Z>",
      "count":        <number of rows>,
      "categories":   <number of manifest records excluded as topic indexes>,
      "fields":       ["title", "url", "code", "j", "r", "t", "g", "excerpt"],
      "jurisdictions": [ {code, label, short, type, slug, count}, ... ],
      "returns":       [ {code, label, slug, count}, ... ],
      "types":         [ {code, label, count}, ... ],
      "groups":        [ {code, label, count}, ... ],
      "rows": [
        [ "<title>", "<url>", "<primary code|''>", <jIdx>, <rIdx>, <tIdx>, <gIdx>, "<excerpt|''>" ],
        ...
      ]
    }

Rows are positional arrays rather than objects purely for payload size: the
catalog ships every row to the browser so filtering is instant and offline, and
the columnar form roughly halves the transfer.

================================================================================
FACET DERIVATION  (all deterministic, all from scraped text)
================================================================================

jurisdiction  Delegated to builder.jurisdiction.detect_jurisdiction — the same
              classifier the article pages, codes index and signature index use,
              so a row's jurisdiction always agrees with its article page.

return type   The tax return the article is about, read off the breadcrumb /
              path rather than guessed from the body:
                "1065 e-file errors"  -> 1065
                "1040 returns"        -> 1040
                "e-file 1042 returns" -> 1042
                "<n>-e-file-errors"   -> n     (path segment fallback)
              Articles with no return signal land in "Any return".

error type    Structural classification of *what went wrong*, matched against
              the title plus the full article body, most specific pattern first.
              This deliberately mirrors error_matcher.js's classifyErrorKind
              vocabulary so the catalog's "Error type" filter and the resolver's
              signature chips name the same things. Anything unmatched is
              reported as "Not classified" rather than being forced into a
              bucket — an honest empty is more useful than a wrong label.

group         The topical area, from the breadcrumb node under the section.
              Every "<n> e-file errors" node collapses into "E-file rejections"
              because the return-type facet already carries the number.

Usage
-----
    .venv/bin/python builder/build_catalog.py                 # -> data/catalog.json
    .venv/bin/python builder/build_catalog.py --manifest X --out Y
    .venv/bin/python builder/build_catalog.py --report         # print facet counts
"""

from __future__ import annotations

import argparse
import datetime as _dt
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from builder.jurisdiction import detect_jurisdiction

DEFAULT_MANIFEST = ROOT / "data" / "manifest.json"
DEFAULT_OUT = ROOT / "data" / "catalog.json"

EXCERPT_LIMIT = 190

# --------------------------------------------------------------------------- #
# Return type
# --------------------------------------------------------------------------- #
_RE_CRUMB_ERRORS = re.compile(r"^(\d{3,4})\s+e-?file\s+errors$", re.I)
_RE_CRUMB_RETURNS = re.compile(r"^(?:e-?file\s+)?(\d{3,4})\s+returns$", re.I)
_RE_PATH_ERRORS = re.compile(r"^(\d{3,4})-e-?file-errors$", re.I)

# Ordered so the label reads the way a preparer would say it.
RETURN_LABELS = {
    "1040": "Form 1040 — Individual",
    "1041": "Form 1041 — Estates & trusts",
    "1042": "Form 1042 — Withholding",
    "1065": "Form 1065 — Partnership",
    "1120": "Form 1120 — Corporation",
    "5500": "Form 5500 — Employee benefit",
    "706": "Form 706 — Estate tax",
    "709": "Form 709 — Gift tax",
    "990": "Form 990 — Exempt organization",
}
RETURN_ORDER = ["1040", "1041", "1065", "1120", "990", "1042", "709", "706", "5500"]


def detect_return(article: dict) -> str:
    """The tax return an article concerns, or "" when it applies to any return."""
    for crumb in article.get("breadcrumb", []):
        text = str(crumb).strip()
        found = _RE_CRUMB_ERRORS.match(text) or _RE_CRUMB_RETURNS.match(text)
        if found:
            return found.group(1)
    for seg in str(article.get("path", "")).split("/"):
        found = _RE_PATH_ERRORS.match(seg)
        if found:
            return found.group(1)
    # A bare numeric section (the non-e-file corpora: 709, 706, 1040, ...).
    section = str(article.get("section", ""))
    if re.fullmatch(r"\d{3,4}", section):
        return section
    return ""


# --------------------------------------------------------------------------- #
# Error type
# --------------------------------------------------------------------------- #
# Order matters: the first pattern to match wins, so the most specific
# structural failures are listed before the general ones.
ERROR_TYPES: list[tuple[str, str, str]] = [
    (
        "missing-data",
        "Missing required data",
        r"(?:data is missing|is missing from|must be present|is required(?:\s|,|\.|$)"
        r"|required (?:element|field|entry)|incomplete content"
        r"|list of possible elements expected|cannot be blank|must be entered)",
    ),
    (
        "unexpected-data",
        "Unexpected data",
        r"(?:is unexpected|not allowed|should not be (?:present|entered|used)"
        r"|must not be (?:present|entered)|remove the)",
    ),
    (
        "invalid-choice",
        "Invalid allowed value",
        r"(?:enumeration constraint|invalid according to its datatype"
        r"|not valid according to its datatype|must be one of)",
    ),
    (
        "invalid-format",
        "Invalid format or data type",
        r"(?:data format is not correct|format is not correct|pattern constraint"
        r"|invalid character|must be numeric|must be formatted|invalid datatype)",
    ),
    (
        "duplicate",
        "Duplicate filing",
        r"(?:duplicate|already been (?:filed|accepted|transmitted)|already exists)",
    ),
    (
        "rule-mismatch",
        "Value or total mismatch",
        r"(?:must equal|must match|must be equal|must agree|does not match|does not equal"
        r"|cannot exceed|must be (?:greater|less)|sum of|must be the same)",
    ),
    (
        "schema-validation",
        "Schema validation failure",
        r"(?:schema validation|failed schema|xml (?:data )?(?:has )?failed)",
    ),
    # Residual bucket. Everything here is recognisably a rejection but carries no
    # structural signal we can name, so the label says exactly that rather than
    # implying a diagnosis the text does not support.
    (
        "rejected",
        "General rejection",
        r"(?:\breject(?:ed|ion)?\b|\bdiagnostic\b|e-?file error)",
    ),
]
ERROR_TYPES_COMPILED = [(code, label, re.compile(pat, re.I)) for code, label, pat in ERROR_TYPES]
UNCLASSIFIED = ("unclassified", "Not classified")


def detect_error_type(title: str, body: str) -> str:
    haystack = f"{title}\n{body}"
    for code, _label, pattern in ERROR_TYPES_COMPILED:
        if pattern.search(haystack):
            return code
    return UNCLASSIFIED[0]


# --------------------------------------------------------------------------- #
# Topical group
# --------------------------------------------------------------------------- #
GROUP_RENAME = {
    "gosystem tax rs federal and state e-filing information": "Federal & state e-file information",
    "create and transmit e-files": "Create & transmit e-files",
    "review and track e-files": "Review & track e-files",
    "signature and pin": "Signature & PIN",
    "e-file state returns": "State e-filing setup",
    "apply to e-file": "Apply to e-file",
    "attachments": "Attachments",
    "common e-file errors": "Common e-file errors",
}
REJECTION_GROUP = "E-file rejections"


def detect_group(article: dict) -> str:
    """Topical area, from the breadcrumb node directly under the section."""
    crumbs = [str(c).strip() for c in article.get("breadcrumb", [])]
    node = crumbs[2] if len(crumbs) > 2 else ""
    if not node:
        return "Other help topics"
    low = node.lower()
    if _RE_CRUMB_ERRORS.match(node) or _RE_CRUMB_RETURNS.match(node):
        return REJECTION_GROUP
    return GROUP_RENAME.get(low, node[:1].upper() + node[1:])


# --------------------------------------------------------------------------- #
# Codes and excerpts
# --------------------------------------------------------------------------- #
_RE_TITLE_CODE = re.compile(
    r"^\s*([A-Z][A-Z0-9]{1,12}(?:-[A-Z0-9]{1,6})+|\d{4,6})\s+e-?file\s+(?:error|diagnostic)",
    re.I,
)
_RE_MEF_CODE = re.compile(r"[A-Z][A-Z0-9]{1,12}(?:-[A-Z0-9]{1,6})+")
_RE_MD_NOISE = re.compile(r"^\s*(?:#{1,6}\s|\||!\[|\[!\[|>\s|-{3,}\s*$|\*{3,}\s*$)")
_RE_MD_LINK = re.compile(r"\[([^\]]*)\]\([^)]*\)")
# Emphasis markers become a space, not nothing: the scraped Markdown frequently
# runs a bold UI control straight into the surrounding sentence
# ("...is populated**Attach** the detail"), and deleting the asterisks would
# weld the words together. Underscores and backticks are stripped without a
# space because in this corpus they sit inside identifiers (Return_Header),
# where an inserted space would corrupt a field name.
_RE_MD_EMPHASIS = re.compile(r"\*+")
_RE_MD_STRIP = re.compile(r"[`_]{1,}(?=\W|$)|(?<=\W)[`_]{1,}|`")
_RE_SPACES = re.compile(r"\s{2,}")


def primary_code(article: dict) -> str:
    """The article's own reject code, when it has one.

    The manifest's `codes` list is a harvest of every code-shaped token in the
    body, so it is full of publication numbers, tax years and placeholders
    ("0654", "2023", "0000000") and its order means nothing — reading codes[0]
    labels articles with the wrong code. Two trustworthy signals instead:

      1. The article's own subject code in its "<CODE> e-file error" title. This
         is the only place a bare-numeric state code (000054) is accepted, which
         is the same rule build_signature_index.py documents.
      2. Failing that, the first manifest code matching the dashed MeF shape —
         an upper-case mnemonic plus "-<ALNUM>" segments, with at least three
         digits overall. That admits F1065-037-02 and X0000-005 while rejecting
         the bare numbers above.

    Articles with no reject code return "" and are filterable as such; that is
    accurate rather than guessed.
    """
    title = str(article.get("title", "")).replace("\xa0", " ")
    found = _RE_TITLE_CODE.match(title)
    if found:
        return found.group(1).upper()
    for code in article.get("codes") or []:
        text = str(code).strip().upper()
        if _RE_MEF_CODE.fullmatch(text) and sum(ch.isdigit() for ch in text) >= 3:
            return text
    return ""


def read_excerpt(md_path: str | None) -> str:
    """First meaningful prose line of an article body, trimmed for a list row."""
    if not md_path:
        return ""
    path = ROOT / md_path
    if not path.exists():
        return ""
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.replace(" ", " ").strip()
        if len(line) < 25 or _RE_MD_NOISE.match(line):
            continue
        line = _RE_MD_LINK.sub(lambda m: m.group(1), line)
        line = _RE_MD_EMPHASIS.sub(" ", line)
        line = _RE_MD_STRIP.sub("", line)
        line = _RE_SPACES.sub(" ", line).strip()
        if len(line) < 25:
            continue
        if len(line) > EXCERPT_LIMIT:
            cut = line[:EXCERPT_LIMIT].rsplit(" ", 1)[0]
            line = cut + "…"
        return line
    return ""


def read_body(md_path: str | None) -> str:
    if not md_path:
        return ""
    path = ROOT / md_path
    if not path.exists():
        return ""
    return path.read_text(encoding="utf-8").replace(" ", " ")


# A row's title is worth showing on its own when it describes the problem. When
# it is only a code ("F990PF-905-01 e-file error") the row needs the excerpt to
# be scannable, so we ship one. Skipping the rest keeps catalog.json small.
def title_is_descriptive(title: str, code: str) -> bool:
    stripped = title.replace(" ", " ").strip()
    if code and _RE_TITLE_CODE.match(stripped):
        return False
    return len(stripped) >= 46


def slugify(text: str) -> str:
    return re.sub(r"-{2,}", "-", re.sub(r"[^a-z0-9]+", "-", text.lower())).strip("-")


# --------------------------------------------------------------------------- #
# Build
# --------------------------------------------------------------------------- #
def build(manifest_path: Path) -> dict:
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    articles = manifest["articles"]

    rows: list[list] = []
    jurisdictions: dict[str, dict] = {}
    returns: dict[str, int] = {}
    types: dict[str, int] = {}
    groups: dict[str, int] = {}
    categories = 0

    for article in articles:
        # Category pages are navigation, not errors. They stay reachable through
        # breadcrumbs and the section indexes; listing them here would pad the
        # catalog with rows that have no fix to read.
        if article.get("is_category"):
            categories += 1
            continue

        jurisdiction = detect_jurisdiction(article)
        j_code = jurisdiction["code"]
        if j_code not in jurisdictions:
            jurisdictions[j_code] = {
                "code": j_code,
                "label": jurisdiction["label"],
                "short": jurisdiction["short"],
                "type": jurisdiction["type"],
                "slug": jurisdiction["slug"],
                "count": 0,
            }
        jurisdictions[j_code]["count"] += 1

        ret = detect_return(article)
        returns[ret] = returns.get(ret, 0) + 1

        title = str(article.get("title", "")).replace(" ", " ").strip()
        code = primary_code(article)
        body = read_body(article.get("content_md"))
        err_type = detect_error_type(title, body)
        types[err_type] = types.get(err_type, 0) + 1

        group = detect_group(article)
        groups[group] = groups.get(group, 0) + 1

        excerpt = "" if title_is_descriptive(title, code) else read_excerpt(article.get("content_md"))

        rows.append(
            {
                "title": title,
                "url": f"/{article['path']}.html",
                "code": code,
                "j": j_code,
                "r": ret,
                "t": err_type,
                "g": group,
                "excerpt": excerpt,
            }
        )

    # ---- ordered facet tables (indices below refer to these) --------------- #
    def jurisdiction_sort(entry: dict) -> tuple:
        rank = {"Federal": 0, "General": 1}.get(entry["code"], 2)
        return (rank, entry["label"])

    j_list = sorted(jurisdictions.values(), key=jurisdiction_sort)

    r_list = []
    for code in RETURN_ORDER:
        if code in returns:
            r_list.append({"code": code, "label": RETURN_LABELS[code], "slug": code, "count": returns[code]})
    for code in sorted(k for k in returns if k and k not in RETURN_LABELS):
        r_list.append({"code": code, "label": f"Form {code}", "slug": code, "count": returns[code]})
    if "" in returns:
        r_list.append({"code": "any", "label": "Any return", "slug": "any", "count": returns[""]})

    t_list = [
        {"code": code, "label": label, "count": types[code]}
        for code, label, _ in ERROR_TYPES
        if types.get(code)
    ]
    if types.get(UNCLASSIFIED[0]):
        t_list.append({"code": UNCLASSIFIED[0], "label": UNCLASSIFIED[1], "count": types[UNCLASSIFIED[0]]})

    g_list = sorted(
        ({"code": slugify(name), "label": name, "count": count} for name, count in groups.items()),
        key=lambda entry: (-entry["count"], entry["label"]),
    )

    j_index = {entry["code"]: i for i, entry in enumerate(j_list)}
    r_index = {entry["code"]: i for i, entry in enumerate(r_list)}
    t_index = {entry["code"]: i for i, entry in enumerate(t_list)}
    g_index = {entry["label"]: i for i, entry in enumerate(g_list)}

    packed = [
        [
            row["title"],
            row["url"],
            row["code"],
            j_index[row["j"]],
            r_index[row["r"] or "any"],
            t_index[row["t"]],
            g_index[row["g"]],
            row["excerpt"],
        ]
        for row in rows
    ]
    # Code-bearing rows first, then alphabetical: the default view leads with the
    # reject codes people arrive holding.
    packed.sort(key=lambda r: (r[2] == "", r[2], r[0].lower()))

    return {
        "generated_at": _dt.datetime.now(_dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "count": len(packed),
        "categories": categories,
        "fields": ["title", "url", "code", "j", "r", "t", "g", "excerpt"],
        "jurisdictions": j_list,
        "returns": r_list,
        "types": t_list,
        "groups": g_list,
        "rows": packed,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Build the error catalog facet index.")
    parser.add_argument("--manifest", default=str(DEFAULT_MANIFEST))
    parser.add_argument("--out", default=str(DEFAULT_OUT))
    parser.add_argument("--report", action="store_true", help="print facet counts and write nothing")
    args = parser.parse_args()

    catalog = build(Path(args.manifest))

    if args.report:
        print(f"rows: {catalog['count']}  (excluded {catalog['categories']} category pages)")
        for facet in ("jurisdictions", "returns", "types", "groups"):
            print(f"\n{facet}  ({len(catalog[facet])})")
            for entry in catalog[facet]:
                print(f"  {entry['count']:5d}  {entry['label']}")
        return

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(catalog, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    size_kb = out.stat().st_size / 1024
    print(f"Wrote {out} — {catalog['count']} rows, {size_kb:.0f} KB")
    print(f"  jurisdictions: {len(catalog['jurisdictions'])}"
          f"  returns: {len(catalog['returns'])}"
          f"  error types: {len(catalog['types'])}"
          f"  groups: {len(catalog['groups'])}")


if __name__ == "__main__":
    main()
