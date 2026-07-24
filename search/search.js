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

let pagefind = null;
let codes = null;
let seq = 0;                         // stale-response guard

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

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c =>
    ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
}

/* ---- live signature decomposition ---------------------------------------- */
function renderSignature(sig) {
  if (!sig) { sigBox.hidden = true; sigChips.innerHTML = ""; return false; }
  const parts = [];
  if (sig.state)      parts.push(["jurisdiction", sig.state]);
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

/* ---- result cards --------------------------------------------------------- */
function cardHTML(hit, rank, best) {
  const why = (hit.why || []).map((w, i) =>
    `<span class="why__chip ${i === 0 && best ? "why__chip--strong" : ""}">${esc(w)}</span>`).join("");
  const badge = best ? `<span class="card__badge">Best match</span>` : "";
  const excerpt = hit.excerpt ? `<p class="card__excerpt">${hit.excerpt}</p>` : "";
  const kind = hit.kind || "text";
  const kindTag = `<span class="card__kind card__kind--${kind}">${esc(KIND_LABEL[kind] || kind)}</span>`;
  const crumbSpans = (hit.breadcrumb || []).map(c => `<span>${esc(c)}</span>`).join("");
  return `
  <article class="card ${best ? "card--best" : ""}" data-url="${esc(hit.url)}" data-kind="${esc(kind)}" data-open="false">
    <div class="card__top" role="button" tabindex="0" aria-expanded="${best}">
      <span class="card__rank">${best ? "✓" : rank}</span>
      <div class="card__grow">
        ${badge}
        <h3 class="card__title"><a href="${esc(hit.url)}">${esc(hit.title)}</a></h3>
        <p class="card__crumb">${kindTag}${crumbSpans}</p>
        ${why ? `<div class="why">${why}</div>` : excerpt}
      </div>
      <span class="card__disc" aria-hidden="true">▸</span>
    </div>
    <div class="card__fix" id="fix-${rank}">
      <p class="card__fixlabel">The fix</p>
      <div class="prose" data-fixbody>Loading…</div>
      <p class="card__source"><a href="${esc(hit.url)}">Open full article →</a></p>
    </div>
  </article>`;
}

async function loadFix(card) {
  const body = card.querySelector("[data-fixbody]");
  if (!body || body.dataset.loaded) return;
  body.dataset.loaded = "1";
  try {
    const html = await (await fetch(card.dataset.url)).text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const el = doc.querySelector(".doc__body") || doc.querySelector(".prose");
    body.innerHTML = el ? el.innerHTML : "See the full article for details.";
  } catch {
    body.innerHTML = `Couldn't load the fix inline. <a href="${card.dataset.url}">Open the article →</a>`;
  }
}

function toggleCard(card, open) {
  const willOpen = open ?? card.dataset.open !== "true";
  card.dataset.open = String(willOpen);
  card.querySelector(".card__top")?.setAttribute("aria-expanded", String(willOpen));
  if (willOpen) loadFix(card);
}

function wireCards() {
  results.querySelectorAll(".card").forEach(card => {
    const top = card.querySelector(".card__top");
    top.addEventListener("click", e => { if (e.target.closest("a")) return; toggleCard(card); });
    top.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleCard(card); }
    });
  });
  const best = results.querySelector(".card--best");
  if (best) toggleCard(best, true);
}

/* ---- merge sources -------------------------------------------------------- */
async function gather(query, sig) {
  const out = [];
  const seen = new Set();
  const add = (h) => { const k = h.url.replace(/index\.html$/, "").replace(/\.html$/, "").toLowerCase(); if (!seen.has(k)) { seen.add(k); out.push(h); } };

  // 1) deterministic error matches (highest confidence)
  if (window.ErrorMatcher) {
    try {
      await window.ErrorMatcher.ready;
      (window.ErrorMatcher.match(query) || []).forEach(h => add({ ...h, kind: h.kind || "signature" }));
    } catch {}
  }
  // 2) exact reject-code lookup from codes.json
  const c = await loadCodes();
  if (sig && sig.codes) {
    for (const code of sig.codes) {
      const hit = c.codes?.[normCode(code)];
      if (hit) add({ url: hit.url, title: hit.title, breadcrumb: hit.section ? ["Form " + hit.section] : [], why: ["Exact code " + code], kind: "code" });
    }
  }
  // 3) full-text (natural language / body text)
  const pf = await loadPagefind();
  if (pf) {
    try {
      const search = await pf.search(query.slice(0, 240));
      const top = await Promise.all(search.results.slice(0, 8).map(r => r.data()));
      top.forEach(d => add({ url: d.url.replace(/\.html$/, ".html"), title: (d.meta && d.meta.title) || d.url, breadcrumb: [], excerpt: d.excerpt, kind: "text" }));
    } catch {}
  }
  return out;
}

/* ---- main run ------------------------------------------------------------- */
let timer = null;
function schedule() { clearTimeout(timer); timer = setTimeout(run, 130); }

async function run() {
  const query = input.value.trim();
  const mine = ++seq;
  clearBtn.hidden = !query;

  if (!query) {
    setState("ready", "ready");
    renderSignature(null);
    results.innerHTML = "";
    samples.style.display = "";
    return;
  }
  samples.style.display = "none";

  const sig = window.ErrorMatcher ? window.ErrorMatcher.parse(query) : null;
  const hasSig = renderSignature(sig);
  setState("reading", hasSig ? "scanning" : "searching");

  const hits = await gather(query, sig);
  if (mine !== seq) return;                   // a newer query superseded us

  if (!hits.length) {
    setState("reading", "no match");
    results.innerHTML = `<div class="note">No article matched that yet.<br>
      Try the reject code on its own (e.g. <code>F1065-037-02</code>) or a few keywords from the message.</div>`;
    return;
  }

  setState("matched", hits.length === 1 ? "1 match" : hits.length + " matches");
  const html = [toolbarHTML(hits)];
  hits.forEach((h, i) => html.push(cardHTML(h, i + 1, i === 0)));
  results.innerHTML = html.join("");
  wireCards();
  wireToolbar(hits.length);
}

/* ---- results toolbar: match-type filters + expand/collapse ---------------- */
function toolbarHTML(hits) {
  const n = hits.length;
  const present = KIND_ORDER.filter(k => hits.some(h => (h.kind || "text") === k));
  const filters = present.length > 1
    ? `<div class="filterset" role="group" aria-label="Filter matches by type">
         <button type="button" class="filter filter--on" data-filter="all">All</button>
         ${present.map(k => `<button type="button" class="filter" data-filter="${k}">${esc(KIND_LABEL[k])}</button>`).join("")}
       </div>`
    : "";
  const actions = n > 1
    ? `<div class="results__actions">
         <button type="button" class="bar-btn" data-action="expand">Expand all</button>
         <button type="button" class="bar-btn" data-action="collapse">Collapse all</button>
       </div>`
    : "";
  return `<div class="results__bar">
    <p class="results__count" id="gs-count">${n} match${n > 1 ? "es" : ""}</p>
    ${filters}${actions}
  </div>`;
}

function wireToolbar(total) {
  const count = results.querySelector("#gs-count");
  results.querySelectorAll(".filter").forEach(btn => {
    btn.addEventListener("click", () => {
      results.querySelectorAll(".filter").forEach(b => b.classList.toggle("filter--on", b === btn));
      const f = btn.dataset.filter;
      let shown = 0;
      results.querySelectorAll(".card").forEach(card => {
        const match = f === "all" || card.dataset.kind === f;
        card.hidden = !match;
        if (match) shown++;
      });
      if (count) count.textContent = f === "all"
        ? `${total} match${total > 1 ? "es" : ""}`
        : `${shown} of ${total} shown`;
    });
  });
  results.querySelector('[data-action="expand"]')?.addEventListener("click", () => {
    results.querySelectorAll(".card").forEach(c => { if (!c.hidden) toggleCard(c, true); });
  });
  results.querySelector('[data-action="collapse"]')?.addEventListener("click", () => {
    results.querySelectorAll(".card").forEach(c => toggleCard(c, false));
  });
}

/* ---- samples + keyboard --------------------------------------------------- */
samples?.addEventListener("click", e => {
  const btn = e.target.closest(".sample");
  if (!btn) return;
  input.value = btn.dataset.sample.replace(/\r?\n/g, "\n");
  input.focus();
  run();
});

clearBtn?.addEventListener("click", () => { input.value = ""; input.focus(); run(); });
input?.addEventListener("input", schedule);
form?.addEventListener("submit", e => { e.preventDefault(); run(); });

document.addEventListener("keydown", e => {
  const typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName || "");
  if ((e.key === "/" && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) {
    e.preventDefault(); input.focus(); input.select?.();
  } else if (e.key === "Escape" && document.activeElement === input) {
    input.value = ""; run();
  } else if (e.key === "Enter" && document.activeElement === input && !e.shiftKey) {
    e.preventDefault();
    const first = results.querySelector(".card a");
    if (first) window.location.href = first.getAttribute("href");
  }
});
document.querySelectorAll("[data-focus-search]").forEach(el =>
  el.addEventListener("click", () => { input.focus(); input.select?.(); }));

/* deep link ?q= */
const q0 = new URLSearchParams(location.search).get("q");
if (q0) { input.value = q0; run(); }
setState("ready", "ready");
