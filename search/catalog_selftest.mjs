/* ============================================================================
 * catalog_selftest.mjs — integrity of the error catalog, end to end.
 *
 * catalog.js trusts catalog.json completely: it indexes straight into the facet
 * tables by position and renders row URLs as links without checking them. So the
 * contract is verified here instead —
 *
 *   - every row's facet indices resolve to a real table entry;
 *   - every row URL points at a page that actually exists in site/;
 *   - every facet count equals the number of rows carrying it;
 *   - every jurisdiction and return type has its generated static index page;
 *   - the resolver, article templates and catalog.js all agree on the slug for a
 *     jurisdiction (the one thing most likely to drift, since it is derived
 *     independently in Python and JavaScript).
 * ========================================================================== */

import { readFile, access } from "node:fs/promises";
import { jurisdictionSlug } from "./error_matcher.js";

const root = new URL("../", import.meta.url);
const read = (p) => readFile(new URL(p, root), "utf8");
const exists = (p) => access(new URL(p, root)).then(() => true, () => false);

const catalog = JSON.parse(await read("data/catalog.json"));
const shipped = JSON.parse(await read("site/catalog.json"));

let failures = 0;
function check(label, condition, detail = "") {
  if (!condition) failures++;
  console.log(`${condition ? "PASS" : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
}

const [TITLE, URL_, CODE, J, R, T, G, EXCERPT] = [0, 1, 2, 3, 4, 5, 6, 7];

/* ---- shape --------------------------------------------------------------- */
check("data/catalog.json and site/catalog.json are identical",
  JSON.stringify(catalog) === JSON.stringify(shipped));
check("row count matches the declared count",
  catalog.rows.length === catalog.count, `${catalog.rows.length} vs ${catalog.count}`);
check("the field order catalog.js assumes is documented",
  catalog.fields.join(",") === "title,url,code,j,r,t,g,excerpt", catalog.fields.join(","));
check("every facet table is non-empty",
  ["jurisdictions", "returns", "types", "groups"].every(key => catalog[key].length > 0));

for (const facet of ["jurisdictions", "returns", "types", "groups"]) {
  const codes = catalog[facet].map(entry => entry.code);
  check(`${facet}: codes are unique`, new Set(codes).size === codes.length);
  check(`${facet}: every entry has a label and a count`,
    catalog[facet].every(entry => entry.label && Number.isInteger(entry.count) && entry.count > 0));
}

/* ---- rows ---------------------------------------------------------------- */
const badIndices = catalog.rows.filter(row =>
  !catalog.jurisdictions[row[J]] || !catalog.returns[row[R]] ||
  !catalog.types[row[T]] || !catalog.groups[row[G]]);
check("every row's facet indices resolve", badIndices.length === 0,
  badIndices.length ? badIndices[0][TITLE] : "all 4 tables");

const badRows = catalog.rows.filter(row =>
  typeof row[TITLE] !== "string" || !row[TITLE].trim() ||
  typeof row[URL_] !== "string" || !row[URL_].startsWith("/") ||
  typeof row[CODE] !== "string" || typeof row[EXCERPT] !== "string");
check("every row has a title, a root-absolute url, and string code/excerpt",
  badRows.length === 0, badRows.length ? JSON.stringify(badRows[0]).slice(0, 120) : "ok");

const urls = catalog.rows.map(row => row[URL_]);
check("row urls are unique", new Set(urls).size === urls.length,
  `${urls.length - new Set(urls).size} duplicates`);

/* ---- counts agree with the rows they describe ---------------------------- */
for (const [facet, column] of [["jurisdictions", J], ["returns", R], ["types", T], ["groups", G]]) {
  const tallies = new Map();
  for (const row of catalog.rows) {
    const code = catalog[facet][row[column]].code;
    tallies.set(code, (tallies.get(code) || 0) + 1);
  }
  const wrong = catalog[facet].filter(entry => tallies.get(entry.code) !== entry.count);
  check(`${facet}: declared counts match the rows`, wrong.length === 0,
    wrong.length ? `${wrong[0].label} says ${wrong[0].count}, rows say ${tallies.get(wrong[0].code)}` : "ok");
}

const codedRows = catalog.rows.filter(row => row[CODE]).length;
check("reject codes are extracted for a meaningful share of rows",
  codedRows > 400, `${codedRows} of ${catalog.count} rows carry a code`);
// The manifest's `codes` harvest is noisy — it contains tax years, publication
// numbers and placeholders scraped from body text. Bare-numeric codes are the
// ones that could plausibly be such a leak, so each must be corroborated by the
// article's own URL. Arizona really does reject with "2049", and its article
// lives at .../arizona/2049.html; a year harvested from prose never would.
// (This is why primary_code() reads the title, not codes[0].)
const uncorroborated = catalog.rows
  .filter(row => /^\d+$/.test(row[CODE]))
  .filter(row => !row[URL_].toLowerCase().includes(row[CODE].toLowerCase()));
check("every bare-numeric code is corroborated by its article url",
  uncorroborated.length === 0,
  uncorroborated.length
    ? uncorroborated.slice(0, 3).map(row => `${row[CODE]} not in ${row[URL_]}`).join("; ")
    : `${catalog.rows.filter(row => /^\d+$/.test(row[CODE])).length} numeric codes verified`);

/* ---- generated pages exist ---------------------------------------------- */
const missingArticles = [];
for (const row of catalog.rows) {
  if (!(await exists(`site${row[URL_]}`))) missingArticles.push(row[URL_]);
}
check("every row links to a page that exists", missingArticles.length === 0,
  missingArticles.length ? `${missingArticles.length} missing, e.g. ${missingArticles[0]}` : `${catalog.count} checked`);

const missingJurisdictionPages = [];
for (const entry of catalog.jurisdictions) {
  if (!(await exists(`site/errors/jurisdiction/${entry.slug}/index.html`))) {
    missingJurisdictionPages.push(entry.slug);
  }
}
check("every jurisdiction has a static index page", missingJurisdictionPages.length === 0,
  missingJurisdictionPages.join(", ") || `${catalog.jurisdictions.length} pages`);

const missingReturnPages = [];
for (const entry of catalog.returns) {
  if (!(await exists(`site/errors/return/${entry.slug}/index.html`))) {
    missingReturnPages.push(entry.slug);
  }
}
check("every return type has a static index page", missingReturnPages.length === 0,
  missingReturnPages.join(", ") || `${catalog.returns.length} pages`);

/* ---- the Python and JavaScript slug rules agree ------------------------- */
const slugMismatches = catalog.jurisdictions
  .map(entry => ({ code: entry.code, python: entry.slug, js: jurisdictionSlug(entry.code) }))
  .filter(entry => entry.python !== entry.js);
check("builder/jurisdiction.py and error_matcher.js derive the same slugs",
  slugMismatches.length === 0,
  slugMismatches.length
    ? slugMismatches.map(m => `${m.code}: py=${m.python} js=${m.js}`).join(", ")
    : `${catalog.jurisdictions.length} jurisdictions agree`);

/* ---- catalog.js talks to markup that actually exists --------------------- */
// The catalog page is rendered by Jinja and driven by hand-written selectors, so
// a renamed id silently disables filtering with no error anywhere. Every selector
// the client depends on is checked against the generated HTML instead.
const catalogJs = await read("search/catalog.js");
const catalogPage = await read("site/errors/index.html");

const selectors = new Set();
// $("#id") / $("[data-x]") — the els{} table and the ad-hoc lookups.
for (const [, sel] of catalogJs.matchAll(/\$\$?\("([#[][^"]+)"/g)) selectors.add(sel);
// Template-literal facet lookups: [data-facet="j"] and friends.
for (const [, facet] of catalogJs.matchAll(/\[data-facet="(\w)"\]/g)) selectors.add(`[data-facet="${facet}"]`);

const missing = [];
for (const selector of selectors) {
  const present = selector.startsWith("#")
    ? catalogPage.includes(` id="${selector.slice(1)}"`)
    // Attribute selectors: match the bare attribute or an attribute=value pair.
    : new RegExp(`\\s${selector.slice(1, -1).replace(/([[\]"=])/g, "\\$1").replace(/\\=/, '="?')}`)
        .test(catalogPage) || catalogPage.includes(selector.slice(1, -1));
  if (!present) missing.push(selector);
}
check("every selector catalog.js depends on exists in the generated page",
  missing.length === 0,
  missing.length ? `missing: ${missing.join(", ")}` : `${selectors.size} selectors resolved`);

// The row markup catalog.js generates must use the same hooks the server-rendered
// rows use, or hydration would restyle the list.
for (const cls of ["row__code", "row__title", "row__meta", "row__tag", "jur__abbr"]) {
  check(`row class .${cls} is used by both the template and catalog.js`,
    catalogPage.includes(cls) && catalogJs.includes(cls));
}

/* ---- payload budget ----------------------------------------------------- */
// The catalog ships every row so filtering is instant and works offline. That is
// only a good trade while the payload stays small; flag it if it stops being so.
const bytes = Buffer.byteLength(JSON.stringify(catalog));
check("catalog payload stays under 512 KB uncompressed", bytes < 512 * 1024,
  `${(bytes / 1024).toFixed(0)} KB`);

/* ------------------------------------------------------------------------- */
console.log("");
if (failures) {
  console.error(`${failures} catalog check(s) FAILED`);
  process.exit(1);
}
console.log("ALL CATALOG CHECKS PASS");
