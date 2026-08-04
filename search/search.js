/* ============================================================================
 * search.js — the e-file resolver orchestrator
 * AUTHORITATIVE SOURCE. build.sh copies this to site/assets/search.js.
 *
 * Flow: paste error -> ErrorMatcher.parse() draws the live SIGNATURE chips ->
 * ErrorMatcher.match() (deterministic, over signatures.json) + Pagefind
 * (full-text) + codes.json (exact reject codes) -> merged, ranked cards.
 * The top card auto-expands and fetches the article body so the fix shows
 * inline. Vanilla JS, no framework. Degrades gracefully if any layer is absent.
 * ========================================================================== */

const $ = (s, r = document) => r.querySelector(s);

const input   = $("#gs-search");
const form    = $("#gs-form");
const frame   = $(".paste__frame");
const sigBox  = $("#gs-signature");
const sigChips= $("#gs-sigchips");
const results = $("#gs-results");
const samples = $("#gs-samples");
const clearBtn= $("#gs-clear");
const stateLabel = $("[data-state-label]");
const modeTabs = Array.from(document.querySelectorAll("[data-mode]"));
const modePanels = Array.from(document.querySelectorAll("[data-mode-panel]"));
const signatureLabel = $(".sig__label");
const manualPanel = $("#gs-manual-panel");
const manualSubmit = $("#gs-manual-submit");
const manualSubmitLabel = $("[data-manual-submit-label]");
const manualReset = $("#gs-manual-reset");
const manualError = $("#gs-manual-error");
const manualStatus = $("#gs-manual-status");
const autoScopeControls = Array.from(document.querySelectorAll("[data-auto-scope]"));
const autoScopeStatus = $("#gs-auto-scope-status");
const manualFields = {
  jurisdiction: $("#gs-jurisdiction"),
  code: $("#gs-error-code"),
  form: $("#gs-form-number"),
  schedule: $("#gs-schedule"),
  field: $("#gs-field-name"),
  kind: $("#gs-error-type"),
  keywords: $("#gs-keywords"),
};

let pagefind = null;
let codes = null;
let seq = 0;                         // stale-response guard
let activeMode = "auto";
let activeAutoScope = "all";

/* ---- lazy loaders --------------------------------------------------------- */
async function loadPagefind() {
  if (pagefind) return pagefind;
  try {
    pagefind = await import("/pagefind/pagefind.js");
    await pagefind.options?.({ excerptLength: 28 });
    return pagefind;
  } catch { return null; }
}
async function loadCodes() {
  if (codes) return codes;
  try { codes = await (await fetch("/codes.json")).json(); }
  catch { codes = { codes: {} }; }
  return codes;
}
const normCode = (s) => s.toUpperCase().replace(/[^A-Z0-9]/g, "");

/* match-type labels — drives the result cards' kind tag and the filter bar */
const KIND_LABEL = { code: "Exact code", signature: "Signature match", text: "Full-text" };
const KIND_ORDER = ["code", "signature", "text"];

/* ---- UI state ------------------------------------------------------------- */
function setState(state, label) {
  if (frame) frame.dataset.state = state;
  if (stateLabel) stateLabel.textContent = label;
}

function setResultsBusy(busy) {
  results?.setAttribute("aria-busy", String(busy));
  if (manualSubmit) {
    const manualBusy = busy && activeMode === "manual";
    manualSubmit.disabled = manualBusy;
    if (manualSubmitLabel) manualSubmitLabel.textContent = manualBusy ? "Searching…" : "Find matching fixes";
  }
}

function autoScopeDescription(scope) {
  if (scope === "Federal") return "Federal and general guidance only.";
  if (scope === "States") return "State and District of Columbia guidance only.";
  return "Best matches across federal and state guidance.";
}

function setAutoScope(scope, { rerun = true, persist = true } = {}) {
  activeAutoScope = ["Federal", "States"].includes(scope) ? scope : "all";
  autoScopeControls.forEach(control => {
    const selected = control.dataset.autoScope === activeAutoScope;
    control.classList.toggle("auto-scope__option--active", selected);
    control.setAttribute("aria-pressed", String(selected));
  });
  if (autoScopeStatus) autoScopeStatus.textContent = autoScopeDescription(activeAutoScope);
  if (persist) {
    try { localStorage.setItem("gs-auto-jurisdiction-scope", activeAutoScope); } catch {}
  }
  if (rerun && activeMode === "auto" && input?.value.trim()) run();
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c =>
    ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
}

function resolverReturnURL() {
  const current = new URL(location.href);
  if (activeMode === "manual" && current.searchParams.get("mode") === "manual") {
    current.searchParams.delete("focus");
    return current.pathname + current.search + current.hash;
  }
  const query = input?.value.trim() || "";
  // Keep a useful, shareable return path without putting a full diagnostic in
  // the address bar. Browser history still restores long diagnostics.
  if (query && query.length <= 1200) return `/?q=${encodeURIComponent(query)}`;
  return "/";
}

function articleURL(url) {
  const destination = new URL(url, location.origin);
  destination.searchParams.set("return", resolverReturnURL());
  return destination.pathname + destination.search + destination.hash;
}

/* ---- search modes + manual criteria ------------------------------------- */
const MANUAL_PARAM_KEYS = ["jurisdiction", "code", "form", "schedule", "field", "kind", "keywords"];

function resetSearchUI() {
  seq++;
  setResultsBusy(false);
  setState("ready", "ready");
  renderSignature(null);
  results.innerHTML = "";
  if (samples) samples.style.display = "";
}

function setMode(mode, { focus = true, clearResults = true, persist = true } = {}) {
  activeMode = mode === "manual" ? "manual" : "auto";
  modeTabs.forEach(tab => {
    const selected = tab.dataset.mode === activeMode;
    tab.classList.toggle("mode-tab--active", selected);
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  modePanels.forEach(panel => { panel.hidden = panel.dataset.modePanel !== activeMode; });
  if (signatureLabel) signatureLabel.textContent = activeMode === "manual" ? "criteria" : "signature";
  if (manualError) manualError.hidden = true;
  if (clearResults) resetSearchUI();
  if (persist) {
    try { localStorage.setItem("gs-search-mode", activeMode); } catch {}
  }
  if (focus) {
    const target = activeMode === "manual" ? manualFields.jurisdiction : input;
    requestAnimationFrame(() => target?.focus());
  }
}

function manualValues() {
  return Object.fromEntries(MANUAL_PARAM_KEYS.map(key => [key, manualFields[key]?.value.trim() || ""]));
}

function normalizeManualCode(value) {
  return value.trim().toUpperCase().replace(/[–—]/g, "-").replace(/\s+/g, "-");
}

function buildManualSearch() {
  const values = manualValues();
  values.code = normalizeManualCode(values.code);
  if (manualFields.code) manualFields.code.value = values.code;

  const jurisdictionLabel = values.jurisdiction
    ? manualFields.jurisdiction?.selectedOptions?.[0]?.textContent.trim() || values.jurisdiction
    : "";
  const kindLabel = values.kind
    ? manualFields.kind?.selectedOptions?.[0]?.textContent.trim() || values.kind
    : "";
  const parts = [
    jurisdictionLabel,
    values.code ? `${values.code} e-file error` : "",
    values.form ? `Form ${values.form}` : "",
    values.schedule ? `Schedule ${values.schedule}` : "",
    values.field ? `element ${values.field}` : "",
    values.kind,
    values.keywords,
  ].filter(Boolean);

  return {
    query: parts.join(" · "),
    values,
    jurisdictionLabel,
    kindLabel,
    scopeCode: values.jurisdiction,
    hasCriteria: Object.values(values).some(Boolean),
  };
}

function updateManualURL(values) {
  if (!history.replaceState) return;
  const params = new URLSearchParams();
  params.set("mode", "manual");
  MANUAL_PARAM_KEYS.forEach(key => { if (values[key]) params.set(key, values[key]); });
  history.replaceState(null, "", `${location.pathname}?${params.toString()}${location.hash}`);
}

function clearManualURL() {
  if (history.replaceState) history.replaceState(null, "", `${location.pathname}${location.hash}`);
}

function restoreManualSearch(params) {
  MANUAL_PARAM_KEYS.forEach(key => {
    if (manualFields[key] && params.has(key)) manualFields[key].value = params.get(key) || "";
  });
  const search = buildManualSearch();
  if (search.hasCriteria) runManual({ updateURL: false });
}

/* ---- live signature decomposition ---------------------------------------- */
function renderSignature(sig) {
  if (!sig) { sigBox.hidden = true; sigChips.innerHTML = ""; return false; }
  const parts = [];
  if (sig.jurisdiction?.label) parts.push(["jurisdiction", sig.jurisdiction.label]);
  else if (sig.state) parts.push(["jurisdiction", sig.state]);
  if (sig.errorKind?.label && sig.errorKind.code !== "search") parts.push(["error type", sig.errorKind.label]);
  if (sig.form)       parts.push(["form", sig.form]);
  if (sig.schedule)   parts.push(["schedule", sig.schedule]);
  if (sig.field)      parts.push(["element", sig.field]);
  else if (sig.element) parts.push(["element", sig.element]);
  if (sig.value)      parts.push(["value", sig.value]);
  if (Array.isArray(sig.codes) && sig.codes.length) parts.push(["code", sig.codes[0]]);
  const cons = sig.constraint;

  if (!parts.length && !cons) { sigBox.hidden = true; sigChips.innerHTML = ""; return false; }

  let html = "";
  parts.forEach(([label, val], i) => {
    html += `<span class="sigchip" style="animation-delay:${i * 45}ms"><i>${esc(label)}</i><b>${esc(val)}</b></span>`;
  });
  if (cons) {
    html += `<span class="sigchip sigchip--constraint" style="animation-delay:${parts.length * 45}ms"><i>constraint</i><b>${esc(cons)}</b></span>`;
  }
  sigChips.innerHTML = html;
  sigBox.hidden = false;
  return true;
}

/* ---- jurisdiction helper for JS ----------------------------------------- */
function detectJurisdictionJS(url = "", title = "", breadcrumbs = []) {
  if (window.ErrorMatcher?.detectArticleJurisdiction) {
    return window.ErrorMatcher.detectArticleJurisdiction(url, title, breadcrumbs);
  }
  const low = `${url} ${title} ${(breadcrumbs || []).join(" ")}`.toLowerCase();
  if (low.includes("/federal") || /\b(?:federal|irs|mef)\b/.test(low)) return { label: "Federal", code: "Federal" };
  return { label: "General / Federal", code: "General" };
}

function jurisdictionCodeFromLabel(label = "") {
  if (/^federal$/i.test(label)) return "Federal";
  if (/^general/i.test(label)) return "General";
  return label.match(/\(([A-Z]{2})\)\s*$/)?.[1] || "";
}

function normalizeHitJurisdiction(hit) {
  if (!hit.jurisdictionCode && hit.jurisdiction) {
    hit.jurisdictionCode = jurisdictionCodeFromLabel(hit.jurisdiction);
  }
  if (!hit.jurisdiction || !hit.jurisdictionCode) {
    const found = detectJurisdictionJS(hit.url, hit.title, hit.breadcrumb || []);
    hit.jurisdiction ||= found.label;
    hit.jurisdictionCode ||= found.code;
  }
  hit.jurisdiction ||= "General / Federal";
  hit.jurisdictionCode ||= "General";
  return hit;
}

/* ---- result cards --------------------------------------------------------- */
function cardHTML(hit, rank, best) {
  const why = (hit.why || []).map((w, i) =>
    `<span class="why__chip ${i === 0 && best ? "why__chip--strong" : ""}">${esc(w)}</span>`).join("");
  const badge = best ? `<span class="card__badge">Best match</span>` : "";
  const excerpt = hit.excerpt ? `<p class="card__excerpt">${hit.excerpt}</p>` : "";
  const kind = hit.kind || "text";
  const kindTag = `<span class="card__kind card__kind--${kind}">${esc(KIND_LABEL[kind] || kind)}</span>`;
  const crumbSpans = (hit.breadcrumb || []).map(c => `<span>${esc(c)}</span>`).join("");
  
  const j = hit.jurisdiction || "General / Federal";
  const jCode = hit.jurisdictionCode || "General";
  const jIcon = jCode === "Federal" ? "🏛️" : (jCode === "General" ? "🌐" : "📍");
  const jClass = /^[A-Z]{2}$/.test(jCode) ? "state" : jCode.toLowerCase();
  const jBadge = `<span class="card__jurisdiction card__jurisdiction--${jClass}"><span aria-hidden="true">${jIcon}</span> ${esc(j)}</span>`;
  const fullArticleURL = articleURL(hit.url);

  return `
  <article class="card ${best ? "card--best" : ""}" style="--rank:${rank}" data-url="${esc(hit.url)}" data-article-url="${esc(fullArticleURL)}" data-kind="${esc(kind)}" data-jurisdiction="${esc(j)}" data-jurisdiction-code="${esc(jCode)}" data-title="${esc(hit.title)}" data-rank="${rank}" data-open="false">
    <div class="card__top">
      <span class="card__rank">${best ? "✓" : rank}</span>
      <div class="card__grow">
        <div class="card__header-tags">
          ${badge}
          ${jBadge}
        </div>
        <h3 class="card__title"><a href="${esc(fullArticleURL)}">${esc(hit.title)}</a></h3>
        <p class="card__crumb">${kindTag}${crumbSpans}</p>
        ${why ? `<div class="why">${why}</div>` : excerpt}
      </div>
      <button type="button" class="card__disc" aria-expanded="${best}" aria-controls="fix-${rank}" aria-label="Show fix for ${esc(hit.title)}">▸</button>
    </div>
    <div class="card__fix" id="fix-${rank}">
      <div class="card__fixhead">
        <p class="card__fixlabel">The fix</p>
        <button type="button" class="copy-btn" data-copy-solution aria-label="Copy solution for ${esc(hit.title)}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>
          <span data-copy-label aria-live="polite">Copy solution</span>
        </button>
      </div>
      <div class="prose" data-fixbody>Loading…</div>
      <p class="card__source"><a href="${esc(fullArticleURL)}">Open full article →</a></p>
    </div>
  </article>`;
}

async function loadFix(card) {
  const body = card.querySelector("[data-fixbody]");
  if (!body || body.dataset.loaded) return;
  if (body._loadPromise) return body._loadPromise;
  body._loadPromise = (async () => {
    try {
      const html = await (await fetch(card.dataset.url)).text();
      const doc = new DOMParser().parseFromString(html, "text/html");
      const el = doc.querySelector(".doc__body") || doc.querySelector(".prose");
      body.innerHTML = el ? el.innerHTML : "See the full article for details.";
    } catch {
      body.innerHTML = `Couldn't load the fix inline. <a href="${card.dataset.articleUrl || card.dataset.url}">Open the article →</a>`;
    } finally {
      body.dataset.loaded = "1";
      delete body._loadPromise;
    }
  })();
  return body._loadPromise;
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const helper = document.createElement("textarea");
  helper.value = text;
  helper.setAttribute("readonly", "");
  helper.style.position = "fixed";
  helper.style.opacity = "0";
  document.body.appendChild(helper);
  helper.select();
  document.execCommand("copy");
  helper.remove();
}

async function copySolution(card, button) {
  const label = button.querySelector("[data-copy-label]");
  button.disabled = true;
  if (label) label.textContent = "Preparing…";
  await loadFix(card);
  const solution = card.querySelector("[data-fixbody]")?.innerText.trim();
  const text = `${card.dataset.title}\n\n${solution || "See the full article for details."}\n\nSource: ${new URL(card.dataset.url, location.href).href}`;
  try {
    await copyText(text);
    button.dataset.copied = "true";
    if (label) label.textContent = "Copied";
  } catch {
    if (label) label.textContent = "Copy failed";
  }
  setTimeout(() => {
    button.disabled = false;
    delete button.dataset.copied;
    if (label) label.textContent = "Copy solution";
  }, 1800);
}

function toggleCard(card, open) {
  const willOpen = open ?? card.dataset.open !== "true";
  card.dataset.open = String(willOpen);
  const disclosure = card.querySelector(".card__disc");
  disclosure?.setAttribute("aria-expanded", String(willOpen));
  disclosure?.setAttribute("aria-label", `${willOpen ? "Hide" : "Show"} fix for ${card.dataset.title}`);
  if (willOpen) loadFix(card);
}

function wireCards() {
  results.querySelectorAll(".card").forEach(card => {
    const top = card.querySelector(".card__top");
    top.addEventListener("click", e => { if (e.target.closest("a")) return; toggleCard(card); });
    card.querySelector("[data-copy-solution]")?.addEventListener("click", e => copySolution(card, e.currentTarget));
  });
  const best = results.querySelector(".card--best");
  if (best) toggleCard(best, true);
}

/* ---- merge sources -------------------------------------------------------- */
async function gather(query, sig) {
  const out = [];
  const seen = new Map();
  const priority = { code: 3, signature: 2, text: 1 };
  const add = (h) => {
    const k = h.url.replace(/index\.html$/, "").replace(/\.html$/, "").toLowerCase();
    normalizeHitJurisdiction(h);
    if (!seen.has(k)) {
      seen.set(k, out.length);
      out.push(h);
      return;
    }
    const current = out[seen.get(k)];
    if ((priority[h.kind] || 0) > (priority[current.kind] || 0)) {
      h.why = Array.from(new Set([...(h.why || []), ...(current.why || [])]));
      out[seen.get(k)] = h;
    }
  };

  // 1) exact reject-code lookup. A code may legitimately map to several
  // jurisdictions, so preserve every collision from codes.json.
  const c = await loadCodes();
  if (sig?.codes) {
    for (const code of sig.codes) {
      const entry = c.codes?.[normCode(code)];
      const matches = entry?.matches?.length ? entry.matches : (entry ? [entry] : []);
      matches.forEach(hit => add({
        url: hit.url,
        title: hit.title,
        breadcrumb: hit.section ? ["Form " + hit.section] : [],
        why: ["Exact code " + code],
        kind: "code",
        jurisdiction: hit.jurisdiction,
        jurisdictionCode: hit.jurisdiction_code,
      }));
    }
  }

  // 2) deterministic signature matches
  if (window.ErrorMatcher) {
    try {
      await window.ErrorMatcher.ready;
      (window.ErrorMatcher.match(query) || []).forEach(h => add({ ...h, kind: h.kind || "signature" }));
    } catch {}
  }
  // 3) full-text (natural language / body text)
  const pf = await loadPagefind();
  if (pf) {
    try {
      const search = await pf.search(query.slice(0, 240));
      const top = await Promise.all(search.results.slice(0, 12).map(r => r.data()));
      top.forEach(d => {
        const pfJurisdiction = d.filters?.jurisdiction?.[0];
        add({
          url: d.url.replace(/\.html$/, ".html"),
          title: (d.meta && d.meta.title) || d.url,
          breadcrumb: [],
          excerpt: d.excerpt,
          kind: "text",
          jurisdiction: pfJurisdiction || null,
          jurisdictionCode: jurisdictionCodeFromLabel(pfJurisdiction || ""),
        });
      });
    } catch {}
  }
  return out;
}

function inferJurisdictionFromExactMatches(sig, hits) {
  if (sig?.jurisdiction?.code) return sig;
  const codes = new Set(
    hits
      .filter(h => h.kind === "code" && h.jurisdictionCode && h.jurisdictionCode !== "General")
      .map(h => h.jurisdictionCode)
  );
  if (codes.size !== 1 || !window.ErrorMatcher?.jurisdictionInfo) return sig;
  const code = [...codes][0];
  const jurisdiction = window.ErrorMatcher.jurisdictionInfo(code, "high", "Exact code index");
  return { ...sig, state: code === "Federal" ? "federal" : code, jurisdiction };
}

function prioritizeJurisdiction(hits, code) {
  if (!code) return hits;
  return hits
    .map((hit, index) => ({ hit, index }))
    .sort((a, b) =>
      Number(b.hit.jurisdictionCode === code) - Number(a.hit.jurisdictionCode === code) || a.index - b.index
    )
    .map(x => x.hit);
}

function matchesAutoScope(hit, scope) {
  if (scope === "Federal") return ["Federal", "General"].includes(hit.jurisdictionCode);
  if (scope === "States") return /^[A-Z]{2}$/.test(hit.jurisdictionCode || "");
  return true;
}

/* ---- main run ------------------------------------------------------------- */
let timer = null;
function schedule() {
  clearTimeout(timer);
  if (activeMode === "auto") timer = setTimeout(run, 130);
}

function manualSummaryHTML(search, filteredOut = 0) {
  const criteria = [
    search.jurisdictionLabel && ["Jurisdiction", search.jurisdictionLabel],
    search.values.code && ["Code", search.values.code],
    search.values.form && ["Form", search.values.form],
    search.values.schedule && ["Schedule", search.values.schedule],
    search.values.field && ["Field", search.values.field],
    search.values.kind && ["Type", search.kindLabel],
    search.values.keywords && ["Keywords", search.values.keywords],
  ].filter(Boolean);
  const scopeNote = search.scopeCode
    ? `<span class="search-summary__scope">Strict jurisdiction filter${filteredOut ? ` · ${filteredOut} outside-scope match${filteredOut === 1 ? "" : "es"} hidden` : ""}</span>`
    : `<span class="search-summary__scope">All jurisdictions included</span>`;

  return `<section class="search-summary" aria-label="Active manual search criteria">
    <div class="search-summary__top">
      <div><span class="search-summary__label">Manual search</span>${scopeNote}</div>
      <button type="button" class="search-summary__edit" data-edit-manual>Edit filters</button>
    </div>
    <div class="search-summary__criteria">
      ${criteria.map(([label, value]) => `<span><i>${esc(label)}</i><b>${esc(value)}</b></span>`).join("")}
    </div>
  </section>`;
}

function wireManualSummary() {
  results.querySelectorAll("[data-edit-manual]").forEach(button => {
    button.addEventListener("click", () => {
      manualPanel?.scrollIntoView({ behavior: "smooth", block: "center" });
      manualFields.jurisdiction?.focus({ preventScroll: true });
    });
  });
}

function run() {
  return executeSearch(input.value.trim(), { mode: "auto" });
}

async function runManual({ updateURL = true } = {}) {
  const search = buildManualSearch();
  if (!search.hasCriteria) {
    resetSearchUI();
    if (manualError) manualError.hidden = false;
    manualPanel?.setAttribute("aria-describedby", "gs-manual-error");
    manualFields.jurisdiction?.focus();
    return;
  }
  if (manualError) manualError.hidden = true;
  manualPanel?.removeAttribute("aria-describedby");
  if (updateURL) updateManualURL(search.values);
  return executeSearch(search.query, { mode: "manual", scopeCode: search.scopeCode, manualSearch: search });
}

async function executeSearch(query, { mode = "auto", scopeCode = "", manualSearch = null } = {}) {
  const mine = ++seq;
  if (clearBtn) clearBtn.hidden = mode !== "auto" || !query;

  if (!query) {
    setState("ready", "ready");
    renderSignature(null);
    results.innerHTML = "";
    if (samples) samples.style.display = "";
    setResultsBusy(false);
    return;
  }
  if (samples && mode === "auto") samples.style.display = "none";
  setResultsBusy(true);

  let sig = window.ErrorMatcher ? window.ErrorMatcher.parse(query) : null;
  const hasSig = renderSignature(sig);
  setState("reading", hasSig ? "scanning" : "searching");

  let hits = await gather(query, sig);
  if (mine !== seq) return;                   // a newer query superseded us

  sig = inferJurisdictionFromExactMatches(sig, hits);
  renderSignature(sig);
  const detectedCode = scopeCode || sig?.jurisdiction?.code;
  hits = prioritizeJurisdiction(hits, detectedCode);
  const unscopedCount = hits.length;
  if (scopeCode) hits = hits.filter(hit => hit.jurisdictionCode === scopeCode);
  else if (mode === "auto") hits = hits.filter(hit => matchesAutoScope(hit, activeAutoScope));
  const filteredOut = unscopedCount - hits.length;

  if (!hits.length) {
    setState("reading", "no match");
    const scope = manualSearch?.jurisdictionLabel || (activeAutoScope === "all" ? "" : activeAutoScope === "States" ? "states and D.C." : "federal guidance");
    const manualSummary = manualSearch ? manualSummaryHTML(manualSearch, filteredOut) : "";
    results.innerHTML = `${manualSummary}<div class="note">
      <strong>No matching guidance found${scope ? ` in ${esc(scope)}` : ""}.</strong>
      <span>${manualSearch
        ? "Try removing one detail, choosing all jurisdictions, or entering a phrase from the diagnostic."
        : "Try the reject code on its own (for example, F1065-037-02) or a few keywords from the message."}</span>
      ${manualSearch ? `<button type="button" class="note__action" data-edit-manual>Review manual filters</button>` : ""}
    </div>`;
    wireManualSummary();
    setResultsBusy(false);
    return;
  }

  setState("matched", hits.length === 1 ? "1 match" : "best match found");
  const html = manualSearch ? [manualSummaryHTML(manualSearch, filteredOut)] : [];
  html.push(cardHTML(hits[0], 1, true));
  if (hits.length > 1) {
    const alternatives = hits.slice(1);
    html.push(`<section class="alternatives" aria-labelledby="more-heading">
      <div class="alternatives__prompt">
        <div>
          <h2 id="more-heading">Still not resolved?</h2>
          <p>Review ${alternatives.length} lower-confidence match${alternatives.length > 1 ? "es" : ""}. These may be less likely to solve this exact error, but can help when the first fix does not apply.</p>
        </div>
        <button type="button" class="alternatives__button" data-show-more aria-expanded="false" aria-controls="gs-more-results">
          <span data-more-label>Show other solutions</span>
          <span class="alternatives__count">${alternatives.length}</span>
        </button>
      </div>
      <div class="alternatives__results" id="gs-more-results" hidden>
        ${toolbarHTML(alternatives)}
        <div class="alternatives__list" id="gs-secondary">
          ${alternatives.map((hit, i) => cardHTML(hit, i + 2, false)).join("")}
        </div>
      </div>
    </section>`);
  }
  results.innerHTML = html.join("");
  if (hits.length > 1) wireToolbar(hits.slice(1), detectedCode);
  wireCards();
  wireAlternatives();
  wireManualSummary();
  setResultsBusy(false);
}

function wireAlternatives() {
  const button = results.querySelector("[data-show-more]");
  const panel = results.querySelector("#gs-more-results");
  if (!button || !panel) return;
  button.addEventListener("click", () => {
    const open = button.getAttribute("aria-expanded") !== "true";
    button.setAttribute("aria-expanded", String(open));
    panel.hidden = !open;
    const label = button.querySelector("[data-more-label]");
    if (label) label.textContent = open ? "Hide other solutions" : "Show other solutions";
  });
}

/* ---- results toolbar: match-type filters, jurisdiction filter, sort & actions ---------------- */
function toolbarHTML(hits, detectedJurisdiction = "") {
  const n = hits.length;
  const presentKinds = KIND_ORDER.filter(k => hits.some(h => (h.kind || "text") === k));
  const kindFilters = presentKinds.length > 1
    ? `<div class="filter-group" role="group" aria-label="Filter by match type">
         <span class="filter-group__label">Match</span>
         <div class="filterset">
           <button type="button" class="filter filter--on" data-filter="all" aria-pressed="true">All</button>
           ${presentKinds.map(k => `<button type="button" class="filter" data-filter="${k}" aria-pressed="false">${esc(KIND_LABEL[k])}</button>`).join("")}
         </div>
       </div>`
    : "";

  const jurisdictions = Array.from(new Map(
    hits.map(h => [h.jurisdictionCode || "General", h.jurisdiction || "General / Federal"])
  ).entries()).sort((a, b) => a[1].localeCompare(b[1]));
  const canAutoScope = detectedJurisdiction && jurisdictions.some(([code]) => code === detectedJurisdiction);
  const jurButtons = `<div class="filter-group filter-group--wide" role="group" aria-label="Filter by jurisdiction">
    <span class="filter-group__label">Jurisdiction</span>
    <div class="filterset filterset--scroll">
      <button type="button" class="filter ${canAutoScope ? "" : "filter--on"}" data-jur-filter="all" aria-pressed="${canAutoScope ? "false" : "true"}">All <span>${n}</span></button>
      ${jurisdictions.map(([code, label]) => {
        const count = hits.filter(h => (h.jurisdictionCode || "General") === code).length;
        const active = canAutoScope && code === detectedJurisdiction;
        return `<button type="button" class="filter ${active ? "filter--on" : ""}" data-jur-filter="${esc(code)}" aria-pressed="${active}">${esc(label)} <span>${count}</span></button>`;
      }).join("")}
    </div>
  </div>`;

  const autoScope = canAutoScope
    ? `<p class="results__scope" id="gs-scope-note">Auto-filtered to <strong>${esc(jurisdictions.find(([code]) => code === detectedJurisdiction)?.[1])}</strong> from the pasted error. Choose “All jurisdictions” to widen the results.</p>`
    : "";

  const sortButtons = `<div class="filter-group" role="group" aria-label="Sort results">
    <span class="filter-group__label">Sort</span>
    <div class="filterset">
      <button type="button" class="filter filter--on" data-sort="relevance" aria-pressed="true">Best match</button>
      <button type="button" class="filter" data-sort="jurisdiction-asc" aria-pressed="false">Jurisdiction A-Z</button>
      <button type="button" class="filter" data-sort="jurisdiction-desc" aria-pressed="false">Jurisdiction Z-A</button>
      <button type="button" class="filter" data-sort="title-asc" aria-pressed="false">Title A-Z</button>
    </div>
  </div>`;

  const actions = n > 1
    ? `<div class="results__actions">
         <button type="button" class="bar-btn" data-action="expand">Expand all</button>
         <button type="button" class="bar-btn" data-action="collapse">Collapse all</button>
       </div>`
    : "";

  return `<div class="results__bar">
    <div class="results__bar-top">
      <p class="results__count" id="gs-count">${n} match${n > 1 ? "es" : ""}</p>
      ${actions}
    </div>
    <div class="results__filters">
      ${kindFilters}
      ${jurButtons}
      ${sortButtons}
    </div>
    ${autoScope}
  </div>`;
}

function wireToolbar(hits, detectedJurisdiction = "") {
  const cardsRoot = results.querySelector("#gs-secondary") || results;
  const toolbarRoot = results.querySelector("#gs-more-results") || results;
  const total = hits.length;
  const count = toolbarRoot.querySelector("#gs-count");
  const typeBtns = toolbarRoot.querySelectorAll("[data-filter]");
  const jurBtns = toolbarRoot.querySelectorAll("[data-jur-filter]");
  const sortBtns = toolbarRoot.querySelectorAll("[data-sort]");

  let activeKind = "all";
  let activeJur = toolbarRoot.querySelector('[data-jur-filter][aria-pressed="true"]')?.dataset.jurFilter || "all";
  let activeSort = "relevance";

  function applyFiltersAndSort() {
    let cards = Array.from(cardsRoot.querySelectorAll(".card"));
    
    // 1. Filtering
    let shown = 0;
    cards.forEach(card => {
      const matchKind = activeKind === "all" || card.dataset.kind === activeKind;
      const matchJur = activeJur === "all" || card.dataset.jurisdictionCode === activeJur;
      const visible = matchKind && matchJur;
      card.hidden = !visible;
      if (visible) shown++;
    });

    if (count) {
      const selectedLabel = Array.from(jurBtns).find(btn => btn.dataset.jurFilter === activeJur)?.textContent.trim() || activeJur;
      const extra = activeJur !== "all" ? ` · ${selectedLabel}` : "";
      count.textContent = (activeKind === "all" && activeJur === "all")
        ? `${total} match${total > 1 ? "es" : ""}`
        : `${shown} of ${total} shown${extra}`;
    }

    // 2. Sorting
    const sortVal = activeSort;
    cards.sort((a, b) => {
      if (sortVal === "jurisdiction-asc") {
        return a.dataset.jurisdiction.localeCompare(b.dataset.jurisdiction);
      }
      if (sortVal === "jurisdiction-desc") {
        return b.dataset.jurisdiction.localeCompare(a.dataset.jurisdiction);
      }
      if (sortVal === "title-asc") {
        return a.dataset.title.localeCompare(b.dataset.title);
      }
      // default: relevance / rank
      return Number(a.dataset.rank) - Number(b.dataset.rank);
    });

    // Re-append sorted cards in the lower-confidence results container.
    cards.forEach(card => cardsRoot.appendChild(card));
  }

  typeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      typeBtns.forEach(b => {
        const active = b === btn;
        b.classList.toggle("filter--on", active);
        b.setAttribute("aria-pressed", String(active));
      });
      activeKind = btn.dataset.filter;
      applyFiltersAndSort();
    });
  });

  jurBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      jurBtns.forEach(b => {
        const active = b === btn;
        b.classList.toggle("filter--on", active);
        b.setAttribute("aria-pressed", String(active));
      });
      activeJur = btn.dataset.jurFilter;
      const scopeNote = toolbarRoot.querySelector("#gs-scope-note");
      if (scopeNote) scopeNote.hidden = activeJur !== detectedJurisdiction;
      applyFiltersAndSort();
    });
  });

  sortBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      sortBtns.forEach(b => {
        const active = b === btn;
        b.classList.toggle("filter--on", active);
        b.setAttribute("aria-pressed", String(active));
      });
      activeSort = btn.dataset.sort;
      applyFiltersAndSort();
    });
  });

  toolbarRoot.querySelector('[data-action="expand"]')?.addEventListener("click", () => {
    cardsRoot.querySelectorAll(".card").forEach(c => { if (!c.hidden) toggleCard(c, true); });
  });
  toolbarRoot.querySelector('[data-action="collapse"]')?.addEventListener("click", () => {
    cardsRoot.querySelectorAll(".card").forEach(c => toggleCard(c, false));
  });

  applyFiltersAndSort();
}


/* ---- samples + keyboard --------------------------------------------------- */
samples?.addEventListener("click", e => {
  const btn = e.target.closest(".sample");
  if (!btn) return;
  input.value = btn.dataset.sample.replace(/\r?\n/g, "\n");
  input.focus();
  run();
});

function updateManualStatus() {
  const count = Object.values(manualValues()).filter(Boolean).length;
  if (manualStatus) {
    manualStatus.textContent = count
      ? count + " detail" + (count === 1 ? "" : "s") + " ready · Add more to narrow the results"
      : "No required fields · Use whatever information you have";
  }
  if (count && manualError) manualError.hidden = true;
}

modeTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => setMode(tab.dataset.mode));
  tab.addEventListener("keydown", e => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    let next = index;
    if (e.key === "ArrowLeft") next = (index - 1 + modeTabs.length) % modeTabs.length;
    if (e.key === "ArrowRight") next = (index + 1) % modeTabs.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = modeTabs.length - 1;
    setMode(modeTabs[next].dataset.mode);
  });
});

autoScopeControls.forEach(control => {
  control.addEventListener("click", () => setAutoScope(control.dataset.autoScope));
});

Object.values(manualFields).forEach(field => {
  field?.addEventListener("input", updateManualStatus);
  field?.addEventListener("change", updateManualStatus);
});
manualFields.code?.addEventListener("blur", () => {
  manualFields.code.value = normalizeManualCode(manualFields.code.value);
});

manualReset?.addEventListener("click", () => {
  Object.values(manualFields).forEach(field => { if (field) field.value = ""; });
  updateManualStatus();
  clearManualURL();
  resetSearchUI();
  manualFields.jurisdiction?.focus();
});

clearBtn?.addEventListener("click", () => {
  input.value = "";
  clearManualURL();
  input.focus();
  run();
});
input?.addEventListener("input", () => {
  if (new URLSearchParams(location.search).has("q")) clearManualURL();
  schedule();
});
form?.addEventListener("submit", e => {
  e.preventDefault();
  if (activeMode === "manual") runManual();
  else run();
});

document.addEventListener("keydown", e => {
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || "");
  if ((e.key === "/" && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) {
    e.preventDefault();
    if (activeMode !== "auto") setMode("auto");
    input.focus();
    input.select?.();
  } else if (e.key === "Escape" && document.activeElement === input) {
    input.value = "";
    clearManualURL();
    run();
  } else if (e.key === "Enter" && document.activeElement === input && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
    const first = results.querySelector(".card a");
    if (first) window.location.href = first.getAttribute("href");
  }
});
document.querySelectorAll("[data-focus-search]").forEach(el =>
  el.addEventListener("click", () => {
    if (activeMode !== "auto") setMode("auto");
    input.focus();
    input.select?.();
  }));

/* Restore a shareable search, then fall back to the user's last-used mode. */
const initialParams = new URLSearchParams(location.search);
const q0 = initialParams.get("q");
let initialMode = initialParams.get("mode");
try {
  const savedAutoScope = localStorage.getItem("gs-auto-jurisdiction-scope");
  if (savedAutoScope) setAutoScope(savedAutoScope, { rerun: false, persist: false });
} catch {}
if (initialMode !== "manual" && !q0) {
  try { initialMode = localStorage.getItem("gs-search-mode"); } catch {}
}
setState("ready", "ready");
if (initialParams.get("mode") === "manual") {
  setMode("manual", { focus: false, clearResults: false, persist: false });
  restoreManualSearch(initialParams);
} else if (q0) {
  setMode("auto", { focus: false, clearResults: false, persist: false });
  input.value = q0;
  run();
} else {
  setMode(initialMode === "manual" ? "manual" : "auto", { focus: false, clearResults: false, persist: false });
}
updateManualStatus();

if (initialParams.get("focus") === "search") {
  setTimeout(() => {
    setMode("auto", { clearResults: false });
    input?.focus();
    input?.select?.();
  }, 0);
}
