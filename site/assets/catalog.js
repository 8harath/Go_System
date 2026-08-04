/* ============================================================================
 * catalog.js — the browsable error catalog (/errors/)
 * AUTHORITATIVE SOURCE. build.sh copies this to site/assets/catalog.js.
 *
 * Loads /catalog.json (columnar, ~1.3k rows) once, then filters, sorts and
 * renders entirely in the browser. Nothing here talks to a server.
 *
 * Design notes worth keeping:
 *
 *  - PROGRESSIVE ENHANCEMENT. The page ships a server-rendered first page of
 *    rows. We only replace #cat-rows once catalog.json has actually parsed, so
 *    a failed fetch leaves a readable page rather than an empty one.
 *
 *  - FACET COUNTS ARE CONTEXTUAL. Each facet's counts are computed against the
 *    other active facets, excluding its own selections. That means a value
 *    showing "12" really does yield 12 rows, so the UI has no dead ends.
 *
 *  - CHUNKED RENDER. Rows go out 60 at a time behind an explicit "Show more"
 *    button rather than infinite scroll, so keyboard and screen-reader users
 *    keep a stable end-of-list and the count stays truthful.
 *
 *  - URL IS THE STATE. Every filter round-trips through the query string, so a
 *    filtered view is bookmarkable and shareable — the same contract the
 *    resolver's manual mode uses.
 * ========================================================================== */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

const CHUNK = 60;

/* Facet keys map to row columns and to URL parameters of the same name.
   "c" (has/has-no reject code) is derived from the code column, not stored. */
const FACET_KEYS = ["j", "r", "t", "g", "c"];
const ROW = { TITLE: 0, URL: 1, CODE: 2, J: 3, R: 4, T: 5, G: 6, EXCERPT: 7 };

const els = {
  rows: $("#cat-rows"),
  count: $("#cat-count"),
  chips: $("#cat-chips"),
  search: $("#cat-search"),
  sort: $("#cat-sort"),
  more: $("#cat-more"),
  clear: $("#cat-clear"),
  facets: $("#cat-facets"),
  jurFilter: $("#cat-jur-filter"),
  facetBadge: $("[data-facet-badge]"),
  facetsToggle: $("[data-facets-toggle]"),
};

let data = null;
let haystacks = [];       // per-row lowercase search text
let haystacksNorm = [];   // per-row punctuation-stripped text (code matching)
let filtered = [];
let shown = 0;
let searchTimer = null;
let fixSeq = 0;

const state = {
  j: new Set(), r: new Set(), t: new Set(), g: new Set(), c: new Set(),
  q: "",
  sort: "code",
};

/* ---- helpers ------------------------------------------------------------- */
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

const normalize = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, "");

function labelFor(facet, code) {
  if (facet === "c") return code === "with" ? "Has a reject code" : "No reject code";
  const table = { j: data.jurisdictions, r: data.returns, t: data.types, g: data.groups };
  return (table[facet] || []).find(entry => entry.code === code)?.label || code;
}

const FACET_NAME = { j: "Jurisdiction", r: "Return", t: "Error type", g: "Topic", c: "Code" };

/* ---- URL <-> state ------------------------------------------------------- */
function readURL() {
  const params = new URLSearchParams(location.search);
  FACET_KEYS.forEach(key => {
    state[key] = new Set((params.get(key) || "").split(",").map(v => v.trim()).filter(Boolean));
  });
  state.q = params.get("q") || "";
  const sort = params.get("sort");
  state.sort = ["code", "title", "jurisdiction", "type"].includes(sort) ? sort : "code";
}

function writeURL() {
  if (!history.replaceState) return;
  const params = new URLSearchParams();
  FACET_KEYS.forEach(key => { if (state[key].size) params.set(key, [...state[key]].join(",")); });
  if (state.q) params.set("q", state.q);
  if (state.sort !== "code") params.set("sort", state.sort);
  const query = params.toString();
  history.replaceState(null, "", query ? `${location.pathname}?${query}` : location.pathname);
}

/* The article "back" link returns to exactly this filtered view. */
function returnParam() {
  return encodeURIComponent(location.pathname + location.search);
}

/* ---- filtering ----------------------------------------------------------- */
function rowMatchesFacets(row, index, skip = null) {
  if (skip !== "j" && state.j.size && !state.j.has(data.jurisdictions[row[ROW.J]]?.code)) return false;
  if (skip !== "r" && state.r.size && !state.r.has(data.returns[row[ROW.R]]?.code)) return false;
  if (skip !== "t" && state.t.size && !state.t.has(data.types[row[ROW.T]]?.code)) return false;
  if (skip !== "g" && state.g.size && !state.g.has(data.groups[row[ROW.G]]?.code)) return false;
  if (skip !== "c" && state.c.size) {
    const has = Boolean(row[ROW.CODE]);
    // Both boxes ticked is the same as neither: every row qualifies.
    if (!((has && state.c.has("with")) || (!has && state.c.has("without")))) return false;
  }
  return true;
}

function rowMatchesQuery(index) {
  if (!state.q) return true;
  const hay = haystacks[index];
  const hayNorm = haystacksNorm[index];
  return state.q.toLowerCase().split(/\s+/).filter(Boolean).every(token => {
    if (hay.includes(token)) return true;
    const norm = normalize(token);
    return norm.length > 1 && hayNorm.includes(norm);
  });
}

function computeFiltered() {
  filtered = [];
  data.rows.forEach((row, index) => {
    if (rowMatchesFacets(row, index) && rowMatchesQuery(index)) filtered.push(index);
  });
  sortFiltered();
}

function sortFiltered() {
  const rows = data.rows;
  const byTitle = (a, b) => rows[a][ROW.TITLE].localeCompare(rows[b][ROW.TITLE], undefined, { sensitivity: "base" });
  const comparators = {
    code: (a, b) => {
      const ca = rows[a][ROW.CODE], cb = rows[b][ROW.CODE];
      if (!ca !== !cb) return ca ? -1 : 1;
      return ca.localeCompare(cb, undefined, { numeric: true }) || byTitle(a, b);
    },
    title: byTitle,
    jurisdiction: (a, b) =>
      data.jurisdictions[rows[a][ROW.J]].label.localeCompare(data.jurisdictions[rows[b][ROW.J]].label) || byTitle(a, b),
    type: (a, b) =>
      data.types[rows[a][ROW.T]].label.localeCompare(data.types[rows[b][ROW.T]].label) || byTitle(a, b),
  };
  filtered.sort(comparators[state.sort] || comparators.code);
}

/* Counts for one facet, honouring every OTHER active facet plus the query. */
function contextualCounts(facet) {
  const column = { j: ROW.J, r: ROW.R, t: ROW.T, g: ROW.G }[facet];
  const counts = new Map();
  data.rows.forEach((row, index) => {
    if (!rowMatchesFacets(row, index, facet) || !rowMatchesQuery(index)) return;
    if (facet === "c") {
      const key = row[ROW.CODE] ? "with" : "without";
      counts.set(key, (counts.get(key) || 0) + 1);
      return;
    }
    const table = { j: data.jurisdictions, r: data.returns, t: data.types, g: data.groups }[facet];
    const key = table[row[column]]?.code;
    if (key) counts.set(key, (counts.get(key) || 0) + 1);
  });
  return counts;
}

/* ---- rendering ----------------------------------------------------------- */
function rowHTML(index, position) {
  const row = data.rows[index];
  const jurisdiction = data.jurisdictions[row[ROW.J]];
  const returnType = data.returns[row[ROW.R]];
  const errorType = data.types[row[ROW.T]];
  const fixId = `cat-fix-${position}`;
  const code = row[ROW.CODE]
    ? `<span class="row__code">${esc(row[ROW.CODE])}</span>`
    : "";
  const excerpt = row[ROW.EXCERPT]
    ? `<p class="row__excerpt">${esc(row[ROW.EXCERPT])}</p>`
    : "";
  const href = `${esc(row[ROW.URL])}?return=${returnParam()}`;

  return `<li>
    <div class="row" data-url="${esc(row[ROW.URL])}" data-article-url="${href}">
      <div class="row__main">
        <div class="row__topline">
          ${code}
          <a class="jur jur--${esc(jurisdiction.type.toLowerCase())}" href="/errors/jurisdiction/${esc(jurisdiction.slug)}/">
            <span class="jur__abbr">${esc(jurisdiction.short)}</span>${esc(jurisdiction.label)}
          </a>
        </div>
        <h3 class="row__title"><a href="${href}">${esc(row[ROW.TITLE])}</a></h3>
        ${excerpt}
        <p class="row__meta">
          <span class="row__tag">${esc(returnType.label)}</span>
          <span class="row__tag">${esc(errorType.label)}</span>
        </p>
      </div>
      <div class="row__actions">
        <button type="button" class="row__look" aria-expanded="false" aria-controls="${fixId}">Quick look</button>
      </div>
      <div class="row__fix" id="${fixId}" hidden>
        <div class="prose" data-fixbody>Loading the fix…</div>
        <p class="row__fixfoot"><a href="${href}">Open the full article →</a></p>
      </div>
    </div>
  </li>`;
}

function renderChunk(reset) {
  if (reset) {
    els.rows.innerHTML = "";
    shown = 0;
  }
  const next = filtered.slice(shown, shown + CHUNK);
  els.rows.insertAdjacentHTML("beforeend", next.map((index, i) => rowHTML(index, shown + i)).join(""));
  shown += next.length;
  updateCount();
  if (els.more) {
    const remaining = filtered.length - shown;
    els.more.hidden = remaining <= 0;
    els.more.textContent = remaining > 0
      ? `Show ${Math.min(CHUNK, remaining)} more (${remaining.toLocaleString()} left)`
      : "";
  }
  if (!filtered.length) renderEmpty();
}

function renderEmpty() {
  els.rows.innerHTML = `<li><div class="catalog__empty">
    <strong>No articles match these filters.</strong>
    <span>Remove a filter, or search for a phrase from the diagnostic instead of the exact code.</span>
    <button type="button" class="btn" data-clear-all>Clear all filters</button>
  </div></li>`;
}

function updateCount() {
  if (!els.count) return;
  const total = data.count;
  const n = filtered.length;
  els.count.innerHTML = n === total
    ? `Showing <b>${shown.toLocaleString()}</b> of <b>${total.toLocaleString()}</b> articles`
    : `<b>${n.toLocaleString()}</b> of ${total.toLocaleString()} articles match`
      + (shown < n ? ` · showing <b>${shown.toLocaleString()}</b>` : "");
}

function renderChips() {
  if (!els.chips) return;
  const chips = [];
  FACET_KEYS.forEach(facet => {
    state[facet].forEach(code => {
      chips.push(`<button type="button" class="chip-btn" data-remove-facet="${esc(facet)}" data-remove-value="${esc(code)}">
        <i>${esc(FACET_NAME[facet])}</i>${esc(labelFor(facet, code))}
        <span class="chip-btn__x" aria-hidden="true">×</span>
        <span class="visually-hidden">Remove this filter</span>
      </button>`);
    });
  });
  if (state.q) {
    chips.push(`<button type="button" class="chip-btn" data-remove-query>
      <i>Search</i>${esc(state.q)}
      <span class="chip-btn__x" aria-hidden="true">×</span>
      <span class="visually-hidden">Clear the search text</span>
    </button>`);
  }
  els.chips.innerHTML = chips.join("");
  const active = chips.length;
  if (els.clear) els.clear.hidden = !active;
  if (els.facetBadge) {
    els.facetBadge.textContent = active
      ? `${active} applied`
      : "None applied";
  }
}

function syncFacetInputs() {
  $$("[data-facet-input]").forEach(input => {
    const facet = input.dataset.facetInput;
    input.checked = state[facet].has(input.value);
  });
  FACET_KEYS.forEach(facet => {
    const counts = contextualCounts(facet);
    $$(`[data-facet="${facet}"] [data-facet-input]`).forEach(input => {
      const option = input.closest(".facet-option");
      const count = counts.get(input.value) || 0;
      const countEl = option?.querySelector(".facet-option__count");
      if (countEl) countEl.textContent = count.toLocaleString();
      // A zero-count value that is not already selected cannot help; disable it
      // rather than letting the user pick a guaranteed empty result.
      const dead = count === 0 && !input.checked;
      input.disabled = dead;
      if (option) option.style.opacity = dead ? ".5" : "";
    });
  });
}

function apply({ url = true } = {}) {
  computeFiltered();
  renderChunk(true);
  renderChips();
  syncFacetInputs();
  if (url) writeURL();
}

/* ---- quick look --------------------------------------------------------- */
async function loadFix(rowEl) {
  const body = rowEl.querySelector("[data-fixbody]");
  if (!body || body.dataset.loaded) return;
  if (body._loading) return body._loading;
  const mine = ++fixSeq;
  body._loading = (async () => {
    try {
      const html = await (await fetch(rowEl.dataset.url)).text();
      if (mine > fixSeq) return;
      const doc = new DOMParser().parseFromString(html, "text/html");
      const el = doc.querySelector(".doc__body") || doc.querySelector(".prose");
      const text = el ? el.innerHTML.trim() : "";
      body.innerHTML = text || "This article has no inline body — open it for the full page.";
    } catch {
      body.innerHTML = `Couldn't load the fix here. <a href="${rowEl.dataset.articleUrl}">Open the article →</a>`;
    } finally {
      body.dataset.loaded = "1";
      delete body._loading;
    }
  })();
  return body._loading;
}

/* ---- wiring ------------------------------------------------------------- */
function wire() {
  // Facet checkboxes (delegated: the lists are re-counted, never re-created).
  els.facets?.addEventListener("change", event => {
    const input = event.target.closest("[data-facet-input]");
    if (!input) return;
    const facet = input.dataset.facetInput;
    if (input.checked) state[facet].add(input.value);
    else state[facet].delete(input.value);
    apply();
  });

  els.clear?.addEventListener("click", clearAll);

  // Jurisdiction list is 51 items; let people type to narrow it.
  els.jurFilter?.addEventListener("input", () => {
    const needle = els.jurFilter.value.trim().toLowerCase();
    $$('[data-facet="j"] li').forEach(li => {
      const label = li.querySelector(".facet-option__label")?.textContent.toLowerCase() || "";
      li.hidden = Boolean(needle) && !label.includes(needle);
    });
  });

  els.search?.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.q = els.search.value.trim();
      apply();
    }, 200);
  });
  els.search?.addEventListener("keydown", event => {
    if (event.key === "Escape" && els.search.value) {
      event.stopPropagation();
      els.search.value = "";
      state.q = "";
      apply();
    }
  });

  els.sort?.addEventListener("change", () => {
    state.sort = els.sort.value;
    apply();
  });

  els.more?.addEventListener("click", () => {
    const firstNew = shown;
    renderChunk(false);
    // Move focus to the first newly revealed row so keyboard users continue
    // from where the list grew instead of being dropped at the top.
    els.rows.querySelectorAll(".row__title a")[firstNew]?.focus();
  });

  els.chips?.addEventListener("click", event => {
    const remove = event.target.closest("[data-remove-facet]");
    if (remove) {
      state[remove.dataset.removeFacet].delete(remove.dataset.removeValue);
      apply();
      return;
    }
    if (event.target.closest("[data-remove-query]")) {
      state.q = "";
      if (els.search) els.search.value = "";
      apply();
    }
  });

  els.rows?.addEventListener("click", event => {
    const clearBtn = event.target.closest("[data-clear-all]");
    if (clearBtn) { clearAll(); return; }
    const look = event.target.closest(".row__look");
    if (!look) return;
    const rowEl = look.closest(".row");
    const fix = rowEl.querySelector(".row__fix");
    const open = look.getAttribute("aria-expanded") !== "true";
    look.setAttribute("aria-expanded", String(open));
    look.textContent = open ? "Hide fix" : "Quick look";
    fix.hidden = !open;
    if (open) loadFix(rowEl);
  });

  els.facetsToggle?.addEventListener("click", () => {
    const open = els.facets.dataset.open !== "true";
    els.facets.dataset.open = String(open);
    els.facetsToggle.setAttribute("aria-expanded", String(open));
  });

  document.addEventListener("keydown", event => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || "");
    if ((event.key === "/" && !typing) || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k")) {
      event.preventDefault();
      els.search?.focus();
      els.search?.select();
    }
  });
}

function clearAll() {
  FACET_KEYS.forEach(key => state[key].clear());
  state.q = "";
  if (els.search) els.search.value = "";
  if (els.jurFilter) {
    els.jurFilter.value = "";
    $$('[data-facet="j"] li').forEach(li => { li.hidden = false; });
  }
  apply();
  els.search?.focus();
}

/* ---- boot --------------------------------------------------------------- */
(async function boot() {
  readURL();
  if (els.search) els.search.value = state.q;
  if (els.sort) els.sort.value = state.sort;

  let payload = null;
  try {
    const response = await fetch("/catalog.json");
    if (response.ok) payload = await response.json();
  } catch { /* leave the server-rendered rows in place */ }

  if (!payload?.rows?.length) {
    // No payload: the static first page stays, and we say so instead of
    // pretending the filters work.
    if (els.count) {
      els.count.textContent = "Showing the first page. Live filtering is unavailable — use the jurisdiction and return type indexes below.";
    }
    return;
  }

  data = payload;
  haystacks = data.rows.map(row => {
    const jurisdiction = data.jurisdictions[row[ROW.J]];
    return [row[ROW.TITLE], row[ROW.CODE], row[ROW.EXCERPT], jurisdiction?.label, jurisdiction?.code]
      .filter(Boolean).join(" ").toLowerCase();
  });
  haystacksNorm = haystacks.map(normalize);

  wire();
  apply({ url: false });
})();
