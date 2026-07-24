#!/usr/bin/env python3
"""
GoSystem Tax RS Help — Scraper (Agent A)
========================================

Config-driven, polite, resumable scraper that productionizes
``fixtures/gen_dataset.py``. It discovers every article in one or more
GoSystem Tax RS help *sections* by walking the browse page's embedded JSON
island (``childrenList`` tree), downloads each article, extracts the DITA
topic body as HTML + Markdown, and emits:

  <out-dir>/data/manifest.json     (schema per CONTRACT.md)
  <out-dir>/content/<path>.md      (verbatim body as Markdown)
  <out-dir>/content/<path>.html    (verbatim body as HTML)
  <out-dir>/_raw/<path>.html       (full page HTML, audit trail)

Robustness features
-------------------
* ~1 req/s politeness (``--delay``), configurable.
* Retries with exponential backoff on transient failures.
* On-disk HTTP cache (``.cache/`` keyed by URL) — reused across runs.
* Resumable: bodies whose sha256 is unchanged from the previous manifest
  keep their original ``fetched_at`` (manifest stays stable across reruns);
  cached responses avoid network entirely.
* Structured logging to stderr and an end-of-run summary.

Output schema is byte-for-byte compatible with the ground-truth
``data/manifest.json`` (12 records for section 709) on the stable fields
(url, path, title, breadcrumb, parent, is_category, codes, sha256).

Usage
-----
    # PoC — section 709 only (reproduces ground truth):
    python scraper/scrape.py --sections 709

    # All 10 sections (full run):
    python scraper/scrape.py --sections all

    # Self-test into a scratch dir (does NOT touch real data/ or content/):
    python scraper/scrape.py --sections 709 --out-dir scraper/_selftest

See ``python scraper/scrape.py --help`` for every flag.
"""
from __future__ import annotations

import argparse
import datetime
import hashlib
import html
import json
import logging
import pathlib
import re
import sys
import time
import warnings
from dataclasses import dataclass, field
from typing import Iterable, Optional

warnings.filterwarnings("ignore")  # silence urllib3/LibreSSL notice on this box

import requests
from bs4 import BeautifulSoup
from markdownify import markdownify as md

# --------------------------------------------------------------------------- #
# Defaults / constants (all overridable via CLI or --config)
# --------------------------------------------------------------------------- #
REPO_ROOT = pathlib.Path(__file__).resolve().parent.parent
DEFAULT_BASE = "https://www.thomsonreuters.com"
DEFAULT_PREFIX = "/en-us/help/gosystem-tax-rs"
# The 10 sections, in the order listed in CONTRACT.md.
ALL_SECTIONS = ["e-file", "import-export", "1065", "1120", "1040",
                "1041", "990", "5500", "706", "709"]
DEFAULT_UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
              "AppleWebKit/537.36 (GoSystemHelpArchiver/1.0)")

# Error-code pattern. Matters for e-file sections; harmless for 709. Kept
# identical to the reference generator so code extraction is reproducible.
CODE_RE = re.compile(
    r'\b([A-Z]{1,6}\d{2,}[-\dA-Za-z]*|\d{4,}[-\dA-Za-z]*|[A-Z]\d{4}[-\dA-Za-z]*)\b'
)

log = logging.getLogger("scrape")


# --------------------------------------------------------------------------- #
# Config
# --------------------------------------------------------------------------- #
@dataclass
class Config:
    sections: list[str]
    base_url: str = DEFAULT_BASE
    prefix: str = DEFAULT_PREFIX
    out_dir: pathlib.Path = REPO_ROOT
    cache_dir: pathlib.Path = REPO_ROOT / ".cache"
    delay: float = 1.0
    retries: int = 4
    backoff: float = 1.5
    timeout: float = 30.0
    user_agent: str = DEFAULT_UA
    refresh: bool = False       # bypass cache, force network re-fetch
    max_articles: int = 0       # 0 == no limit (safety valve for testing)


# --------------------------------------------------------------------------- #
# Utilities
# --------------------------------------------------------------------------- #
def iso_now() -> str:
    """UTC timestamp in the '...Z' style used by the ground-truth manifest."""
    return datetime.datetime.now(datetime.timezone.utc).replace(
        tzinfo=None).isoformat() + "Z"


def clean_url(path: str) -> str:
    """Normalize a CMS path to a canonical /en-us/help/... URL path."""
    path = path.replace("/content/helpandsupp", "")
    if path.endswith(".html"):
        path = path[:-5]
    return path


def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def extract_codes(title: str, text: str) -> list[str]:
    """Best-effort error-code extraction from title + body text."""
    cands: set[str] = set()
    for m in CODE_RE.findall(f"{title}\n{text}"):
        if any(ch.isdigit() for ch in m) and len(m) >= 4:
            cands.add(m)
    return sorted(cands)


# --------------------------------------------------------------------------- #
# HTTP cache + polite fetcher
# --------------------------------------------------------------------------- #
@dataclass
class FetchStats:
    network: int = 0
    cached: int = 0
    revalidated_304: int = 0
    errors: list[tuple[str, str]] = field(default_factory=list)


class Fetcher:
    """Polite HTTP fetcher with on-disk cache, retries and backoff.

    Cache entries live at ``<cache_dir>/<sha1(url)>.json`` and store the
    response body plus validators (ETag / Last-Modified) so subsequent runs
    can (a) serve straight from disk or (b) issue a conditional GET.
    """

    def __init__(self, cfg: Config):
        self.cfg = cfg
        self.cache_dir = cfg.cache_dir
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": cfg.user_agent})
        self.stats = FetchStats()
        self._last_request_ts = 0.0

    def _cache_path(self, url: str) -> pathlib.Path:
        return self.cache_dir / (hashlib.sha1(url.encode("utf-8")).hexdigest() + ".json")

    def _read_cache(self, url: str) -> Optional[dict]:
        p = self._cache_path(url)
        if not p.exists():
            return None
        try:
            return json.loads(p.read_text(encoding="utf-8"))
        except Exception as exc:  # corrupt cache entry — ignore, re-fetch
            log.warning("cache read failed for %s (%s); ignoring", url, exc)
            return None

    def _write_cache(self, url: str, status: int, headers: dict, body: str) -> None:
        entry = {
            "url": url,
            "status": status,
            "fetched_at": iso_now(),
            "etag": headers.get("ETag"),
            "last_modified": headers.get("Last-Modified"),
            "sha256": sha256_text(body),
            "body": body,
        }
        self._cache_path(url).write_text(
            json.dumps(entry, ensure_ascii=False), encoding="utf-8")

    def _throttle(self) -> None:
        """Sleep so that consecutive *network* requests are >= delay apart."""
        if self.cfg.delay <= 0:
            return
        wait = self.cfg.delay - (time.monotonic() - self._last_request_ts)
        if wait > 0:
            time.sleep(wait)

    def _network_get(self, url: str, conditional: Optional[dict]) -> requests.Response:
        """Single GET with retries + exponential backoff."""
        last_exc: Optional[Exception] = None
        for attempt in range(1, self.cfg.retries + 1):
            self._throttle()
            self._last_request_ts = time.monotonic()
            try:
                headers = dict(conditional or {})
                resp = self.session.get(url, headers=headers, timeout=self.cfg.timeout)
                # Retry on transient server / rate-limit statuses.
                if resp.status_code in (429, 500, 502, 503, 504):
                    raise requests.HTTPError(
                        f"transient status {resp.status_code}", response=resp)
                return resp
            except Exception as exc:  # network error or transient HTTP status
                last_exc = exc
                if attempt >= self.cfg.retries:
                    break
                sleep_for = self.cfg.backoff ** attempt
                log.warning("fetch %s failed (attempt %d/%d): %s — backoff %.1fs",
                            url, attempt, self.cfg.retries, exc, sleep_for)
                time.sleep(sleep_for)
        assert last_exc is not None
        raise last_exc

    def get(self, url: str) -> str:
        """Return the response body for *url*, using the cache when possible."""
        cached = self._read_cache(url)

        if cached and not self.cfg.refresh:
            log.debug("cache hit %s", url)
            self.stats.cached += 1
            return cached["body"]

        conditional = None
        if cached and self.cfg.refresh:
            conditional = {}
            if cached.get("etag"):
                conditional["If-None-Match"] = cached["etag"]
            if cached.get("last_modified"):
                conditional["If-Modified-Since"] = cached["last_modified"]

        resp = self._network_get(url, conditional)
        self.stats.network += 1

        if resp.status_code == 304 and cached:
            log.debug("304 not-modified %s (served from cache)", url)
            self.stats.revalidated_304 += 1
            return cached["body"]

        resp.raise_for_status()
        body = resp.text
        self._write_cache(url, resp.status_code, resp.headers, body)
        return body


# --------------------------------------------------------------------------- #
# Browse-page discovery (JSON island → node tree)
# --------------------------------------------------------------------------- #
@dataclass
class Node:
    title: str
    clean_url: str        # canonical /en-us/help/... path
    rel: str              # relative to prefix, e.g. "709/prepare-.../calculate-gst"
    has_children: bool


def _walk_children(nodes: list[dict], prefix: str, out: list[Node], seen: set[str]) -> None:
    """DFS pre-order walk of a childrenList tree preserving true hierarchy."""
    for n in nodes:
        path = n.get("path", "")
        title = n.get("title", "")
        if not path:
            continue
        cu = clean_url(path)
        children = n.get("childrenList") or []
        if cu not in seen:
            seen.add(cu)
            rel = cu.replace(prefix + "/", "")
            out.append(Node(title=title, clean_url=cu, rel=rel, has_children=bool(children)))
        # Recurse regardless, to reach descendants even if a dupe was skipped.
        _walk_children(children, prefix, out, seen)


def parse_browse(html_text: str, prefix: str) -> list[Node]:
    """Extract the discovery tree from a browse page.

    Primary path: parse the HTML-entity-encoded JSON island carried in the
    ``data-banner`` attribute of ``<ul class="accordion">`` and walk
    ``childrenList`` recursively (true hierarchy + reliable is_category).

    Fallback path: if the island can't be parsed, scrape flat
    ``"title":..,"path":..`` pairs from the decoded HTML and infer hierarchy
    from path prefixes.
    """
    nodes: list[Node] = []
    seen: set[str] = set()

    m = re.search(r'data-banner="([^"]*)"', html_text)
    if m:
        try:
            tree = json.loads(html.unescape(m.group(1)))
            _walk_children(tree, prefix, nodes, seen)
            if nodes:
                log.debug("parsed JSON island: %d nodes", len(nodes))
                return nodes
        except Exception as exc:
            log.warning("JSON island parse failed (%s); using path-prefix fallback", exc)

    # ---- fallback: flat pairs + path-prefix nesting -----------------------
    log.info("using flat/path-prefix discovery fallback")
    dec = html.unescape(html_text)
    pairs = re.findall(r'"title":"(.*?)","path":"(.*?)"', dec)
    tmp: list[Node] = []
    for title, path in pairs:
        cu = clean_url(path)
        if cu in seen:
            continue
        seen.add(cu)
        rel = cu.replace(prefix + "/", "")
        tmp.append(Node(title=title, clean_url=cu, rel=rel, has_children=False))
    rels = {n.rel for n in tmp}
    for n in tmp:
        n.has_children = any(r != n.rel and r.startswith(n.rel + "/") for r in rels)
    return tmp


# --------------------------------------------------------------------------- #
# Article body extraction
# --------------------------------------------------------------------------- #
def extract_body(page_html: str) -> tuple[str, str, str]:
    """Return (body_html, body_md, body_text) for a page.

    Body = the DITA ``<div class="topic ...">`` element. Category/landing
    pages have no topic div → empty body (sha256 of '' is the ground-truth
    marker e3b0c442...).
    """
    soup = BeautifulSoup(page_html, "lxml")
    topic = soup.select_one("div.topic")
    if not topic:
        return "", "", ""
    body_html = str(topic)
    body_md = md(body_html, heading_style="ATX").strip()
    body_text = topic.get_text(" ", strip=True)
    return body_html, body_md, body_text


# --------------------------------------------------------------------------- #
# Section scrape
# --------------------------------------------------------------------------- #
@dataclass
class RunSummary:
    sections: list[str] = field(default_factory=list)
    total: int = 0
    categories: int = 0
    articles: int = 0
    unchanged: int = 0        # sha256 matched previous manifest
    errors: list[tuple[str, str]] = field(default_factory=list)


def scrape_section(section: str, cfg: Config, fetcher: Fetcher,
                   prior: dict[str, dict], summary: RunSummary) -> list[dict]:
    """Scrape one section; write content/raw files; return manifest records."""
    browse_url = f"{cfg.base_url}{cfg.prefix}/{section}/browse"
    log.info("[%s] fetching browse page %s", section, browse_url)
    try:
        browse_html = fetcher.get(browse_url)
    except Exception as exc:
        log.error("[%s] browse fetch failed: %s", section, exc)
        summary.errors.append((browse_url, str(exc)))
        return []

    nodes = parse_browse(browse_html, cfg.prefix)
    # Keep only nodes belonging to this section (defensive).
    nodes = [n for n in nodes if n.rel == section or n.rel.startswith(section + "/")]
    log.info("[%s] discovered %d nodes", section, len(nodes))

    title_by_rel = {n.rel: n.title for n in nodes}
    rels = {n.rel for n in nodes}
    records: list[dict] = []

    for n in nodes:
        if cfg.max_articles and len(records) >= cfg.max_articles:
            log.info("[%s] reached --max-articles=%d; stopping", section, cfg.max_articles)
            break

        rel = n.rel
        url = cfg.base_url + n.clean_url
        # is_category: true if tree says it has children OR path-prefix implies descendants.
        is_cat = n.has_children or any(r != rel and r.startswith(rel + "/") for r in rels)

        try:
            page_html = fetcher.get(url)
        except Exception as exc:
            log.error("[%s] fetch failed %s: %s", section, url, exc)
            summary.errors.append((url, str(exc)))
            continue

        body_html, body_md, body_text = extract_body(page_html)
        sha = sha256_text(body_html)

        # breadcrumb from ancestor path segments (uses discovered titles).
        segs = rel.split("/")
        crumb = ["GoSystem Tax RS"]
        for i in range(len(segs)):
            anc = "/".join(segs[:i + 1])
            crumb.append(title_by_rel.get(anc, segs[i]))
        parent = "/".join(segs[:-1]) if len(segs) > 1 else None

        # Resumability: reuse prior fetched_at when the body is unchanged so
        # the manifest stays stable across reruns.
        prev = prior.get(rel)
        if prev and prev.get("sha256") == sha:
            fetched_at = prev.get("fetched_at", iso_now())
            summary.unchanged += 1
        else:
            fetched_at = iso_now()

        # Mirror content + raw, following the reference's layout.
        if is_cat:
            md_rel = f"content/{rel}/index.md"
            html_rel = f"content/{rel}/index.html"
            raw_rel = f"_raw/{rel}/index.html"
        else:
            md_rel = f"content/{rel}.md"
            html_rel = f"content/{rel}.html"
            raw_rel = f"_raw/{rel}.html"
        for relp, data in ((md_rel, body_md), (html_rel, body_html), (raw_rel, page_html)):
            fp = cfg.out_dir / relp
            fp.parent.mkdir(parents=True, exist_ok=True)
            fp.write_text(data, encoding="utf-8")

        rec = {
            "url": url,
            "source_url": url,
            "path": rel,
            "section": section,
            "title": n.title,
            "breadcrumb": crumb,
            "parent": parent,
            "is_category": is_cat,
            "codes": extract_codes(n.title, body_text),
            "content_md": md_rel,
            "content_html": html_rel,
            "raw_html": raw_rel,
            "sha256": sha,
            "fetched_at": fetched_at,
        }
        records.append(rec)
        summary.total += 1
        if is_cat:
            summary.categories += 1
        else:
            summary.articles += 1
        log.info("[%s] %s %s (%d md chars)",
                 section, "CAT" if is_cat else "ART", rel, len(body_md))

    return records


# --------------------------------------------------------------------------- #
# Manifest I/O
# --------------------------------------------------------------------------- #
def load_prior_index(manifest_path: pathlib.Path) -> dict[str, dict]:
    """Index the previous manifest's articles by ``path`` for resumability."""
    if not manifest_path.exists():
        return {}
    try:
        data = json.loads(manifest_path.read_text(encoding="utf-8"))
        return {a["path"]: a for a in data.get("articles", [])}
    except Exception as exc:
        log.warning("could not read prior manifest %s (%s)", manifest_path, exc)
        return {}


# --------------------------------------------------------------------------- #
# CLI
# --------------------------------------------------------------------------- #
def resolve_sections(raw: str) -> list[str]:
    if not raw or raw.strip().lower() in ("all", "*"):
        return list(ALL_SECTIONS)
    out: list[str] = []
    for s in raw.split(","):
        s = s.strip()
        if not s:
            continue
        if s.lower() == "all":
            return list(ALL_SECTIONS)
        out.append(s)
    return out


def build_config(args: argparse.Namespace) -> Config:
    file_cfg: dict = {}
    if args.config:
        file_cfg = json.loads(pathlib.Path(args.config).read_text(encoding="utf-8"))

    def pick(cli_val, key, default):
        if cli_val is not None:
            return cli_val
        return file_cfg.get(key, default)

    sections_raw = args.sections if args.sections is not None else file_cfg.get("sections", "all")
    if isinstance(sections_raw, list):
        sections = list(sections_raw)
    else:
        sections = resolve_sections(sections_raw)

    out_dir = pathlib.Path(pick(args.out_dir, "out_dir", str(REPO_ROOT))).resolve()
    cache_default = pick(args.cache_dir, "cache_dir", str(REPO_ROOT / ".cache"))
    return Config(
        sections=sections,
        base_url=pick(args.base_url, "base_url", DEFAULT_BASE),
        prefix=pick(args.prefix, "prefix", DEFAULT_PREFIX),
        out_dir=out_dir,
        cache_dir=pathlib.Path(cache_default).resolve(),
        delay=float(pick(args.delay, "delay", 1.0)),
        retries=int(pick(args.retries, "retries", 4)),
        backoff=float(pick(args.backoff, "backoff", 1.5)),
        timeout=float(pick(args.timeout, "timeout", 30.0)),
        user_agent=pick(args.user_agent, "user_agent", DEFAULT_UA),
        refresh=bool(args.refresh),
        max_articles=int(pick(args.max_articles, "max_articles", 0)),
    )


def parse_args(argv: Optional[list[str]] = None) -> argparse.Namespace:
    p = argparse.ArgumentParser(
        description="Scrape GoSystem Tax RS help sections into data/manifest.json + content/.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__)
    p.add_argument("--sections", default=None,
                   help="Comma-separated sections (e.g. 'e-file,709') or 'all'. "
                        f"Default: all ({','.join(ALL_SECTIONS)}).")
    p.add_argument("--out-dir", default=None,
                   help="Root under which data/, content/, _raw/ are written "
                        "(default: repo root). Use a scratch dir for self-tests.")
    p.add_argument("--cache-dir", default=None,
                   help="On-disk HTTP cache directory (default: <repo>/.cache).")
    p.add_argument("--delay", type=float, default=None,
                   help="Min seconds between network requests (default: 1.0).")
    p.add_argument("--retries", type=int, default=None,
                   help="Max attempts per request (default: 4).")
    p.add_argument("--backoff", type=float, default=None,
                   help="Exponential backoff base (default: 1.5).")
    p.add_argument("--timeout", type=float, default=None,
                   help="Per-request timeout seconds (default: 30).")
    p.add_argument("--user-agent", default=None, help="Override User-Agent header.")
    p.add_argument("--base-url", default=None, help=f"Base URL (default: {DEFAULT_BASE}).")
    p.add_argument("--prefix", default=None, help=f"Help path prefix (default: {DEFAULT_PREFIX}).")
    p.add_argument("--refresh", action="store_true",
                   help="Bypass cache; force network re-fetch (conditional GET when possible).")
    p.add_argument("--max-articles", type=int, default=None,
                   help="Cap articles per section (0 = no limit; for testing).")
    p.add_argument("--config", default=None, help="Optional JSON config file (CLI flags win).")
    p.add_argument("--log-level", default="INFO",
                   choices=["DEBUG", "INFO", "WARNING", "ERROR"],
                   help="Logging verbosity (default: INFO).")
    return p.parse_args(argv)


def main(argv: Optional[list[str]] = None) -> int:
    args = parse_args(argv)
    logging.basicConfig(
        level=getattr(logging, args.log_level),
        format="%(asctime)s %(levelname)-7s %(message)s",
        stream=sys.stderr,
    )
    cfg = build_config(args)

    log.info("sections=%s out_dir=%s cache_dir=%s delay=%.2fs refresh=%s",
             ",".join(cfg.sections), cfg.out_dir, cfg.cache_dir, cfg.delay, cfg.refresh)

    manifest_path = cfg.out_dir / "data" / "manifest.json"
    prior = load_prior_index(manifest_path)
    fetcher = Fetcher(cfg)
    summary = RunSummary(sections=list(cfg.sections))

    all_records: list[dict] = []
    for section in cfg.sections:
        all_records.extend(scrape_section(section, cfg, fetcher, prior, summary))

    manifest = {
        "generated_at": iso_now(),
        "base_url": cfg.base_url,
        "prefix": cfg.prefix,
        "sections": list(cfg.sections),
        "count": len(all_records),
        "articles": all_records,
    }
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    # ---- end-of-run summary ------------------------------------------------
    log.info("=" * 60)
    log.info("SUMMARY")
    log.info("  sections processed : %s", ", ".join(summary.sections))
    log.info("  records written    : %d (%d categories, %d articles)",
             summary.total, summary.categories, summary.articles)
    log.info("  unchanged (sha)    : %d", summary.unchanged)
    log.info("  http network gets  : %d", fetcher.stats.network)
    log.info("  http cache hits    : %d", fetcher.stats.cached)
    log.info("  http 304 revalid.  : %d", fetcher.stats.revalidated_304)
    log.info("  errors             : %d", len(summary.errors))
    for url, err in summary.errors:
        log.error("    - %s :: %s", url, err)
    log.info("  manifest           : %s", manifest_path)
    log.info("=" * 60)

    return 1 if summary.errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
