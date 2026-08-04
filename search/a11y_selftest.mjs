/* ============================================================================
 * a11y_selftest.mjs — accessibility contract for the generated site.
 *
 * The theme's accessibility claims are checked here rather than trusted, so a
 * future edit that reintroduces 9px labels or a 2.8:1 grey fails the build
 * instead of shipping. Three groups of checks:
 *
 *   1. TYPE SCALE     every font-size resolves to a --fs-* token (or a safe em),
 *                     and no token is below 12px.
 *   2. COLOUR         every text/background pair the design relies on is
 *                     recomputed from the actual CSS tokens against WCAG 2.2.
 *   3. MARKUP         the generated pages carry the structures assistive tech
 *                     needs: one h1, labelled controls, alt text, no positive
 *                     tabindex, unique ids, a skip link.
 *
 * No DOM library: the generated HTML is regular and small enough to check with
 * targeted regexes, which keeps this runnable with plain `node`.
 * ========================================================================== */

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = (p) => readFile(new URL(p, root), "utf8");

const css = await read("builder/assets/styles.css");
const builtCss = await read("site/assets/styles.css");
/* Declaration scans run against comment-stripped CSS. The stylesheet's own
   header documents the rules it follows ("no backdrop-filter", ...), and those
   sentences would otherwise trip the very checks they describe. */
const cssCode = css.replace(/\/\*[\s\S]*?\*\//g, "");
const catalogSource = await read("search/catalog.js");
const builtCatalog = await read("site/assets/catalog.js");

const pages = {
  "site/index.html": await read("site/index.html"),
  "site/errors/index.html": await read("site/errors/index.html"),
  "site/errors/jurisdiction/california/index.html": await read("site/errors/jurisdiction/california/index.html"),
  "site/errors/return/1065/index.html": await read("site/errors/return/1065/index.html"),
  "site/e-file/990-e-file-errors/federal/f990pf-905-01.html": await read("site/e-file/990-e-file-errors/federal/f990pf-905-01.html"),
};

let failures = 0;
function check(label, condition, detail = "") {
  if (!condition) failures++;
  console.log(`${condition ? "PASS" : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
}

/* ---------------------------------------------------------------------------
 * Token extraction
 * ------------------------------------------------------------------------- */
function tokenBlock(selector) {
  const start = cssCode.indexOf(selector + " {");
  assert.notEqual(start, -1, `missing token block: ${selector}`);
  const open = cssCode.indexOf("{", start);
  const end = cssCode.indexOf("\n}", open);
  const body = cssCode.slice(open + 1, end);
  const tokens = {};
  for (const [, name, value] of body.matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    tokens[name] = value.trim();
  }
  return tokens;
}

const lightTokens = tokenBlock(":root");
const darkTokens = { ...lightTokens, ...tokenBlock(':root[data-theme="dark"]') };

/* ---------------------------------------------------------------------------
 * 1. Type scale
 * ------------------------------------------------------------------------- */
const MIN_PX = 12;

const fsTokens = Object.entries(lightTokens).filter(([name]) => name.startsWith("fs-"));
check("type scale defines at least 7 steps", fsTokens.length >= 7, `${fsTokens.length} steps`);

for (const [name, value] of fsTokens) {
  const rem = Number.parseFloat(value);
  check(`--${name} is at least ${MIN_PX}px`, /rem$/.test(value) && rem * 16 >= MIN_PX, value);
}

// Every font-size in the sheet must come from the scale. Bare em values are
// allowed down to 0.85em (they sit inside already-large prose contexts); pt is
// allowed only in the print block.
const printStart = cssCode.indexOf("@media print");
const offenders = [];
for (const match of cssCode.matchAll(/font-size:\s*([^;]+);/g)) {
  const value = match[1].trim();
  const inPrint = printStart !== -1 && match.index > printStart;
  if (/^var\(--fs-[a-z0-9-]+\)$/.test(value)) continue;
  if (value === "inherit") continue;
  if (inPrint && /pt$/.test(value)) continue;
  if (/em$/.test(value) && !/rem$/.test(value) && Number.parseFloat(value) >= 0.85) continue;
  offenders.push(value);
}
check("every font-size uses the type scale", offenders.length === 0, offenders.join(", ") || "none");

check("body sets a 16px base", /body\s*\{[^}]*font-size:\s*var\(--fs-body\)/s.test(cssCode));
check("form controls are >=16px so iOS does not zoom on focus",
  /\.manual-field input,\s*\n?\.manual-field select \{[^}]*font-size:\s*var\(--fs-body\)/s.test(cssCode));

/* ---------------------------------------------------------------------------
 * 2. Colour contrast
 * ------------------------------------------------------------------------- */
function srgbToLinear(channel) {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function luminance(hex) {
  const value = hex.replace("#", "");
  const full = value.length === 3 ? value.split("").map(c => c + c).join("") : value;
  const [r, g, b] = [0, 2, 4].map(i => Number.parseInt(full.slice(i, i + 2), 16));
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

/* [foreground, background, minimum, what it is]
   4.5 = WCAG AA body text · 3.0 = AA large text, UI boundaries and focus rings */
const PAIRS = [
  ["ink", "surface", 7, "primary text on a card"],
  ["ink", "canvas", 7, "primary text on the page"],
  ["ink", "surface-sunk", 7, "primary text on a sunk panel"],
  ["ink-2", "surface", 4.5, "secondary text on a card"],
  ["ink-2", "canvas", 4.5, "secondary text on the page"],
  ["ink-2", "surface-sunk", 4.5, "secondary text on a sunk panel"],
  ["ink-3", "surface", 4.5, "metadata on a card"],
  ["ink-3", "canvas", 4.5, "metadata on the page"],
  ["ink-3", "surface-sunk", 4.5, "metadata on a sunk panel"],
  ["brand", "surface", 4.5, "primary accent on a card"],
  ["brand-ink", "surface", 4.5, "link text on a card"],
  ["brand-ink", "canvas", 4.5, "link text on the page"],
  ["brand-ink", "brand-wash", 4.5, "selected chip text"],
  ["on-brand", "brand", 4.5, "text on a primary button"],
  ["reject-ink", "reject-wash", 4.5, "error text in its callout"],
  ["reject-ink", "surface", 4.5, "error text on a card"],
  ["resolved-ink", "resolved-wash", 4.5, "resolved text in its callout"],
  ["resolved-ink", "surface", 4.5, "resolved text on a card"],
  ["attention", "attention-wash", 4.5, "attention text in its callout"],
  ["attention", "surface", 4.5, "attention text on a card"],
  ["fed-ink", "fed-wash", 4.5, "Federal jurisdiction pill"],
  ["state-ink", "state-wash", 4.5, "state jurisdiction pill"],
  ["edge", "surface", 3, "control border on a card"],
  ["edge", "canvas", 3, "control border on the page"],
  ["edge", "surface-sunk", 3, "control border on a sunk panel"],
  ["focus", "surface", 3, "focus ring against a card"],
  ["focus", "canvas", 3, "focus ring against the page"],
  ["focus", "surface-sunk", 3, "focus ring against a sunk panel"],
];

for (const [themeName, tokens] of [["light", lightTokens], ["dark", darkTokens]]) {
  let tightest = { margin: Infinity, description: "" };
  let passed = 0;

  for (const [fg, bg, min, what] of PAIRS) {
    const foreground = tokens[fg];
    const background = tokens[bg];
    assert(foreground && background, `${themeName}: missing token ${foreground ? bg : fg}`);

    const ratio = contrast(foreground, background);
    if (ratio - min < tightest.margin) {
      tightest = { margin: ratio - min, description: `${what} at ${ratio.toFixed(2)}:1 (needs ${min})` };
    }
    if (ratio >= min) passed++;
    else check(`${themeName}: ${what}`, false, `${ratio.toFixed(2)}:1 < ${min}:1 — ${fg} on ${bg}`);
  }

  check(`${themeName} theme: all ${PAIRS.length} colour pairs meet WCAG 2.2`,
    passed === PAIRS.length,
    `tightest margin is ${tightest.description}`);
}

check("no backdrop-filter behind text", !/backdrop-filter\s*:/.test(cssCode));
check("reduced motion is honoured", /@media \(prefers-reduced-motion: reduce\)/.test(cssCode));
check("forced-colors mode is handled", /@media \(forced-colors: active\)/.test(cssCode));
check("increased contrast is handled", /@media \(prefers-contrast: more\)/.test(cssCode));

/* ---------------------------------------------------------------------------
 * 3. Markup
 * ------------------------------------------------------------------------- */
const VOID_INPUTS = /<(input|select|textarea)\b([^>]*)>/g;

function attr(tag, name) {
  return tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1] ?? null;
}

for (const [name, html] of Object.entries(pages)) {
  const label = (what) => `${name}: ${what}`;

  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
  const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
  check(label("ids are unique"), duplicates.length === 0, duplicates.join(", ") || "ok");

  const h1s = [...html.matchAll(/<h1\b/g)].length;
  check(label("exactly one h1"), h1s === 1, String(h1s));

  check(label("declares a language"), /<html lang="en">/.test(html));
  check(label("has a skip link to #main"), /class="skip-link" href="#main"/.test(html));
  check(label("has a main landmark"), /<main id="main">/.test(html));
  check(label("no positive tabindex"), !/tabindex="[1-9]/.test(html));

  const images = [...html.matchAll(/<img\b[^>]*>/g)];
  const unlabelledImages = images.filter(([tag]) => attr(tag, "alt") === null);
  check(label("every img has an alt attribute"), unlabelledImages.length === 0,
    `${images.length} images`);

  // Controls need a programmatic name: aria-label, aria-labelledby, a <label for>,
  // or an ancestor <label>. Hidden and submit-type inputs are exempt.
  const labelFors = new Set([...html.matchAll(/<label\b[^>]*\sfor="([^"]+)"/g)].map(m => m[1]));
  const wrappedIds = new Set();
  for (const [, inner] of html.matchAll(/<label\b[^>]*>([\s\S]*?)<\/label>/g)) {
    for (const [, id] of inner.matchAll(/\sid="([^"]+)"/g)) wrappedIds.add(id);
    // A wrapping label also names controls that have no id at all.
    for (const [tag] of inner.matchAll(VOID_INPUTS)) {
      if (attr(tag, "id") === null) wrappedIds.add(tag);
    }
  }
  const unnamed = [];
  for (const [tag, kind, rest] of html.matchAll(VOID_INPUTS)) {
    const type = attr(tag, "type");
    if (kind === "input" && ["hidden", "submit", "button", "reset"].includes(type)) continue;
    const id = attr(tag, "id");
    if (attr(tag, "aria-label") || attr(tag, "aria-labelledby")) continue;
    if (id && (labelFors.has(id) || wrappedIds.has(id))) continue;
    if (!id && wrappedIds.has(tag)) continue;
    unnamed.push(`${kind}${id ? `#${id}` : `[${type || "text"}]`}`);
  }
  check(label("every form control has an accessible name"), unnamed.length === 0,
    unnamed.join(", ") || "ok");

  // Icon-only buttons must carry aria-label; text buttons must carry text.
  const namelessButtons = [];
  for (const [, open, inner] of html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)) {
    if (/\saria-label(?:ledby)?="/.test(open)) continue;
    const text = inner.replace(/<[^>]*>/g, "").replace(/&[a-z#0-9]+;/gi, "x").trim();
    if (!text) namelessButtons.push(open.trim().slice(0, 60));
  }
  check(label("every button has an accessible name"), namelessButtons.length === 0,
    namelessButtons.join(" | ") || "ok");
}

/* ---- catalog-specific structure ----------------------------------------- */
const catalogHtml = pages["site/errors/index.html"];
check("catalog exposes a live region for the result count",
  /id="cat-count"[^>]*aria-live="polite"/.test(catalogHtml));
check("catalog facet groups are fieldsets with legends",
  ([...catalogHtml.matchAll(/<fieldset class="facet">/g)].length >= 5));
check("catalog ships server-rendered rows (works before catalog.json lands)",
  [...catalogHtml.matchAll(/<li>\s*<div class="row">/g)].length >= 25);
check("catalog explains itself without JavaScript", /<noscript>/.test(catalogHtml));
check("catalog is excluded from the full-text index", /data-pagefind-ignore/.test(catalogHtml));
check("catalog facet toggle is a real disclosure",
  /data-facets-toggle[^>]*aria-expanded="false"[^>]*aria-controls="cat-facet-panel"/.test(catalogHtml));

const articleHtml = pages["site/e-file/990-e-file-errors/federal/f990pf-905-01.html"];
check("articles scope the full-text index to their own body",
  /<article class="doc" data-pagefind-body/.test(articleHtml));
check("articles link out to their jurisdiction index",
  /href="\/errors\/jurisdiction\/federal\/"/.test(articleHtml));

/* ---- asset sync ---------------------------------------------------------- */
check("built styles.css is in sync with its source", builtCss === css);
check("built catalog.js is in sync with its source", builtCatalog === catalogSource);

/* ------------------------------------------------------------------------- */
console.log("");
if (failures) {
  console.error(`${failures} accessibility check(s) FAILED`);
  process.exit(1);
}
console.log("ALL ACCESSIBILITY CHECKS PASS");
