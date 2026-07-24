# Error: Field 'PercentOwned' is unexpected

This error occurs when the Ownership % field contains an invalid value on the California Ownership Control Statement. The percentage must be entered as a decimal (for example, 1 instead of 100).

## Error message

```
Validation failed on [FILE_ID]:

Form: CA-OwnershipControlStatement[1][@documentId='OwnCtrlStmtK100012YC1] StatementOfOwnership[1]/OwnerInformation[1]/PercentOwned[1]
Description: Owner percent owned
Requirement: Expecting SSN, FEIN, ITIN, MissingIdReason
Error: Field 'PercentOwned' is unexpected

Element Name: PercentOwned
XPath: //CA-OwnershipControlStatement[@documentId='OwnCtrlStmtK100012YC1']/StatementOfOwnership[1]/OwnerInformation[1]/PercentOwned[1]
XML Fragment: 0.0100
Field Key: 105,1608,143,0,0,0,0,0,0
Error Code: c00ce014
Error Reason: Element '{http://www.ftb.ca.gov/efile}PercentOwned' is unexpected according to content model of parent element '{http://www.ftb.ca.gov/efile}OwnerInformation'.
Expecting: {http://www.ftb.ca.gov/efile}SSN, {http://www.ftb.ca.gov/efile}FEIN, {http://www.ftb.ca.gov/efile}ITIN, {http://www.ftb.ca.gov/efile}MissingIdReason.

Form 100/100W, Question K, Ownership Control Statement ID Number: If the ID type chosen is FEIN, SSN, or ITIN, the ID number must be entered. Otherwise, choose a "Not Applicable" option. There are reject diagnostics in the parent and/or subsidiary returns. Double click on this diagnostic, then subview on the field to see which members contain errors. Clear these diagnostics then reconsolidate.
```

## Solution

- Go to 

  **Organizer****States****California****General Information****Ownership Information Part 1 or Part 2****(NAME)**

  .
- Under the **Foreign Address** section, locate the **Ownership %** field.
- Enter the ownership percentage as a decimal.
- Reconsolidate and recreate the e-file.

note

The Ownership % value can't be greater than 1.0. For example, enter 1 for 100% ownership or 0.5 for 50% ownership.