#!/usr/bin/env python3
"""
build_signature_index.py — Search layer (deterministic error matching)

Reads ``data/manifest.json`` + ``content/**`` and writes ``site/signatures.json``:
a per-article table of *match keys* extracted from each article's title and body.
The companion browser module ``error_matcher.js`` parses a raw pasted e-file /
FTB validation error into the same shape and scores it against this table.

Nothing here talks to an Excel sheet or a "solution" file — matching is purely
structural: reject codes, element/field identifiers, form numbers, states, and
xpath/element path tokens scraped straight out of the Thomson Reuters articles.

================================================================================
signatures.json SCHEMA
================================================================================

    {
      "generated_at": "<ISO8601Z>",
      "count": <number of articles>,
      "articles": [
        {
          "url":        "/e-file/.../x0000-010.html",   # LOCAL built page
          "title":      "X0000-010 e-file error",
          "section":    "e-file",
          "breadcrumb": ["GoSystem Tax RS", "e-file", ...],
          "keys": {
            "codes":    ["X0000-010", "R0000-058-01", ...],  # reject/state codes
            "fields":   ["EntityType", "IsInvestmentPartnership", ...],
            "forms":    ["565", "1041", ...],
            "states":   ["CA", "federal", ...],
            "elements": ["CAForm565ScheduleK-1", "PartnerInformation", ...]
          },
          "excerpt": "The XML data has failed schema validation. ..."
        }
      ]
    }

``url`` is the LOCAL built-site page (mirrors the article ``path``): categories
=> ``<path>/index.html``, articles => ``<path>.html``, root-absolute. This is
byte-for-byte the same rule the site builder / codes index use, so clicks land
on our verbatim copy of the article.

================================================================================
KEY EXTRACTION RULES  (deterministic — keep in lockstep with error_matcher.js)
================================================================================

codes    Reject / business-rule codes, tightened so plain FORM numbers are NOT
         captured as codes:
           * dashed MeF/state shape: a short UPPER-CASE mnemonic followed by one
             or more ``-<ALNUM>`` segments AND containing >= 3 digits overall —
             e.g. X0000-005, F1065-037-02, R0000-058-01, IND-039-01,
             SA-F1040-002, F990PF-905-01, F990T-041, HIXML-001, ILK1P-500-3,
             FIN-035, F565-060.  Excludes "K-1", "CA-Return", "990-T", "6081-5".
           * the article's own subject code in a "<CODE> e-file error" title —
             this is the ONLY place a bare-numeric state code (e.g. "725") is
             accepted, so form numbers elsewhere are never mistaken for codes.

fields   Element / field identifiers:
           * quoted names — 'IsInvestmentPartnership', "ESPenaltyAmt"
           * CamelCase element names — EntityType, StreetAddress, USAddress
           * the trailing element of any ``xpath /.../Element`` fragment in the
             title or body.

forms    Form numbers, from ``CAForm<NNN>``, ``Form <NNN>`` and the numeric part
         of an ``F<NNN>...-`` reject-code prefix (F5227-006 -> 5227). Bare
         numbers are NOT harvested, so codes like "725" never become forms.

states   Two-letter abbreviation from a ``states/<state>`` path segment, from a
         ``<XX>Form`` prefix, or from a state NAME in the title/breadcrumb.
         The literal path segment ``federal`` maps to "federal".

elements Normalized path / xpath segments. Normalization: ``\`` -> ``/``; strip
         a leading namespace URI and any ``ns:`` prefix on a segment; collapse
         internal spaces ("CAForm 565ScheduleK-1" -> "CAForm565ScheduleK-1");
         drop pure positional indices. Compared case-insensitively by the
         matcher for element-token overlap scoring.

Scoring itself lives in error_matcher.js (``match()``); its documented weights:
    exact reject-code hit (100) > field-name match (45) > element-token overlap
    (8 each, capped) > form (15) + state (10) > constraint (5).

Usage
-----
    .venv/bin/python search/build_signature_index.py               # -> site/signatures.json
    .venv/bin/python search/build_signature_index.py --manifest X --out Y
    .venv/bin/python search/build_signature_index.py --self-test   # synthetic proof (writes nothing)
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
DEFAULT_OUT = os.path.join(_ROOT, "site", "signatures.json")

# ---------------------------------------------------------------------------
# US state name -> USPS abbreviation (used for `states` extraction)
# ---------------------------------------------------------------------------
STATE_ABBR = {
    "alabama": "AL", "alaska": "AK", "arizona": "AZ", "arkansas": "AR",
    "california": "CA", "colorado": "CO", "connecticut": "CT", "delaware": "DE",
    "florida": "FL", "georgia": "GA", "hawaii": "HI", "idaho": "ID",
    "illinois": "IL", "indiana": "IN", "iowa": "IA", "kansas": "KS",
    "kentucky": "KY", "louisiana": "LA", "maine": "ME", "maryland": "MD",
    "massachusetts": "MA", "michigan": "MI", "minnesota": "MN",
    "mississippi": "MS", "missouri": "MO", "montana": "MT", "nebraska": "NE",
    "nevada": "NV", "new hampshire": "NH", "new jersey": "NJ",
    "new mexico": "NM", "new york": "NY", "north carolina": "NC",
    "north dakota": "ND", "ohio": "OH", "oklahoma": "OK", "oregon": "OR",
    "pennsylvania": "PA", "rhode island": "RI", "south carolina": "SC",
    "south dakota": "SD", "tennessee": "TN", "texas": "TX", "utah": "UT",
    "vermont": "VT", "virginia": "VA", "washington": "WA",
    "west virginia": "WV", "wisconsin": "WI", "wyoming": "WY",
    "district of columbia": "DC",
}
_ABBR_SET = set(STATE_ABBR.values())

# ---------------------------------------------------------------------------
# Regexes
# ---------------------------------------------------------------------------
# Dashed reject codes: UPPER-CASE mnemonic + one or more "-ALNUM" segments.
_RE_CODE_DASHED = re.compile(r"\b([A-Z][A-Z0-9]{0,6}(?:-[A-Z0-9]+){1,3})\b")
# The article's own subject code sitting at the head of an "<X> e-file error" title.
_RE_TITLE_CODE = re.compile(
    r"^\s*([A-Z0-9][A-Z0-9-]*?)\s+[Ee]-file\s+(?:error|reject|diagnostic)"
)
# Quoted element/field names.
_RE_QUOTED = re.compile(r"['\"‘’“”]([A-Za-z][A-Za-z0-9_]{2,})['\"‘’“”]")
# CamelCase / acronym-led element names (>= 2 humps, e.g. EntityType, USAddress).
_RE_CAMEL = re.compile(r"\b((?:[A-Z][a-z0-9]+){2,}|[A-Z]{2,}[a-z][A-Za-z0-9]*)\b")
# Form-number patterns.
_RE_CAFORM = re.compile(r"\bCAForm\s*(\d{3,4})", re.I)
_RE_FORM = re.compile(r"\bForm\s*(\d{3,4})\b", re.I)
_RE_FCODE_PREFIX = re.compile(r"\bF(\d{3,4})[A-Z]*-\d")
# xpath / element-path runs (a leading "/" then >= 1 more "/segment").
_RE_XPATH = re.compile(r"(/[A-Za-z][\w .:\-]*(?:/[A-Za-z0-9][\w .:\-]*)+)")
# 2-letter-state form prefix (e.g. CAForm..., NYForm...).
_RE_STATE_FORM = re.compile(r"\b([A-Z]{2})Form[A-Z]*\d", re.I)

_DIGIT = re.compile(r"\d")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def local_url(article: dict) -> str:
    """LOCAL built-site page URL from an article's ``path`` (mirrors builder)."""
    path = str(article.get("path", "")).strip("/")
    if not path:
        return "/"
    if article.get("is_category"):
        return "/" + path + "/index.html"
    return "/" + path + ".html"


def _dedup(seq):
    """Order-preserving de-dup."""
    out, seen = [], set()
    for x in seq:
        if x and x not in seen:
            seen.add(x)
            out.append(x)
    return out


def _looks_like_code(token: str) -> bool:
    """True for dashed reject codes; rejects K-1 / CA-Return / form-ish tokens."""
    if "-" not in token:
        return False
    digits = sum(c.isdigit() for c in token)
    return digits >= 3


def extract_codes(title: str, body: str) -> list:
    text = f"{title}\n{body}"
    codes = []
    # 1) dashed reject/business-rule codes anywhere.
    for m in _RE_CODE_DASHED.finditer(text):
        tok = m.group(1)
        if _looks_like_code(tok):
            codes.append(tok)
    # 2) the article's own subject code (allows a bare-numeric state code here).
    mt = _RE_TITLE_CODE.match(title or "")
    if mt:
        codes.insert(0, mt.group(1).upper())
    return _dedup(codes)


def _strip_ns(segment: str) -> str:
    """Drop a namespace URI / ``ns:`` prefix from an element segment."""
    seg = segment.strip()
    # Full URI namespace: http://www.ftb.ca.gov/efile:EntityType -> EntityType
    seg = re.sub(r"^https?://\S*?:", "", seg)
    # {namespace}Element style.
    seg = re.sub(r"^\{[^}]*\}", "", seg)
    # Simple ns: prefix (efile:EntityType) — only when it precedes an identifier.
    seg = re.sub(r"^[\w.]+:(?=[A-Za-z])", "", seg)
    return seg.strip()


def _xpath_segments(text: str) -> list:
    """Every cleaned segment of every xpath-ish run found in ``text``."""
    segs = []
    for run in _RE_XPATH.findall(text):
        for raw in run.split("/"):
            seg = _strip_ns(raw)
            seg = re.sub(r"\s+", "", seg)  # "CAForm 565ScheduleK-1" -> joined
            if not seg:
                continue
            if seg.isdigit():  # positional index, not an element
                continue
            segs.append(seg)
    return segs


def _xpath_trailing(text: str) -> list:
    """The final element of each xpath-ish run (a strong `field` signal)."""
    tails = []
    for run in _RE_XPATH.findall(text):
        parts = [re.sub(r"\s+", "", _strip_ns(p)) for p in run.split("/")]
        parts = [p for p in parts if p and not p.isdigit()]
        if parts:
            tails.append(parts[-1])
    return tails


def extract_fields(title: str, body: str) -> list:
    text = f"{title}\n{body}"
    fields = []
    fields += _RE_QUOTED.findall(text)
    fields += _RE_CAMEL.findall(text)
    fields += _xpath_trailing(text)
    # Keep identifier-shaped tokens only; drop obvious non-fields.
    out = []
    for f in fields:
        f = f.strip()
        if len(f) < 3:
            continue
        out.append(f)
    return _dedup(out)


def extract_forms(title: str, body: str, path: str) -> list:
    text = f"{title}\n{body}\n{path}"
    forms = []
    forms += _RE_CAFORM.findall(text)
    forms += _RE_FORM.findall(text)
    forms += _RE_FCODE_PREFIX.findall(text)
    return _dedup(forms)


def extract_states(title: str, breadcrumb: list, path: str) -> list:
    states = []
    # Path segment: .../states/<state>/... or a bare "federal" segment.
    segs = [s.lower() for s in str(path).replace("\\", "/").split("/") if s]
    for i, s in enumerate(segs):
        if s == "states" and i + 1 < len(segs):
            nxt = segs[i + 1].replace("-", " ")
            if nxt in STATE_ABBR:
                states.append(STATE_ABBR[nxt])
        if s == "federal":
            states.append("federal")
    # <XX>Form prefix (CAForm... -> CA).
    for ab in _RE_STATE_FORM.findall(f"{title}"):
        if ab in _ABBR_SET:
            states.append(ab)
    # State names in title / breadcrumb.
    hay = " ".join([title or ""] + [str(b) for b in (breadcrumb or [])]).lower()
    for name, ab in STATE_ABBR.items():
        if re.search(r"\b" + re.escape(name) + r"\b", hay):
            states.append(ab)
    return _dedup(states)


def extract_elements(title: str, body: str) -> list:
    text = f"{title}\n{body}"
    return _dedup(_xpath_segments(text))


# ---------------------------------------------------------------------------
# Body reading + excerpt
# ---------------------------------------------------------------------------
_RE_FENCE = re.compile(r"```(.*?)```", re.S)
_RE_MD_NOISE = re.compile(r"[`*#>_]|^\s*[-*]\s+", re.M)


def read_body(article: dict) -> str:
    rel = article.get("content_md") or ""
    if not rel:
        return ""
    p = rel if os.path.isabs(rel) else os.path.join(_ROOT, rel)
    try:
        with open(p, "r", encoding="utf-8") as fh:
            return fh.read()
    except OSError:
        return ""


def make_excerpt(body: str, limit: int = 260) -> str:
    if not body:
        return ""
    # Prefer the first fenced code block (the raw error message).
    fence = _RE_FENCE.search(body)
    if fence and fence.group(1).strip():
        text = fence.group(1).strip()
    else:
        # Otherwise the first non-heading, non-empty paragraph.
        text = ""
        for line in body.splitlines():
            s = line.strip()
            if not s or s.startswith("#") or s in ("```",):
                continue
            text = s
            break
    text = _RE_MD_NOISE.sub("", text).strip()
    text = re.sub(r"\s+", " ", text)
    if len(text) > limit:
        text = text[:limit].rstrip() + "…"
    return text


# ---------------------------------------------------------------------------
# Build
# ---------------------------------------------------------------------------
def build_article_signature(article: dict, body: str) -> dict:
    title = article.get("title", "") or ""
    path = article.get("path", "") or ""
    breadcrumb = article.get("breadcrumb") or []

    keys = {
        "codes": extract_codes(title, body),
        "fields": extract_fields(title, body),
        "forms": extract_forms(title, body, path),
        "states": extract_states(title, breadcrumb, path),
        "elements": extract_elements(title, body),
    }
    j = article.get("jurisdiction") or detect_jurisdiction(article)
    return {
        "url": local_url(article),
        "title": title,
        "section": article.get("section", "") or "",
        "breadcrumb": breadcrumb,
        "jurisdiction": j["label"],
        "jurisdiction_code": j["code"],
        "jurisdiction_type": j["type"],
        "keys": keys,
        "excerpt": make_excerpt(body),
    }


def build_signatures(articles: list) -> list:
    out = []
    for art in articles:
        body = read_body(art)
        out.append(build_article_signature(art, body))
    return out


def build(manifest_path: str, out_path: str) -> dict:
    with open(manifest_path, "r", encoding="utf-8") as fh:
        manifest = json.load(fh)

    articles = manifest.get("articles", [])
    sigs = build_signatures(articles)

    payload = {
        "generated_at": _dt.datetime.now(_dt.timezone.utc)
        .isoformat(timespec="seconds")
        .replace("+00:00", "Z"),
        "count": len(sigs),
        "articles": sigs,
    }

    os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as fh:
        json.dump(payload, fh, indent=2, ensure_ascii=False)
        fh.write("\n")
    return payload


# ---------------------------------------------------------------------------
# Self-test — proves key extraction against synthetic e-file-style articles.
# ---------------------------------------------------------------------------
def _self_test() -> int:
    print("=== build_signature_index.py key-extraction self-test ===\n")

    synthetic = [
        {
            "title": "X0000-010 e-file error xpath /CA-Return/CA-ReturnData/CAForm 565ScheduleK-1/PartnerInformation/Individual",
            "path": "e-file/1065-e-file-errors/states/california/x0000-010",
            "section": "e-file",
            "breadcrumb": ["GoSystem Tax RS", "e-file", "1065 e-file errors", "California"],
            "is_category": False,
            "_body": (
                "```\nYour State submission does not match the latest published FTB Schema. "
                "XPath to Error /CA-Return/CA-ReturnData/CAForm565ScheduleK-1/"
                "PartnerInformation/EntityType\n```\n"
                "The value CHECK is invalid according to its datatype CA-PartnerMemberEntityType."
            ),
        },
        {
            "title": "E-file error: Field 'IsInvestmentPartnership' is unexpected",
            "path": "e-file/1065-e-file-errors/states/california/isinvestmentpartnership",
            "section": "e-file",
            "breadcrumb": ["GoSystem Tax RS", "e-file", "1065 e-file errors", "California"],
            "is_category": False,
            "_body": (
                "The element PartnershipInformation on the CAForm568ScheduleK-1 has "
                "incomplete content. List of possible elements expected: "
                "'IsInvestmentPartnership'."
            ),
        },
        {
            "title": "F1065-037-02 e-file error",
            "path": "e-file/1065-e-file-errors/federal/f1065-037-02",
            "section": "e-file",
            "breadcrumb": ["GoSystem Tax RS", "e-file", "1065 e-file errors", "Federal"],
            "is_category": False,
            "_body": "```\nForm 1065 reject F1065-037-02. See rule (F1065-037-02).\n```",
        },
        {
            "title": "725 e-file error",
            "path": "e-file/1041-e-file-errors/states/illinois/725",
            "section": "e-file",
            "breadcrumb": ["GoSystem Tax RS", "e-file", "1041 e-file errors", "Illinois"],
            "is_category": False,
            "_body": "```\nIllinois Schedule K-1-P error 725.\n```",
        },
    ]

    def body_of(a):
        return a["_body"]

    sigs = [build_article_signature(a, body_of(a)) for a in synthetic]

    print(f"{'title':<52} codes / fields / forms / states")
    print("-" * 100)
    for s in sigs:
        k = s["keys"]
        print(f"{s['title'][:50]:<52} "
              f"codes={k['codes']}\n{'':<52} fields={k['fields']}\n"
              f"{'':<52} forms={k['forms']} states={k['states']}")
        print(f"{'':<52} elements={k['elements']}\n")

    # ------------------------------ assertions ------------------------------
    ok = True

    def check(cond, msg):
        nonlocal ok
        status = "PASS" if cond else "FAIL"
        if not cond:
            ok = False
        print(f"  [{status}] {msg}")

    a0, a1, a2, a3 = sigs
    print("Assertions:")
    # Article 0: xpath title -> trailing element field, form 565, state CA, no bogus code
    check("565" in a0["keys"]["forms"], "art0 form 565 extracted")
    check("CA" in a0["keys"]["states"], "art0 state CA extracted")
    check("EntityType" in a0["keys"]["fields"], "art0 field EntityType (xpath tail)")
    check("Individual" in a0["keys"]["fields"], "art0 field Individual (title xpath tail)")
    check("X0000-010" in a0["keys"]["codes"], "art0 title code X0000-010")
    check(not any("SCHEDULEK" in c.upper().replace("-", "") and c != "X0000-010"
                  for c in a0["keys"]["codes"]),
          "art0 did NOT capture 'ScheduleK-1' as a code")
    check("CAForm565ScheduleK-1" in a0["keys"]["elements"],
          "art0 element CAForm565ScheduleK-1 (spaces collapsed, ns stripped)")
    # Article 1: quoted field + form 568 + MissingRequired-style body
    check("IsInvestmentPartnership" in a1["keys"]["fields"],
          "art1 field IsInvestmentPartnership (quoted + title)")
    check("568" in a1["keys"]["forms"], "art1 form 568")
    check("CA" in a1["keys"]["states"], "art1 state CA")
    # Article 2: dashed federal code + form-prefix -> 1065
    check("F1065-037-02" in a2["keys"]["codes"], "art2 code F1065-037-02")
    check("1065" in a2["keys"]["forms"], "art2 form 1065 (from F-code prefix + 'Form 1065')")
    # Article 3: bare-numeric state code from title; K-1-P not a code; 725 not a form
    check("725" in a3["keys"]["codes"], "art3 bare-numeric title code 725")
    check("725" not in a3["keys"]["forms"], "art3 '725' NOT treated as a form")
    check(not any(_looks_like_code(c) and c not in ("725",) for c in a3["keys"]["codes"]
                  if "K-1-P".replace("-", "") in c.replace("-", "")),
          "art3 'K-1-P' not captured as a code")

    print("\nRESULT:", "ALL EXTRACTION CASES PASS" if ok else "SOME CASES FAILED")
    print("\nNote: parse()/match() (the query-side signature extractor and scorer)"
          " are exercised by search/matcher_selftest.mjs (Node).")
    return 0 if ok else 1


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(
        description="Build site/signatures.json (deterministic error-match keys) from manifest + content."
    )
    parser.add_argument("--manifest", default=DEFAULT_MANIFEST, help="path to manifest.json")
    parser.add_argument("--out", default=DEFAULT_OUT, help="output signatures.json path")
    parser.add_argument("--self-test", action="store_true",
                        help="run the synthetic extraction proof and exit (writes nothing)")
    args = parser.parse_args(argv)

    if args.self_test:
        return _self_test()

    if not os.path.exists(args.manifest):
        print(f"error: manifest not found: {args.manifest}", file=sys.stderr)
        return 1

    payload = build(args.manifest, args.out)
    n = payload["count"]
    n_codes = sum(1 for a in payload["articles"] if a["keys"]["codes"])
    n_fields = sum(1 for a in payload["articles"] if a["keys"]["fields"])
    print(f"wrote {args.out}")
    print(f"  articles: {n}  (with codes: {n_codes}, with fields: {n_fields})")
    if n == 0:
        print("  note: manifest empty — signatures.json has no articles; matcher returns [].")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
