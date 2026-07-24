#!/usr/bin/env python3
"""Build a manifest from ALREADY-scraped e-file content on disk (no re-fetch of
articles) so we can demo before the full crawl's end-of-run manifest write.
One browse fetch for titles/hierarchy; everything else read from content/ + _raw/.
Safe alongside the running crawl: it only reads content/, and the crawl will
overwrite data/manifest.json with the complete set when it finishes.
"""
import warnings; warnings.filterwarnings("ignore")
import re, html, json, hashlib, datetime, pathlib, glob, os
import requests

ROOT = pathlib.Path(__file__).resolve().parent.parent
BASE = "https://www.thomsonreuters.com"
PREFIX = "/en-us/help/gosystem-tax-rs"
UA = {"User-Agent": "Mozilla/5.0 (Macintosh) GoSystemHelpArchiver/1.0"}
SECTION = "e-file"
CODE_RE = re.compile(r'\b([A-Z]{1,6}\d{2,}[-\dA-Za-z]*|[A-Z]\d{4}[-\dA-Za-z]*)\b')

def clean(p):
    p = p.replace("/content/helpandsupp", "")
    return p[:-5] if p.endswith(".html") else p

def main():
    r = requests.get(f"{BASE}{PREFIX}/{SECTION}/browse", headers=UA, timeout=30)
    dec = html.unescape(r.text)
    pairs = re.findall(r'"title":"(.*?)","path":"(.*?)"', dec)

    nodes, seen = [], set()
    for title, path in pairs:
        rel = clean(path).replace(PREFIX + "/", "")
        if rel in seen:
            continue
        seen.add(rel)
        nodes.append((title, rel))
    rels = {rel for _, rel in nodes}
    title_by_rel = {rel: t for t, rel in nodes}

    articles = []
    for title, rel in nodes:
        is_cat = any(r != rel and r.startswith(rel + "/") for r in rels)
        md_rel = f"content/{rel}/index.md" if is_cat else f"content/{rel}.md"
        html_rel = f"content/{rel}/index.html" if is_cat else f"content/{rel}.html"
        raw_rel = f"_raw/{rel}/index.html" if is_cat else f"_raw/{rel}.html"
        if not (ROOT / md_rel).exists():
            continue                                  # not scraped yet — skip
        body_html = (ROOT / html_rel).read_text(encoding="utf-8") if (ROOT / html_rel).exists() else ""
        md_text = (ROOT / md_rel).read_text(encoding="utf-8")
        segs = rel.split("/")
        crumb = ["GoSystem Tax RS"] + ["/".join(segs[:i+1]) for i in range(len(segs))]
        crumb = ["GoSystem Tax RS"] + [title_by_rel.get("/".join(segs[:i+1]), segs[i]) for i in range(len(segs))]
        codes = sorted({m for m in CODE_RE.findall(title + "\n" + md_text) if any(c.isdigit() for c in m) and len(m) >= 4})
        articles.append({
            "url": BASE + PREFIX + "/" + rel, "source_url": BASE + PREFIX + "/" + rel,
            "path": rel, "section": SECTION, "title": title, "breadcrumb": crumb,
            "parent": "/".join(segs[:-1]) if len(segs) > 1 else None,
            "is_category": is_cat, "codes": codes,
            "content_md": md_rel, "content_html": html_rel, "raw_html": raw_rel,
            "sha256": hashlib.sha256(body_html.encode()).hexdigest(),
            "fetched_at": datetime.datetime.utcnow().isoformat() + "Z",
        })

    manifest = {
        "generated_at": datetime.datetime.utcnow().isoformat() + "Z",
        "base_url": BASE, "prefix": PREFIX, "sections": [SECTION],
        "count": len(articles), "articles": articles, "_snapshot": True,
    }
    (ROOT / "data" / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    cats = sum(1 for a in articles if a["is_category"])
    print(f"snapshot manifest: {len(articles)} records ({cats} categories, {len(articles)-cats} articles)")
    ca = [a for a in articles if "1065-e-file-errors/states/california" in a["path"]]
    print(f"  incl. {len(ca)} CA 1065 e-file-error pages")

if __name__ == "__main__":
    main()
