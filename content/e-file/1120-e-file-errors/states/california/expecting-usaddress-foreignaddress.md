# Error: Expecting: USAddress, ForeignAddress

This error occurs when the ownership information for California is incomplete.

## Error message

```
Validation failed on [FILE_ID]:

Form: CA-OwnershipControlStatement[1][@documentId='OwnCtrlStmtK17858PLC1] StatementOfOwnership[1]/OwnerInformation[1]
Error: Expecting: USAddress, ForeignAddress.

Element Name: OwnerInformation
XPath: //CA-OwnershipControlStatement[@documentId='OwnCtrlStmtK17858PLC1']/StatementOfOwnership[1]/OwnerInformation[1]
XML Fragment:
Field Key: 0,0,0,0,0,0,0,0,0
Error Code: [CODE]
Error Reason: Content for element '{http://www.ftb.ca.gov/efile}OwnerInformation' is incomplete according to the DTD/Schema.
Expecting: {http://www.ftb.ca.gov/efile}USAddress, {http://www.ftb.ca.gov/efile}ForeignAddress.
```

## Solution

- In the lower member's locators, go to 

  **Organizer****States****California****General Information****General Information****Ownership Information Part 1**

  .
- Select **Add new Owner Information** if there are no owners listed.
- Populate all sections and enter a complete address (either U.S. address or foreign).
- Do a full recompute on the lower member.
- Consolidate at the TopCon and recreate the e-file.

note

Complete these steps for any members with ownership information that are missing address data.