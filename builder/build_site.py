#!/usr/bin/env python3
"""Static-site generator for the GoSystem Tax RS help search portal (Agent B).

Reads  : data/manifest.json  +  content/**/*.md   (produced by the scraper, Agent A)
Writes : site/                                    (build output, git-ignored)
           - site/index.html                       search landing (DOM contract shell)
           - site/<path>.html                       one page per article
           - site/<path>/index.html                 one page per category / section
           - site/assets/styles.css                 copied from builder/assets/styles.css

The search landing shell implements the Search DOM contract from CONTRACT.md but
deliberately does NOT emit /assets/search.js or /codes.json — those belong to
Agent C and are added at integration. Likewise /pagefind/ is written by Pagefind.

Dependencies: jinja2 (present in the venv) + markdown (added by this component;
Agent D should pin `markdown` in requirements.txt).

Run:
    .venv/bin/python builder/build_site.py
"""

from __future__ import annotations

import json
import re
import shutil
import sys
from pathlib import Path

BUILDER_DIR = Path(__file__).resolve().parent
ROOT = BUILDER_DIR.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import markdown
from jinja2 import Environment, FileSystemLoader, select_autoescape

from builder.jurisdiction import detect_jurisdiction

# --------------------------------------------------------------------------- #
# Paths
# --------------------------------------------------------------------------- #
BUILDER_DIR = Path(__file__).resolve().parent
ROOT = BUILDER_DIR.parent
TEMPLATE_DIR = BUILDER_DIR / "templates"
STYLES_SRC = BUILDER_DIR / "assets" / "styles.css"

MANIFEST = ROOT / "data" / "manifest.json"
SITE = ROOT / "site"

SITE_NAME = "GoSystem Tax RS Help Search"

# Markdown -> HTML. `extra` gives us tables, fenced code, def lists, attr lists;
# `sane_lists` keeps ordered/unordered lists from bleeding together.
MD = markdown.Markdown(extensions=["extra", "sane_lists"], output_format="html5")

_H1_LEADING = re.compile(r"^\s*#\s.*(?:\r?\n|$)")


# --------------------------------------------------------------------------- #
# URL / path helpers
# --------------------------------------------------------------------------- #
def page_url(path: str, is_category: bool) -> str:
    """Canonical site URL for a manifest record's rendered page."""
    return f"/{path}/index.html" if is_category else f"/{path}.html"


def out_file(path: str, is_category: bool) -> Path:
    """Filesystem output path for a record, mirroring `path`."""
    return SITE / path / "index.html" if is_category else SITE / f"{path}.html"


def render_body(md_rel_path: str) -> str:
    """Render an article's Markdown body to HTML.

    The scraped Markdown starts with a leading `# Title` heading; the template
    already renders the title as an <h1>, so we strip that single leading H1 to
    avoid a duplicate heading while keeping the rest of the body verbatim.
    """
    md_file = ROOT / md_rel_path
    if not md_file.exists():
        return ""
    text = md_file.read_text(encoding="utf-8")
    if not text.strip():
        return ""
    text = _H1_LEADING.sub("", text, count=1)
    if not text.strip():
        return ""
    MD.reset()
    return MD.convert(text)


# --------------------------------------------------------------------------- #
# Build
# --------------------------------------------------------------------------- #
def main() -> None:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    articles = manifest["articles"]
    sections = manifest.get("sections", [])

    by_path = {a["path"]: a for a in articles}

    def crumbs_for(article: dict) -> list[dict]:
        """Breadcrumb entries [{label, href|None}] for an article.

        breadcrumb[0] is the home label; breadcrumb[1:] line up with the path
        segments, so breadcrumb[i] (i>=1) points at the first `i` path segments.
        """
        labels = article["breadcrumb"]
        segs = article["path"].split("/")
        crumbs = [{"label": labels[0], "href": "/"}]
        for i in range(1, len(labels)):
            is_last = i == len(labels) - 1
            if is_last:
                crumbs.append({"label": labels[i], "href": None})
                continue
            prefix = "/".join(segs[:i])
            rec = by_path.get(prefix)
            if rec:
                href = page_url(rec["path"], rec["is_category"])
            else:
                # Bare section node (e.g. "709") -> synthetic section index.
                href = f"/{prefix}/index.html"
            crumbs.append({"label": labels[i], "href": href})
        return crumbs

    def children_of(parent_path: str) -> list[dict]:
        kids = [a for a in articles if a.get("parent") == parent_path]
        kids.sort(key=lambda a: (not a["is_category"], a["title"].lower()))
        return [
            {
                "title": a["title"],
                "href": page_url(a["path"], a["is_category"]),
                "is_category": a["is_category"],
            }
            for a in kids
        ]

    env = Environment(
        loader=FileSystemLoader(str(TEMPLATE_DIR)),
        autoescape=select_autoescape(["html", "xml"]),
        trim_blocks=True,
        lstrip_blocks=True,
    )
    tpl_article = env.get_template("article.html")
    tpl_search = env.get_template("search.html")

    # Fresh output tree.
    if SITE.exists():
        shutil.rmtree(SITE)
    SITE.mkdir(parents=True)
    (SITE / "assets").mkdir(parents=True, exist_ok=True)

    written: list[Path] = []

    def write(dest: Path, html: str) -> None:
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(html, encoding="utf-8")
        written.append(dest)

    # ---- Article & category pages ---------------------------------------- #
    for a in articles:
        a["jurisdiction"] = detect_jurisdiction(a)
        body_html = render_body(a["content_md"])
        children = children_of(a["path"]) if a["is_category"] else []
        html = tpl_article.render(
            site_name=SITE_NAME,
            article=a,
            body_html=body_html,
            crumbs=crumbs_for(a),
            children=children,
            is_category=a["is_category"],
            is_section=False,
        )
        write(out_file(a["path"], a["is_category"]), html)

    # ---- Synthetic section index pages ----------------------------------- #
    base_url = manifest.get("base_url", "")
    prefix = manifest.get("prefix", "")
    for sec in sections:
        if by_path.get(sec):
            continue  # a real record already owns this path
        children = children_of(sec)
        if not children:
            continue
        section_record = {
            "title": f"Form {sec} help topics",
            "section": sec,
            "codes": [],
            "breadcrumb": ["GoSystem Tax RS", sec],
            "source_url": f"{base_url}{prefix}/{sec}/browse",
        }
        section_record["jurisdiction"] = detect_jurisdiction(section_record)
        html = tpl_article.render(
            site_name=SITE_NAME,
            article=section_record,
            body_html="",
            crumbs=[
                {"label": "GoSystem Tax RS", "href": "/"},
                {"label": sec, "href": None},
            ],
            children=children,
            is_category=True,
            is_section=True,
        )
        write(SITE / sec / "index.html", html)

    # ---- Search landing (index.html) ------------------------------------- #
    browse = []
    for sec in sections:
        sec_children = [a for a in articles if a.get("parent") == sec]
        cats = sorted(
            (a for a in sec_children if a["is_category"]),
            key=lambda a: a["title"].lower(),
        )
        arts = sorted(
            (a for a in sec_children if not a["is_category"]),
            key=lambda a: a["title"].lower(),
        )
        browse.append(
            {
                "section": sec,
                "href": page_url(sec, True) if not by_path.get(sec) else page_url(sec, by_path[sec]["is_category"]),
                "categories": [
                    {"title": c["title"], "href": page_url(c["path"], c["is_category"])}
                    for c in cats
                ],
                "articles": [
                    {"title": a["title"], "href": page_url(a["path"], a["is_category"])}
                    for a in arts
                ],
            }
        )

    # Unique jurisdictions list for filter pills on landing page
    all_jurisdictions = {}
    for a in articles:
        j = a.get("jurisdiction") or detect_jurisdiction(a)
        all_jurisdictions[j["code"]] = j
    
    # Sort order: Federal, then States A-Z, then General
    def j_sort_key(j):
        if j["code"] == "Federal": return (0, "Federal")
        if j["type"] == "State": return (1, j["name"])
        return (2, j["name"])

    unique_jurisdictions = sorted(all_jurisdictions.values(), key=j_sort_key)

    index_html = tpl_search.render(site_name=SITE_NAME, sections=browse, jurisdictions=unique_jurisdictions)
    write(SITE / "index.html", index_html)

    # ---- Stylesheet ------------------------------------------------------ #
    shutil.copyfile(STYLES_SRC, SITE / "assets" / "styles.css")
    written.append(SITE / "assets" / "styles.css")

    # ---- Summary --------------------------------------------------------- #
    print(f"Built {len(written)} files into {SITE}")
    print(f"  articles + categories : {len(articles)}")
    print(f"  section index pages   : "
          f"{sum(1 for w in written if w.parent.name in sections and w.name == 'index.html')}")
    print(f"  search landing        : site/index.html")
    print(f"  stylesheet            : site/assets/styles.css")


if __name__ == "__main__":
    main()
