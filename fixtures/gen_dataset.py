#!/usr/bin/env python3
"""One-off generator: build a REAL dataset for section 709 so downstream agents
build against ground truth. The production scraper (scraper/scrape.py) generalizes
this to all sections with politeness/caching/resume. Output schema == CONTRACT.md.
"""
import warnings; warnings.filterwarnings("ignore")
import re, html, json, hashlib, time, datetime, pathlib
import requests
from bs4 import BeautifulSoup
from markdownify import markdownify as md

ROOT = pathlib.Path(__file__).resolve().parent.parent
BASE = "https://www.thomsonreuters.com"
PREFIX = "/en-us/help/gosystem-tax-rs"
UA = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (GoSystemHelpArchiver/1.0)"}
SECTION = "709"

# Error-code pattern (matters for e-file sections; harmless here). Kept in CONTRACT.
CODE_RE = re.compile(r'\b([A-Z]{1,6}\d{2,}[-\dA-Za-z]*|\d{4,}[-\dA-Za-z]*|[A-Z]\d{4}[-\dA-Za-z]*)\b')

def clean_url(p):
    p = p.replace("/content/helpandsupp", "")
    if p.endswith(".html"): p = p[:-5]
    return p

def fetch(url):
    r = requests.get(url, headers=UA, timeout=30)
    return r

def extract_codes(title, text):
    cands = set()
    for m in CODE_RE.findall(f"{title}\n{text}"):
        if any(ch.isdigit() for ch in m) and len(m) >= 4:
            cands.add(m)
    return sorted(cands)

def main():
    # 1) discovery from browse JSON island
    br = fetch(f"{BASE}{PREFIX}/{SECTION}/browse")
    dec = html.unescape(br.text)
    pairs = re.findall(r'"title":"(.*?)","path":"(.*?)"', dec)
    nodes = []
    seen = set()
    for title, path in pairs:
        cu = clean_url(path)
        if cu in seen: continue
        seen.add(cu)
        rel = cu.replace(PREFIX + "/", "")  # e.g. 709/prepare-gift-tax-returns/calculate-gst
        nodes.append({"title": title, "clean_url": cu, "rel": rel})

    rels = {n["rel"] for n in nodes}
    title_by_rel = {n["rel"]: n["title"] for n in nodes}

    articles = []
    for n in nodes:
        rel = n["rel"]
        is_cat = any(r != rel and r.startswith(rel + "/") for r in rels)
        url = BASE + n["clean_url"]
        r = fetch(url)
        soup = BeautifulSoup(r.text, "lxml")
        topic = soup.select_one("div.topic")
        body_html = str(topic) if topic else ""
        body_md = md(body_html, heading_style="ATX").strip() if body_html else ""
        text = topic.get_text(" ", strip=True) if topic else ""
        # breadcrumb from ancestor path segments
        segs = rel.split("/")
        crumb = ["GoSystem Tax RS"]
        for i in range(len(segs)):
            anc = "/".join(segs[:i+1])
            crumb.append(title_by_rel.get(anc, segs[i]))
        parent = "/".join(segs[:-1]) if len(segs) > 1 else None
        sha = hashlib.sha256(body_html.encode("utf-8")).hexdigest()

        # write content + raw mirroring the path
        md_rel = f"content/{rel}/index.md" if is_cat else f"content/{rel}.md"
        html_rel = f"content/{rel}/index.html" if is_cat else f"content/{rel}.html"
        raw_rel = f"_raw/{rel}/index.html" if is_cat else f"_raw/{rel}.html"
        for relp, data in ((md_rel, body_md), (html_rel, body_html), (raw_rel, r.text)):
            fp = ROOT / relp
            fp.parent.mkdir(parents=True, exist_ok=True)
            fp.write_text(data, encoding="utf-8")

        rec = {
            "url": url, "source_url": url, "path": rel, "section": SECTION,
            "title": n["title"], "breadcrumb": crumb, "parent": parent,
            "is_category": is_cat, "codes": extract_codes(n["title"], text),
            "content_md": md_rel, "content_html": html_rel, "raw_html": raw_rel,
            "sha256": sha, "fetched_at": datetime.datetime.utcnow().isoformat() + "Z",
        }
        articles.append(rec)
        print(f"[{'CAT' if is_cat else 'ART'}] {rel}  ({len(body_md)} md chars)")
        time.sleep(0.8)  # polite

    manifest = {
        "generated_at": datetime.datetime.utcnow().isoformat() + "Z",
        "base_url": BASE, "prefix": PREFIX, "sections": [SECTION],
        "count": len(articles), "articles": articles,
    }
    (ROOT / "data").mkdir(exist_ok=True)
    (ROOT / "data" / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"\nWROTE data/manifest.json with {len(articles)} records")

if __name__ == "__main__":
    main()
