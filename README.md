# GoSystem Tax RS Help — Search Portal

A free, fast, **static** search portal for Thomson Reuters **GoSystem Tax RS** help
articles. A user pastes an **error code** (e.g. `F1065-037-02`) or types a
plain-language question and instantly gets the **verbatim Thomson Reuters article**
as the fix.

The pipeline scrapes the official help docs, renders one static HTML page per
article (with a canonical "Source: Thomson Reuters" attribution link), builds an
error-code lookup index, and indexes everything for full-text search with
[Pagefind](https://pagefind.app). The output is a plain `site/` directory that can
be hosted anywhere (Vercel, Netlify, GitHub Pages, S3, …) — no server, no database.

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
  │  2. builder/build_site.py ◄───────────┘                                    │
  │                                 ─────► site/**/*.html   (one page/article) │
  │                                        site/index.html  (search landing)   │
  │                                        site/assets/styles.css              │
  │                                        │                                   │
  │  3. search/build_codes_index.py ◄──────┘ (reads manifest)                  │
  │                                 ─────► site/codes.json  (error-code index) │
  │                                                                            │
  │  4. cp search/search.js ────────► site/assets/search.js                    │
  │                                                                            │
  │  5. npx pagefind --site site ───► site/pagefind/       (full-text index)   │
  │                                                                            │
  └──────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
                        Deployable static site  ./site/
```

Component ownership (see `CONTRACT.md` for the full interface spec):

| Dir / files          | Owner   | Produces                                        |
|----------------------|---------|-------------------------------------------------|
| `scraper/`           | Agent A | `data/manifest.json`, `content/`, `_raw/`       |
| `builder/`           | Agent B | `site/` pages, `site/assets/styles.css`, `index.html` |
| `search/`            | Agent C | `site/codes.json`, `search/search.js`           |
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

It runs, in order: **scrape -> build_site -> build_codes_index -> copy search.js -> pagefind index**,
echoing progress and failing fast on the first error. When it finishes, the
deployable site is in `./site/`.

Preview locally with any static file server, e.g.:

```bash
npx serve site          # then open the printed URL
# or:  python3 -m http.server -d site 8000
```

`npm run build` is an alias for `./build.sh`; `npm run index` re-runs just the
Pagefind indexing step against an existing `site/`.

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
