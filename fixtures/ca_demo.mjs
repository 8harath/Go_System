import { match, setSignatures, ready } from "../search/error_matcher.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
await ready;
setSignatures(JSON.parse(fs.readFileSync(path.join(ROOT, "site/signatures.json"), "utf8")));

const QUERIES = [
  ["CA 565 · EntityType 'CHECK'",
   "CAForm565ScheduleK-1\\PartnerInformation\\EntityType\nThe http://www.ftb.ca.gov/efile:EntityType element is invalid. The value CHECK is invalid according to its datatype http://www.ftb.ca.gov/efile:CA-PartnerMemberEntityType. The Enumeration constraint failed."],
  ["CA 565 · IsInvestmentPartnership",
   "CAForm565ScheduleK-1\\PartnershipInformation\\IsInvestmentPartnership\nThe element PartnershipInformation has incomplete content. List of possible elements expected: IsInvestmentPartnership."],
  ["CA 565 · ForeignAddress/Country (Pattern)",
   "CAForm565ScheduleK-1\\PartnerInformation\\ForeignAddress\\Country\nThe Country element is invalid. The value '' is invalid according to its datatype CA-CountryType. The Pattern constraint failed."],
  ["CA 568 · MemberInformation/EntityType",
   "CAForm568ScheduleK-1\\MemberInformation\\EntityType\nThe value CHECK is invalid according to its datatype CA-PartnerMemberEntityType. The Enumeration constraint failed."],
];

for (const [label, input] of QUERIES) {
  const res = match(input).slice(0, 3);
  console.log("\n█ " + label);
  if (!res.length) { console.log("   (no match)"); continue; }
  res.forEach((r, i) => {
    console.log(`   ${i === 0 ? "✓ BEST" : "  #" + (i + 1)} [${r.score}] ${r.title}`);
    console.log(`        ${r.url}`);
    console.log(`        why: ${r.why.join(" · ")}`);
  });
}
