/* Integration checks against the generated 1,426-article indexes. */

import { readFile } from "node:fs/promises";
import { match, parse, setSignatures } from "./error_matcher.js";

const signatures = JSON.parse(await readFile(new URL("../site/signatures.json", import.meta.url)));
const codes = JSON.parse(await readFile(new URL("../site/codes.json", import.meta.url)));
setSignatures(signatures);

let failures = 0;
function check(label, condition, detail = "") {
  console.log(`${condition ? "PASS" : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
  if (!condition) failures++;
}

check("full signature corpus is present", signatures.count === 1426, String(signatures.count));
check("code index is populated", codes.count > 1000, String(codes.count));

const californiaError =
  "CAForm565ScheduleK-1\\PartnershipInformation\\IsInvestmentPartnership\n" +
  "The element PartnershipInformation has incomplete content. " +
  "List of possible elements expected: IsInvestmentPartnership.";
const parsed = parse(californiaError);
const californiaMatches = match(californiaError);
check("California jurisdiction is classified", parsed.jurisdiction.code === "CA");
check("missing-data error kind is classified", parsed.errorKind.code === "missing-data");
check(
  "real California article ranks first",
  californiaMatches[0]?.jurisdictionCode === "CA" &&
    californiaMatches[0]?.url.includes("isinvestmentpartnership"),
  californiaMatches[0]?.url || "no match"
);

const federalMatches = match("IRS MeF rejection R0000-058-01");
check(
  "federal reject code ranks a federal article first",
  federalMatches[0]?.jurisdictionCode === "Federal",
  federalMatches[0]?.url || "no match"
);

const stateSearchMatches = match("New York");
check(
  "state-only search returns that jurisdiction",
  stateSearchMatches.length > 0 &&
    stateSearchMatches[0].jurisdictionCode === "NY" &&
    stateSearchMatches.every(hit => hit.matchedOn.state === "NY"),
  `${stateSearchMatches.length} New York matches`
);

const collision = codes.codes.X0000005;
const collisionJurisdictions = new Set((collision?.matches || [collision]).map(x => x.jurisdiction_code));
check(
  "cross-jurisdiction code collisions are retained",
  collisionJurisdictions.has("Federal") && collisionJurisdictions.has("IA") && collisionJurisdictions.size > 1,
  [...collisionJurisdictions].join(", ")
);

console.log(`\n${failures ? `${failures} integration check(s) failed` : "ALL INTEGRATION CHECKS PASS"}`);
process.exit(failures ? 1 : 0);
