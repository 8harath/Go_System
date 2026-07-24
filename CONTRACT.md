# GoSystem Tax RS Help — Search Portal · BUILD CONTRACT

Shared interface spec. Every component builds against this so parallel work integrates.
**Goal:** scrape all GoSystem Tax RS help docs → a free static site where a user pastes an
error code (or types a question) and gets the **verbatim Thomson Reuters article** as the fix.

## Verified facts (already proven against the live site — do not re-investigate)
- Each of the 10 sections has a browse page: `/en-us/help/gosystem-tax-rs/<section>/browse`.
- The browse page's raw HTML embeds an HTML-entity-encoded JSON tree. Nodes look like
  `{"title": "...", "path": "/content/helpandsupp/en-us/help/gosystem-tax-rs/...", "childrenList":[...]}`.
  `html.unescape()` then parse. Every article's real URL + title is here (slugs are NOT derivable from titles).
- Article body = `<div class="topic ...">` (DITA topic; classes: `topic topic task|concept|reference`).
  `markdownify(str(div), heading_style="ATX")` yields clean Markdown (headings/bold/lists preserved).
- URL normalization: strip `/content/helpandsupp` prefix and trailing `.html` → canonical `/en-us/help/...`.
- Sections: `e-file, import-export, 1065, 1120, 1040, 1041, 990, 5500, 706, 709`.
- Content is server-rendered; plain `requests` works. Be polite: ~1 req/s, retry w/ backoff, cache. No auth.

## Environment
- Python venv: `/Users/8harath/alpha/GS/gosystem-help/.venv/bin/python` (requests, bs4, lxml, jinja2, markdownify installed).
- Node/npx available (for Pagefind via `npx pagefind`).
- **PoC scope = section `709` only.** Full 10-section run happens after PoC is approved. Do NOT crawl all sections.

## Directory layout & OWNERSHIP (do not edit files outside your area)
```
gosystem-help/
  data/manifest.json      ← SCRAPER writes. Everyone else READS.
  content/<path>.md|.html ← SCRAPER writes. Builder READS.
  _raw/<path>.html        ← SCRAPER writes (audit).
  scraper/                ← AGENT A owns
  builder/                ← AGENT B owns (build_site.py, templates/, styles)
  search/                 ← AGENT C owns (codes index gen, search.js source, pagefind build script)
  deploy/                 ← AGENT D owns (host configs, CI, orchestration)
  site/                   ← BUILD OUTPUT (git-ignored). Builder writes pages+css+index.html;
                            Search writes site/codes.json + site/assets/search.js; Pagefind writes site/pagefind/.
  fixtures/               ← real 709 ground truth + gen_dataset.py (reference). Read-only for agents.
  CONTRACT.md, README.md
```
A real `data/manifest.json` + `content/709/**` already exist (12 records). Build against them now.

## manifest.json schema
```json
{ "generated_at":"ISO8601Z","base_url":"https://www.thomsonreuters.com",
  "prefix":"/en-us/help/gosystem-tax-rs","sections":["709"],"count":12,
  "articles":[
    { "url":"https://www.thomsonreuters.com/en-us/help/gosystem-tax-rs/709/prepare-gift-tax-returns/calculate-gst",
      "source_url":"<canonical TR link, same as url>",
      "path":"709/prepare-gift-tax-returns/calculate-gst",   // relative to section root; drives folder mirroring
      "section":"709",
      "title":"Calculate generation-skipping tax (GST)",
      "breadcrumb":["GoSystem Tax RS","709","Prepare gift tax returns","Calculate generation-skipping tax (GST)"],
      "parent":"709/prepare-gift-tax-returns",   // or null
      "is_category":false,                        // true = section/category landing (may have empty body)
      "codes":["F1065-037-02"],                   // best-effort error codes found in title/body ([] if none)
      "content_md":"content/709/.../calculate-gst.md",
      "content_html":"content/709/.../calculate-gst.html",
      "raw_html":"_raw/709/.../calculate-gst.html",
      "sha256":"<sha256 of body html>","fetched_at":"ISO8601Z" }
  ] }
```

## AGENT A — Scraper (`scraper/scrape.py`)
Productionize `fixtures/gen_dataset.py` into a robust, config-driven CLI.
- `--sections e-file,709` (default: all 10). CLI must be able to run **only 709** for the PoC.
- Robust JSON-island parse (walk `childrenList` recursively to preserve true hierarchy; fall back to path-prefix nesting).
- Politeness: ~1 req/s (configurable), retries w/ exponential backoff, on-disk HTTP cache in `.cache/` keyed by URL, **resumable** (skip unchanged via sha256), structured logging, summary stats.
- Output EXACTLY the schema above. Must reproduce the existing 12-record 709 manifest (validate against it).
- Acceptance: `python scraper/scrape.py --sections 709` regenerates data/ deterministically; README snippet for `--sections all`.

## AGENT B — Site builder (`builder/build_site.py` + `builder/templates/`)
Jinja2 static-site generator. Reads `data/manifest.json` + `content/*.md` → writes `site/`.
- One HTML page per article, mirroring `path` (`site/709/prepare-gift-tax-returns/calculate-gst.html`; categories → `.../index.html`).
- Each page: breadcrumb, `<h1>` title, verbatim body (render the `.md`), and a clear
  **"Source: Thomson Reuters ↗"** canonical link to `source_url` (attribution is required — public deployment).
- `site/index.html` = search landing page. It MUST contain the search DOM contract below and include
  `/assets/styles.css`, `/assets/search.js` (module), `/pagefind/pagefind.js`, and fetch `/codes.json`.
  Builder writes the shell + styles ONLY; it must NOT write `search.js` or `codes.json` (Agent C owns those).
- Clean, fast, self-contained CSS in `site/assets/styles.css`. Mobile-friendly. No external CDNs required.
- Acceptance: `python builder/build_site.py` produces browsable `site/` from the real 709 data.

### Search DOM contract (Builder implements, Search consumes)
- Search input: `<input id="gs-search" type="search" autofocus>`
- Results container: `<div id="gs-results"></div>`
- Builder includes, in `site/index.html`, in this order: `/codes.json` (prefetch or let search.js fetch it),
  `/pagefind/pagefind.js`, then `<script type="module" src="/assets/search.js"></script>`.

## AGENT C — Search (`search/`)
- `search/build_codes_index.py`: read `data/manifest.json` → write `site/codes.json`:
  `{ "normalize":"<describe>", "codes": { "<NORMALIZED_CODE>": {"title":..,"url":..,"section":..} , ... } }`.
  Normalization spec: uppercase; strip spaces; collapse separators so `F1065-037-02`, `f1065 037 02`,
  `F1065037-02` all map to one key. Document the exact rule in the file header and in `codes.json`.
- `site/assets/search.js` (ES module): on input, (1) normalize query and check `codes.json` for exact/prefix
  code hits → render those at the TOP; (2) run Pagefind full-text search for everything else / NL queries;
  merge, de-dupe, render into `#gs-results` (title + section chip + snippet + link to the article page).
  Uses the DOM contract IDs above. No framework; vanilla JS.
- `search/build_search.sh`: runs `npx pagefind --site site` to index Builder's output into `site/pagefind/`.
  (Actual indexing runs at integration, after Builder produces `site/`.)
- Acceptance: given the 709 `codes.json` (will be empty of codes — 709 has none) the module still works for
  text queries; include a tiny synthetic e-file code sample in a comment/test to prove normalization.

## AGENT D — Deploy & orchestration (`deploy/`, root)
- `requirements.txt` (pin the installed versions), `package.json` (pagefind devDependency + scripts).
- `build.sh` (or Makefile) orchestrating the pipeline **in this order**:
  `scrape → build_site → build_codes_index → pagefind index`. Idempotent; supports `SECTIONS=709`.
- Static-host configs for Vercel (`vercel.json`) AND Netlify (`netlify.toml`): output dir `site/`, SPA-style
  fallback not needed (multipage). Add `X-Robots-Tag: noindex` header option (commented, user's choice).
- `.github/workflows/refresh.yml`: scheduled re-scrape + rebuild + deploy (document required secrets).
- Root `README.md`: what it is, attribution/ToS note (public deployment republishes TR content — attribution
  required, be ready to take down on request), setup, `build.sh` usage, how to flip PoC→all sections, deploy steps.
- `.gitignore`: `.venv/`, `.cache/`, `site/`, `_raw/`, `__pycache__/`.
- Acceptance: `bash build.sh` (with SECTIONS=709) runs the whole pipeline to a deployable `site/`.

## Integration (owner: orchestrator, after agents report)
Order: scraper(709) → builder → search codes → pagefind → open `site/index.html` and verify search works.
