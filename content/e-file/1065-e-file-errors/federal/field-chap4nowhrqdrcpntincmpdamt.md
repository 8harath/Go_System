# Error: Field 'Chap4NoWHRqdRcpntIncmPdAmt' is unexpected

The IRS requires direct deposit information for 1042 returns with a refund. Enter bank information for the return to qualify for e-file.

## Error message

```
1. Validation failed on:
      Form: IRS1042[1][@documentId='IRS1042] Chap4NoWHRqdRcpntIncmPdAmt[1]
      Description: Amount of income paid to recipients whose chapter 4 status established no withholding
      LineNumber: Section 2, Line 2a
      Requirement: Expecting DirectDepositGrp
      Error: Field 'Chap4NoWHRqdRcpntIncmPdAmt' is unexpected
      Element Name: Chap4NoWHRqdRcpntIncmPdAmt
      XPath: //IRS1042[@documentId='IRS1042']/Chap4NoWHRqdRcpntIncmPdAmt[1]
      XML Fragment: 864383
      Field Key: 228,23,1,0,0,0,0,0,0
      Error Code: c00ce014
      Error Reason: Element '{http://www.irs.gov/efile}Chap4NoWHRqdRcpntIncmPdAmt' is unexpected according to content model of parent element '{http://www.irs.gov/efile}IRS1042'.
      Expecting: {http://www.irs.gov/efile}DirectDepositGrp.[/STYLE]
```

## Solution

- Go to

  **Organizer****Informational Forms****Withholding for Foreign Persons****Federal 1042 E-file****Bank Information**
- Mark one of the fields in the **Confirm/Update (Mandatory)** section.
- Complete the bank information.

  note

  The **Suppress direct deposit of refund on the return** checkbox won't clear this diagnostic.