/* Static UI contract checks for the generated Auto/Manual resolver. */

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const [html, css, searchSource, matcherSource, builtSearch, builtMatcher, formattedArticle] = await Promise.all([
  readFile(new URL("site/index.html", root), "utf8"),
  readFile(new URL("site/assets/styles.css", root), "utf8"),
  readFile(new URL("search/search.js", root), "utf8"),
  readFile(new URL("search/error_matcher.js", root), "utf8"),
  readFile(new URL("site/assets/search.js", root), "utf8"),
  readFile(new URL("site/assets/error_matcher.js", root), "utf8"),
  readFile(new URL("site/e-file/1040-e-file-errors/states/california/ca-ext-gen-partner-phone-number-present.html", root), "utf8"),
]);

const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(ids).size, ids.length, "generated page must not contain duplicate IDs");

[
  "gs-form",
  "gs-mode-auto",
  "gs-mode-manual",
  "gs-auto-panel",
  "gs-auto-scope",
  "gs-auto-scope-status",
  "gs-manual-panel",
  "gs-jurisdiction",
  "gs-error-code",
  "gs-form-number",
  "gs-schedule",
  "gs-field-name",
  "gs-error-type",
  "gs-keywords",
  "gs-manual-submit",
  "gs-manual-error",
  "gs-results",
].forEach(id => assert(ids.includes(id), "missing required UI control #" + id));

assert.match(html, /data-auto-scope="all"[\s\S]*aria-pressed="true"/);
assert.match(html, /data-auto-scope="Federal"/);
assert.match(html, /data-auto-scope="States"/);

assert.match(html, /id="gs-mode-auto"[\s\S]*role="tab"[\s\S]*aria-selected="true"/);
assert.match(html, /id="gs-manual-panel"[\s\S]*role="tabpanel"[\s\S]*hidden/);
assert.match(html, /id="gs-manual-error"[\s\S]*role="alert"/);
assert.match(html, /id="gs-results"[\s\S]*aria-live="polite"[\s\S]*aria-busy="false"/);

const jurisdictionValues = [...html.matchAll(/<option value="(Federal|[A-Z]{2})">/g)].map(match => match[1]);
assert.equal(jurisdictionValues.length, 52, "manual search must offer Federal, 50 states, and D.C.");
assert.equal(new Set(jurisdictionValues).size, 52, "jurisdiction options must be unique");

[
  ".mode-tabs",
  ".auto-scope",
  ".manual__grid",
  ".manual__submit",
  ".search-summary",
  ".manual__error",
].forEach(selector => assert(css.includes(selector), "missing styles for " + selector));
assert.match(css, /\.prose pre \{[^}]*white-space: pre-wrap/);
assert.match(formattedArticle, /<li>Go to <strong>Organizer<\/strong> → <strong>States<\/strong> → <strong>Common State<\/strong> → <strong>General Information<\/strong> → <strong>Basic Return Information<\/strong>\.<\/li>/);

assert.match(searchSource, /hits = hits\.filter\(hit => hit\.jurisdictionCode === scopeCode\)/);
assert.match(searchSource, /matchesAutoScope\(hit, activeAutoScope\)/);
assert.match(searchSource, /gs-auto-jurisdiction-scope/);
assert.match(searchSource, /params\.set\("mode", "manual"\)/);
assert.match(html, /Enter at least one detail before searching/);
assert.match(matcherSource, /SCHEDULE: 12/);

assert.equal(builtSearch, searchSource, "built search.js is out of sync with its source");
assert.equal(builtMatcher, matcherSource, "built error_matcher.js is out of sync with its source");

console.log("PASS  generated Auto/Manual UI contract");
console.log("PASS  all 52 jurisdiction choices are present and unique");
console.log("PASS  automatic federal/state scope and safe diagnostic wrapping are present");
console.log("PASS  split menu paths render as readable list instructions");
console.log("PASS  production search assets are synchronized");
