# ILSCHUB-20900-2 e-file error

```
ILSCHUB-20900-2 path to XML Error /ns:ReturnState/ns:ReturnDataState/ns:SchIL1120UB/ns:SchUBMembershipTable/ns:Step3ColABCTaxableInc/ns:ApportionedNetAmount See Schedule UB instructions for SchIL1120UB Step 4 Line 2 to understand how to handle eliminations in UB Step 4. Do not create an eliminations column.
```

enter cause and intro (e.g. "This happens when" or "You get this error when")

## Solution

- In the TopCon, go to **Organizer**, **States**, **Illinois**, and then **Net Operation Losses**.
- Remove any NOL detail entered. This information should be entered at the member level.
- Still in the TopCon, go to **Organizer**, **States**, **State Combined Returns**, **State Consolidation Steps**, and then **Step 6**.
- Select the **Delete previously transferred state data**.
- Select **Illinois**, **Consolidated Returns**, **Step 4 - Review Preconsol Checklist**, Out of balance and compute pending, and then Compute all subsidiaries.
- Next, go to Organizer, Consolidated Returns, Step 5 - Consolidate!, and then Consolidate.

erlink | Click "Illinois" Organizer | Consolidated Returns | Step 4 - Review Preconsol Checklist | Out of balance and compute pending | Compute all subsidiaries now Organizer | Consolidated Returns | Step 5 - Consolidate! | Consolidate NOTE: This is an Alert that can be disregarded. This alert does not require any further activity. Illinois sends alerts back with every return, no matter if it's accepted or rejected.

The Illinois DOR sends e-file Alerts along with their rejects. The Schedule UB, Step 4 eliminations messages are alerts and do not have to be cleared to get an accepted e-file. The application prevents Schedule UB Step 4, rejects by blocking A&A data in the eliminations locator from flowing to Step 4. Instead, the data entered in the members in Organizer | States | Illinois | Combined Return Information | Combined Return Information in the section for Step 4 - Apportionment Factor Elimination Entries (Enter data on Parent and/or Subsidiary returns only) is included at the member level, which is permitted by the e-file schema and rules.