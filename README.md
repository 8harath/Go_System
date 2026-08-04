# GoSystem Tax RS Help — Search Portal

A free, fast, **static** search portal for Thomson Reuters **GoSystem Tax RS** help
articles. A user pastes an **error code** (e.g. `F1065-037-02`) or types a
plain-language question and instantly gets the **verbatim Thomson Reuters article**
as the fix.

There are two ways in, for the two ways people actually arrive.

**1. The resolver (`/`)** — for when you have the error in front of you.

- **Auto mode** parses a complete pasted diagnostic and detects its jurisdiction,
  form, schedule, field, constraint, and reject code.
- **Manual mode** lets a user search with any combination of jurisdiction, reject
  code, return/form, schedule, field or element, error type, and message keywords.
  Selecting a jurisdiction strictly scopes the results, and submitted manual
  criteria are reflected in the URL so the search can be bookmarked or shared.

**2. The error catalog (`/errors/`)** — for when you don't, or you want to see what
exists. Every indexed article in one filterable list, faceted by **jurisdiction**,
**return type**, **what went wrong**, **topic**, and **whether it has a reject
code**. Filters compose, counts are contextual (a facet showing "12" really does
yield 12 rows, so there are no dead ends), the whole filter state round-trips
through the URL, and any row expands to show the fix inline. See
[The error catalog](#the-error-catalog).

The pipeline scrapes the official help docs, renders one static HTML page per
article (with a canonical "Source: Thomson Reuters" attribution link), builds an
error-code lookup index and a facet index, and indexes everything for full-text
search with [Pagefind](https://pagefind.app). The output is a plain `site/`
directory that can be hosted anywhere (Vercel, Netlify, GitHub Pages, S3, …) — no
server, no database.

> **Scope:** The current deployable corpus builds the complete **`e-file` section** (1,426 records).
> Flip to all 10 sections with a single env var — see
> [Switching PoC -> all sections](#switching-poc---all-sections).

---

## Pipeline

```
                          build.sh  (SECTIONS=e-file by default)
  ┌──────────────────────────────────────────────────────────────────────────┐
  │                                                                            │
  │  1. scraper/scrape.py ──────────► data/manifest.json                       │
  │     --sections $SECTIONS          content/<path>.md|.html                  │
  │                                   _raw/<path>.html   (audit)               │
  │                                        │                                   │
  │  2. builder/build_catalog.py ◄─────────┤                                   │
  │                                 ─────► data/catalog.json  (facet index)    │
  │                                        │                                   │
  │  3. builder/build_site.py ◄────────────┘ (manifest + content + catalog)    │
  │                                 ─────► site/**/*.html   (one page/article) │
  │                                        site/index.html    (resolver)       │
  │                                        site/errors/index.html  (catalog)   │
  │                                        site/errors/jurisdiction/<slug>/    │
  │                                        site/errors/return/<slug>/          │
  │                                        site/catalog.json  (copied payload) │
  │                                        site/assets/styles.css              │
  │                                        │                                   │
  │  4. search/build_codes_index.py ◄──────┤ (reads manifest)                  │
  │                                 ─────► site/codes.json  (error-code index) │
  │                                        │                                   │
  │  5. search/build_signature_index.py ◄──┘                                   │
  │                                 ─────► site/signatures.json                │
  │                                                                            │
  │  6. cp search/{search,error_matcher,catalog}.js ──► site/assets/           │
  │                                                                            │
  │  7. npx pagefind --site site ───► site/pagefind/       (full-text index)   │
  │                                                                            │
  └──────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
                        Deployable static site  ./site/
```

> **Ordering constraint:** `build_catalog.py` must run *before* `build_site.py`.
> `build_site.py` wipes `site/` and then copies `data/catalog.json` into it, which
> is why the facet index is written to `data/` rather than straight to `site/`.

Component ownership (see `CONTRACT.md` for the full interface spec):

| Dir / files          | Owner   | Produces                                        |
|----------------------|---------|-------------------------------------------------|
| `scraper/`           | Agent A | `data/manifest.json`, `content/`, `_raw/`       |
| `builder/`           | Agent B | `data/catalog.json`, `site/` pages (resolver, articles, catalog, facet indexes), `site/assets/styles.css` |
| `search/`            | Agent C | `site/codes.json`, `site/signatures.json`, `search/{search,error_matcher,catalog}.js` |
| `deploy/`, root cfg  | Agent D | `build.sh`, `requirements.txt`, `package.json`, host configs, CI |

---

## Setup

Requires **Python 3.9+** and **Node.js 18+** (Node ships `npx`, used for Pagefind).

```bash
# 1. Python virtualenv + dependencies
python3 -m venv .venv
.venv/bin/pip install --upgrade pip
.venv/bin/pip install -r requirements.txt

# 2. Node dependencies (Pagefind)
npm install
```

---

## Build & run

The whole pipeline is orchestrated by `build.sh` (idempotent — safe to re-run):

```bash
./build.sh                 # complete e-file corpus (default)
```

It runs, in order: **scrape -> build_catalog -> build_site -> build_codes_index ->
build_signature_index -> copy browser clients -> pagefind index**,
echoing progress and failing fast on the first error. When it finishes, the
deployable site is in `./site/`.

Preview locally with any static file server, e.g.:

```bash
npx serve site          # then open the printed URL
# or:  python3 -m http.server -d site 8000
```

`npm run build` is an alias for `./build.sh`; `npm run index` re-runs just the
Pagefind indexing step against an existing `site/`.

### Rebuilding without re-scraping

`build.sh` starts with the scraper. When you are only changing the site (templates,
CSS, facets) and `content/` + `data/manifest.json` are already present, skip
straight to the build steps so you don't touch the origin at all:

```bash
.venv/bin/python builder/build_catalog.py       # data/catalog.json
.venv/bin/python builder/build_site.py          # site/
.venv/bin/python search/build_codes_index.py    # site/codes.json
.venv/bin/python search/build_signature_index.py
cp search/search.js search/error_matcher.js search/catalog.js site/assets/
npx pagefind --site site
```

### Tests

```bash
npm test
```

Five suites, all offline and dependency-free:

| Suite | Checks |
|-------|--------|
| `matcher_selftest.mjs`     | the deterministic parser and scorer, on synthetic errors |
| `integration_selftest.mjs` | ranking against the real generated indexes |
| `ui_selftest.mjs`          | the resolver's DOM contract (required control ids, all 52 jurisdictions, asset sync) |
| `catalog_selftest.mjs`     | catalog integrity — facet indices resolve, counts match their rows, every row URL and facet page exists, and the Python and JS jurisdiction-slug rules agree |
| `a11y_selftest.mjs`        | the accessibility contract below, recomputed from the actual CSS |

---

## The error catalog

`/errors/` is the browse-everything surface, for when you don't have a diagnostic
to paste. It lists every non-category article (1,288 of the 1,426 records; the
other 138 are topic index pages, reachable through breadcrumbs) and filters them
on five facets:

| Facet | Derived from | Notes |
|-------|--------------|-------|
| Jurisdiction | `builder/jurisdiction.py` | The same classifier the article pages and search indexes use, so a row can never disagree with the page it links to |
| Return type | breadcrumb / path (`1065 e-file errors`, `1040 returns`) | Read off structure, not guessed from the body |
| What went wrong | title + full article body | Structural patterns (missing data, unexpected data, value mismatch, …), most specific first |
| Topic | the breadcrumb node under the section | Attachments, Signature & PIN, Create & transmit, … |
| Reject code | title, then dashed-MeF codes in the manifest | See the note on code extraction below |

Two deliberate choices worth knowing about:

- **Unclassified is a real answer.** Roughly 42% of rows get a specific error type.
  The rest land in "General rejection" (recognisably a rejection, no nameable
  structural signal) or "Not classified". Those labels say exactly that instead of
  implying a diagnosis the source text doesn't support.
- **Reject codes come from the title, not `manifest.codes`.** That list is a
  harvest of every code-shaped token in the body, so it is full of publication
  numbers, tax years and placeholders, and its order is meaningless — reading
  `codes[0]` mislabels articles. `build_catalog.py` reads the article's own
  `"<CODE> e-file error"` title, falling back to a dashed-MeF-shaped manifest code.
  `catalog_selftest.mjs` enforces that every bare-numeric code is corroborated by
  the article's own URL.

**Progressive enhancement.** The page ships its first 50 rows as HTML and 59 static
index pages (`/errors/jurisdiction/<slug>/`, `/errors/return/<slug>/`) that are
complete, JavaScript-free lists. Live filtering needs `catalog.json` (287 KB, 58 KB
gzipped); if that fetch fails the static rows stay put and the page says so rather
than rendering an empty shell.

---

## Design & accessibility

The theme is a **"Filing Desk"** system: flat opaque surfaces, hairline rules,
and type carrying the hierarchy. The reasoning, briefly, since it constrains
future edits:

- **No glassmorphism.** Translucency makes text contrast depend on whatever
  scrolls behind it, and `backdrop-filter` shimmers text during scroll. Both are
  disqualifying for an all-day reference tool. There is no `backdrop-filter` in
  the stylesheet and a test keeps it that way.
- **Brutalism's discipline, not its shock.** Honest structure, no decorative
  gradients, generous hit targets — but modulated hierarchy and a humanist sans
  for prose, because these articles *are* prose instructions.
- **Monospace is semantic.** `var(--mono)` marks machine tokens (reject codes,
  element paths, XPaths) and nothing else.
- **Blue primary, green only for "resolved", red only for "reject".** The previous
  green accent was simultaneously the primary action, the Federal jurisdiction and
  "best match" — and green/red alone is the worst pair for deuteranopia, in a
  male-skewed profession. Jurisdiction is now a text abbreviation badge (`CA`,
  `FED`, `GEN`), so it survives greyscale and forced-colors.

### Brand assets

The SVGs in `builder/assets/` are the source of truth; the PNGs beside them exist
only for consumers that cannot take an SVG.

| Source | Rasterized to | Used by |
|--------|---------------|---------|
| `logo-mark.svg` | `favicon-32.png` | in-app brand mark, SVG favicon, PNG fallback |
| `app-icon.svg` | `app-icon-180.png`, `app-icon-512.png` | apple-touch-icon, maskable PWA icon |
| `share-card.svg` | `share-card.png` | `og:image` / `twitter:image` |

`logo-mark.svg` is the rounded mark; `app-icon.svg` is **full-bleed** with the glyph
inside the maskable safe zone (the centre circle of radius 40%), because platforms
apply their own mask and baked-in rounding shows as a double corner. The manifest
previously declared the rounded SVG as `"any maskable"`, which would have had its
corners cropped; the two purposes are now separate entries.

Regenerate after editing any SVG, then commit both:

```bash
.venv/bin/python builder/make_icons.py            # rasterize
.venv/bin/python builder/make_icons.py --check    # verify, write nothing
```

`--check` also verifies the corpus figures printed on the share card against
`data/catalog.json`, since a raster can't read the build data and would otherwise
go quietly stale.

> Not wired into `build.sh` on purpose: it uses macOS `sips`, and the scheduled CI
> job runs on Linux. The PNGs are committed instead. The script's docstring lists
> equivalent `rsvg-convert` / `inkscape` / `magick` commands for other platforms.

`search/a11y_selftest.mjs` recomputes these claims from the CSS on every run, so
a regression fails the build rather than shipping:

- **Type scale** — every `font-size` resolves to a `--fs-*` token; nothing below
  **12px**; 16px base; form controls at 16px so iOS doesn't zoom on focus.
- **Contrast** — 28 colour pairs per theme, recomputed with the WCAG formula from
  the actual token values. Body text ≥ 7:1, secondary text ≥ 4.5:1, control
  borders and focus rings ≥ 3:1. Light and dark both pass with margin.
- **Markup** — one `h1` per page, a skip link and `main` landmark, unique ids, no
  positive `tabindex`, `alt` on every image, and an accessible name on every form
  control and button.
- **Preferences honoured** — `prefers-reduced-motion`, `prefers-contrast: more`,
  `forced-colors: active`, `prefers-color-scheme` (the theme follows the OS until
  you explicitly toggle it), plus a print stylesheet.

---

## Switching PoC -> all sections

`build.sh` reads the **`SECTIONS`** environment variable (default `e-file`). Set it to
`all` to build every section, or pass an explicit comma-separated list:

```bash
SECTIONS=all ./build.sh                    # all 10 sections
SECTIONS=709,706,1040 ./build.sh           # an explicit subset
```

`all` expands inside `build.sh` to the canonical section list from `CONTRACT.md`:

```
e-file, import-export, 1065, 1120, 1040, 1041, 990, 5500, 706, 709
```

The scheduled CI job (`.github/workflows/refresh.yml`) runs with `SECTIONS=all`.

> Please keep the scraper's built-in politeness (~1 req/s, retries, on-disk cache)
> when building all sections — it is a courtesy to the source site.

---

## Deploy

The build needs Python **and** Node, which most static hosts do not provide by
default. The **recommended flow** is to build in CI and deploy the prebuilt
`./site/` directory. Both host configs and a ready-to-use GitHub Actions workflow
are included.

### GitHub Actions (recommended, automated)

`.github/workflows/refresh.yml` runs **weekly** (Mondays 07:00 UTC) and on demand:
it recreates the venv, installs deps, runs `build.sh` for all sections, then
deploys. Configure the required secrets under
**Settings -> Secrets and variables -> Actions** (names documented in the workflow;
the default active path is Netlify, with a commented-out Vercel alternative):

- Netlify: `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`
- Vercel:  `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

### Netlify

Config: `deploy/netlify.toml` (publish dir `site`). To deploy a locally-built site:

```bash
./build.sh
npx netlify deploy --dir=site --prod
```

Or point Netlify at the repo and let it run `bash build.sh` (only works if the
build image has Python 3 — otherwise prefer the CI flow above). Copy
`deploy/netlify.toml` to the repo root if Netlify does not pick it up from `deploy/`.

### Vercel

The root **`vercel.json`** is the active config: a **prebuilt static deploy**.
`site/` is committed, so importing the repo into Vercel "just works" — Vercel
serves `./site` as-is with no build step. `framework: null` plus the no-op
`installCommand`/`buildCommand` stop Vercel from auto-detecting this as a Python
(`requirements.txt`) or Node (`package.json`) project. It also sends long
`Cache-Control` headers for the immutable Pagefind index and short,
revalidating ones for the JSON/JS/CSS assets.

> **Zero-config import:** In the Vercel dashboard, *Add New → Project*, pick this
> repo, leave every Build & Output setting on its default, and deploy. Nothing
> else is required. After changing content, re-run `./build.sh` locally and
> re-commit `./site`, then push — Vercel redeploys automatically.

Note: **`vercel.json` cannot contain comments or unknown keys** — Vercel's schema
sets `additionalProperties: false` and rejects an unknown top-level key (e.g. a
`"//"` comment) with an `Invalid vercel.json` build error. Keep it comment-free.

`deploy/vercel.json` is an **alternative** config for letting Vercel run the full
build (`bash build.sh`) itself; that only works if the build image has Python 3.
To deploy a locally-built site with the Vercel CLI instead of the dashboard:

```bash
./build.sh
mkdir -p .vercel/output/static && cp -R site/. .vercel/output/static/
printf '{ "version": 3 }' > .vercel/output/config.json
npx vercel deploy --prebuilt --prod
```

### Search-engine indexing (your choice)

Because this portal republishes third-party copyrighted content, you may prefer
to **discourage public search indexing**. `netlify.toml` ships an optional,
off-by-default `X-Robots-Tag: noindex` header (a real commented-out line). To do
the same on Vercel, add this object to the `headers[0].headers` array (the
`/(.*)` rule) in the root `vercel.json`:

```json
{ "key": "X-Robots-Tag", "value": "noindex" }
```

It is entirely your call.

---

## Attribution & Terms of Use — please read

This project **downloads and republishes Thomson Reuters copyrighted help
documentation** (GoSystem Tax RS). It is an independent, non-official aid; it is
**not affiliated with, endorsed by, or sponsored by Thomson Reuters**.

If you deploy this publicly, you are responsible for how the content is used. In
particular:

- **Attribution is required.** Every generated article page links back to the
  canonical Thomson Reuters source ("Source: Thomson Reuters ↗"). Do not remove
  or obscure these attribution links.
- **Verbatim republication of copyrighted material.** The article bodies are
  reproduced verbatim from Thomson Reuters. Redistributing them publicly may
  require permission and may be subject to Thomson Reuters' terms of use and
  applicable copyright law. Review those terms before deploying, and consult
  counsel if you are unsure.
- **Be ready to take it down.** If Thomson Reuters (or any rights holder)
  requests removal, take the deployment offline promptly.
- **Scrape politely.** Respect the source site: keep the ~1 req/s rate limit,
  retries/backoff, and caching that the scraper implements. Do not hammer the
  origin.
- Consider enabling the optional `X-Robots-Tag: noindex` header (see above) to
  keep the republished content out of public search engines.

All GoSystem Tax RS content and trademarks are the property of Thomson Reuters.
