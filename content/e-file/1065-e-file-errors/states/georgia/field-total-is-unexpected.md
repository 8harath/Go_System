# Error: Field 'Total' is unexpected

This error occurs on a Georgia 1065 return when Schedule 3 income to partners is suppressed but no K-1 aggregation file is attached.

## Error message

```
Validation failed on [FILE_ID]:

Form: Form700[1] Sch4[1]/Total[1]
Description: Total
FormNumber: GA700
LineNumber: Sch 4
Requirement: Expecting PartnerData
Error: Field 'Total' is unexpected

Element Name: Total
XPath: /ReturnState[1]/ReturnDataState[1]/Form700[1]/Sch4[1]/Total[1]
XML Fragment: [ID]
Field Key: 105,196,57,0,0,0,0,0,0
Error Code: c00ce014
Error Reason: Element '{http://www.irs.gov/efile}Total' is unexpected according to content model of parent element '{http://www.irs.gov/efile}Sch4'.
Expecting: {http://www.irs.gov/efile}PartnerData.
```

## Solution

- Go to 

  **Organizer****States****Georgia****E-file****Attachments****K-1 Aggregation****Summary**

  .
- Review the **Suppress Schedule 3 income to partners** setting.
- If the option is marked, do one of the following:


  * Attach a K-1 aggregation file for Georgia, or
  * Clear **Suppress Schedule 3 income to partners**.
- Run a full recompute and recreate the e-file.

note

Georgia Form 700 Schedule 4 requires at least 2 partners in the return to generate properly. If the return has fewer than 2 partners, you must add partner information or paper file the return. Go to 

**Organizer****Partner Information****Partner by Partner Data****Columnar Partner Entry****Name and Address**

 to verify partner entries.