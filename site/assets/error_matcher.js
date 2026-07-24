/*
 * error_matcher.js — Search layer (deterministic error matching)
 * =============================================================================
 * AUTHORITATIVE SOURCE. The build pipeline copies this file to
 *   site/assets/error_matcher.js
 * (see integration notes). Do not diverge the copies.
 *
 * A pure-logic ES module: no DOM, no framework, no build step. The frontend
 * orchestrator (search.js) imports it and calls the exposed interface. Also
 * importable in Node (for search/matcher_selftest.mjs) — it only touches
 * `window` / `fetch` when they exist.
 *
 * PUBLIC INTERFACE
 * ----------------
 *   window.ErrorMatcher = {
 *     ready,                 // Promise, resolves after loading /signatures.json
 *     parse(text) -> {                // DETERMINISTIC signature extractor
 *        raw, state, form, schedule, element, elementPath, field,
 *        constraint, datatype, value, codes:[]
 *     },
 *     match(text) -> [ {               // scored articles, sorted desc, top ~10
 *        url, title, section, breadcrumb, score,
 *        why:[strings], matchedOn:{field,form,constraint,code,state}
 *     } ]
 *   }
 *
 * parse() understands raw pasted state FTB schema errors and IRS MeF rejects:
 *   - normalizes path separators (\ <-> /),
 *   - strips namespace URIs (http://www.ftb.ca.gov/efile: , efile: , {ns}),
 *   - detects state / form / schedule / element path + trailing field /
 *     constraint / datatype / value / reject codes.
 *
 * match() scores each article in signatures.json against the parsed query.
 * Weights (documented, highest first):
 *     CODE_EXACT ...... 100   normalized reject-code hit (query code == article code)
 *     FIELD_EXACT ..... 45    query field == an article field (case-insensitive)
 *     FIELD_IN_TITLE .. 25    query field appears in the article title
 *     FIELD_PARTIAL ... 20    query field is a substring of an article field/element (or vice-versa)
 *     ELEMENT_OVERLAP . 8 each (capped 32)  shared path/xpath element tokens
 *     FORM ............ 15    same form number
 *     STATE ........... 10    same state
 *     CONSTRAINT ...... 5     constraint keyword present in article title/excerpt
 * Results with score <= 0 are dropped; the top ~10 are returned.
 *
 * Graceful degradation:
 *   - signatures.json missing/empty  -> match() returns [].
 *   - input is plain text (no code, no field, no element path) -> match()
 *     returns [] so the caller can fall back to full-text search.
 * =============================================================================
 */

// ------------------------------- config ------------------------------------
const SIG_URL = "/signatures.json";
const MAX_RESULTS = 10;

const W = {
  CODE_EXACT: 100,
  FIELD_EXACT: 45,
  FIELD_IN_TITLE: 25,
  FIELD_PARTIAL: 20,
  ELEMENT_OVERLAP: 8,
  ELEMENT_OVERLAP_CAP: 32,
  FORM: 15,
  STATE: 10,
  CONSTRAINT: 5,
  // Penalties: a field/element hit on an article that is explicitly about a
  // DIFFERENT jurisdiction is almost always a false positive for these
  // state-specific e-file errors (e.g. an Alabama article that mentions
  // "EntityType" must not outrank the California one).
  STATE_MISMATCH: 40,
  FORM_MISMATCH: 8,
};

// US state name -> USPS abbreviation (mirror of the Python builder table).
const STATE_ABBR = {
  alabama: "AL", alaska: "AK", arizona: "AZ", arkansas: "AR", california: "CA",
  colorado: "CO", connecticut: "CT", delaware: "DE", florida: "FL",
  georgia: "GA", hawaii: "HI", idaho: "ID", illinois: "IL", indiana: "IN",
  iowa: "IA", kansas: "KS", kentucky: "KY", louisiana: "LA", maine: "ME",
  maryland: "MD", massachusetts: "MA", michigan: "MI", minnesota: "MN",
  mississippi: "MS", missouri: "MO", montana: "MT", nebraska: "NE",
  nevada: "NV", "new hampshire": "NH", "new jersey": "NJ", "new mexico": "NM",
  "new york": "NY", "north carolina": "NC", "north dakota": "ND", ohio: "OH",
  oklahoma: "OK", oregon: "OR", pennsylvania: "PA", "rhode island": "RI",
  "south carolina": "SC", "south dakota": "SD", tennessee: "TN", texas: "TX",
  utah: "UT", vermont: "VT", virginia: "VA", washington: "WA",
  "west virginia": "WV", wisconsin: "WI", wyoming: "WY",
  "district of columbia": "DC",
};
const ABBR_SET = new Set(Object.values(STATE_ABBR));

// ------------------------------ state --------------------------------------
let SIGNATURES = null; // { generated_at, count, articles:[...] }
let readyResolve;
const ready = new Promise((res) => {
  readyResolve = res;
});

// --------------------------- code normalization ----------------------------
// Same rule as build_codes_index.py / search.js: uppercase, drop non-alnum.
function normalizeCode(s) {
  return String(s == null ? "" : s)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

// --------------------------- text normalization ----------------------------
// Backslash paths -> forward slash, strip namespace URIs and ns: prefixes.
function normalizeText(text) {
  let t = String(text == null ? "" : text);
  t = t.replace(/\\/g, "/"); // path separators
  t = t.replace(/https?:\/\/\S*?:/g, ""); // http://www.ftb.ca.gov/efile: -> "" (keep trailing identifier)
  t = t.replace(/https?:\/\/\S+/g, ""); // any remaining bare URL -> "" (avoid stray path tokens)
  t = t.replace(/\{[^}]*\}/g, ""); // {namespace}Element -> Element
  // efile:EntityType -> EntityType  (ns prefix immediately before an identifier)
  t = t.replace(/\b[\w.]+:(?=[A-Z][A-Za-z0-9]*\b)/g, "");
  return t;
}

// ------------------------------ regexes ------------------------------------
const RE_CODE_DASHED = /\b([A-Z][A-Z0-9]{0,6}(?:-[A-Z0-9]+){1,3})\b/g;
const RE_CAFORM = /\bCAForm\s*(\d{3,4})/i;
const RE_FORM = /\bForm\s*(\d{3,4})\b/i;
const RE_FCODE_PREFIX = /\bF(\d{3,4})[A-Z]*-\d/;
const RE_STATE_FORM = /\b([A-Z]{2})Form\d/;
// No \b before "Schedule": it is often glued to a form root ("565ScheduleK-1").
const RE_SCHEDULE = /Schedule\s*(K-?\d|[A-Z0-9]+(?:-[A-Z0-9]+)*)/i;
// A path-ish run: Segment(/Segment)+, each Segment starting with a letter.
const RE_PATH = /([A-Za-z][\w .\-]*(?:\/[A-Za-z0-9][\w .\-]*){1,})/g;
const RE_QUOTED = /['"‘’“”]([A-Za-z][A-Za-z0-9_]{2,})['"‘’“”]/g;

function looksLikeCode(token) {
  if (token.indexOf("-") === -1) return false;
  let digits = 0;
  for (const c of token) if (c >= "0" && c <= "9") digits++;
  return digits >= 3;
}

function uniq(arr) {
  const out = [];
  const seen = new Set();
  for (const x of arr) {
    if (x && !seen.has(x)) {
      seen.add(x);
      out.push(x);
    }
  }
  return out;
}

function cleanSegment(seg) {
  return String(seg).replace(/\s+/g, "").trim();
}

// --------------------------- the parser ------------------------------------
function parse(text) {
  const raw = String(text == null ? "" : text);
  const t = normalizeText(raw);

  // ---- reject codes -------------------------------------------------------
  const codes = [];
  let m;
  RE_CODE_DASHED.lastIndex = 0;
  while ((m = RE_CODE_DASHED.exec(t)) !== null) {
    if (looksLikeCode(m[1])) codes.push(m[1]);
  }

  // ---- state --------------------------------------------------------------
  let state = "";
  if (/ftb\.ca\.gov/i.test(raw)) state = "CA";
  else if (/irs\.gov/i.test(raw)) state = "federal";
  if (!state) {
    const sf = raw.match(RE_STATE_FORM);
    if (sf && ABBR_SET.has(sf[1])) state = sf[1];
  }
  if (!state && /\bCAForm/i.test(t)) state = "CA";
  if (!state) {
    const low = raw.toLowerCase();
    for (const name in STATE_ABBR) {
      const re = new RegExp("\\b" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b");
      if (re.test(low)) {
        state = STATE_ABBR[name];
        break;
      }
    }
  }

  // ---- form ---------------------------------------------------------------
  let form = "";
  let fm = t.match(RE_CAFORM) || t.match(RE_FORM) || t.match(RE_FCODE_PREFIX);
  if (fm) form = fm[1];

  // ---- schedule -----------------------------------------------------------
  let schedule = "";
  const sm = t.match(RE_SCHEDULE);
  if (sm) {
    let s = sm[1].toUpperCase();
    // ScheduleK-1 / ScheduleK1 -> "K-1"
    const km = s.match(/^K-?(\d)$/);
    schedule = km ? "K-" + km[1] : s;
  }

  // ---- element path + trailing field -------------------------------------
  // Pick the longest path-ish run (prefer one that mentions "Form").
  let bestPath = "";
  RE_PATH.lastIndex = 0;
  let pm;
  while ((pm = RE_PATH.exec(t)) !== null) {
    const cand = pm[1];
    if (!cand.includes("/")) continue;
    const preferred = /form/i.test(cand);
    const bestPreferred = /form/i.test(bestPath);
    if (
      (preferred && !bestPreferred) ||
      (preferred === bestPreferred && cand.length > bestPath.length)
    ) {
      bestPath = cand;
    }
  }

  let elements = [];
  let elementPath = "";
  let field = "";
  if (bestPath) {
    const segs = bestPath
      .split("/")
      .map((s) => cleanSegment(s))
      .filter((s) => s && !/^\d+$/.test(s));
    elements = segs;
    elementPath = segs.join("/");
    if (segs.length) field = segs[segs.length - 1];
  }

  // Field fallbacks when there was no usable path.
  if (!field) {
    // "The element X ... is invalid" / "element X has incomplete content"
    const em = t.match(/element\s+([A-Za-z][A-Za-z0-9_]{2,})/i);
    // quoted identifier (first)
    RE_QUOTED.lastIndex = 0;
    const qm = RE_QUOTED.exec(t);
    if (qm) field = qm[1];
    else if (em) field = em[1];
  }
  const element = field; // alias for the trailing element

  // ---- constraint ---------------------------------------------------------
  let constraint = "";
  const lc = t.toLowerCase();
  if (/incomplete content|is unexpected|list of possible elements expected/.test(lc)) {
    constraint = "MissingRequired";
  } else if (/enumeration/.test(lc)) {
    constraint = "Enumeration";
  } else if (/pattern/.test(lc)) {
    constraint = "Pattern";
  } else if (/\bboolean\b/.test(lc)) {
    constraint = "BadBoolean";
  } else if (/\binteger\b/.test(lc)) {
    constraint = "BadInteger";
  }

  // ---- datatype -----------------------------------------------------------
  let datatype = "";
  const dm = t.match(/datatype[^A-Za-z0-9]{0,6}([A-Za-z][\w:.\-]*)/i);
  if (dm) datatype = dm[1];

  // ---- value --------------------------------------------------------------
  let value = "";
  const vm =
    t.match(/\bvalue\s+['"]?([A-Za-z0-9_.:\-]+)['"]?\s+is\s+invalid/i) ||
    t.match(/\bThe value\s+['"]?([A-Za-z0-9_.:\-]+)['"]?/i);
  if (vm) value = vm[1];

  return {
    raw,
    state,
    form,
    schedule,
    element,
    elementPath,
    field,
    constraint,
    datatype,
    value,
    codes: uniq(codes),
    _elements: elements, // internal: all path tokens (used by match)
  };
}

// --------------------------- data loading ----------------------------------
async function loadSignatures() {
  try {
    if (typeof fetch !== "function") throw new Error("no fetch");
    const res = await fetch(SIG_URL, { cache: "no-cache" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    setSignatures(data);
  } catch (e) {
    if (typeof console !== "undefined") {
      console.warn("[error-matcher] signatures.json unavailable; matcher idle.", e);
    }
    setSignatures({ articles: [] });
  }
  return SIGNATURES;
}

// Inject signatures directly (used by the Node self-test and by hosts without
// fetch). Also resolves `ready`.
function setSignatures(data) {
  SIGNATURES =
    data && Array.isArray(data.articles) ? data : { articles: [] };
  // Precompute lowercase lookup sets per article.
  for (const a of SIGNATURES.articles) {
    const k = a.keys || {};
    a._codes = (k.codes || []).map(normalizeCode);
    a._fields = (k.fields || []).map((s) => String(s).toLowerCase());
    a._forms = new Set(k.forms || []);
    a._states = new Set(k.states || []);
    a._elements = (k.elements || []).map((s) => String(s).toLowerCase());
    a._hay = (
      (a.title || "") + " " + (a.excerpt || "")
    ).toLowerCase();
  }
  if (readyResolve) {
    readyResolve(SIGNATURES);
    readyResolve = null;
  }
}

// --------------------------- the scorer ------------------------------------
const CONSTRAINT_KEYWORD = {
  Enumeration: "enumeration",
  Pattern: "pattern",
  MissingRequired: "incomplete content",
  BadInteger: "integer",
  BadBoolean: "boolean",
};

function scoreArticle(q, art) {
  let score = 0;
  const why = [];
  const matchedOn = { field: null, form: null, constraint: null, code: null, state: null };

  // Reject codes (highest).
  if (q.codes && q.codes.length && art._codes && art._codes.length) {
    const qcodes = q.codes.map(normalizeCode);
    for (const c of qcodes) {
      if (art._codes.includes(c)) {
        score += W.CODE_EXACT;
        matchedOn.code = c;
        // Show the human-readable form from the article keys if present.
        why.push("Reject code " + (art.keys.codes.find((x) => normalizeCode(x) === c) || c));
        break;
      }
    }
  }

  // Field name.
  const qfield = q.field ? q.field.toLowerCase() : "";
  if (qfield) {
    if (art._fields.includes(qfield)) {
      score += W.FIELD_EXACT;
      matchedOn.field = q.field;
      why.push("Matches field " + q.field);
    } else if (art._hay.includes(qfield)) {
      score += W.FIELD_IN_TITLE;
      matchedOn.field = q.field;
      why.push("Field " + q.field + " referenced in article");
    } else {
      const partial =
        art._fields.some((f) => f.includes(qfield) || qfield.includes(f)) ||
        art._elements.some((e) => e.includes(qfield) || qfield.includes(e));
      if (partial) {
        score += W.FIELD_PARTIAL;
        matchedOn.field = q.field;
        why.push("Related field " + q.field);
      }
    }
  }

  // Element-token overlap (exclude the field we already scored).
  const qElems = (q._elements || []).map((s) => s.toLowerCase());
  if (qElems.length && art._elements.length) {
    const artSet = new Set(art._elements);
    let overlap = 0;
    const shared = [];
    for (const e of qElems) {
      if (!e || e === qfield) continue;
      if (artSet.has(e)) {
        overlap += W.ELEMENT_OVERLAP;
        shared.push(e);
      }
    }
    overlap = Math.min(overlap, W.ELEMENT_OVERLAP_CAP);
    if (overlap > 0) {
      score += overlap;
      why.push("Element overlap: " + shared.slice(0, 3).join(", "));
    }
  }

  // Form.
  if (q.form && art._forms.has(q.form)) {
    score += W.FORM;
    matchedOn.form = q.form;
    why.push("Same form (" + q.form + ")");
  }

  // State.
  if (q.state && art._states.has(q.state)) {
    score += W.STATE;
    matchedOn.state = q.state;
    const named = Object.keys(STATE_ABBR).find((n) => STATE_ABBR[n] === q.state);
    why.push(
      q.state === "federal"
        ? "Federal"
        : named
        ? named.replace(/\b\w/g, (c) => c.toUpperCase())
        : q.state
    );
  }

  // Constraint (lowest) — soft keyword presence in title/excerpt.
  if (q.constraint) {
    const kw = CONSTRAINT_KEYWORD[q.constraint];
    if (kw && art._hay.includes(kw)) {
      score += W.CONSTRAINT;
      matchedOn.constraint = q.constraint;
      why.push(q.constraint + " constraint");
    }
  }

  // Jurisdiction guard — only when the article already earned some points and
  // the query names a state/form the article demonstrably is NOT about.
  if (score > 0) {
    if (q.state && art._states.size && !art._states.has(q.state)) {
      score -= W.STATE_MISMATCH;
      matchedOn.state = null;
    }
    if (q.form && art._forms.size && !art._forms.has(q.form)) {
      score -= W.FORM_MISMATCH;
    }
  }

  return { score, why, matchedOn };
}

function match(text) {
  if (!SIGNATURES || !Array.isArray(SIGNATURES.articles) || !SIGNATURES.articles.length) {
    return [];
  }
  const q = parse(text);

  // No structured signature -> defer to full-text search.
  const hasSignal =
    (q.codes && q.codes.length > 0) ||
    !!q.field ||
    (q._elements && q._elements.length > 0);
  if (!hasSignal) return [];

  const out = [];
  for (const art of SIGNATURES.articles) {
    const { score, why, matchedOn } = scoreArticle(q, art);
    if (score <= 0) continue;
    out.push({
      url: art.url,
      title: art.title,
      section: art.section,
      breadcrumb: art.breadcrumb || [],
      score,
      why,
      matchedOn,
    });
  }
  out.sort((a, b) => b.score - a.score);
  return out.slice(0, MAX_RESULTS);
}

// ------------------------------- init --------------------------------------
// Kick off loading in a browser; Node hosts call setSignatures() themselves.
if (typeof fetch === "function") {
  loadSignatures();
}

const ErrorMatcher = { ready, parse, match, setSignatures, normalizeCode };

if (typeof window !== "undefined") {
  window.ErrorMatcher = ErrorMatcher;
}

export { ready, parse, match, setSignatures, normalizeCode };
export default ErrorMatcher;
