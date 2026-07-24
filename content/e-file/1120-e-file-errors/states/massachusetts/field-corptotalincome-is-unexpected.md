# Error: Field 'CorpTotalIncome' is unexpected

Each Sch U-NOL needs either the Date of most recent ownership change or date of incorporation if no change in ownership.

## Error Message

```
Validation failed on:
Form: SchNOL[1][@documentId='SchNOL12345OC1] CorpTotalIncome[1]
Description: Corporations total income allocated or apportioned to Massachusetts for the year
LineNumber: Schedule NOL Line 1
Requirement: Expecting DateOwnershipChange
Error: Field 'CorpTotalIncome' is unexpected
Element Name: CorpTotalIncome
XPath: //SchNOL[@documentId='SchNOL12345OC1']/CorpTotalIncome[1]
XML Fragment: <CorpTotalIncome xmlns="http://www.irs.gov/efile">250001</CorpTotalIncome>
Error Code: c00ce014
Error Reason: Element '{http://www.irs.gov/efile}CorpTotalIncome' is unexpected according to content model of parent element '{http://www.irs.gov/efile}SchNOL'.
Expecting: {http://www.irs.gov/efile}DateOwnershipChange.
```

## Solution 1: Consolidated returns

- In the TopCon, go to 

  **Organizer****States****Massachusetts****Net Operating Loss**

   .
- Find the **Schedule NOL** section.
- Right-click **Date of most recent ownership change or date of incorporation if no change of ownership (Mandatory)** and select **Subview**.
- In Subview, open any entities missing the date and enter the date of most recent ownership change or date or incorporation if no change in ownership.
- Do a full recompute in each subsidiary and the TopCon.
- Clear any overrides for Date of most recent ownership change on Schedule U-NOL in Tax Forms.
- Recreate the Massachusetts e-file.

## Solution 2: Single entity returns

- Go to 

  **Organizer****States****Massachusetts****Net Operating Loss****Schedule NOL**

  .
- Add a date in the **Date of most recent ownership change or date of incorporation if no change of ownership (Mandatory)** field.
- Do a full recompute and recreate the e-file.