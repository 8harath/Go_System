/*
 * matcher_selftest.mjs — Node self-test for the deterministic error matcher.
 *
 * Run:  node search/matcher_selftest.mjs
 *
 * 1. Runs parse() over the real California Form 565 Schedule K-1 example inputs
 *    and asserts the extracted {form, field, constraint, state}; prints a table.
 * 2. Loads a small synthetic signatures.json (an "IsInvestmentPartnership"
 *    article and an "EntityType/CHECK" article, plus a federal decoy) and
 *    demonstrates match() ranking.
 *
 * Exits non-zero if any assertion fails.
 */

import {
  parse,
  match,
  setSignatures,
  ready,
  detectArticleJurisdiction,
} from "./error_matcher.js";

// ---------------------------------------------------------------------------
// The CA example inputs (path + realistic FTB/schema message). These do NOT
// appear verbatim in TR articles — parse() must recover the structure.
// ---------------------------------------------------------------------------
const CASES = [
  {
    name: "EntityType / CHECK (Enumeration)",
    input:
      "CAForm565ScheduleK-1\\PartnerInformation\\EntityType\n" +
      "The http://www.ftb.ca.gov/efile:EntityType element is invalid. " +
      "The value 'CHECK' is invalid according to its datatype " +
      "'http://www.ftb.ca.gov/efile:CA-PartnerMemberEntityType' - " +
      "The Enumeration constraint failed.",
    expect: { form: "565", field: "EntityType", constraint: "Enumeration", state: "CA" },
  },
  {
    name: "IsInvestmentPartnership (incomplete content)",
    input:
      "CAForm565ScheduleK-1\\PartnershipInformation\\IsInvestmentPartnership\n" +
      "The element 'http://www.ftb.ca.gov/efile:PartnershipInformation' has " +
      "incomplete content. List of possible elements expected: " +
      "'http://www.ftb.ca.gov/efile:IsInvestmentPartnership'.",
    expect: {
      form: "565",
      field: "IsInvestmentPartnership",
      constraint: "MissingRequired",
      state: "CA",
    },
  },
  {
    name: "ForeignAddress/Country (Pattern)",
    input:
      "CAForm565ScheduleK-1\\PartnerInformation\\ForeignAddress\\Country\n" +
      "The 'Country' element is invalid - The value 'US' is invalid according " +
      "to its datatype 'CA-CountryType' - The Pattern constraint failed.",
    expect: { form: "565", field: "Country", constraint: "Pattern", state: "CA" },
  },
  {
    name: "DisregardedEntity/TIN (Pattern)",
    input:
      "CAForm565ScheduleK-1\\PartnerInformation\\DisregardedEntity\\TIN\n" +
      "The 'TIN' element is invalid - The Pattern constraint failed.",
    expect: { form: "565", field: "TIN", constraint: "Pattern", state: "CA" },
  },
  {
    name: "CapitalAccountAnalysis/OtherIncreaseDecrease (Integer)",
    input:
      "CAForm565ScheduleK-1\\PartnerInformation\\CapitalAccountAnalysis\\OtherIncreaseDecrease\n" +
      "The value 'ABC' is invalid according to its datatype 'Integer'.",
    expect: {
      form: "565",
      field: "OtherIncreaseDecrease",
      constraint: "BadInteger",
      state: "CA",
    },
  },
  {
    name: "IsPubliclyTraded (Boolean)",
    input:
      "CAForm565ScheduleK-1\\PartnerInformation\\IsPubliclyTraded\n" +
      "The value 'MAYBE' is invalid according to its datatype 'Boolean'.",
    expect: { form: "565", field: "IsPubliclyTraded", constraint: "BadBoolean", state: "CA" },
  },
];

let failures = 0;

function pad(s, n) {
  s = String(s);
  return s.length >= n ? s : s + " ".repeat(n - s.length);
}

console.log("=== parse() over the California Form 565 Schedule K-1 examples ===\n");
console.log(
  pad("field", 26) + pad("form", 6) + pad("state", 7) + pad("constraint", 16) + "ok"
);
console.log("-".repeat(70));

for (const c of CASES) {
  const p = parse(c.input);
  const ok =
    p.form === c.expect.form &&
    p.field === c.expect.field &&
    p.constraint === c.expect.constraint &&
    p.state === c.expect.state;
  if (!ok) failures++;
  console.log(
    pad(p.field, 26) +
      pad(p.form, 6) +
      pad(p.state, 7) +
      pad(p.constraint, 16) +
      (ok ? "PASS" : "FAIL")
  );
  if (!ok) {
    console.log("   expected:", JSON.stringify(c.expect));
    console.log("   got     :", JSON.stringify({
      form: p.form, field: p.field, constraint: p.constraint, state: p.state,
    }));
  }
}

// Jurisdiction and error-kind rules must remain nationwide and deterministic.
const CLASSIFIER_CASES = [
  ["NY form prefix", "NYFormIT201 schema validation failed", "NY", "schema-validation"],
  ["state context", "Jurisdiction: TX — data is missing", "TX", "missing-data"],
  ["state name", "Ohio e-file schema: AccountNumber is unexpected", "OH", "unexpected-data"],
  ["state code prefix", "AL65-008 e-file error", "AL", "reject-code"],
  ["federal authority", "IRS MeF rejection R0000-058-01", "Federal", "reject-code"],
  ["no false Indiana", "IND-039-01 e-file error", "", "reject-code"],
  ["lowercase code", "f1065-037-02 e-file error", "", "reject-code"],
  ["compact state code", "AL65008 e-file error", "AL", "reject-code"],
];

console.log("\n=== jurisdiction and error-kind classifier ===\n");
for (const [name, input, jurisdiction, kind] of CLASSIFIER_CASES) {
  const parsed = parse(input);
  const ok = parsed.jurisdiction.code === jurisdiction && parsed.errorKind.code === kind;
  if (!ok) failures++;
  console.log(`${pad(name, 22)} ${ok ? "PASS" : "FAIL"}`);
  if (!ok) console.log("   got:", parsed.jurisdiction.code, parsed.errorKind.code);
}

const codeShapes = [
  ["f1065-037-02 e-file error", "F1065-037-02"],
  ["IND03901 e-file error", "IND03901"],
  ["80004005 error", "80004005"],
  ["725 e-file error", "725"],
];
for (const [input, expected] of codeShapes) {
  const actual = parse(input).codes;
  const ok = actual.includes(expected);
  if (!ok) failures++;
  console.log(`${pad(`code ${expected}`, 22)} ${ok ? "PASS" : "FAIL"}`);
}

const articleJurisdictions = [
  ["/e-file/1065-e-file-errors/states/new-mexico/x.html", "NM"],
  ["/e-file/1040-e-file-errors/states/district-of-columbia/x.html", "DC"],
  ["/e-file/990-e-file-errors/federal/x.html", "Federal"],
];
for (const [url, expected] of articleJurisdictions) {
  const actual = detectArticleJurisdiction(url).code;
  if (actual !== expected) failures++;
}

const ALL_STATE_PATHS = {
  alabama: "AL", alaska: "AK", arizona: "AZ", arkansas: "AR", california: "CA",
  colorado: "CO", connecticut: "CT", delaware: "DE", florida: "FL", georgia: "GA",
  hawaii: "HI", idaho: "ID", illinois: "IL", indiana: "IN", iowa: "IA",
  kansas: "KS", kentucky: "KY", louisiana: "LA", maine: "ME", maryland: "MD",
  massachusetts: "MA", michigan: "MI", minnesota: "MN", mississippi: "MS",
  missouri: "MO", montana: "MT", nebraska: "NE", nevada: "NV",
  "new-hampshire": "NH", "new-jersey": "NJ", "new-mexico": "NM", "new-york": "NY",
  "north-carolina": "NC", "north-dakota": "ND", ohio: "OH", oklahoma: "OK",
  oregon: "OR", pennsylvania: "PA", "rhode-island": "RI", "south-carolina": "SC",
  "south-dakota": "SD", tennessee: "TN", texas: "TX", utah: "UT", vermont: "VT",
  virginia: "VA", washington: "WA", "west-virginia": "WV", wisconsin: "WI",
  wyoming: "WY", "district-of-columbia": "DC",
};
const allStatePathsOk = Object.entries(ALL_STATE_PATHS).every(([slug, code]) =>
  detectArticleJurisdiction(`/e-file/errors/states/${slug}/example.html`).code === code
);
if (!allStatePathsOk) failures++;
console.log(`${pad("all state URL paths", 22)} ${allStatePathsOk ? "PASS" : "FAIL"}`);

// Show the full parse of the first case (datatype / value / schedule / codes).
console.log("\nFull parse() of case 1 (EntityType / CHECK):");
console.log(JSON.stringify(parse(CASES[0].input), (k, v) =>
  k === "_elements" ? undefined : v, 2));

// ---------------------------------------------------------------------------
// match() ranking against a small synthetic signatures.json
// ---------------------------------------------------------------------------
const SYNTHETIC = {
  generated_at: "2026-07-24T00:00:00Z",
  count: 3,
  articles: [
    {
      url: "/e-file/1065-e-file-errors/states/california/isinvestmentpartnership.html",
      title: "E-file error: Field 'IsInvestmentPartnership' is unexpected",
      section: "e-file",
      breadcrumb: ["GoSystem Tax RS", "e-file", "1065 e-file errors", "California"],
      keys: {
        codes: [],
        fields: ["IsInvestmentPartnership", "PartnershipInformation"],
        forms: ["565", "568"],
        states: ["CA"],
        elements: [
          "CAForm565ScheduleK-1",
          "PartnershipInformation",
          "IsInvestmentPartnership",
        ],
      },
      excerpt:
        "The element PartnershipInformation has incomplete content. List of possible elements expected: IsInvestmentPartnership.",
    },
    {
      url: "/e-file/1065-e-file-errors/states/california/entitytype.html",
      title: "E-file error: EntityType value CHECK invalid (Enumeration)",
      section: "e-file",
      breadcrumb: ["GoSystem Tax RS", "e-file", "1065 e-file errors", "California"],
      keys: {
        codes: [],
        fields: ["EntityType"],
        forms: ["565"],
        states: ["CA"],
        elements: ["CAForm565ScheduleK-1", "PartnerInformation", "EntityType"],
      },
      excerpt:
        "The EntityType element is invalid. The Enumeration constraint failed for value CHECK.",
    },
    {
      url: "/e-file/1041-e-file-errors/federal/r0000-058-01.html",
      title: "R0000-058-01 e-file error",
      section: "e-file",
      breadcrumb: ["GoSystem Tax RS", "e-file", "1041 e-file errors", "Federal"],
      keys: {
        codes: ["R0000-058-01"],
        fields: [],
        forms: ["1041"],
        states: ["federal"],
        elements: [],
      },
      excerpt:
        "An XML document that represents a binary attachment must have a valid reference to an attached file.",
    },
  ],
};

// Node does not auto-fetch the browser index; inject the fixture directly.
setSignatures(SYNTHETIC);
await ready;

console.log("\n\n=== match() ranking demo (synthetic signatures.json) ===");

function showMatches(label, input, expectTopUrlIncludes) {
  const res = match(input);
  console.log("\n" + label);
  if (!res.length) {
    console.log("  (no structured matches)");
  }
  res.forEach((r, i) => {
    console.log(
      `  ${i + 1}. [${r.score}] ${r.title}\n      ${r.url}\n      why: ${r.why.join("; ")}`
    );
  });
  if (expectTopUrlIncludes) {
    const ok = res.length && res[0].url.includes(expectTopUrlIncludes);
    if (!ok) failures++;
    console.log(`  -> top result contains "${expectTopUrlIncludes}": ${ok ? "PASS" : "FAIL"}`);
  }
  return res;
}

showMatches("Query = EntityType example:", CASES[0].input, "entitytype");
showMatches("Query = IsInvestmentPartnership example:", CASES[1].input, "isinvestmentpartnership");

// A code-bearing federal reject should surface the R0000-058-01 article.
showMatches(
  "Query = 'R0000-058-01: binary attachment reference invalid':",
  "R0000-058-01 An XML document that represents a binary attachment must have a valid reference.",
  "r0000-058-01"
);

// Plain-text (no structured signature) must return [] for full-text fallback.
const plain = match("How do I file a Form 709 extension?");
const plainOk = Array.isArray(plain) && plain.length === 0;
if (!plainOk) failures++;
console.log("\nPlain-text query returns [] (full-text fallback): " + (plainOk ? "PASS" : "FAIL"));

// Empty-index safety.
setSignatures({ articles: [] });
const emptyOk = match(CASES[0].input).length === 0;
if (!emptyOk) failures++;
console.log("Empty signatures.json returns []: " + (emptyOk ? "PASS" : "FAIL"));

console.log("\nRESULT:", failures === 0 ? "ALL MATCHER TESTS PASS" : `${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
