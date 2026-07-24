# Error: Field 'Corporation' is unexpected

This e-file validation error appears when the Schedule K-1-P lacks required share percentage information. The system expects either a share percentage value or a binary attachment indicator but finds an unexpected Corporation element instead.

## Error message

```
Validation failed on CXXXXXX4.xil: Form: SchILK1P\[1] Steps1And2\[1]/Corporation\[1] Description: Corporation check box. (Must be equal to "X" or blank). LineNumber: Step 2 Line 9a (Corporation) Requirement: Expecting SharePercentage, SharePrctBinAttach Error: Field 'Corporation' is unexpected Element Name: Corporation XPath: /ReturnState\[1]/ReturnDataState\[1]/SchILK1P\[1]/Steps1And2\[1]/Corporation\[1] XML Fragment: X Field Key: 115,1052,148,0,0,0,0,0,0 Error Code: c00ce014 Error Reason: Element '{http://www.irs.gov/efile}Corporation' is unexpected according to content model of parent element '{http://www.irs.gov/efile}Steps1And2'. Expecting: {http://www.irs.gov/efile}SharePercentage, {http://www.irs.gov/efile}SharePrctBinAttach
```

## Solution

Complete these steps to resolve the validation error:

- Go to 

  **Organizer****States****Illinois****State Adjustments****Pass-Through Input****Schedule K-1-P****\[Partner/Shareholder Name]****Step 2 - Partner or Shareholder Information**

   section.
- Do one of the following:


  * Mark the checkbox titled **Share % is included in binary attachment** and attach the supporting PDF document that contains the share percentage details.
  * Enter the **Share (%)** value in the designated field.
- Do a full recompute and recreate the efile.
- Complete either the share percentage field or the binary attachment option to validate the e-file successfully.