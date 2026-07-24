# Error: Field 'TotalAmtDue' is unexpected

This error occurs when Lines 11, 12, and 13 on Iowa PTE-C Page 2 are blank. The state schema requires these fields to contain a value.

## Error message

```
1. Validation failed on [FILE_ID]:

Form: FormIAPTEC[1][@documentId='FormIAPTEC] TotalAmtDue[1]
Description: TOTAL AMOUNT DUE
LineNumber: 14
Requirement: Expecting RefundsCarryforwards, TotalLessRefundsCarryfwds, Overpayment, TaxOwed
Error: Field 'TotalAmtDue' is unexpected

Element Name: TotalAmtDue
XPath: //FormIAPTEC[@documentId='FormIAPTEC']/TotalAmtDue[1]
XML Fragment: 0.0
Field Key: 130,364,18,0,0,0,0,0,0
Error Code: c00ce014
Error Reason: Element '{http://www.irs.gov/efile}TotalAmtDue' is unexpected according to content model of parent element '{http://www.irs.gov/efile}FormIAPTEC'.
Expecting: {http://www.irs.gov/efile}RefundsCarryforwards, {http://www.irs.gov/efile}TotalLessRefundsCarryfwds, {http://www.irs.gov/efile}Overpayment, {http://www.irs.gov/efile}TaxOwed.
```

## Solution

- Go to 

  **Tax Forms****States****Iowa****PTE-C****PTE-C Page 2**

  .
- Enter **NONE** in Lines 11, 12, and 13. These lines can't be blank.
- Do a full recompute and recreate the e-file.