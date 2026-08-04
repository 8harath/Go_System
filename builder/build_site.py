#!/usr/bin/env python3
"""Static-site generator for the GoSystem Tax RS help search portal (Agent B).

Reads  : data/manifest.json  +  content/**/*.md   (produced by the scraper, Agent A)
         data/catalog.json                        (produced by builder/build_catalog.py)
Writes : site/                                    (build output, git-ignored)
           - site/index.html                        resolver landing (DOM contract shell)
           - site/<path>.html                       one page per article
           - site/<path>/index.html                 one page per category / section
           - site/errors/index.html                 the filterable error catalog
           - site/errors/jurisdiction/<slug>/       static index per jurisdiction
           - site/errors/return/<slug>/             static index per return type
           - site/catalog.json                      catalog payload, copied from data/
           - site/assets/styles.css                 copied from builder/assets/styles.css

The resolver landing implements the Search DOM contract from CONTRACT.md but
deliberately does NOT emit /assets/search.js or /codes.json — those belong to
Agent C and are added at integration. Likewise /pagefind/ is written by Pagefind.

data/catalog.json is REQUIRED and must already exist: this script wipes site/, so
the catalog is built into data/ first and copied in here. build.sh enforces that
order; running standalone, run builder/build_catalog.py first.

Dependencies: jinja2 (present in the venv) + markdown (added by this component;
Agent D should pin `markdown` in requirements.txt).

Run:
    .venv/bin/python builder/build_catalog.py    # first
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

from builder.jurisdiction import all_jurisdictions, detect_jurisdiction

# --------------------------------------------------------------------------- #
# Paths
# --------------------------------------------------------------------------- #
BUILDER_DIR = Path(__file__).resolve().parent
ROOT = BUILDER_DIR.parent
TEMPLATE_DIR = BUILDER_DIR / "templates"
ASSETS_SRC = BUILDER_DIR / "assets"

MANIFEST = ROOT / "data" / "manifest.json"
CATALOG = ROOT / "data" / "catalog.json"
SITE = ROOT / "site"

SITE_NAME = "GoSystem Tax RS Help Search"

# Rows rendered into /errors/ as HTML. The rest arrive with catalog.json and are
# rendered by catalog.js — but this first page means the catalog is readable
# before (and without) that fetch.
CATALOG_PREVIEW_ROWS = 50

# Markdown -> HTML. `extra` gives us tables, fenced code, def lists, attr lists;
# `sane_lists` keeps ordered/unordered lists from bleeding together.
MD = markdown.Markdown(extensions=["extra", "sane_lists"], output_format="html5")

_H1_LEADING = re.compile(r"^\s*#\s.*(?:\r?\n|$)")
_ADJACENT_BOLD = re.compile(r"\*\*\s*\*\*")
_MISSING_BEFORE_BOLD = re.compile(r"(?<=\S)(\*\*[A-Za-z0-9][^*\n]*?\*\*)")
_MISSING_AFTER_BOLD = re.compile(r"(\*\*[A-Za-z0-9][^*\n]*?\*\*)(?=[A-Za-z])")
_SPLIT_MENU_LIST_ITEM = re.compile(
    r"(?m)^([ \t]*[-*] [^\n]+?)\s*\n\s*\n[ \t]+(\*\*[^\n]+?\*\*)\s*\n\s*\n[ \t]*(?!(?:note|tip|important)(?:\s|$)|!\[|```)([^\n]*)"
)
_SPLIT_MENU_LIST_ITEM_NO_TAIL = re.compile(
    r"(?m)^([ \t]*[-*] [^\n]+?)\s*\n\s*\n[ \t]+(\*\*[^\n]+?\*\*)(?=\n[ \t]*[-*] )"
)
_SPLIT_PLAIN_MENU_LIST_ITEM = re.compile(
    r"(?m)^([ \t]*[-*] (?:Go to|Select)[^\n]+?)\s*\n\s*\n[ \t]+([A-Za-z][^\n]*?)\s*\n\s*\n[ \t]*(?!(?:note|tip|important)(?:\s|$)|!\[|```)([^\n]*)"
)


def normalize_navigation_markdown(text: str) -> str:
    """Restore separators that are lost between adjacent scraped UI controls."""
    # A DITA menu cascade is often serialized as adjacent <b> tags.  Preserve
    # that hierarchy in both full articles and inline result previews.
    text = _ADJACENT_BOLD.sub("** → **", text)
    # markdownify sometimes puts a menu path on its own indented paragraph
    # between a list item's verb and its period. Keep the instruction together
    # so later steps remain in the same list.
    def join_split_menu_item(match: re.Match[str]) -> str:
        tail = match.group(3).strip()
        separator = "" if not tail or tail[0] in ".,;:)" else " "
        return f"{match.group(1).rstrip()} {match.group(2).strip()}{separator}{tail}"

    text = _SPLIT_MENU_LIST_ITEM.sub(join_split_menu_item, text)
    text = _SPLIT_MENU_LIST_ITEM_NO_TAIL.sub(
        lambda match: f"{match.group(1).rstrip()} {match.group(2).strip()}",
        text,
    )
    text = _SPLIT_PLAIN_MENU_LIST_ITEM.sub(join_split_menu_item, text)
    # Some controls are attached directly to the preceding verb (e.g. select**X).
    text = _MISSING_BEFORE_BOLD.sub(r" \1", text)
    return _MISSING_AFTER_BOLD.sub(r"\1 ", text)


# --------------------------------------------------------------------------- #
# URL / path helpers
# --------------------------------------------------------------------------- #
def page_url(path: str, is_category: bool) -> str:
    """Canonical site URL for a manifest record's rendered page."""
    return f"/{path}/index.html" if is_category else f"/{path}.html"


def out_file(path: str, is_category: bool) -> Path:
    """Filesystem output path for a record, mirroring `path`."""
    return SITE / path / "index.html" if is_category else SITE / f"{path}.html"


def load_catalog() -> dict:
    """The facet index built by builder/build_catalog.py.

    Required: /errors/ is a first-class surface now, so a silent skip would ship
    a site whose navigation points at a 404.
    """
    if not CATALOG.exists():
        raise SystemExit(
            f"ERROR: {CATALOG.relative_to(ROOT)} is missing.\n"
            "  Build it first:  .venv/bin/python builder/build_catalog.py\n"
            "  (build.sh runs this for you, in order, before build_site.py.)"
        )
    return json.loads(CATALOG.read_text(encoding="utf-8"))


def expand_row(row: list, catalog: dict) -> dict:
    """One packed catalog row -> the dict the row templates expect."""
    return {
        "title": row[0],
        "url": row[1],
        "code": row[2],
        "jurisdiction": catalog["jurisdictions"][row[3]],
        "return_label": catalog["returns"][row[4]]["label"],
        "type_label": catalog["types"][row[5]]["label"],
        "excerpt": row[7],
    }


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
    text = normalize_navigation_markdown(text)
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
    catalog = load_catalog()

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
    tpl_catalog = env.get_template("catalog.html")
    tpl_catalog_index = env.get_template("catalog_index.html")

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

    code_count = sum(1 for row in catalog["rows"] if row[2])
    index_html = tpl_search.render(
        site_name=SITE_NAME,
        sections=browse,
        nav_active="resolver",
        catalog=catalog,
        code_count=code_count,
    )
    write(SITE / "index.html", index_html)

    # ---- Error catalog (/errors/) ----------------------------------------- #
    expanded = [expand_row(row, catalog) for row in catalog["rows"]]
    write(
        SITE / "errors" / "index.html",
        tpl_catalog.render(
            site_name=SITE_NAME,
            nav_active="catalog",
            catalog=catalog,
            code_count=code_count,
            initial_rows=expanded[:CATALOG_PREVIEW_ROWS],
        ),
    )

    # The client payload. build_site.py wipes site/, so the catalog is built into
    # data/ and copied here rather than written to site/ by its own builder.
    write(SITE / "catalog.json", CATALOG.read_text(encoding="utf-8"))

    # ---- Static facet indexes -------------------------------------------- #
    # These are the JavaScript-free spine of the catalog and the stable
    # deep-link target for "every California error" / "every 1065 error".
    def facet_pages(facet_key: str, pages: list[dict], base: str, sibling_heading: str,
                    lede_for) -> int:
        """One index page per facet value.

        `pages` may include values with no rows in the current corpus; those get
        the template's empty state. Siblings link only to populated values, so the
        cross-links stay useful.
        """
        column = 3 if facet_key == "jurisdictions" else 4
        rows_by_code: dict[str, list[dict]] = {}
        for index, row in enumerate(catalog["rows"]):
            code = catalog[facet_key][row[column]]["code"]
            rows_by_code.setdefault(code, []).append(expanded[index])

        siblings = [
            {
                "label": other["label"],
                "href": f"/errors/{base}/{other['slug']}/",
                "count": other["count"],
                "current": False,
            }
            for other in catalog[facet_key]
        ]

        written_pages = 0
        for entry in pages:
            rows = rows_by_code.get(entry["code"], [])
            page_siblings = [
                {**sibling, "current": sibling["href"] == f"/errors/{base}/{entry['slug']}/"}
                for sibling in siblings
            ]
            html = tpl_catalog_index.render(
                site_name=SITE_NAME,
                nav_active="catalog",
                heading=entry["label"],
                lede=lede_for(entry),
                rows=rows,
                coded=sum(1 for row in rows if row["code"]),
                siblings=page_siblings,
                siblings_heading=sibling_heading,
                return_param=f"%2Ferrors%2F{base}%2F{entry['slug']}%2F",
            )
            write(SITE / "errors" / base / entry["slug"] / "index.html", html)
            written_pages += 1
        return written_pages

    jurisdiction_pages = facet_pages(
        "jurisdictions",
        all_jurisdictions(),
        "jurisdiction",
        "Every jurisdiction",
        lambda entry: (
            f"Every indexed GoSystem Tax RS e-file article for {entry['label']}. "
            "Open one for the verbatim Thomson Reuters fix."
        ),
    )
    return_pages = facet_pages(
        "returns",
        catalog["returns"],
        "return",
        "Every return type",
        lambda entry: (
            f"Every indexed e-file article filed under {entry['label']}, across all jurisdictions."
        ),
    )

    # ---- Static design assets ------------------------------------------- #
    shutil.copytree(ASSETS_SRC, SITE / "assets", dirs_exist_ok=True)
    written.extend(path for path in (SITE / "assets").iterdir() if path.is_file())

    # ---- Summary --------------------------------------------------------- #
    print(f"Built {len(written)} files into {SITE}")
    print(f"  articles + categories : {len(articles)}")
    print(f"  section index pages   : "
          f"{sum(1 for w in written if w.parent.name in sections and w.name == 'index.html')}")
    print(f"  search landing        : site/index.html")
    print(f"  error catalog         : site/errors/index.html ({catalog['count']} rows)")
    print(f"  jurisdiction indexes  : {jurisdiction_pages}")
    print(f"  return-type indexes   : {return_pages}")
    print(f"  stylesheet            : site/assets/styles.css")


if __name__ == "__main__":
    main()
