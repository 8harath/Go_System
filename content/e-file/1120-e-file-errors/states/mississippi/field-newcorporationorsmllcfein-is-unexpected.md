# Error: Field “NewCorporationOrSMLLCFEIN” is unexpected

This error occurs when e-filing MS Form 83105 with a final return status (sold, merged, or converted to SMLLC). The schema requires the new corporation/SMLLC owner's address before accepting the FEIN.

## Error message

```
1. Validation failed on [FILE_ID]:

Form: Form83105[1] Status[1]/FinalReturn[1]/SoldMerged[1]/NewCorporationOrSMLLCFEIN[1]
LineNumber: Page 2, Part I, Line 3
Description: If the Corporation has been Sold, Merged or Converted to a Single-Member LLC (SMLLC), Enter the FEIN of the New Existing Corporation or Owner of the SMLLC
ReferenceNumber: 41
Requirement: Expecting NewCorporationOrSMLLCAddress
Error: Field 'NewCorporationOrSMLLCFEIN' is unexpected

Element Name: NewCorporationOrSMLLCFEIN
XPath: /ReturnState[1]/ReturnDataState[1]/Form83105[1]/Status[1]/FinalReturn[1]/SoldMerged[1]/NewCorporationOrSMLLCFEIN[1]
XML Fragment: ******
Field Key: 127,446,9,0,0,0,0,0,0
Error Code: c00ce014
Error Reason: Element '{http://www.irs.gov/efile}NewCorporationOrSMLLCFEIN' is unexpected according to content model of parent element '{http://www.irs.gov/efile}SoldMerged'.
Expecting: {http://www.irs.gov/efile}NewCorporationOrSMLLCAddress.
```

## Solution

- Go to 

  **Organizer****States****Mississippi****E-file****New Existing Co.**

   and fill out the US or foreign address completely.
- Do a full recompute, then print.