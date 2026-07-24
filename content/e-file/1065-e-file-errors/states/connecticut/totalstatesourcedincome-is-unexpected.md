# Error: Field 'TotalStateSourcedIncome' is unexpected

This error occurs when K-1 aggregation attachments or partner/member data for the CT-1065 composite return are missing, suppressed, or structured incorrectly.

## Error message

```
1. Validation failed on [FILE_ID]:

Form: FormCT10651120SI[1] MemberReturns[1]/TotalStateSourcedIncome[1]
LineNumber: 10
Requirement: Expecting Member
Error: Field 'TotalStateSourcedIncome' is unexpected

Element Name: TotalStateSourcedIncome
XPath: /ReturnState[1]/ReturnDataState[1]/FormCT10651120SI[1]/MemberReturns[1]/TotalStateSourcedIncome[1]
XML Fragment: 0
Field Key: 93,168,57,0,0,0,0,0,0
Error Code: c00ce014
Error Reason: Element '{http://www.irs.gov/efile}TotalStateSourcedIncome' is unexpected according to content model of parent element '{http://www.irs.gov/efile}MemberReturns'.
Expecting: {http://www.irs.gov/efile}Member.
```

## Solution 1: No aggregation file attached

Use this solution when no K-1 aggregation file is attached to the return.

- Go to 

  **Organizer****States****Connecticut****E-file****Attachments****K-1 Aggregation****Summary**

  .
- For **CT 1065 Composite Return Suppress options**, clear **Suppress partner member returns - Part 1 Schedule B**.
- Do a full recompute and recreate the e-file.

## Solution 2: K-1 aggregation file attached

Use this solution when a K-1 aggregation file is attached to the return.

- Go to 

  **Organizer****States****Connecticut****E-file****Attachments****K-1 Aggregation****Summary**

  .
- Make sure the K-1 aggregation attachment contains all information for Part III and Part IV. If corrections are needed, update the file and reattach it.
- Do a full recompute and recreate the e-file.